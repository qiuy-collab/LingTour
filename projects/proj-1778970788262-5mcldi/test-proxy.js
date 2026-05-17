const http = require('http');

async function test() {
  try {
    const res = await fetch('http://localhost:5177/api/admin/routes');
    console.log('Status via proxy:', res.status);
    console.log('Headers via proxy:', res.headers.raw ? res.headers.raw() : res.headers);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
