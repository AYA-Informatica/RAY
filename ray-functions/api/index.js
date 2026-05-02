// Vercel serverless function entry point
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { app } = require('../lib/index-vercel');

module.exports = app;
