'use client';

import React, { useState } from 'react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('1M');

  const performanceMetrics = [
    { label: 'Total Return', value: '+12.5%', change: '+2.1%', positive: true },
    { label: 'Annualized Return', value: '+8.7%', change: '+0.8%', positive: true },
    { label: 'Volatility', value: '15.2%', change: '-1.2%', positive: false },
    { label: 'Sharpe Ratio', value: '1.24', change: '+0.15', positive: true },
    { label: 'Max Drawdown', value: '-8.3%', change: '+2.1%', positive: true },
    { label: 'Beta', value: '0.92', change: '-0.05', positive: true }
  ];

  const sectorAllocation = [
    { sector: 'Technology', percentage: 35.2, value: 44280.15, color: 'bg-blue-500' },
    { sector: 'Healthcare', percentage: 18.7, value: 23533.45, color: 'bg-green-500' },
    { sector: 'Financial', percentage: 15.3, value: 19244.68, color: 'bg-purple-500' },
    { sector: 'Consumer', percentage: 12.8, value: 16108.46, color: 'bg-yellow-500' },
    { sector: 'Energy', percentage: 8.9, value: 11200.37, color: 'bg-red-500' },
    { sector: 'Other', percentage: 9.1, value: 11480.21, color: 'bg-gray-500' }
  ];

  const topHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', allocation: 12.5, value: 15730.91, change: 2.3 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', allocation: 10.8, value: 13591.59, change: 1.8 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', allocation: 8.2, value: 10319.48, change: -0.5 },
    { symbol: 'BTC', name: 'Bitcoin', allocation: 7.9, value: 9941.94, change: 5.2 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', allocation: 6.4, value: 8054.22, change: 1.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <div className="flex space-x-2">
            {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Portfolio Performance Chart</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Advanced charting coming soon</p>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
              <p className={`text-xs font-medium ${
                metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sector Allocation</h3>
          
          {/* Pie Chart Placeholder */}
          <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sector allocation chart</p>
            </div>
          </div>

          {/* Sector Breakdown */}
          <div className="space-y-3">
            {sectorAllocation.map((sector) => (
              <div key={sector.sector} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${sector.color}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{sector.sector}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{sector.percentage}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">${sector.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Holdings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Holdings</h3>
          
          <div className="space-y-4">
            {topHoldings.map((holding, index) => (
              <div key={holding.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{holding.symbol}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{holding.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {holding.allocation}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${holding.value.toLocaleString()}
                  </p>
                  <p className={`text-xs font-medium ${
                    holding.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Risk Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Level</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">Moderate</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VaR (95%)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">$2,847</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Correlation</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">0.73</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diversification</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Good</p>
          </div>
        </div>
      </div>

      {/* Dividend Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dividend Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Annual Dividend Income</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$2,847.32</p>
            <p className="text-sm text-green-600 dark:text-green-400">+12.5% vs last year</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dividend Yield</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2.26%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio average</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Next Dividend</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$124.50</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Feb 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
