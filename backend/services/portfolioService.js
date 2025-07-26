const databaseService = require('./databaseService');
const priceService = require('./priceService');

class PortfolioService {
  constructor() {
    this.pool = databaseService.pool;
  }

  /**
   * Create a new portfolio
   * @param {string} userId - User UUID
   * @param {Object} portfolioData - Portfolio information
   * @returns {Promise<Object>} Created portfolio
   */
  async createPortfolio(userId, portfolioData) {
    // Development mode: return mock portfolio
    if (process.env.NODE_ENV === 'development' || !this.pool) {
      console.log('🔧 Development mode: Creating mock portfolio');
      return {
        id: 'dev-portfolio-' + Date.now(),
        user_id: userId,
        name: portfolioData.name || 'My Portfolio',
        description: portfolioData.description || 'Development portfolio',
        base_currency: portfolioData.base_currency || 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    // Production mode: use database
    const query = `
      INSERT INTO portfolios (user_id, name, description, base_currency)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      userId,
      portfolioData.name,
      portfolioData.description || null,
      portfolioData.base_currency || 'USD'
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all portfolios for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} User's portfolios
   */
  async getUserPortfolios(userId) {
    // Development mode: return mock portfolios
    if (process.env.NODE_ENV === 'development' || !this.pool) {
      console.log('🔧 Development mode: Returning mock portfolios for user:', userId);
      return [
        {
          id: 'dev-portfolio-1',
          user_id: userId,
          name: 'My Investment Portfolio',
          description: 'Main investment portfolio',
          base_currency: 'USD',
          holdings_count: '3',
          total_invested: '15000.00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'dev-portfolio-2',
          user_id: userId,
          name: 'Crypto Portfolio',
          description: 'Cryptocurrency investments',
          base_currency: 'USD',
          holdings_count: '2',
          total_invested: '5000.00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    
    // Production mode: use database
    const query = `
      SELECT 
        p.*,
        COUNT(h.id) as holdings_count,
        SUM(CASE WHEN h.quantity > 0 THEN h.total_cost_basis ELSE 0 END) as total_invested
      FROM portfolios p
      LEFT JOIN holdings h ON p.id = h.portfolio_id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get portfolio with current market values
   * @param {string} portfolioId - Portfolio UUID
   * @returns {Promise<Object>} Portfolio with holdings and current values
   */
  async getPortfolioSummary(portfolioId) {
    // Get portfolio basic info
    const portfolioQuery = `
      SELECT * FROM portfolios WHERE id = $1
    `;
    const portfolioResult = await this.pool.query(portfolioQuery, [portfolioId]);
    
    if (portfolioResult.rows.length === 0) {
      throw new Error('Portfolio not found');
    }
    
    const portfolio = portfolioResult.rows[0];

    // Get all holdings with asset information
    const holdingsQuery = `
      SELECT 
        h.*,
        a.symbol,
        a.name,
        a.asset_type,
        a.data_source,
        a.exchange,
        a.currency as asset_currency
      FROM holdings h
      INNER JOIN assets a ON h.asset_id = a.id
      WHERE h.portfolio_id = $1 AND h.quantity > 0
      ORDER BY h.total_cost_basis DESC
    `;
    
    const holdingsResult = await this.pool.query(holdingsQuery, [portfolioId]);
    const holdings = holdingsResult.rows;

    // Get current prices for all holdings
    const assets = holdings.map(h => ({
      symbol: h.data_source === 'coingecko' ? h.symbol.toLowerCase() : h.symbol,
      data_source: h.data_source,
      exchange: h.exchange
    }));

    let currentPrices = {};
    if (assets.length > 0) {
      try {
        const priceData = await priceService.getBulkPrices(assets);
        currentPrices = priceData.reduce((acc, price) => {
          if (!price.error) {
            acc[price.symbol.toUpperCase()] = price;
          }
          return acc;
        }, {});
      } catch (error) {
        console.error('Error fetching current prices:', error);
      }
    }

    // Calculate current values and performance
    const enrichedHoldings = holdings.map(holding => {
      const currentPrice = currentPrices[holding.symbol];
      const quantity = parseFloat(holding.quantity) || 0;
      const currentValue = currentPrice ? quantity * currentPrice.price : 0;
      const totalCostBasis = parseFloat(holding.total_cost_basis) || 0;
      const totalGainLoss = currentValue - totalCostBasis;
      const percentGainLoss = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

      return {
        ...holding,
        current_price: currentPrice?.price || 0,
        current_value: currentValue,
        total_gain_loss: totalGainLoss,
        percent_gain_loss: percentGainLoss,
        price_timestamp: currentPrice?.timestamp || null
      };
    });

    // Get cash balances
    const cashQuery = `
      SELECT platform_id, currency, balance
      FROM cash_balances
      WHERE portfolio_id = $1
      ORDER BY currency
    `;
    const cashResult = await this.pool.query(cashQuery, [portfolioId]);

    // Calculate portfolio totals
    const totalInvested = enrichedHoldings.reduce((sum, h) => sum + (parseFloat(h.total_cost_basis) || 0), 0);
    const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalCash = cashResult.rows.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const totalPortfolioValue = totalCurrentValue + totalCash;
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalPercentGainLoss = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      ...portfolio,
      holdings: enrichedHoldings,
      cash_balances: cashResult.rows,
      summary: {
        total_invested: totalInvested,
        total_current_value: totalCurrentValue,
        total_cash: totalCash,
        total_portfolio_value: totalPortfolioValue,
        total_gain_loss: totalGainLoss,
        total_percent_gain_loss: totalPercentGainLoss,
        holdings_count: holdings.length
      }
    };
  }

  /**
   * Update portfolio information
   * @param {string} portfolioId - Portfolio UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated portfolio
   */
  async updatePortfolio(portfolioId, updateData) {
    const allowedFields = ['name', 'description', 'base_currency'];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(portfolioId);
    const query = `
      UPDATE portfolios 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a portfolio (and all associated data)
   * @param {string} portfolioId - Portfolio UUID
   * @returns {Promise<boolean>} Success status
   */
  async deletePortfolio(portfolioId) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete in correct order due to foreign key constraints
      await client.query('DELETE FROM portfolio_snapshots WHERE portfolio_id = $1', [portfolioId]);
      await client.query('DELETE FROM dividend_payments WHERE portfolio_id = $1', [portfolioId]);
      await client.query('DELETE FROM holdings WHERE portfolio_id = $1', [portfolioId]);
      await client.query('DELETE FROM cash_balances WHERE portfolio_id = $1', [portfolioId]);
      await client.query('DELETE FROM transactions WHERE portfolio_id = $1', [portfolioId]);
      await client.query('DELETE FROM portfolios WHERE id = $1', [portfolioId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get portfolio performance over time
   * @param {string} portfolioId - Portfolio UUID
   * @param {string} period - Time period ('1d', '7d', '1m', '3m', '1y', 'all')
   * @returns {Promise<Array>} Performance data points
   */
  async getPortfolioPerformance(portfolioId, period = '1m') {
    let dateFilter = '';
    
    switch (period) {
      case '1d':
        dateFilter = "AND snapshot_date >= CURRENT_DATE - INTERVAL '1 day'";
        break;
      case '7d':
        dateFilter = "AND snapshot_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case '1m':
        dateFilter = "AND snapshot_date >= CURRENT_DATE - INTERVAL '1 month'";
        break;
      case '3m':
        dateFilter = "AND snapshot_date >= CURRENT_DATE - INTERVAL '3 months'";
        break;
      case '1y':
        dateFilter = "AND snapshot_date >= CURRENT_DATE - INTERVAL '1 year'";
        break;
      case 'all':
        dateFilter = '';
        break;
    }

    const query = `
      SELECT 
        snapshot_date,
        total_value,
        total_invested,
        total_gain_loss,
        percent_gain_loss
      FROM portfolio_snapshots
      WHERE portfolio_id = $1 ${dateFilter}
      ORDER BY snapshot_date ASC
    `;

    const result = await this.pool.query(query, [portfolioId]);
    return result.rows;
  }

  /**
   * Create a portfolio snapshot for performance tracking
   * @param {string} portfolioId - Portfolio UUID
   * @returns {Promise<Object>} Created snapshot
   */
  async createPortfolioSnapshot(portfolioId) {
    const summary = await this.getPortfolioSummary(portfolioId);
    
    const query = `
      INSERT INTO portfolio_snapshots (
        portfolio_id, snapshot_date, total_value, total_invested, 
        total_gain_loss, percent_gain_loss, holdings_count
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
      ON CONFLICT (portfolio_id, snapshot_date)
      DO UPDATE SET
        total_value = EXCLUDED.total_value,
        total_invested = EXCLUDED.total_invested,
        total_gain_loss = EXCLUDED.total_gain_loss,
        percent_gain_loss = EXCLUDED.percent_gain_loss,
        holdings_count = EXCLUDED.holdings_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      portfolioId,
      summary.summary.total_portfolio_value,
      summary.summary.total_invested,
      summary.summary.total_gain_loss,
      summary.summary.total_percent_gain_loss,
      summary.summary.holdings_count
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = new PortfolioService();
