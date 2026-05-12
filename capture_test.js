
const http = require('http');
const fs = require('fs');

const FE_URL = 'http://localhost:3000';
const routes = [
  '/',
  '/culture/',
  '/culture/zhanjiang/',
  '/routes/',
  '/routes/southern-sea-table/',
  '/interpreting/',
  '/shop/',
  '/shop/products/',
  '/shop/products/volcanic-soil-bowl/'
];

async function capture(route) {
  return new Promise((resolve) => {
    http.get(FE_URL + route, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          route: route,
          status: res.statusCode,
          length: data.length,
          preview: data.substring(0, 1000).replace(/<[^>]*>?/gm, '') // Strip tags for preview
        });
      });
    }).on('error', (err) => {
      resolve({ route: route, status: 'ERR', error: err.message });
    });
  });
}

async function run() {
  const results = [];
  for (const route of routes) {
    const res = await capture(route);
    results.push(res);
  }
  fs.writeFileSync('screenshot-test.txt', JSON.stringify(results, null, 2));
  console.log('Results saved to screenshot-test.txt');
}

run();
