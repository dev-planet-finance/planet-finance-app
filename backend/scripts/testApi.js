#!/usr/bin/env node

/**
 * Seamless API Testing Helper for Planet Finance
 * Automatically handles Firebase authentication for API testing
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'TEST_TOKEN_AUTO_USER'; // Special token for development

/**
 * Make authenticated API request
 */
async function apiRequest(method, endpoint, data = null) {
  let curlCommand = `curl -s -X ${method} "${BASE_URL}${endpoint}" \\
    -H "Authorization: Bearer ${TEST_TOKEN}" \\
    -H "Content-Type: application/json"`;
  
  if (data) {
    curlCommand += ` -d '${JSON.stringify(data)}'`;
  }
  
  curlCommand += ' | jq .';
  
  try {
    console.log(`🚀 ${method} ${endpoint}`);
    if (data) console.log('📤 Data:', JSON.stringify(data, null, 2));
    
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr) {
      console.error('❌ Error:', stderr);
      return null;
    }
    
    console.log('✅ Response:');
    console.log(stdout);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

/**
 * Test scenarios
 */
const testScenarios = {
  // Portfolio tests
  async portfolios() {
    console.log('\n📊 Testing Portfolio Management...\n');
    
    // Get all portfolios
    await apiRequest('GET', '/api/portfolios');
    
    // Create new portfolio
    await apiRequest('POST', '/api/portfolios', {
      name: 'Test Portfolio',
      description: 'Created via automated testing',
      base_currency: 'USD'
    });
  },
  
  // Transaction tests
  async transactions() {
    console.log('\n💰 Testing Transaction Processing...\n');
    
    // Cash deposit
    await apiRequest('POST', '/api/transactions/cash', {
      portfolio_id: '660e8400-e29b-41d4-a716-446655440001',
      platform_id: '880e8400-e29b-41d4-a716-446655440001',
      action_type: 'deposit',
      total_amount: 1000.00,
      currency: 'USD',
      notes: 'Automated test deposit'
    });
    
    // Stock purchase
    await apiRequest('POST', '/api/transactions/asset', {
      portfolio_id: '660e8400-e29b-41d4-a716-446655440001',
      asset_id: '770e8400-e29b-41d4-a716-446655440001',
      platform_id: '880e8400-e29b-41d4-a716-446655440001',
      action_type: 'buy',
      quantity: 5,
      price_per_unit: 200.00,
      total_amount: 1000.00,
      currency: 'USD',
      fees: 5.00,
      notes: 'Automated test stock purchase'
    });
  },
  
  // Price data tests
  async prices() {
    console.log('\n📈 Testing Price Data APIs...\n');
    
    // Get stock price
    await apiRequest('GET', '/api/prices/stocks/AAPL');
    
    // Get crypto price
    await apiRequest('GET', '/api/prices/crypto/bitcoin');
    
    // Search assets
    await apiRequest('GET', '/api/prices/search?q=apple');
    
    // Bulk prices
    await apiRequest('POST', '/api/prices/bulk', {
      assets: [
        { symbol: 'AAPL', data_source: 'eodhd' },
        { symbol: 'bitcoin', data_source: 'coingecko' }
      ]
    });
  },
  
  // Full workflow test
  async workflow() {
    console.log('\n🔄 Testing Complete Workflow...\n');
    
    // 1. Get portfolios
    console.log('1️⃣ Getting portfolios...');
    await apiRequest('GET', '/api/portfolios');
    
    // 2. Get portfolio summary
    console.log('2️⃣ Getting portfolio summary...');
    await apiRequest('GET', '/api/portfolios/660e8400-e29b-41d4-a716-446655440001/summary');
    
    // 3. Make a deposit
    console.log('3️⃣ Making cash deposit...');
    await apiRequest('POST', '/api/transactions/cash', {
      portfolio_id: '660e8400-e29b-41d4-a716-446655440001',
      platform_id: '880e8400-e29b-41d4-a716-446655440001',
      action_type: 'deposit',
      total_amount: 2000.00,
      currency: 'USD',
      notes: 'Workflow test deposit'
    });
    
    // 4. Buy some stock
    console.log('4️⃣ Buying stock...');
    await apiRequest('POST', '/api/transactions/asset', {
      portfolio_id: '660e8400-e29b-41d4-a716-446655440001',
      asset_id: '770e8400-e29b-41d4-a716-446655440002',
      platform_id: '880e8400-e29b-41d4-a716-446655440001',
      action_type: 'buy',
      quantity: 3,
      price_per_unit: 400.00,
      total_amount: 1200.00,
      currency: 'USD',
      fees: 10.00,
      notes: 'Workflow test stock purchase'
    });
    
    // 5. Check updated portfolio
    console.log('5️⃣ Checking updated portfolio...');
    await apiRequest('GET', '/api/portfolios/660e8400-e29b-41d4-a716-446655440001/summary');
    
    // 6. Get transaction history
    console.log('6️⃣ Getting transaction history...');
    await apiRequest('GET', '/api/transactions?portfolioId=660e8400-e29b-41d4-a716-446655440001');
  }
};

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const testName = args[0] || 'help';
  
  console.log('🔥 Planet Finance API Tester');
  console.log('🔐 Using automatic authentication\n');
  
  if (testName === 'help' || !testScenarios[testName]) {
    console.log('Available tests:');
    console.log('  portfolios  - Test portfolio management');
    console.log('  transactions - Test transaction processing');
    console.log('  prices      - Test price data APIs');
    console.log('  workflow    - Test complete workflow');
    console.log('  help        - Show this help');
    console.log('\nUsage: node testApi.js [test-name]');
    console.log('Example: node testApi.js workflow');
    return;
  }
  
  await testScenarios[testName]();
  console.log('\n✅ Test completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { apiRequest, testScenarios };
