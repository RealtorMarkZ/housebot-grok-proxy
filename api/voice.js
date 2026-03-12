const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Existing /api/grok for text (HTTP)
app.use('/api/grok', createProxyMiddleware({
  target: 'https://api.x.ai/v1/chat/completions',
  changeOrigin: true,
  pathRewrite: {'^/api/grok': ''},
  headers: {
    'Authorization': `Bearer ${process.env.XAI_API_KEY}`  // Key as env var for security
  }
}));

// New /api/voice for voice (WebSocket)
app.use('/api/voice', createProxyMiddleware({
  target: 'wss://api.x.ai/v1/realtime',
  ws: true,
  changeOrigin: true,
  pathRewrite: {'^/api/voice': ''},
  headers: {
    'Authorization': `Bearer ${process.env.XAI_API_KEY}`
  }
}));

app.listen(process.env.PORT || 3000);
