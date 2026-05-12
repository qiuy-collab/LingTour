
const http = require('http');

async function checkContent(url, searchString) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const found = data.includes(searchString);
        console.log(`Checking ${url} for "${searchString}": ${found ? 'FOUND' : 'NOT FOUND'} (Status: ${res.statusCode})`);
        resolve(found);
      });
    }).on('error', (err) => {
      console.log(`Error checking ${url}: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  await checkContent('http://localhost:3000/shop/', 'Coastal Life Kit');
  await checkContent('http://localhost:3000/culture/zhanjiang/', 'Southern coast');
  await checkContent('http://localhost:3000/routes/southern-sea-table/', 'A Southern Sea Table');
  await checkContent('http://localhost:3000/interpreting/', 'Maya Chen');
}

run();
