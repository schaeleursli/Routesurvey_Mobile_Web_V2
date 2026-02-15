/**
 * FastAPI Integration Test
 * 
 * Quick test script to verify FastAPI backend integration.
 * Run with: node test-fastapi-integration.mjs
 */

import axios from 'axios';

const FASTAPI_URL = process.env.VITE_FASTAPI_URL || 'http://localhost:8002';

const testResults = {
    passed: 0,
    failed: 0,
    tests: [],
};

function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}`);
    if (details) {
        console.log(`   ${details}`);
    }
    testResults.tests.push({ name, passed, details });
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

async function runTests() {
    console.log('🧪 Testing FastAPI Integration\n');
    console.log(`Backend URL: ${FASTAPI_URL}\n`);

    // Test 1: Health Check
    try {
        const response = await axios.get(`${FASTAPI_URL}/health`);
        const { status, version, environment } = response.data;
        logTest(
            'Health Check',
            status === 'healthy',
            `v${version} (${environment})`
        );
    } catch (error) {
        logTest('Health Check', false, error.message);
    }

    // Test 2: List Catalog Items
    try {
        const response = await axios.get(`${FASTAPI_URL}/api/v1/catalog/items`);
        const items = response.data;
        logTest(
            'List Catalog Items',
            Array.isArray(items),
            `Found ${items.length} items`
        );
    } catch (error) {
        logTest('List Catalog Items', false, error.message);
    }

    // Test 3: OpenAPI Schema
    try {
        const response = await axios.get(`${FASTAPI_URL}/openapi.json`);
        const paths = Object.keys(response.data.paths);
        logTest(
            'OpenAPI Schema',
            paths.length > 0,
            `${paths.length} endpoints available`
        );
    } catch (error) {
        logTest('OpenAPI Schema', false, error.message);
    }

    // Test 4: CORS Headers
    try {
        const response = await axios.options(`${FASTAPI_URL}/health`);
        const hasCors = response.headers['access-control-allow-origin'] !== undefined;
        logTest(
            'CORS Configuration',
            hasCors,
            hasCors ? 'CORS enabled' : 'CORS not configured'
        );
    } catch (error) {
        // OPTIONS might not be supported, try GET
        try {
            const response = await axios.get(`${FASTAPI_URL}/health`);
            const hasCors = response.headers['access-control-allow-origin'] !== undefined;
            logTest('CORS Configuration', hasCors, 'Checked via GET request');
        } catch (e) {
            logTest('CORS Configuration', false, error.message);
        }
    }

    // Test 5: Response Time
    try {
        const start = Date.now();
        await axios.get(`${FASTAPI_URL}/health`);
        const duration = Date.now() - start;
        logTest(
            'Response Time',
            duration < 1000,
            `${duration}ms (target: <1000ms)`
        );
    } catch (error) {
        logTest('Response Time', false, error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.tests.length}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${Math.round((testResults.passed / testResults.tests.length) * 100)}%`);

    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! FastAPI backend is ready for frontend integration.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the backend configuration.');
    }

    process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
});
