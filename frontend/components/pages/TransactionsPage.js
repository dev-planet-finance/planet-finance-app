'use client';

import React, { useState } from 'react';

export default function TransactionsPage() {
  const [transactionType, setTransactionType] = useState('buy');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [transactionStage, setTransactionStage] = useState('search'); // 'search' or 'details'
  const [cashTransactionType, setCashTransactionType] = useState('deposit');

  // Mock assets data matching Magic Patterns
  const mockAssets = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 403.78, type: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, type: 'stock' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.15, type: 'stock' },
    { symbol: 'NVDA', name: 'Nvidia Corp.', price: 950.02, type: 'stock' }
  ];

  const filteredAssets = mockAssets.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setTransactionStage('details');
  };

  const handleBackToSearch = () => {
    setSelectedAsset(null);
    setTransactionStage('search');
  };

  const recentTransactions = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', action: 'buy', quantity: 10, price: 185.20, total: 1852.00, date: '2024-01-15', portfolio: 'Main Portfolio' },
    { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.', action: 'sell', quantity: 5, price: 142.80, total: 714.00, date: '2024-01-14', portfolio: 'Tech Stocks' },
    { id: 3, symbol: 'BTC', name: 'Bitcoin', action: 'buy', quantity: 0.1, price: 67420.00, total: 6742.00, date: '2024-01-13', portfolio: 'Main Portfolio' },
    { id: 4, symbol: 'CASH', name: 'Cash Deposit', action: 'deposit', quantity: 1, price: 5000.00, total: 5000.00, date: '2024-01-12', portfolio: 'Main Portfolio' },
    { id: 5, symbol: 'MSFT', name: 'Microsoft Corp.', action: 'buy', quantity: 8, price: 378.85, total: 3030.80, date: '2024-01-11', portfolio: 'Retirement' }
  ];

  return (
    <div className="space-y-6">
      {/* Transaction Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Transaction */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Transaction</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAssetForm(true)}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  showAssetForm
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Asset
              </button>
              <button
                onClick={() => setShowAssetForm(false)}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  !showAssetForm
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Cash
              </button>
            </div>
          </div>
          
          {showAssetForm ? (
            !selectedAsset ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Assets
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stocks, ETFs, crypto..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAssetSearch()}
                    />
                    <button
                      onClick={handleAssetSearch}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Search Results:</p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {searchResults.map((asset) => (
                        <button
                          key={asset.symbol}
                          onClick={() => selectAsset(asset)}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{asset.symbol}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                ${asset.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {asset.type}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedAsset.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{selectedAsset.name}</div>
                  </div>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTransactionTab('buy')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTransactionTab === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setActiveTransactionTab('sell')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTransactionTab === 'sell'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    Sell
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price per Share
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={selectedAsset.price}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Portfolio
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="main">Main Portfolio</option>
                      <option value="retirement">Retirement</option>
                      <option value="tech">Tech Stocks</option>
                    </select>
                  </div>
                  
                  <button
                    className={`w-full py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      activeTransactionTab === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {activeTransactionTab === 'buy' ? 'Buy Asset' : 'Sell Asset'}
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Cash Transaction Form */
            <div className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveTransactionTab('deposit')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTransactionTab === 'deposit'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTransactionTab('withdrawal')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTransactionTab === 'withdrawal'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Withdrawal
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Portfolio
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="main">Main Portfolio</option>
                  <option value="retirement">Retirement</option>
                  <option value="tech">Tech Stocks</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              
              <button
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add {activeTransactionTab === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Quick Buy</span>
              </div>
            </button>
            
            <button className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span className="font-medium">Quick Sell</span>
              </div>
            </button>
            
            <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="font-medium">Import CSV</span>
              </div>
            </button>
            
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="font-medium">Rebalance</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search transactions..."
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Asset</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{transaction.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.action === 'buy' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : transaction.action === 'sell'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {transaction.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-gray-900 dark:text-white font-medium">
                    {transaction.quantity}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-900 dark:text-white">
                    ${transaction.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-900 dark:text-white font-medium">
                    ${transaction.total.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                    {transaction.portfolio}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
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
