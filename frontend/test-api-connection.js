// Simple test script to verify API connectivity
const API_BASE_URL = 'http://localhost:5124/api';

async function testApiConnection() {
    console.log('🔍 Testing API connection...');
    console.log(`Connecting to: ${API_BASE_URL}`);
    
    try {
        // Test basic connection
        console.log('\n1. Testing basic connection...');
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Response body:', errorText);
            return;
        }

        const categories = await response.json();
        console.log(`✅ Successfully fetched ${categories.length} categories`);
        console.log('Sample category:', categories[0]);

        // Test auth endpoint
        console.log('\n2. Testing auth endpoint...');
        const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'max.mustermann@test.de',
                password: 'Test123!'
            })
        });

        if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('✅ Auth test successful');
            console.log('Token received:', authData.token ? 'Yes' : 'No');
        } else {
            console.log(`⚠️ Auth test failed: ${authResponse.status}`);
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('\n🔧 Possible solutions:');
            console.log('1. Make sure the backend is running at http://localhost:5124');
            console.log('2. Check if CORS is properly configured');
            console.log('3. Verify the API endpoints are working');
        }
    }
}

// Run the test
testApiConnection();