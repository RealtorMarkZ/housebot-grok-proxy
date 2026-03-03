// api/market-stats-1.js
export default async function handler(req, res) {
  console.log('market-stats-1 called - method:', req.method);
  console.log('Request body received:', req.body); // Debug: see what client sends

  // CORS headers (required for browser fetch)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  const { filter } = req.body;

  if (!filter) {
    console.warn('Missing filter in request body');
    return res.status(400).json({ error: 'Missing filter parameter' });
  }

  const apiKey = process.env.BUYING_BUDDY_API_KEY; // <-- Correct env var name

  if (!apiKey) {
    console.error('Missing BUYING_BUDDY_API_KEY in Vercel env vars');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  console.log('API Key found - attempting Buying Buddy fetch');

  try {
    const response = await fetch('https://api.buyingbuddy.com/v3/market-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ filter })
    });

    console.log('Buying Buddy response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Buying Buddy API failed:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Buying Buddy API error: ${response.status} - ${errorText}` 
      });
    }

    const data = await response.json();
    console.log('Buying Buddy data returned:', data);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy crashed:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal proxy error – check Vercel logs' });
  }
}
