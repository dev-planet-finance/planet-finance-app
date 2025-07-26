const databaseService = require('./databaseService');

class TransactionService {
  constructor() {
    this.pool = databaseService.pool;
  }

  /**
   * Process a new transaction (buy, sell, deposit, withdrawal, etc.)
   * @param {Object} transactionData - Transaction information
   * @returns {Promise<Object>} Processed transaction with updated holdings
   */
  async processTransaction(transactionData) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert the transaction record
      const transaction = await this.createTransaction(client, transactionData);

      // Update holdings and cash balances based on transaction type
      switch (transaction.transaction_type) {
        case 'buy':
          await this.processBuyTransaction(client, transaction);
          break;
        case 'sell':
          await this.processSellTransaction(client, transaction);
          break;
        case 'deposit':
          await this.processDepositTransaction(client, transaction);
          break;
        case 'withdrawal':
          await this.processWithdrawalTransaction(client, transaction);
          break;
        case 'dividend':
          await this.processDividendTransaction(client, transaction);
          break;
        case 'transfer_in':
        case 'transfer_out':
          await this.processTransferTransaction(client, transaction);
          break;
        case 'split':
          await this.processSplitTransaction(client, transaction);
          break;
        case 'free':
          await this.processFreeAssetTransaction(client, transaction);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${transaction.transaction_type}`);
      }

      await client.query('COMMIT');
      return transaction;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create transaction record
   * @param {Object} client - Database client
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(client, data) {
    const query = `
      INSERT INTO transactions (
        user_id, portfolio_id, asset_id, platform_id, transaction_type, quantity, 
        price_per_unit, total_amount, transaction_currency, fee_amount, transaction_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.user_id || '550e8400-e29b-41d4-a716-446655440001', // TODO: Get from auth
      data.portfolio_id,
      data.asset_id || null,
      data.platform_id,
      data.action_type || data.transaction_type,
      data.quantity || 0,
      data.price_per_unit || 0,
      data.total_amount,
      data.currency || data.transaction_currency || 'USD',
      data.fees || data.fee_amount || 0,
      data.transaction_date || new Date(),
      data.notes || null
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  /**
   * Process buy transaction - increase holdings, decrease cash
   */
  async processBuyTransaction(client, transaction) {
    const totalAmount = parseFloat(transaction.total_amount) || 0;
    const feeAmount = parseFloat(transaction.fee_amount) || 0;
    const quantity = parseFloat(transaction.quantity) || 0;
    
    // Update or create holding
    await this.updateHolding(client, {
      portfolio_id: transaction.portfolio_id,
      asset_id: transaction.asset_id,
      platform_id: transaction.platform_id,
      quantity_change: quantity,
      cost_change: totalAmount + feeAmount
    });

    // Decrease cash balance
    await this.updateCashBalance(client, {
      portfolio_id: transaction.portfolio_id,
      platform_id: transaction.platform_id,
      currency: transaction.transaction_currency,
      amount_change: -(totalAmount + feeAmount)
    });
  }

  /**
   * Process sell transaction - decrease holdings, increase cash
   */
  async processSellTransaction(client, transaction) {
    // Update holding (decrease)
    await this.updateHolding(client, {
      portfolio_id: transaction.portfolio_id,
      asset_id: transaction.asset_id,
      quantity_change: -transaction.quantity,
      cost_change: -this.calculateCostBasisReduction(transaction)
    });

    // Increase cash balance (minus fees)
    await this.updateCashBalance(client, {
      portfolio_id: transaction.portfolio_id,
      platform_id: transaction.platform_id,
      currency: transaction.currency,
      amount_change: transaction.total_amount - transaction.fees
    });
  }

  /**
   * Process deposit transaction - increase cash
   */
  async processDepositTransaction(client, transaction) {
    await this.updateCashBalance(client, {
      portfolio_id: transaction.portfolio_id,
      platform_id: transaction.platform_id,
      currency: transaction.transaction_currency,
      amount_change: parseFloat(transaction.total_amount)
    });
  }

  /**
   * Process withdrawal transaction - decrease cash
   */
  async processWithdrawalTransaction(client, transaction) {
    await this.updateCashBalance(client, {
      portfolio_id: transaction.portfolio_id,
      platform_id: transaction.platform_id,
      currency: transaction.currency,
      amount_change: -(transaction.total_amount + transaction.fees)
    });
  }

  /**
   * Process dividend transaction - increase cash or holdings (DRIP)
   */
  async processDividendTransaction(client, transaction) {
    // Record dividend payment
    const dividendQuery = `
      INSERT INTO dividend_payments (
        portfolio_id, asset_id, payment_date, amount_per_share, 
        total_amount, currency, is_reinvested
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const dividendValues = [
      transaction.portfolio_id,
      transaction.asset_id,
      transaction.transaction_date,
      transaction.price_per_unit, // amount per share
      transaction.total_amount,
      transaction.currency,
      transaction.quantity > 0 // DRIP if quantity > 0
    ];

    await client.query(dividendQuery, dividendValues);

    if (transaction.quantity > 0) {
      // DRIP - reinvest dividends into more shares
      await this.updateHolding(client, {
        portfolio_id: transaction.portfolio_id,
        asset_id: transaction.asset_id,
        quantity_change: transaction.quantity,
        cost_change: transaction.total_amount
      });
    } else {
      // Cash dividend
      await this.updateCashBalance(client, {
        portfolio_id: transaction.portfolio_id,
        platform_id: transaction.platform_id,
        currency: transaction.currency,
        amount_change: transaction.total_amount
      });
    }
  }

  /**
   * Process transfer transaction
   */
  async processTransferTransaction(client, transaction) {
    const multiplier = transaction.action_type === 'transfer_in' ? 1 : -1;
    
    await this.updateHolding(client, {
      portfolio_id: transaction.portfolio_id,
      asset_id: transaction.asset_id,
      quantity_change: transaction.quantity * multiplier,
      cost_change: transaction.total_amount * multiplier
    });
  }

  /**
   * Process stock split transaction
   */
  async processSplitTransaction(client, transaction) {
    // Record stock split
    const splitQuery = `
      INSERT INTO stock_splits (
        asset_id, split_date, split_ratio, portfolio_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    await client.query(splitQuery, [
      transaction.asset_id,
      transaction.transaction_date,
      transaction.quantity, // split ratio (e.g., 2 for 2:1 split)
      transaction.portfolio_id
    ]);

    // Update holdings - multiply quantity, divide average cost
    const holdingQuery = `
      UPDATE holdings 
      SET 
        quantity = quantity * $3,
        average_cost = average_cost / $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE portfolio_id = $1 AND asset_id = $2
    `;

    await client.query(holdingQuery, [
      transaction.portfolio_id,
      transaction.asset_id,
      transaction.quantity
    ]);
  }

  /**
   * Process free asset transaction (airdrops, bonuses, etc.)
   */
  async processFreeAssetTransaction(client, transaction) {
    await this.updateHolding(client, {
      portfolio_id: transaction.portfolio_id,
      asset_id: transaction.asset_id,
      quantity_change: transaction.quantity,
      cost_change: 0 // Free assets have no cost basis
    });
  }

  /**
   * Update or create holding record
   */
  async updateHolding(client, data) {
    const query = `
      INSERT INTO holdings (
        user_id, portfolio_id, asset_id, platform_id, quantity, 
        total_cost_basis, average_cost_basis
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (portfolio_id, asset_id, platform_id)
      DO UPDATE SET
        quantity = holdings.quantity + EXCLUDED.quantity,
        total_cost_basis = holdings.total_cost_basis + EXCLUDED.total_cost_basis,
        average_cost_basis = CASE 
          WHEN (holdings.quantity + EXCLUDED.quantity) = 0 THEN 0
          ELSE (holdings.total_cost_basis + EXCLUDED.total_cost_basis) / (holdings.quantity + EXCLUDED.quantity)
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const averageCost = data.quantity_change !== 0 ? data.cost_change / data.quantity_change : 0;

    const values = [
      data.user_id || '550e8400-e29b-41d4-a716-446655440001', // TODO: Get from auth
      data.portfolio_id,
      data.asset_id,
      data.platform_id || '880e8400-e29b-41d4-a716-446655440001', // Default platform
      data.quantity_change,
      data.cost_change,
      averageCost
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  /**
   * Update cash balance
   */
  async updateCashBalance(client, data) {
    const query = `
      INSERT INTO cash_balances (user_id, portfolio_id, platform_id, currency, balance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (portfolio_id, platform_id, currency)
      DO UPDATE SET
        balance = cash_balances.balance + EXCLUDED.balance,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      data.user_id || '550e8400-e29b-41d4-a716-446655440001', // TODO: Get from auth
      data.portfolio_id,
      data.platform_id,
      data.currency,
      data.amount_change
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  /**
   * Calculate cost basis reduction for sell transactions (FIFO method)
   */
  calculateCostBasisReduction(transaction) {
    // For now, use average cost method
    // TODO: Implement FIFO/LIFO methods based on user preference
    return transaction.quantity * transaction.price_per_unit;
  }

  /**
   * Get transaction history for a portfolio
   * @param {string} portfolioId - Portfolio UUID
   * @param {Object} filters - Optional filters (asset_id, action_type, date_range)
   * @returns {Promise<Array>} Transaction history
   */
  async getTransactionHistory(portfolioId, filters = {}) {
    let whereClause = 'WHERE t.portfolio_id = $1';
    const values = [portfolioId];
    let paramIndex = 2;

    if (filters.asset_id) {
      whereClause += ` AND t.asset_id = $${paramIndex}`;
      values.push(filters.asset_id);
      paramIndex++;
    }

    if (filters.action_type) {
      whereClause += ` AND t.action_type = $${paramIndex}`;
      values.push(filters.action_type);
      paramIndex++;
    }

    if (filters.start_date) {
      whereClause += ` AND t.transaction_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      whereClause += ` AND t.transaction_date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    const query = `
      SELECT 
        t.*,
        a.symbol,
        a.name as asset_name,
        p.name as platform_name
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN platforms p ON t.platform_id = p.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 100
    `;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  /**
   * Update an existing transaction
   * @param {string} transactionId - Transaction UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(transactionId, updateData) {
    // Note: Updating transactions requires recalculating holdings
    // This is a complex operation that should be handled carefully
    throw new Error('Transaction updates not yet implemented - requires holdings recalculation');
  }

  /**
   * Delete a transaction and recalculate holdings
   * @param {string} transactionId - Transaction UUID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTransaction(transactionId) {
    // Note: Deleting transactions requires recalculating all subsequent holdings
    // This is a complex operation that should be handled carefully
    throw new Error('Transaction deletion not yet implemented - requires holdings recalculation');
  }
}

module.exports = new TransactionService();
