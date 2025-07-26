# Planet Finance Database Schema Documentation

## Overview

This database schema is designed to handle comprehensive portfolio tracking with support for:
- Multiple portfolios per user
- Multi-platform asset tracking (stocks, ETFs, crypto)
- Complex transaction types (buy, sell, transfer, dividend, splits)
- Multi-currency support with automatic conversion
- Cost basis calculations (FIFO/LIFO/Average)
- Real-time portfolio performance tracking
- Historical data and analytics

## Core Tables

### 1. Users
- **Purpose**: User authentication and profile management
- **Key Features**: Firebase integration, subscription tiers, base currency preference
- **Relationships**: One-to-many with portfolios, transactions, holdings

### 2. Portfolios
- **Purpose**: Multiple portfolio support (e.g., "Main Portfolio", "Crypto Portfolio")
- **Key Features**: Portfolio-specific base currency, active/inactive status
- **Relationships**: Belongs to user, has many transactions and holdings

### 3. Assets
- **Purpose**: Master list of all tradeable assets (stocks, ETFs, crypto)
- **Key Features**: Multi-source data (EODHD, CoinGecko), sector/industry classification
- **Data Sources**: 
  - `eodhd`: Stocks and ETFs from EODHD API
  - `coingecko`: Cryptocurrencies from CoinGecko API
  - `manual`: User-added custom assets

### 4. Platforms
- **Purpose**: Trading platforms/brokers (Robinhood, Interactive Brokers, Coinbase)
- **Key Features**: User-specific platform lists, platform types (broker, exchange, wallet)
- **Relationships**: User-specific, referenced in transactions and holdings

### 5. Transactions (Core Table)
- **Purpose**: All portfolio activities and the foundation for calculations
- **Transaction Types**:
  - `cash_deposit` / `cash_withdrawal`: Cash movements
  - `buy` / `sell`: Asset purchases and sales
  - `dividend`: Dividend payments (cash or DRIP)
  - `transfer_in` / `transfer_out`: Cross-platform asset transfers
  - `split`: Stock splits
  - `free_asset`: Free stocks from brokers

**Key Fields**:
- `quantity`: Number of shares/units
- `price_per_unit`: Purchase/sale price
- `total_amount`: Total transaction value
- `fee_amount`: Transaction fees
- `exchange_rate_to_base`: Currency conversion rate
- `affects_cash_balance`: Whether transaction impacts cash balance

### 6. Holdings
- **Purpose**: Current positions calculated from transaction history
- **Key Features**: 
  - Real-time position tracking
  - Cost basis calculations (FIFO/LIFO/Average)
  - Performance metrics (unrealized P&L)
  - Dividend tracking

### 7. Cash Balances
- **Purpose**: Track cash in different currencies across platforms
- **Key Features**: Multi-currency support, platform-specific balances

## Supporting Tables

### Price History
- Historical price data for all assets
- Supports charting and performance analysis
- Multiple data sources with source attribution

### Exchange Rates
- Currency conversion rates for multi-currency portfolios
- Historical rates for accurate P&L calculations
- Multiple data sources for reliability

### Portfolio Snapshots
- Daily/periodic portfolio performance snapshots
- Enables historical performance tracking and charting
- Aggregated metrics (total value, P&L, number of positions)

### Stock Splits
- Stock split events and processing status
- Automatic adjustment of historical transactions
- Split ratio tracking (e.g., 2:1, 3:2 splits)

### Dividend Payments
- Historical dividend payments per asset
- Supports dividend projection and analysis
- Multiple dividend types (regular, special, return of capital)

## Key Design Decisions

### 1. Transaction-Based Architecture
- All portfolio data derived from transaction history
- Ensures data integrity and auditability
- Supports complex scenarios (transfers, splits, DRIP)

### 2. Multi-Currency Support
- Every transaction stores currency and exchange rate
- Base currency conversion at portfolio and user level
- Historical exchange rate preservation

### 3. Platform Separation
- Assets can be held across multiple platforms
- Enables cross-platform transfer tracking
- Platform-specific cash balance management

### 4. Flexible Cost Basis
- Support for FIFO, LIFO, and Average cost methods
- User-selectable calculation method per holding
- Accurate tax reporting capabilities

### 5. Real-Time Performance
- Holdings table maintains current positions
- Price updates trigger performance recalculation
- Efficient querying for dashboard displays

## Data Flow

1. **User Registration**: Creates user record with preferences
2. **Portfolio Creation**: User creates one or more portfolios
3. **Platform Setup**: User adds their trading platforms
4. **Asset Discovery**: Assets added via API search or manual entry
5. **Transaction Entry**: All activities recorded as transactions
6. **Holdings Calculation**: Current positions calculated from transactions
7. **Performance Updates**: Real-time price updates trigger P&L calculations
8. **Historical Snapshots**: Periodic snapshots for trend analysis

## Indexes and Performance

Key indexes created for optimal query performance:
- Transaction lookups by user/portfolio/date
- Holdings by portfolio and user
- Price history by asset and date
- Exchange rates by currency pair and date

## Scalability Considerations

- UUID primary keys for distributed systems
- Partitioning potential on user_id or date ranges
- Efficient aggregation queries for dashboard views
- Separate read replicas for analytics queries

## Security Features

- Row-level security potential with user_id filtering
- Audit trail via created_at/updated_at timestamps
- Soft deletes with is_active flags
- Foreign key constraints for data integrity
