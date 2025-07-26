'use client';

import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import OverviewPage from '../pages/OverviewPage';
import PortfolioPage from '../pages/PortfolioPage';
import TransactionsPage from '../pages/TransactionsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SettingsPage from '../pages/SettingsPage';
import WatchlistsPage from '../pages/WatchlistsPage';

export default function PortfolioDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'watchlists':
        return <WatchlistsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActivePage()}
    </DashboardLayout>
  );
}
