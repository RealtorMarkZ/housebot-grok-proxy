// api/voice.js – WebSocket proxy for voice
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (clientWs) => {
  const serverWs = new WebSocket('wss://api.x.ai/v1/realtime', {
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`
    }
  });

  serverWs.on('open', () => {
    console.log('Proxy connected to xAI');
  });

  clientWs.on('message', (message) => {
    if (serverWs.readyState === WebSocket.OPEN) {
      serverWs.send(message);
    }
  });

  serverWs.on('message', (message) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });

  clientWs.on('close', () => serverWs.close());
  serverWs.on('close', () => clientWs.close());
});

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, req);
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
