const axios = require('axios');

class PriceService {
  constructor() {
    this.eodhd_api_key = process.env.EODHD_API_KEY;
    this.eodhd_base_url = 'https://eodhd.com/api';
    this.coingecko_base_url = 'https://api.coingecko.com/api/v3';
  }

  /**
   * Get price for a single asset based on its data source
   * @param {string} symbol - Asset symbol (e.g., 'AAPL', 'bitcoin')
   * @param {string} dataSource - 'eodhd' or 'coingecko'
   * @param {string} exchange - Exchange for stocks (e.g., 'US', 'LSE')
   * @returns {Promise<Object>} Price data
   */
  async getAssetPrice(symbol, dataSource, exchange = 'US') {
    try {
      if (dataSource === 'eodhd') {
        return await this.getEODHDPrice(symbol, exchange);
      } else if (dataSource === 'coingecko') {
        return await this.getCoinGeckoPrice(symbol);
      } else {
        throw new Error(`Unsupported data source: ${dataSource}`);
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol} from ${dataSource}:`, error.message);
      throw error;
    }
  }

  /**
   * Get stock/ETF price from EODHD API
   * @param {string} symbol - Stock symbol (e.g., 'AAPL')
   * @param {string} exchange - Exchange code (e.g., 'US', 'LSE')
   * @returns {Promise<Object>} Price data
   */
  async getEODHDPrice(symbol, exchange = 'US') {
    const url = `${this.eodhd_base_url}/real-time/${symbol}.${exchange}`;
    const params = {
      api_token: this.eodhd_api_key,
      fmt: 'json'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    return {
      symbol: symbol,
      price: parseFloat(data.close || data.price),
      currency: 'USD', // Most EODHD assets are in USD
      timestamp: new Date(data.timestamp * 1000),
      change: parseFloat(data.change),
      change_percent: parseFloat(data.change_p),
      volume: parseInt(data.volume),
      data_source: 'eodhd'
    };
  }

  /**
   * Get cryptocurrency price from CoinGecko API
   * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
   * @returns {Promise<Object>} Price data
   */
  async getCoinGeckoPrice(coinId) {
    const url = `${this.coingecko_base_url}/simple/price`;
    const params = {
      ids: coinId.toLowerCase(),
      vs_currencies: 'usd',
      include_24hr_change: true,
      include_24hr_vol: true,
      include_last_updated_at: true
    };

    const response = await axios.get(url, { params });
    const data = response.data[coinId.toLowerCase()];

    if (!data) {
      throw new Error(`Cryptocurrency ${coinId} not found`);
    }

    return {
      symbol: coinId.toUpperCase(),
      price: data.usd,
      currency: 'USD',
      timestamp: new Date(data.last_updated_at * 1000),
      change_percent: data.usd_24h_change,
      volume: data.usd_24h_vol,
      data_source: 'coingecko'
    };
  }

  /**
   * Get multiple asset prices in bulk
   * @param {Array} assets - Array of {symbol, dataSource, exchange} objects
   * @returns {Promise<Array>} Array of price data
   */
  async getBulkPrices(assets) {
    const pricePromises = assets.map(asset => 
      this.getAssetPrice(asset.symbol, asset.data_source, asset.exchange)
        .catch(error => ({
          symbol: asset.symbol,
          error: error.message,
          data_source: asset.data_source
        }))
    );

    return await Promise.all(pricePromises);
  }

  /**
   * Search for assets across both EODHD and CoinGecko
   * @param {string} query - Search query
   * @returns {Promise<Array>} Combined search results
   */
  async searchAssets(query) {
    try {
      const [eodhd_results, coingecko_results] = await Promise.allSettled([
        this.searchEODHDAssets(query),
        this.searchCoinGeckoAssets(query)
      ]);

      const results = [];

      // Add EODHD results
      if (eodhd_results.status === 'fulfilled') {
        results.push(...eodhd_results.value);
      }

      // Add CoinGecko results
      if (coingecko_results.status === 'fulfilled') {
        results.push(...coingecko_results.value);
      }

      return results;
    } catch (error) {
      console.error('Error searching assets:', error.message);
      throw error;
    }
  }

  /**
   * Search for stocks/ETFs in EODHD
   * @param {string} query - Search query
   * @returns {Promise<Array>} EODHD search results
   */
  async searchEODHDAssets(query) {
    const url = `${this.eodhd_base_url}/search/${query}`;
    const params = {
      api_token: this.eodhd_api_key,
      limit: 20
    };

    const response = await axios.get(url, { params });
    
    return response.data.map(item => ({
      symbol: item.Code,
      name: item.Name,
      exchange: item.Exchange,
      currency: item.Currency || 'USD',
      type: item.Type?.toLowerCase() || 'stock',
      country: item.Country,
      data_source: 'eodhd'
    }));
  }

  /**
   * Search for cryptocurrencies in CoinGecko
   * @param {string} query - Search query
   * @returns {Promise<Array>} CoinGecko search results
   */
  async searchCoinGeckoAssets(query) {
    const url = `${this.coingecko_base_url}/search`;
    const params = {
      query: query
    };

    const response = await axios.get(url, { params });
    
    return response.data.coins.slice(0, 20).map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      exchange: 'GLOBAL',
      currency: 'USD',
      type: 'crypto',
      country: 'GLOBAL',
      data_source: 'coingecko',
      coingecko_id: coin.id // Store the CoinGecko ID for price fetching
    }));
  }

  /**
   * Get historical price data for an asset
   * @param {string} symbol - Asset symbol
   * @param {string} dataSource - 'eodhd' or 'coingecko'
   * @param {string} period - Time period ('1d', '7d', '1m', '3m', '1y')
   * @param {string} exchange - Exchange for stocks
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalPrices(symbol, dataSource, period = '1m', exchange = 'US') {
    try {
      if (dataSource === 'eodhd') {
        return await this.getEODHDHistoricalPrices(symbol, exchange, period);
      } else if (dataSource === 'coingecko') {
        return await this.getCoinGeckoHistoricalPrices(symbol, period);
      } else {
        throw new Error(`Unsupported data source: ${dataSource}`);
      }
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get historical prices from EODHD
   */
  async getEODHDHistoricalPrices(symbol, exchange, period) {
    const url = `${this.eodhd_base_url}/eod/${symbol}.${exchange}`;
    const params = {
      api_token: this.eodhd_api_key,
      period: period,
      fmt: 'json'
    };

    const response = await axios.get(url, { params });
    
    return response.data.map(item => ({
      date: item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume),
      data_source: 'eodhd'
    }));
  }

  /**
   * Get historical prices from CoinGecko
   */
  async getCoinGeckoHistoricalPrices(coinId, period) {
    const days = this.periodToDays(period);
    const url = `${this.coingecko_base_url}/coins/${coinId.toLowerCase()}/market_chart`;
    const params = {
      vs_currency: 'usd',
      days: days
    };

    const response = await axios.get(url, { params });
    
    return response.data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      close: price,
      data_source: 'coingecko'
    }));
  }

  /**
   * Convert period string to days for CoinGecko API
   */
  periodToDays(period) {
    const periodMap = {
      '1d': 1,
      '7d': 7,
      '1m': 30,
      '3m': 90,
      '1y': 365
    };
    return periodMap[period] || 30;
  }
}

module.exports = new PriceService();
