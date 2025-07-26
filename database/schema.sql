-- Planet Finance Portfolio Tracker Database Schema
-- PostgreSQL Database Schema for comprehensive portfolio tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, premium
    base_currency VARCHAR(3) DEFAULT 'USD' -- User's preferred base currency
);

-- Portfolios table for multiple portfolio support
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Assets table for storing asset information
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL, -- AAPL, BTC, etc.
    name VARCHAR(255) NOT NULL, -- Apple Inc., Bitcoin, etc.
    asset_type VARCHAR(50) NOT NULL, -- stock, etf, crypto, bond, commodity
    exchange VARCHAR(100), -- NASDAQ, NYSE, BINANCE, etc.
    currency VARCHAR(3) NOT NULL, -- USD, EUR, GBP, etc.
    sector VARCHAR(100), -- Technology, Finance, etc.
    industry VARCHAR(100), -- Software, Banking, etc.
    country VARCHAR(3), -- US, GB, DE, etc.
    data_source VARCHAR(50) NOT NULL, -- eodhd, coingecko, manual
    external_id VARCHAR(255), -- External API identifier
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange, data_source)
);

-- Platforms/Brokers table for tracking different trading platforms
CREATE TABLE platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Robinhood, Interactive Brokers, etc.
    platform_type VARCHAR(50) DEFAULT 'broker', -- broker, exchange, wallet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Transactions table - the core of portfolio tracking
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id), -- NULL for cash transactions
    platform_id UUID REFERENCES platforms(id),
    
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL, -- cash_deposit, cash_withdrawal, buy, sell, dividend, transfer_in, transfer_out, split, free_asset
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Quantities and prices
    quantity DECIMAL(20, 8), -- Number of shares/units (NULL for cash transactions)
    price_per_unit DECIMAL(20, 8), -- Price per share/unit
    total_amount DECIMAL(20, 2) NOT NULL, -- Total transaction amount
    
    -- Fees and costs
    fee_amount DECIMAL(20, 2) DEFAULT 0,
    fee_currency VARCHAR(3),
    fee_type VARCHAR(20) DEFAULT 'fixed', -- fixed, percentage
    
    -- Currency information
    transaction_currency VARCHAR(3) NOT NULL,
    exchange_rate_to_base DECIMAL(20, 8) DEFAULT 1, -- Exchange rate to portfolio base currency
    
    -- Transfer specific fields
    transfer_from_platform_id UUID REFERENCES platforms(id),
    transfer_to_platform_id UUID REFERENCES platforms(id),
    
    -- Dividend specific fields
    dividend_type VARCHAR(20), -- cash, drip (dividend reinvestment)
    
    -- Optional categorization fields
    asset_class VARCHAR(100), -- Large Cap, Small Cap, Growth, Value, etc.
    sector_override VARCHAR(100), -- User can override asset's default sector
    country_override VARCHAR(3), -- User can override asset's default country
    strategy VARCHAR(100), -- User-defined strategy (Long-term, Day Trading, etc.)
    
    -- Additional fields
    notes TEXT,
    affects_cash_balance BOOLEAN DEFAULT true, -- Whether this transaction affects cash balance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Holdings table for current positions (calculated from transactions)
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id),
    
    -- Current position
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost_basis DECIMAL(20, 8), -- Average purchase price
    total_cost_basis DECIMAL(20, 2), -- Total amount invested
    
    -- Cost basis calculation method
    cost_basis_method VARCHAR(20) DEFAULT 'fifo', -- fifo, lifo, average
    
    -- Performance metrics (calculated)
    current_price DECIMAL(20, 8),
    market_value DECIMAL(20, 2),
    unrealized_gain_loss DECIMAL(20, 2),
    unrealized_gain_loss_percent DECIMAL(10, 4),
    
    -- Dividend tracking
    total_dividends_received DECIMAL(20, 2) DEFAULT 0,
    
    -- Metadata
    first_purchase_date TIMESTAMP WITH TIME ZONE,
    last_transaction_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(portfolio_id, asset_id, platform_id)
);

-- Cash balances table for tracking cash in different currencies
CREATE TABLE cash_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id),
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(portfolio_id, platform_id, currency)
);

-- Price history table for storing historical price data
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    open_price DECIMAL(20, 8),
    high_price DECIMAL(20, 8),
    low_price DECIMAL(20, 8),
    close_price DECIMAL(20, 8) NOT NULL,
    volume BIGINT,
    data_source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(asset_id, price_date, data_source)
);

-- Exchange rates table for multi-currency support
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(20, 8) NOT NULL,
    rate_date DATE NOT NULL,
    data_source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(from_currency, to_currency, rate_date, data_source)
);

-- Portfolio performance snapshots for historical tracking
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Portfolio metrics
    total_market_value DECIMAL(20, 2) NOT NULL,
    total_cost_basis DECIMAL(20, 2) NOT NULL,
    total_cash_balance DECIMAL(20, 2) NOT NULL,
    unrealized_gain_loss DECIMAL(20, 2) NOT NULL,
    unrealized_gain_loss_percent DECIMAL(10, 4) NOT NULL,
    
    -- Additional metrics
    total_dividends_received DECIMAL(20, 2) DEFAULT 0,
    total_fees_paid DECIMAL(20, 2) DEFAULT 0,
    number_of_positions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(portfolio_id, snapshot_date)
);

-- Stock splits table for handling stock splits
CREATE TABLE stock_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    split_date DATE NOT NULL,
    split_ratio_from INTEGER NOT NULL, -- e.g., 1 in "1:2 split"
    split_ratio_to INTEGER NOT NULL, -- e.g., 2 in "1:2 split"
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(asset_id, split_date)
);

-- Dividend payments table for tracking dividend history
CREATE TABLE dividend_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    ex_dividend_date DATE NOT NULL,
    payment_date DATE,
    dividend_per_share DECIMAL(20, 8) NOT NULL,
    dividend_type VARCHAR(50) DEFAULT 'regular', -- regular, special, return_of_capital
    currency VARCHAR(3) NOT NULL,
    data_source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(asset_id, ex_dividend_date, data_source)
);

-- Indexes for performance optimization
CREATE INDEX idx_transactions_user_portfolio ON transactions(user_id, portfolio_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_holdings_user ON holdings(user_id);
CREATE INDEX idx_price_history_asset_date ON price_history(asset_id, price_date);
CREATE INDEX idx_exchange_rates_currencies_date ON exchange_rates(from_currency, to_currency, rate_date);
CREATE INDEX idx_portfolio_snapshots_portfolio_date ON portfolio_snapshots(portfolio_id, snapshot_date);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_balances_updated_at BEFORE UPDATE ON cash_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
