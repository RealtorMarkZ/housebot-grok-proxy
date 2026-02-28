// api/grok.js – Hardened CORS + crash-proof proxy

export default async function handler(req, res) {
  // Force CORS headers on EVERY response (even errors)
  res.setHeader('Access-Control-Allow-Origin', '*'); // or 'https://tampabaypremierrealty.org' for stricter
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.status(200).end();
  }

  // Log request for debugging
  console.log(`[${req.method}] Request to /api/grok`);

  if (req.method !== 'POST') {
    console.log('Rejecting non-POST');
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  try {
    const body = req.body || {};
    console.log('Body:', JSON.stringify(body, null, 2));

    const { messages, model = 'grok-beta', temperature = 0.2, max_tokens = 300 } = body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid "messages" array' });
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error('Missing GROK_API_KEY');
      return res.status(500).json({ error: 'Missing API key in env vars' });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI error:', response.status, errorText);
      return res.status(response.status).json({ error: `xAI error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy crashed:', error.message, error.stack);
    return res.status(500).json({ error: 'Proxy internal error – check Vercel logs' });
  }
}
