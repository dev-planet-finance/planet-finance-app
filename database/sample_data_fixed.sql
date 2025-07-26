-- Fixed sample data for Planet Finance Portfolio Tracker
-- This file contains corrected test data

-- Sample Users
INSERT INTO users (id, email, firebase_uid, display_name, base_currency) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'firebase_uid_001', 'John Doe', 'USD'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'firebase_uid_002', 'Jane Smith', 'EUR');

-- Sample Portfolios
INSERT INTO portfolios (id, user_id, name, description, base_currency) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Main Portfolio', 'Primary investment portfolio', 'USD'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Crypto Portfolio', 'Cryptocurrency investments', 'USD'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'European Stocks', 'European stock investments', 'EUR');

-- Sample Assets (Fixed country codes to 3 characters max)
INSERT INTO assets (id, symbol, name, asset_type, exchange, currency, sector, industry, country, data_source) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 'USD', 'Technology', 'Consumer Electronics', 'USA', 'eodhd'),
('770e8400-e29b-41d4-a716-446655440002', 'MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 'USD', 'Technology', 'Software', 'USA', 'eodhd'),
('770e8400-e29b-41d4-a716-446655440003', 'TSLA', 'Tesla, Inc.', 'stock', 'NASDAQ', 'USD', 'Consumer Cyclical', 'Auto Manufacturers', 'USA', 'eodhd'),
('770e8400-e29b-41d4-a716-446655440004', 'BTC', 'Bitcoin', 'crypto', 'GLOBAL', 'USD', 'Cryptocurrency', 'Digital Currency', 'GLB', 'coingecko'),
('770e8400-e29b-41d4-a716-446655440005', 'ETH', 'Ethereum', 'crypto', 'GLOBAL', 'USD', 'Cryptocurrency', 'Smart Contract Platform', 'GLB', 'coingecko'),
('770e8400-e29b-41d4-a716-446655440006', 'SPY', 'SPDR S&P 500 ETF Trust', 'etf', 'NYSE', 'USD', 'Diversified', 'Large Blend', 'USA', 'eodhd');

-- Sample Platforms
INSERT INTO platforms (id, user_id, name, platform_type) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Robinhood', 'broker'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Interactive Brokers', 'broker'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Coinbase', 'exchange'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'DeGiro', 'broker');

-- Sample Cash Deposits
INSERT INTO transactions (id, user_id, portfolio_id, platform_id, transaction_type, transaction_date, total_amount, transaction_currency, notes) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'cash_deposit', '2024-01-15 10:00:00+00', 10000.00, 'USD', 'Initial deposit'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 'cash_deposit', '2024-01-20 14:30:00+00', 5000.00, 'USD', 'Crypto portfolio funding');

-- Sample Stock Purchases
INSERT INTO transactions (id, user_id, portfolio_id, asset_id, platform_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount, fee_amount, transaction_currency, asset_class, strategy, notes) VALUES
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'buy', '2024-01-16 09:30:00+00', 50.00000000, 180.50, 9025.00, 0.00, 'USD', 'Large Cap Growth', 'Long-term', 'AAPL purchase'),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'buy', '2024-01-18 11:15:00+00', 25.00000000, 380.75, 9518.75, 0.00, 'USD', 'Large Cap Growth', 'Long-term', 'MSFT purchase');

-- Sample Crypto Purchases
INSERT INTO transactions (id, user_id, portfolio_id, asset_id, platform_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount, fee_amount, transaction_currency, strategy, notes) VALUES
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'buy', '2024-01-21 16:45:00+00', 0.10000000, 42500.00, 4250.00, 25.00, 'USD', 'Crypto Hold', 'BTC purchase'),
('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 'buy', '2024-01-22 12:20:00+00', 2.00000000, 2800.00, 5600.00, 15.00, 'USD', 'Crypto Hold', 'ETH purchase');

-- Sample Cash Balances
INSERT INTO cash_balances (user_id, portfolio_id, platform_id, currency, balance) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'USD', 456.25),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 'USD', -890.00);

-- Sample Holdings
INSERT INTO holdings (user_id, portfolio_id, asset_id, platform_id, quantity, average_cost_basis, total_cost_basis, first_purchase_date, last_transaction_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 50.00000000, 180.50, 9025.00, '2024-01-16 09:30:00+00', '2024-01-16 09:30:00+00'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 25.00000000, 380.75, 9518.75, '2024-01-18 11:15:00+00', '2024-01-18 11:15:00+00'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 0.10000000, 42500.00, 4250.00, '2024-01-21 16:45:00+00', '2024-01-21 16:45:00+00'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 2.00000000, 2800.00, 5600.00, '2024-01-22 12:20:00+00', '2024-01-22 12:20:00+00');

-- Sample Price History
INSERT INTO price_history (asset_id, price_date, close_price, data_source) VALUES
('770e8400-e29b-41d4-a716-446655440001', '2024-01-25', 195.25, 'eodhd'),
('770e8400-e29b-41d4-a716-446655440002', '2024-01-25', 415.30, 'eodhd'),
('770e8400-e29b-41d4-a716-446655440004', '2024-01-25', 48500.00, 'coingecko'),
('770e8400-e29b-41d4-a716-446655440005', '2024-01-25', 3200.00, 'coingecko');

-- Sample Exchange Rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, rate_date, data_source) VALUES
('USD', 'EUR', 0.85, '2024-01-25', 'eodhd'),
('EUR', 'USD', 1.18, '2024-01-25', 'eodhd'),
('USD', 'GBP', 0.75, '2024-01-25', 'eodhd'),
('GBP', 'USD', 1.33, '2024-01-25', 'eodhd');

-- Sample Dividend Payments
INSERT INTO dividend_payments (asset_id, ex_dividend_date, payment_date, dividend_per_share, currency, data_source) VALUES
('770e8400-e29b-41d4-a716-446655440001', '2024-02-15', '2024-02-22', 0.24, 'USD', 'eodhd'),
('770e8400-e29b-41d4-a716-446655440002', '2024-02-20', '2024-02-28', 0.75, 'USD', 'eodhd');
