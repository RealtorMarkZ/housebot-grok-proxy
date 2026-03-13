// api/voice.js – WebSocket proxy for voice
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'wss://api.x.ai/v1/realtime',
  ws: true,
  changeOrigin: true,
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`
  }
});

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    // Explicit upgrade for Vercel
    req.socket.server.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      proxy.ws(req, ws, req.headers);
    });
    return;
  }

  res.status(400).json({ error: 'This endpoint is for WebSocket only' });
}

export const config = {
  api: {
    bodyParser: false
  }
};
