const http = require('http');

const data = JSON.stringify({
  fullName: 'Test User Fixed',
  email: 'testfixed' + Date.now() + '@susupay.com',
  password: 'password123',
  momoNumber: '0246814468',
  momoProvider: 'MTN',
  role: 'CUSTOMER'
});

const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
