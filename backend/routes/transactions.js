const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');

// @route   GET /api/transactions
// @desc    Get all transactions for a portfolio
// @access  Private
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
// @desc    Process cash transaction (deposit/withdrawal)
// @access  Private
router.post('/cash', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      asset_id: null // Cash transactions don't have an asset
    };
    
    const transaction = await transactionService.processTransaction(transactionData);
    res.status(201).json({ success: true, data: transaction });
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
router.post('/asset', async (req, res) => {
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
router.get('/portfolio/:portfolioId', async (req, res) => {
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
router.post('/bulk', async (req, res) => {
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
