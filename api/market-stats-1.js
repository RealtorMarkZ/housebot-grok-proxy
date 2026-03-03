// api/market-stats-1.js
export default async function handler(req, res) {
  console.log('market-stats-1 called - method:', req.method);
  console.log('Request body received:', req.body); // Debug incoming data

  // CORS (keep this)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  const { filter } = req.body;

  if (!filter) {
    console.warn('Missing filter in request body');
    return res.status(400).json({ error: 'Missing filter parameter' });
  }

  const apiKey = process.env.BUYING_BUDDY_API_KEY; // <-- Use this standard name!

  if (!apiKey) {
    console.error('Missing BUYING_BUDDY_API_KEY env var');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  console.log('API Key loaded - fetching from Buying Buddy');

  try {
    const response = await fetch('https://api.buyingbuddy.com/v3/market-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ filter })
    });

    console.log('Buying Buddy status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Buying Buddy error:', response.status, errorText);
      return res.status(response.status).json({ error: `Buying Buddy error: ${errorText}` });
    }

    const data = await response.json();
    console.log('Success - data:', data);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy crashed:', error.message, error.stack);
    return res.status(500).json({ error: 'Proxy error' });
  }
}
