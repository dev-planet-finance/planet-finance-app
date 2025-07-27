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
        
        // For new users or API errors, show empty portfolio (no mock data)
        setPortfolioData({
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          totalAssets: 0,
          totalCash: 0,
          holdings: []
        });
        console.log('✅ Showing empty portfolio for new user or API error');
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
          {portfolioData.holdings && portfolioData.holdings.length > 0 ? (
            portfolioData.holdings.slice(0, 3).map((holding, index) => (
              <div key={holding.symbol || index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{holding.asset_name || holding.symbol || 'Unknown Asset'}</p>
                    <p className="text-sm text-gray-500">{holding.symbol || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(holding.current_value || 0).toLocaleString()}</p>
                  <p className={`text-sm font-medium ${
                    (holding.gain_loss_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(holding.gain_loss_percent || 0) >= 0 ? '+' : ''}{(holding.gain_loss_percent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No holdings to display</p>
              <p className="text-sm mt-1">Start investing to see your top performers here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
