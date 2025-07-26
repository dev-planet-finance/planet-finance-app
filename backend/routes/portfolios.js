const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');
const { verifyFirebaseToken } = require('../middleware/auth');

// @route   GET /api/portfolios
// @desc    Get all portfolios for the authenticated user
// @access  Private
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.database_user.id;
    
    const portfolios = await portfolioService.getUserPortfolios(userId);
    res.json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/portfolios
// @desc    Create a new portfolio
// @access  Private
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.database_user.id;
    
    const portfolio = await portfolioService.createPortfolio(userId, req.body);
    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/portfolios/:id
// @desc    Get portfolio by ID with holdings and performance
// @access  Private
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioService.getPortfolioSummary(id);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
});

// @route   PUT /api/portfolios/:id
// @desc    Update portfolio information
// @access  Private
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioService.updatePortfolio(id, req.body);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   DELETE /api/portfolios/:id
// @desc    Delete a portfolio
// @access  Private
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    await portfolioService.deletePortfolio(id);
    res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/portfolios/:id/summary
// @desc    Get portfolio summary with current values and performance
// @access  Private
router.get('/:id/summary', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await portfolioService.getPortfolioSummary(id);
    res.json({ success: true, data: summary });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
});

// @route   GET /api/portfolios/:id/performance
// @desc    Get portfolio performance over time
// @access  Private
router.get('/:id/performance', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '1m' } = req.query;
    
    const performance = await portfolioService.getPortfolioPerformance(id, period);
    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/portfolios/:id/snapshot
// @desc    Create a portfolio snapshot for performance tracking
// @access  Private
router.post('/:id/snapshot', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await portfolioService.createPortfolioSnapshot(id);
    res.json({ success: true, data: snapshot });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
