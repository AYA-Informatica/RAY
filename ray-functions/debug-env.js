// Simple script to test .env file loading
require('dotenv').config();

console.log('=== .env File Debug ===');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env keys:', Object.keys(process.env).filter(key => 
  key.startsWith('FIREBASE_') || key.startsWith('MONGODB_') || key === 'NODE_ENV'
));
console.log('======================');