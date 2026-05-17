const http = require('http');

async function test() {
  // Login
  const loginData = JSON.stringify({ email: 'admin@lingtour.cn', password: 'LingTour2026!' });
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  }).then(r => r.json());
  
  if (!loginRes.access_token) {
    console.log('Login failed:', loginRes);
    return;
  }
  const token = loginRes.access_token;
  console.log('Got token');

  // Fetch routes
  const routesRes = await fetch('http://localhost:8000/api/v1/admin/routes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Routes status:', routesRes.status);
  if (routesRes.status === 200) {
      console.log('Routes sample:', JSON.stringify(await routesRes.json()).substring(0, 100));
  } else {
      console.log('Routes error:', await routesRes.text());
  }
}
test();
