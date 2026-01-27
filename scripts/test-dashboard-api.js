const http = require('http');

function fetchJson(path) {
    return new Promise((resolve, reject) => {
        http.get({
            hostname: 'localhost',
            port: 3000,
            path: path,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Status ${res.statusCode}: ${data}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function testApis() {
    console.log('Testing Dashboard APIs...');

    try {
        console.log('\n--- /api/dashboard/stats ---');
        const stats = await fetchJson('/api/dashboard/stats');
        console.log(stats);

        console.log('\n--- /api/dashboard/trend?days=7 ---');
        const trend = await fetchJson('/api/dashboard/trend?days=7');
        console.log(trend.slice(0, 3), '...');

        console.log('\n--- /api/dashboard/users/inactive?days=90 ---');
        const users = await fetchJson('/api/dashboard/users/inactive?days=90');
        console.log(users.slice(0, 3), '...');

        console.log('\n✅ All APIs reachable and responding.');
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        process.exit(1);
    }
}

testApis();
