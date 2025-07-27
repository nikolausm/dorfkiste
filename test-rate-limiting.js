#!/usr/bin/env node

/**
 * Rate Limiting Test Script
 * 
 * This script tests the rate limiting functionality by making multiple requests
 * to different API endpoints and verifying the rate limiting behavior.
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test configuration
const TESTS = [
  {
    name: 'Authentication Rate Limit Test',
    endpoint: '/api/auth/register',
    method: 'POST',
    data: { email: 'test@example.com', password: 'testpass123', name: 'Test User' },
    limit: 5,
    expectedStatus: 429,
  },
  {
    name: 'General API Rate Limit Test',
    endpoint: '/api/items',
    method: 'GET',
    limit: 60,
    expectedStatus: 429,
  },
  {
    name: 'Search Rate Limit Test',
    endpoint: '/api/categories',
    method: 'GET',
    limit: 100,
    expectedStatus: 429,
  }
];

async function makeRequest(test, requestNumber = 1) {
  try {
    const config = {
      method: test.method,
      url: `${BASE_URL}${test.endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Request': `${requestNumber}`,
      },
      validateStatus: () => true, // Don't throw on error status codes
    };

    if (test.data) {
      config.data = test.data;
    }

    const response = await axios(config);
    
    return {
      status: response.status,
      headers: {
        remaining: response.headers['x-ratelimit-remaining'],
        limit: response.headers['x-ratelimit-limit'],
        reset: response.headers['x-ratelimit-reset'],
        retryAfter: response.headers['retry-after'],
      },
      data: response.data,
    };
  } catch (error) {
    console.error(`Request failed:`, error.message);
    return null;
  }
}

async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  console.log(`📍 Endpoint: ${test.method} ${test.endpoint}`);
  console.log(`🎯 Expected limit: ${test.limit} requests`);
  
  const results = [];
  let rateLimitHit = false;
  
  // Make requests up to 150% of the limit to ensure we hit the rate limit
  const maxRequests = Math.ceil(test.limit * 1.5);
  
  for (let i = 1; i <= maxRequests; i++) {
    const result = await makeRequest(test, i);
    
    if (result) {
      results.push(result);
      
      const { status, headers } = result;
      
      if (status === test.expectedStatus) {
        console.log(`✅ Rate limit hit at request ${i} (status: ${status})`);
        console.log(`📊 Headers:`, {
          limit: headers.limit,
          remaining: headers.remaining,
          retryAfter: headers.retryAfter,
        });
        rateLimitHit = true;
        break;
      } else if (i <= test.limit) {
        console.log(`✅ Request ${i}: status ${status}, remaining: ${headers.remaining}`);
      } else {
        console.log(`⚠️  Request ${i}: Expected rate limit but got status ${status}`);
      }
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  if (!rateLimitHit && results.length > 0) {
    console.log(`⚠️  Rate limit not hit after ${results.length} requests`);
    console.log(`📋 Final result:`, results[results.length - 1]);
  }
  
  return {
    testName: test.name,
    passed: rateLimitHit,
    requestsMade: results.length,
    finalStatus: results[results.length - 1]?.status,
  };
}

async function runPerformanceTest() {
  console.log('\n⚡ Performance Test: Measuring rate limit check overhead');
  
  const iterations = 100;
  const start = Date.now();
  
  const promises = Array(iterations).fill().map((_, i) => 
    makeRequest({
      endpoint: '/api/items',
      method: 'GET',
    }, i)
  );
  
  await Promise.all(promises);
  
  const duration = Date.now() - start;
  const avgTime = duration / iterations;
  
  console.log(`📊 Performance Results:`);
  console.log(`   Total time: ${duration}ms`);
  console.log(`   Average per request: ${avgTime.toFixed(2)}ms`);
  console.log(`   ${avgTime < 5 ? '✅' : '❌'} Target: <5ms per request`);
  
  return { avgTime, passed: avgTime < 5 };
}

async function testHeadersPresence() {
  console.log('\n📋 Testing Rate Limit Headers');
  
  const result = await makeRequest({
    endpoint: '/api/items',
    method: 'GET',
  });
  
  if (!result) {
    console.log('❌ Failed to get response');
    return { passed: false };
  }
  
  const requiredHeaders = ['limit', 'remaining', 'reset'];
  const missingHeaders = requiredHeaders.filter(header => !result.headers[header]);
  
  if (missingHeaders.length === 0) {
    console.log('✅ All required rate limit headers present');
    console.log('📊 Headers:', result.headers);
  } else {
    console.log('❌ Missing headers:', missingHeaders);
  }
  
  return { passed: missingHeaders.length === 0, headers: result.headers };
}

async function main() {
  console.log('🚀 Rate Limiting System Test Suite');
  console.log(`🔗 Testing against: ${BASE_URL}`);
  
  try {
    // Test that server is accessible
    console.log('\n🔍 Checking server accessibility...');
    const healthCheck = await makeRequest({ endpoint: '/api/items', method: 'GET' });
    
    if (!healthCheck) {
      console.log('❌ Server not accessible. Please ensure the development server is running.');
      console.log('   Run: npm run dev');
      process.exit(1);
    }
    
    console.log('✅ Server is accessible');
    
    // Test headers presence
    const headersTest = await testHeadersPresence();
    
    // Run rate limiting tests
    const testResults = [];
    for (const test of TESTS) {
      const result = await runTest(test);
      testResults.push(result);
    }
    
    // Run performance test
    const performanceResult = await runPerformanceTest();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('='.repeat(50));
    
    console.log(`Headers Test: ${headersTest.passed ? '✅ PASS' : '❌ FAIL'}`);
    
    testResults.forEach(result => {
      console.log(`${result.testName}: ${result.passed ? '✅ PASS' : '❌ FAIL'} (${result.requestsMade} requests)`);
    });
    
    console.log(`Performance Test: ${performanceResult.passed ? '✅ PASS' : '❌ FAIL'} (${performanceResult.avgTime.toFixed(2)}ms avg)`);
    
    const allPassed = headersTest.passed && 
                     testResults.every(r => r.passed) && 
                     performanceResult.passed;
    
    console.log('\n' + '='.repeat(50));
    console.log(`Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (!allPassed) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}