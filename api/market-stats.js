// api/market-stats.js
export default async function handler(req, res) {
  // Force CORS headers (same as your grok.js)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  const { filter } = req.body; // e.g. "county:hillsborough+mls_id:florida"

  if (!filter) {
    return res.status(400).json({ error: 'Missing filter parameter' });
  }

  const apiKey = process.env.dogx91tx0if-du0h0ot8w3p;

  if (!apiKey) {
    console.error('Missing BUYING_BUDDY_API_KEY in env vars');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.buyingbuddy.com/v3/market-stats', {  // Confirm exact endpoint in docs
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ filter })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Buying Buddy error:', response.status, errorText);
      return res.status(response.status).json({ error: `Buying Buddy API error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy crashed:', error.message);
    return res.status(500).json({ error: 'Internal proxy error – check Vercel logs' });
  }
}
