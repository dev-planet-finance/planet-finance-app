'use client';

import React, { useState } from 'react';

export default function PortfoliosPage() {
  const [activePortfolio, setActivePortfolio] = useState('main');

  const portfolios = [
    { id: 'main', name: 'Main Portfolio' },
    { id: 'retirement', name: 'Retirement' },
    { id: 'tech', name: 'Tech Stocks' }
  ];

  // Mock data matching Magic Patterns design
  const portfolioMetrics = {
    totalValue: 8048.84,
    totalCost: 6900,
    totalGainLoss: 1148.84,
    gainLossPercent: 16.65,
    dividendIncome: 109.7
  };

  const mainPortfolioAssets = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 15, 
      price: 178.72, 
      value: 2680.8, 
      cost: 2200, 
      gainLoss: 480.8, 
      gainLossPercent: 21.85,
      dividend: 42.50
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      shares: 8, 
      price: 403.78, 
      value: 3230.24, 
      cost: 2800, 
      gainLoss: 430.24, 
      gainLossPercent: 15.37,
      dividend: 67.20
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      shares: 12, 
      price: 178.15, 
      value: 2137.8, 
      cost: 1900, 
      gainLoss: 237.8, 
      gainLossPercent: 12.52,
      dividend: 0.00
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolios</h1>
      </div>

      {/* Portfolio Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setActivePortfolio(portfolio.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activePortfolio === portfolio.id
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {portfolio.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Portfolio Content */}
        <div className="p-6">
          {/* Portfolio Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-sm">
              <div className="text-sm font-medium text-gray-400 mb-2">Total Value</div>
              <div className="text-2xl font-bold text-white">
                ${portfolioMetrics.totalValue.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-sm">
              <div className="text-sm font-medium text-gray-400 mb-2">Total Cost</div>
              <div className="text-2xl font-bold text-white">
                ${portfolioMetrics.totalCost.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-sm">
              <div className="text-sm font-medium text-gray-400 mb-2">Total Gain/Loss</div>
              <div className="text-2xl font-bold text-white">
                ${portfolioMetrics.totalGainLoss.toLocaleString()}
              </div>
              <div className="text-sm text-green-400 mt-1">
                +{portfolioMetrics.gainLossPercent.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-sm">
              <div className="text-sm font-medium text-gray-400 mb-2">Dividend Income</div>
              <div className="text-2xl font-bold text-white">
                ${portfolioMetrics.dividendIncome.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Main Portfolio Assets */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Main Portfolio Assets</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">ASSET</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">SHARES</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">PRICE</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">VALUE</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">COST</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">GAIN/LOSS</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">DIVIDEND</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {mainPortfolioAssets.map((asset, index) => (
                    <tr key={asset.symbol} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{asset.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{asset.symbol}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">{asset.shares}</td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${asset.price.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">${asset.value.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${asset.cost.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <div className={`font-medium ${asset.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ${asset.gainLoss.toFixed(2)}
                        </div>
                        <div className={`text-sm ${asset.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {asset.gainLoss >= 0 ? '+' : ''}{asset.gainLossPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${asset.dividend.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Allocation</h3>
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Asset allocation chart</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Return</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">+12.5%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Annualized Return</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">+8.7%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Volatility</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">15.2%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">1.24</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Drawdown</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">-8.3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
