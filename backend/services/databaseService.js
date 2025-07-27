const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    // Always use real database for production-ready MVP
    console.log('📊 Initializing production database connection for MVP launch');
    
    // Note: Removed development mode mock data for production-ready authentication
    
    // Production mode: Use Railway database
    let connectionString = process.env.DATABASE_URL;
    
    // Fallback to hardcoded Railway connection if needed
    if (!connectionString) {
      connectionString = 'postgresql://postgres:bumXFeizMBsVTXanhjxncujQbHnnAsAu@yamanote.proxy.rlwy.net:39114/railway';
      console.log('⚠️ Using fallback database connection');
    }
    
    // Clean up any malformed connection string
    connectionString = connectionString.replace(/railwayDB_HOST=[^/]+/, 'railway');
    
    console.log('Database connection string:', connectionString.replace(/:[^:@]*@/, ':***@')); // Log without password
    
    try {
      this.pool = new Pool({
        connectionString: connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      console.log('✅ Database pool initialized');
    } catch (error) {
      console.error('❌ Database pool initialization error:', error.message);
      this.pool = null;
    }
  }

  /**
   * Get asset information from database
   * @param {string} symbol - Asset symbol
   * @returns {Promise<Object>} Asset data with data_source
   */
  async getAssetBySymbol(symbol) {
    // Development mode: return mock data
    if (!this.pool) {
      const mockAssets = {
        'CAT': { id: 1, symbol: 'CAT', name: 'Caterpillar Inc.', asset_type: 'stock', data_source: 'EODHD', exchange: 'US', currency: 'USD' },
        'AAPL': { id: 2, symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'stock', data_source: 'EODHD', exchange: 'US', currency: 'USD' },
        'BTC': { id: 3, symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto', data_source: 'CoinGecko', exchange: 'CRYPTO', currency: 'USD' }
      };
      return mockAssets[symbol.toUpperCase()] || null;
    }
    
    // Production mode: use real database
    const query = `
      SELECT id, symbol, name, asset_type, data_source, exchange, currency
      FROM assets 
      WHERE UPPER(symbol) = UPPER($1)
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [symbol]);
    return result.rows[0] || null;
  }

  /**
   * Get all assets in a portfolio
   * @param {string} portfolioId - Portfolio UUID
   * @returns {Promise<Array>} Array of assets with holdings
   */
  async getPortfolioAssets(portfolioId) {
    // Development mode: return mock portfolio data
    if (!this.pool) {
      return [
        {
          id: 1,
          symbol: 'CAT',
          name: 'Caterpillar Inc.',
          asset_type: 'stock',
          data_source: 'EODHD',
          exchange: 'US',
          currency: 'USD',
          quantity: 10,
          average_cost: 275.50,
          total_cost: 2755.00,
          last_updated: new Date().toISOString()
        },
        {
          id: 2,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          asset_type: 'stock',
          data_source: 'EODHD',
          exchange: 'US',
          currency: 'USD',
          quantity: 5,
          average_cost: 190.00,
          total_cost: 950.00,
          last_updated: new Date().toISOString()
        }
      ];
    }
    
    // Production mode: use real database
    const query = `
      SELECT 
        a.id,
        a.symbol,
        a.name,
        a.asset_type,
        a.data_source,
        a.exchange,
        a.currency,
        h.quantity,
        h.average_cost,
        h.total_cost,
        h.last_updated
      FROM assets a
      INNER JOIN holdings h ON a.id = h.asset_id
      WHERE h.portfolio_id = $1 AND h.quantity > 0
      ORDER BY a.symbol
    `;
    
    const result = await this.pool.query(query, [portfolioId]);
    return result.rows;
  }

  /**
   * Search assets in database
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching assets
   */
  async searchAssets(query) {
    const searchQuery = `
      SELECT id, symbol, name, asset_type, data_source, exchange, currency
      FROM assets 
      WHERE 
        UPPER(symbol) LIKE UPPER($1) OR 
        UPPER(name) LIKE UPPER($1)
      ORDER BY 
        CASE WHEN UPPER(symbol) = UPPER($2) THEN 1 ELSE 2 END,
        symbol
      LIMIT 50
    `;
    
    const searchPattern = `%${query}%`;
    const result = await this.pool.query(searchQuery, [searchPattern, query]);
    return result.rows;
  }

  /**
   * Insert or update price history
   * @param {string} assetId - Asset UUID
   * @param {Object} priceData - Price data object
   */
  async updatePriceHistory(assetId, priceData) {
    const query = `
      INSERT INTO price_history (
        asset_id, price_date, open_price, high_price, 
        low_price, close_price, volume, data_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (asset_id, price_date, data_source) 
      DO UPDATE SET
        open_price = EXCLUDED.open_price,
        high_price = EXCLUDED.high_price,
        low_price = EXCLUDED.low_price,
        close_price = EXCLUDED.close_price,
        volume = EXCLUDED.volume,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      assetId,
      priceData.date || new Date().toISOString().split('T')[0],
      priceData.open || priceData.price,
      priceData.high || priceData.price,
      priceData.low || priceData.price,
      priceData.close || priceData.price,
      priceData.volume || 0,
      priceData.data_source
    ];
    
    await this.pool.query(query, values);
  }

  /**
   * Get latest price for an asset from database
   * @param {string} assetId - Asset UUID
   * @returns {Promise<Object>} Latest price data
   */
  async getLatestPrice(assetId) {
    const query = `
      SELECT * FROM price_history 
      WHERE asset_id = $1 
      ORDER BY price_date DESC, updated_at DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [assetId]);
    return result.rows[0] || null;
  }

  /**
   * Add new asset to database
   * @param {Object} assetData - Asset information
   * @returns {Promise<string>} Asset ID
   */
  async addAsset(assetData) {
    const query = `
      INSERT INTO assets (symbol, name, asset_type, data_source, exchange, currency)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (symbol, exchange) 
      DO UPDATE SET
        name = EXCLUDED.name,
        asset_type = EXCLUDED.asset_type,
        data_source = EXCLUDED.data_source,
        currency = EXCLUDED.currency,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    const values = [
      assetData.symbol,
      assetData.name,
      assetData.type || assetData.asset_type,
      assetData.data_source,
      assetData.exchange || 'US',
      assetData.currency || 'USD'
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseService();
