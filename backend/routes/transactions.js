const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { verifyFirebaseToken } = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions for a portfolio
// @access  Private
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { portfolioId, assetId, actionType, startDate, endDate } = req.query;
    
    if (!portfolioId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Portfolio ID is required' 
      });
    }
    
    const filters = {
      asset_id: assetId,
      action_type: actionType,
      start_date: startDate,
      end_date: endDate
    };
    
    const transactions = await transactionService.getTransactionHistory(portfolioId, filters);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction (buy, sell, deposit, etc.)
// @access  Private
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const transaction = await transactionService.processTransaction(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get specific transaction by ID
// @access  Private
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    // TODO: Implement get single transaction
    res.json({ 
      success: false, 
      message: 'Get single transaction not yet implemented' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    await transactionService.updateTransaction(id, req.body);
    res.json({ success: true, message: 'Transaction updated successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    await transactionService.deleteTransaction(id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/transactions/cash
// @desc    Add cash deposit or withdrawal transaction
// @access  Private
router.post('/cash', verifyFirebaseToken, async (req, res) => {
  try {
    const { type, amount, currency, date, platform, notes } = req.body;
    
    // Validate required fields
    if (!type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Type, amount, and currency are required'
      });
    }
    
    if (!['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "deposit" or "withdrawal"'
      });
    }
    
    // Mock successful response for testing
    const mockTransaction = {
      id: `cash_${Date.now()}`,
      type,
      amount: parseFloat(amount),
      currency,
      date: date || new Date().toISOString().split('T')[0],
      platform: platform || 'Manual',
      notes: notes || '',
      created_at: new Date().toISOString(),
      user_id: 'test_user' // In production, this would come from auth token
    };
    
    res.status(201).json({
      success: true,
      data: mockTransaction,
      message: `Cash ${type} of ${amount} ${currency} added successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// @route   POST /api/transactions/asset
// @desc    Process asset transaction (buy/sell/transfer)
// @access  Private
router.post('/asset', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.body.asset_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Asset ID is required for asset transactions' 
      });
    }
    
    const transaction = await transactionService.processTransaction(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/transactions/portfolio/:portfolioId
// @desc    Get transaction history for a specific portfolio
// @access  Private
router.get('/portfolio/:portfolioId', verifyFirebaseToken, async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { assetId, actionType, startDate, endDate } = req.query;
    
    const filters = {
      asset_id: assetId,
      action_type: actionType,
      start_date: startDate,
      end_date: endDate
    };
    
    const transactions = await transactionService.getTransactionHistory(portfolioId, filters);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/transactions/bulk
// @desc    Process multiple transactions at once
// @access  Private
router.post('/bulk', verifyFirebaseToken, async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transactions array is required' 
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const [index, transactionData] of transactions.entries()) {
      try {
        const result = await transactionService.processTransaction(transactionData);
        results.push(result);
      } catch (error) {
        errors.push({ index, error: error.message });
      }
    }
    
    res.json({ 
      success: errors.length === 0, 
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
