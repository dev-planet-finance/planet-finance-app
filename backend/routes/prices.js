const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');
const { verifyFirebaseToken } = require('../middleware/auth');

// @route   GET /api/prices/:symbol
// @desc    Get price for any asset (auto-detects source from database)
// @access  Private
router.get('/:symbol', verifyFirebaseToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = 'US', source } = req.query;
    
    // If source is specified, use it directly
    if (source) {
      const price = await priceService.getAssetPrice(symbol, source, exchange);
      return res.json({ success: true, data: price });
    }
    
    // TODO: Query database to determine data source for this asset
    // For now, assume stocks are EODHD and crypto is CoinGecko
    const dataSource = symbol.length <= 5 ? 'eodhd' : 'coingecko';
    const price = await priceService.getAssetPrice(symbol, dataSource, exchange);
    
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/stocks/:symbol
// @desc    Get stock/ETF price from EODHD API
// @access  Private
router.get('/stocks/:symbol', verifyFirebaseToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = 'US' } = req.query;
    
    const price = await priceService.getEODHDPrice(symbol, exchange);
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/crypto/:symbol
// @desc    Get crypto price from CoinGecko API
// @access  Private
router.get('/crypto/:symbol', verifyFirebaseToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const price = await priceService.getCoinGeckoPrice(symbol);
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/search
// @desc    Search for assets across EODHD and CoinGecko
// @access  Private
router.get('/search', verifyFirebaseToken, async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }
    
    const results = await priceService.searchAssets(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/exchange-rates
// @desc    Get currency exchange rates for multi-currency support
// @access  Private
router.get('/exchange-rates', verifyFirebaseToken, async (req, res) => {
  try {
    // TODO: Implement exchange rate fetching
    // For now, return mock data
    const rates = {
      'USD': { 'EUR': 0.85, 'GBP': 0.75, 'JPY': 110 },
      'EUR': { 'USD': 1.18, 'GBP': 0.88, 'JPY': 129 },
      'GBP': { 'USD': 1.33, 'EUR': 1.14, 'JPY': 147 }
    };
    
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/prices/bulk
// @desc    Get bulk prices for multiple assets
// @access  Private
router.post('/bulk', verifyFirebaseToken, async (req, res) => {
  try {
    const { assets } = req.body;
    
    if (!assets || !Array.isArray(assets)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Assets array is required' 
      });
    }
    
    const prices = await priceService.getBulkPrices(assets);
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/historical/:symbol
// @desc    Get historical price data for an asset
// @access  Private
router.get('/historical/:symbol', verifyFirebaseToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1m', exchange = 'US', source } = req.query;
    
    // Determine data source
    const dataSource = source || (symbol.length <= 5 ? 'eodhd' : 'coingecko');
    
    const historicalData = await priceService.getHistoricalPrices(
      symbol, 
      dataSource, 
      period, 
      exchange
    );
    
    res.json({ success: true, data: historicalData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/prices/portfolio/:portfolioId/live
// @desc    Get live prices for all assets in a portfolio
// @access  Private
router.get('/portfolio/:portfolioId/live', verifyFirebaseToken, async (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    // TODO: Query database for all assets in this portfolio
    // Then fetch bulk prices for all assets
    
    res.json({ 
      success: true, 
      message: `Live prices for portfolio ${portfolioId} - database integration needed` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
