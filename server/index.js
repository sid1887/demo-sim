const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const simulateRouter = require('./routes/simulate');
const geminiRouter = require('./routes/geminiProxy');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ngspice: 'checking...'
  });
});

// Routes
app.use('/api/simulate', simulateRouter);
app.use('/api/gemini', geminiRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Circuit Simulator Server running on port ${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/simulate - Run circuit simulation`);
  console.log(`   POST /api/gemini - AI chat proxy`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = app;