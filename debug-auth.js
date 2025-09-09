// Debug authentication issue
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testAuth() {
  try {
    const form = new FormData();
    form.append('username', 'admin');
    form.append('password', 'demo123');
    
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      body: form
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();