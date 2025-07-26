'use client';

import React, { useState } from 'react';

export default function OverviewPage() {
  const [performanceTimeRange, setPerformanceTimeRange] = useState('1M');
  
  // Mock data for demonstration
  const portfolioMetrics = {
    totalValue: 14575.64,
    totalCost: 12700,
    totalGainLoss: 1875.64,
    gainLossPercent: 14.77,
    totalAssets: 5
  };

  const assets = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 15, 
      price: 178.72, 
      value: 2680.8, 
      gainLoss: 480.8, 
      gainLossPercent: 21.85 
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      shares: 8, 
      price: 403.78, 
      value: 3230.24, 
      gainLoss: 430.24, 
      gainLossPercent: 15.37 
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      shares: 12, 
      price: 178.15, 
      value: 2137.8, 
      gainLoss: 237.8, 
      gainLossPercent: 12.52 
    }
  ];

  const timeRanges = ['1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h1>
      </div>

      {/* Portfolio Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            +{portfolioMetrics.gainLossPercent}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-sm">
          <div className="text-sm font-medium text-gray-400 mb-2">Assets</div>
          <div className="text-2xl font-bold text-white">
            {portfolioMetrics.totalAssets}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Performance (July)</h2>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setPerformanceTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  performanceTimeRange === range
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-between px-8 pb-8">
            {/* Mock chart line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              <path
                d="M 40 160 Q 100 140 160 120 T 280 80 T 360 40"
                stroke="#8B5CF6"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />
            </svg>
            {/* Y-axis labels */}
            <div className="absolute left-4 top-4 text-xs text-gray-400">$15,000</div>
            <div className="absolute left-4 top-1/2 text-xs text-gray-400">$11,000</div>
            <div className="absolute left-4 bottom-8 text-xs text-gray-400">$10,000</div>
            {/* X-axis labels */}
            <div className="absolute bottom-2 left-12 text-xs text-gray-400">10</div>
            <div className="absolute bottom-2 left-1/2 text-xs text-gray-400">15</div>
            <div className="absolute bottom-2 right-16 text-xs text-gray-400">20</div>
            <div className="absolute bottom-2 right-8 text-xs text-gray-400">25</div>
          </div>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Portfolio Value</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">$15,800</span>
              <span className="text-sm text-green-400">+5.12% (+$768.00%)</span>
            </div>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-48 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150">
            <path
              d="M 40 120 Q 80 110 120 100 T 200 90 T 280 70 T 360 50"
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
            />
            {/* Data points */}
            <circle cx="40" cy="120" r="3" fill="#8B5CF6" />
            <circle cx="120" cy="100" r="3" fill="#8B5CF6" />
            <circle cx="200" cy="90" r="3" fill="#8B5CF6" />
            <circle cx="280" cy="70" r="3" fill="#8B5CF6" />
            <circle cx="360" cy="50" r="3" fill="#8B5CF6" />
          </svg>
          {/* X-axis labels */}
          <div className="absolute bottom-2 left-8 text-xs text-gray-400">Jan</div>
          <div className="absolute bottom-2 left-20 text-xs text-gray-400">Feb</div>
          <div className="absolute bottom-2 left-32 text-xs text-gray-400">Mar</div>
          <div className="absolute bottom-2 right-32 text-xs text-gray-400">Apr</div>
          <div className="absolute bottom-2 right-20 text-xs text-gray-400">May</div>
          <div className="absolute bottom-2 right-8 text-xs text-gray-400">Jun</div>
          {/* Y-axis labels */}
          <div className="absolute left-2 top-4 text-xs text-gray-400">$16,000</div>
          <div className="absolute left-2 top-1/2 text-xs text-gray-400">$12,000</div>
          <div className="absolute left-2 bottom-8 text-xs text-gray-400">$8,000</div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Assets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">ASSET</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">SHARES</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">PRICE</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">VALUE</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">GAIN/LOSS</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
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
                    <div className="text-green-400">
                      <div className="font-medium">${asset.gainLoss.toFixed(1)}</div>
                      <div className="text-sm">+{asset.gainLossPercent.toFixed(2)}%</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
