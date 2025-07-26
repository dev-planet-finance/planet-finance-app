import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Portfolio API calls
export const portfolioAPI = {
  // Get all portfolios for authenticated user
  getPortfolios: () => api.get('/api/portfolios'),
  
  // Create new portfolio
  createPortfolio: (portfolioData) => api.post('/api/portfolios', portfolioData),
  
  // Get portfolio summary with holdings
  getPortfolioSummary: (portfolioId) => api.get(`/api/portfolios/${portfolioId}/summary`),
  
  // Update portfolio
  updatePortfolio: (portfolioId, updateData) => api.put(`/api/portfolios/${portfolioId}`, updateData),
  
  // Delete portfolio
  deletePortfolio: (portfolioId) => api.delete(`/api/portfolios/${portfolioId}`),
  
  // Get portfolio performance
  getPortfolioPerformance: (portfolioId, period = '1m') => 
    api.get(`/api/portfolios/${portfolioId}/performance?period=${period}`),
};

// Transaction API calls
export const transactionAPI = {
  // Get transaction history
  getTransactions: (portfolioId, filters = {}) => {
    const params = new URLSearchParams({ portfolioId, ...filters });
    return api.get(`/api/transactions?${params}`);
  },
  
  // Create new transaction
  createTransaction: (transactionData) => api.post('/api/transactions', transactionData),
  
  // Create cash transaction (deposit/withdrawal)
  createCashTransaction: (transactionData) => api.post('/api/transactions/cash', transactionData),
  
  // Create asset transaction (buy/sell)
  createAssetTransaction: (transactionData) => api.post('/api/transactions/asset', transactionData),
  
  // Bulk transaction creation
  createBulkTransactions: (transactions) => api.post('/api/transactions/bulk', { transactions }),
};

// Price API calls
export const priceAPI = {
  // Get asset price
  getAssetPrice: (symbol, source = null, exchange = 'US') => {
    const params = new URLSearchParams({ exchange });
    if (source) params.append('source', source);
    return api.get(`/api/prices/${symbol}?${params}`);
  },
  
  // Get stock price
  getStockPrice: (symbol, exchange = 'US') => 
    api.get(`/api/prices/stocks/${symbol}?exchange=${exchange}`),
  
  // Get crypto price
  getCryptoPrice: (symbol) => api.get(`/api/prices/crypto/${symbol}`),
  
  // Search assets
  searchAssets: (query) => api.get(`/api/prices/search?q=${encodeURIComponent(query)}`),
  
  // Get bulk prices
  getBulkPrices: (assets) => api.post('/api/prices/bulk', { assets }),
  
  // Get historical prices
  getHistoricalPrices: (symbol, period = '1m', source = null, exchange = 'US') => {
    const params = new URLSearchParams({ period, exchange });
    if (source) params.append('source', source);
    return api.get(`/api/prices/historical/${symbol}?${params}`);
  },
  
  // Get exchange rates
  getExchangeRates: () => api.get('/api/prices/exchange-rates'),
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.statusText;
    return { success: false, error: message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { success: false, error: 'Network error - please check your connection' };
  } else {
    // Something else happened
    return { success: false, error: error.message };
  }
};

export default api;
