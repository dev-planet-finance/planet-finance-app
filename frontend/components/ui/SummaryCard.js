'use client';

import React from 'react';

export default function SummaryCard({ title, value, change, icon }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-1 ${
              isPositive 
                ? 'text-green-600' 
                : isNegative 
                ? 'text-red-600' 
                : 'text-gray-500'
            }`}>
              {isPositive && '+'}
              {change?.toFixed(2)}%
            </p>
          )}
        </div>
        {change !== undefined && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isPositive 
              ? 'bg-green-50' 
              : isNegative 
              ? 'bg-red-50' 
              : 'bg-gray-50'
          }`}>
            {isPositive ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            ) : isNegative ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
