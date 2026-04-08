const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5050/api/auth/register', {
      fullName: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      momoNumber: '0240000000',
      momoProvider: 'MTN'
    });
    console.log('Success:', response.status, response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error Message:', error.message);
    }
  }
}

testRegistration();
