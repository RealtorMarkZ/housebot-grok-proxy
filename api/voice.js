// api/voice.js – WebSocket proxy for voice
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'wss://api.x.ai/v1/realtime',
  ws: true,
  changeOrigin: true,
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`  // Your key from env vars
  }
});

// For Vercel to handle upgrades correctly
export default function handler(req, res) {
  // CORS for upgrade requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Explicitly handle WebSocket upgrade
  if (req.headers.upgrade.toLowerCase() === 'websocket') {
    proxy.ws(req, req.socket, req.headers);
    return;
  }

  res.status(400).json({ error: 'This endpoint is for WebSocket only' });
}

export const config = {
  api: {
    bodyParser: false
  }
};
