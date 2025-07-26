# 🌍 Planet Finance App

> **A comprehensive portfolio tracking platform inspired by Delta by eToro and Stock Events**

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](https://github.com/planetfinance/planet-finance-app)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20PostgreSQL-blue)](https://github.com/planetfinance/planet-finance-app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Project Vision

Building the next-generation investment tracking platform that rivals Delta by eToro and Stock Events. Planet Finance will provide comprehensive portfolio management across stocks, ETFs, and cryptocurrencies with real-time data, advanced analytics, and professional-grade features.

## 🚀 Current Development Status

### ✅ **COMPLETED (Sprint 1-2)**
- **🔐 Firebase Authentication System**
  - User registration and login
  - JWT token management
  - Secure logout functionality
  - Authentication middleware

- **🏗️ Backend Infrastructure**
  - Node.js/Express API server
  - PostgreSQL database with optimized schema
  - RESTful API endpoints for portfolios, transactions, prices
  - CORS configuration and security middleware

- **💾 Database Architecture**
  - Users, portfolios, transactions, assets tables
  - UUID primary keys and foreign key relationships
  - Sample data and migration scripts
  - Optimized indexes for performance

- **📊 Price Data Integration**
  - EODHD API for stocks/ETFs (with API key: `6864e8b7da7074.72988217`)
  - CoinGecko API for cryptocurrency data
  - Asset search across multiple data sources
  - Bulk pricing and historical data endpoints

- **🎨 Frontend Foundation**
  - Next.js 14 with App Router
  - TailwindCSS + ShadCN UI components
  - Dark/light mode toggle
  - Responsive design system
  - Authentication context and state management

### 🔧 **IN PROGRESS (Sprint 3)**
- **📱 Portfolio Dashboard**
  - Portfolio overview with key metrics
  - Transaction management interface
  - Asset search and discovery
  - Real-time data integration
  - ⚠️ *Currently fixing JSX syntax errors in dashboard component*

### 🎯 **UPCOMING SPRINTS**

#### **Sprint 4: Dashboard Completion & Core Features**
- Fix portfolio dashboard JSX syntax issues
- Complete transaction CRUD operations
- Implement portfolio performance calculations
- Add transaction history and filtering
- Real-time price updates and portfolio valuation

#### **Sprint 5: Advanced Portfolio Analytics**
- Portfolio performance charts (daily, weekly, monthly, yearly)
- Asset allocation pie charts and breakdowns
- Gain/loss calculations with cost basis tracking
- Portfolio rebalancing recommendations
- Historical performance tracking

#### **Sprint 6: Multi-Currency & International Markets**
- Multi-currency portfolio support
- Automatic currency conversion
- International stock exchanges (LSE, TSX, ASX)
- Currency-specific formatting and display

#### **Sprint 7: Transaction Management Pro**
- Advanced transaction types (splits, dividends, transfers)
- CSV import/export functionality
- Bulk transaction operations
- Transaction categories and tagging
- Cost basis calculation methods (FIFO, LIFO, Average)

#### **Sprint 8: Mobile Experience**
- Mobile-responsive design optimization
- Touch-friendly interface improvements
- Progressive Web App (PWA) features
- Mobile-specific navigation patterns

#### **Sprint 9: Social & Sharing Features**
- Portfolio sharing and social features
- Performance comparisons and benchmarking
- Community insights and discussions
- Public portfolio showcases

#### **Sprint 10: Premium Features & Monetization**
- Stripe payment integration
- Premium subscription tiers
- Advanced analytics and reporting
- API access for power users
- White-label solutions

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + ShadCN UI
- **State Management**: React Context + Local Storage
- **Authentication**: Firebase Client SDK
- **Charts**: Recharts / Chart.js (planned)

### **Backend**
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL on Railway.com
- **Authentication**: Firebase Admin SDK
- **APIs**: EODHD (stocks/ETFs), CoinGecko (crypto)
- **Security**: Helmet, CORS, JWT validation

### **Infrastructure**
- **Version Control**: GitHub
- **Frontend Hosting**: Vercel.com
- **Backend Hosting**: Railway.com
- **Database**: PostgreSQL on Railway
- **CDN**: Vercel Edge Network

### **Development Ports**
- **Backend**: `localhost:5000`
- **Frontend**: `localhost:3002`

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project setup
- EODHD API key

### Quick Setup

```bash
# Clone repository
git clone https://github.com/planetfinance/planet-finance-app.git
cd planet-finance-app

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev  # Starts on port 5000

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.local.example .env.local  # Configure your environment
npm run dev  # Starts on port 3002
```


## 📚 Documentation

- **[Backend API Documentation](./backend/README.md)** - Complete API reference
- **[Database Schema](./database/README.md)** - Database design and setup
- **[Frontend Components](./frontend/README.md)** - UI component library

## 🎨 Design Philosophy

**Inspired by the best:**
- **Delta by eToro**: Clean, professional interface with focus on portfolio performance
- **Stock Events**: Modern design patterns and user experience
- **Robinhood**: Simple, accessible investment tracking
- **Personal Capital**: Comprehensive financial dashboard

**Key Design Principles:**
- **Simplicity**: Clean, uncluttered interface
- **Performance**: Fast loading and real-time updates
- **Accessibility**: Dark/light mode, keyboard navigation
- **Mobile-First**: Responsive design for all devices
- **Professional**: Trading platform-grade UI/UX

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap to Production

**Phase 1: MVP (Sprints 1-4)** - Core portfolio tracking ✅
**Phase 2: Advanced Features (Sprints 5-7)** - Analytics and multi-currency
**Phase 3: Mobile & Social (Sprints 8-9)** - Mobile optimization and sharing
**Phase 4: Monetization (Sprint 10)** - Premium features and revenue

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built by Planet Finance Team**

*Creating the future of investment tracking, one commit at a time.*
3. Backend API development
4. Frontend React components
5. API integrations (EODHD, CoinGecko)
6. Testing and deployment
