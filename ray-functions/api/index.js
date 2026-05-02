// Vercel serverless function entry point
try {
  const { app } = require('../lib/index-vercel');
  module.exports = app;
} catch (error) {
  console.error('Failed to load app:', error);
  
  // Fallback minimal Express app for debugging
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
  
  fallbackApp.get('/', (req, res) => {
    res.json({
      error: 'Failed to initialize API',
      message: error.message,
      stack: error.stack,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
      }
    });
  });
  
  fallbackApp.get('/health', (req, res) => {
    res.json({ 
      status: 'error', 
      message: 'App failed to load',
      error: error.message 
    });
  });
  
  module.exports = fallbackApp;
}
