'use client';

import React, { useState } from 'react';

export default function WatchlistsPage() {
  const [activeWatchlistTab, setActiveWatchlistTab] = useState('tech-stocks');

  const watchlistTabs = [
    { id: 'tech-stocks', name: 'Tech Stocks' },
    { id: 'dividend-stocks', name: 'Dividend Stocks' },
    { id: 'etfs', name: 'ETFs' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'new', name: '+ New Watchlist', isNew: true }
  ];

  const techStocks = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      price: 178.72, 
      change: 1.25, 
      changePercent: 0.70, 
      marketCap: '2.8T', 
      pe: 29.4, 
      yield: 0.54 
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      price: 403.78, 
      change: 5.43, 
      changePercent: 1.36, 
      marketCap: '3.0T', 
      pe: 34.8, 
      yield: 0.72 
    },
    { 
      symbol: 'NVDA', 
      name: 'Nvidia Corp.', 
      price: 950.02, 
      change: -12.68, 
      changePercent: -1.32, 
      marketCap: '2.3T', 
      pe: 69.2, 
      yield: 0.03 
    },
    { 
      symbol: 'AMD', 
      name: 'AMD Inc.', 
      price: 156.44, 
      change: 2.32, 
      changePercent: 1.51, 
      marketCap: '252.6B', 
      pe: 92.3, 
      yield: null 
    },
    { 
      symbol: 'INTC', 
      name: 'Intel Corp.', 
      price: 21.45, 
      change: -0.35, 
      changePercent: -1.60, 
      marketCap: '90.7B', 
      pe: 22.1, 
      yield: 1.58 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlists</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Asset</span>
        </button>
      </div>

      {/* Watchlist Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {watchlistTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.isNew && setActiveWatchlistTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeWatchlistTab === tab.id && !tab.isNew
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : tab.isNew
                    ? 'border-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Watchlist Content */}
        <div className="p-6">
          {/* Tech Stocks Watchlist */}
          {activeWatchlistTab === 'tech-stocks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tech Stocks</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Watchlist Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ASSET</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">PRICE</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">CHANGE</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">MARKET CAP</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">P/E</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">YIELD</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techStocks.map((stock) => (
                      <tr key={stock.symbol} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${stock.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <div className="font-medium">
                              ${stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-gray-900 dark:text-white">{stock.marketCap}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-gray-900 dark:text-white">{stock.pe}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-gray-900 dark:text-white">
                            {stock.yield ? `${stock.yield.toFixed(2)}%` : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          )}

          {/* Other Watchlist Placeholders */}
          {activeWatchlistTab !== 'tech-stocks' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeWatchlistTab === 'dividend-stocks' && 'Dividend Stocks'}
                {activeWatchlistTab === 'etfs' && 'ETFs'}
                {activeWatchlistTab === 'crypto' && 'Crypto'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No assets in this watchlist yet.
              </p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                Add First Asset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
