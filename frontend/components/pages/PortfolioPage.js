'use client';

import React, { useState } from 'react';

export default function PortfolioPage() {
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
                  </tr>
                </thead>
                <tbody>
                  {mainPortfolioAssets.map((asset) => (
                    <tr key={asset.symbol} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-white">{asset.name}</div>
                          <div className="text-sm text-gray-400">{asset.symbol}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white">{asset.shares}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white">${asset.price.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white">${asset.value.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white">${asset.cost.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="text-green-400">
                          <div className="font-medium">${asset.gainLoss.toFixed(1)}</div>
                          <div className="text-sm">+{asset.gainLossPercent.toFixed(2)}%</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white">${asset.dividend.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
