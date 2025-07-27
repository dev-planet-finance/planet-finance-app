'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SummaryCard from '@/components/ui/SummaryCard';

const OverviewPage = () => {
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    totalAssets: 0,
    totalCash: 0,
    holdings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data for demonstration (matching Magic Patterns style)
  const mockAssets = [
    {
      name: 'Apple Inc.',
      symbol: 'AAPL',
      shares: 15,
      price: 178.72,
      value: 2680.8,
      cost: 2200,
      gain: 480.8,
      gainPercent: 21.85,
    },
    {
      name: 'Microsoft Corp.',
      symbol: 'MSFT',
      shares: 8,
      price: 403.78,
      value: 3230.24,
      cost: 2800,
      gain: 430.24,
      gainPercent: 15.37,
    },
    {
      name: 'Amazon.com Inc.',
      symbol: 'AMZN',
      shares: 12,
      price: 178.15,
      value: 2137.8,
      cost: 1900,
      gain: 237.8,
      gainPercent: 12.52,
    },
    {
      name: 'Tesla Inc.',
      symbol: 'TSLA',
      shares: 10,
      price: 177.67,
      value: 1776.7,
      cost: 2000,
      gain: -223.3,
      gainPercent: -11.17,
    },
    {
      name: 'Nvidia Corp.',
      symbol: 'NVDA',
      shares: 5,
      price: 950.02,
      value: 4750.1,
      cost: 3800,
      gain: 950.1,
      gainPercent: 25,
    },
  ];

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalCost = mockAssets.reduce((sum, asset) => sum + asset.cost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Use backend API to fetch real portfolio data
        const { portfolioAPI } = await import('@/lib/api');
        const response = await portfolioAPI.getPortfolioSummary();
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Transform backend data to frontend format
          setPortfolioData({
            totalValue: data.summary.total_portfolio_value,
            totalGainLoss: data.summary.total_gain_loss,
            totalGainLossPercent: data.summary.total_percent_gain_loss,
            totalAssets: data.summary.holdings_count,
            totalCash: data.summary.total_cash,
            holdings: data.holdings || []
          });
          
          console.log('✅ Portfolio data loaded from backend:', data.summary);
        } else {
          throw new Error(response.data.error || 'Failed to fetch portfolio data');
        }
      } catch (err) {
        console.error('❌ Error fetching portfolio data:', err);
        setError(err.response?.data?.error || err.message || 'Error loading portfolio data');
        
        // Fallback to mock data for development
        setPortfolioData({
          totalValue: totalValue,
          totalGainLoss: totalGain,
          totalGainLossPercent: totalGainPercent,
          totalAssets: mockAssets.length,
          totalCash: 5000,
          holdings: mockAssets
        });
        console.log('⚠️ Using fallback mock data due to API error');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Portfolio Value"
            value={`$${portfolioData.totalValue.toLocaleString()}`}
          />
          <SummaryCard
            title="Total Cash"
            value={`$${portfolioData.totalCash.toLocaleString()}`}
          />
          <SummaryCard
            title="Total Gain/Loss"
            value={`$${portfolioData.totalGainLoss.toLocaleString()}`}
            change={portfolioData.totalGainLossPercent}
          />
          <SummaryCard
            title="Holdings"
            value={portfolioData.totalAssets.toString()}
          />
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Performance (July)</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-md text-sm bg-indigo-100 text-indigo-700 font-medium">
              1M
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              3M
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              6M
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              1Y
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              All
            </button>
          </div>
        </div>
        <div className="h-64 w-full relative">
          {/* Placeholder for chart */}
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Portfolio performance chart
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
        <div className="space-y-3">
          {mockAssets.slice(0, 3).map((asset, index) => (
            <div key={asset.symbol} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-500">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${asset.value.toLocaleString()}</p>
                <p className={`text-sm font-medium ${
                  asset.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {asset.gainPercent >= 0 ? '+' : ''}{asset.gainPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
