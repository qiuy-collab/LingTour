
const http = require('http');

const FE_URL = 'http://localhost:3000';
const BE_URL = 'http://localhost:8000/api/v1';

const routes = [
  '/',
  '/culture/',
  '/culture/zhanjiang/',
  '/routes/',
  '/routes/southern-sea-table/',
  '/interpreting/',
  '/shop/',
  '/shop/products/',
  '/shop/products/volcanic-soil-bowl/',
  '/login/',
  '/about/'
];

const apiEndpoints = [
  '/public/cities',
  '/public/cities/zhanjiang',
  '/public/routes',
  '/public/routes/southern-sea-table',
  '/public/interpreting',
  '/public/shop/collections',
  '/public/shop/products',
  '/public/shop/products/volcanic-soil-bowl'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          length: data.length,
          data: data
        });
      });
    }).on('error', (err) => {
      resolve({ status: 'ERR', ok: false, error: err.message });
    });
  });
}

async function runTest() {
  console.log('=== Starting Full Health Check (v2) ===\n');

  console.log('--- Frontend Routes ---');
  for (const route of routes) {
    const res = await checkUrl(FE_URL + route);
    const hasErrorText = res.data && (res.data.includes('Application error') || res.data.includes('Runtime Error'));
    console.log(`[${res.ok && !hasErrorText ? 'OK' : 'FAIL'}] ${route} - Status: ${res.status} (${res.length || 0} bytes)`);
  }

  console.log('\n--- Backend API Endpoints ---');
  for (const endpoint of apiEndpoints) {
    const res = await checkUrl(BE_URL + endpoint);
    console.log(`[${res.ok ? 'OK' : 'FAIL'}] ${endpoint} - Status: ${res.status} (${res.length || 0} bytes)`);
  }
}

runTest();
