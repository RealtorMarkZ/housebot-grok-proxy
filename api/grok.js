// api/grok.js – Secure proxy for HouseBot chat (Vercel serverless function)


export default async function handler(req, res) {
  // Set CORS headers (required for browser POST requests from your site)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  // Handle preflight OPTIONS request (browser sends this before POST)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.status(200).end();
  }


  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Rejecting non-POST method:', req.method);
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }


  try {
    console.log('Proxy invoked – parsing body...');


    // Parse incoming JSON body
    const body = req.body || {};
    console.log('Received body:', JSON.stringify(body, null, 2));


    const { messages, model = 'grok-beta', temperature = 0.2, max_tokens = 300 } = body;


    if (!messages || !Array.isArray(messages)) {
      console.log('Invalid or missing messages array');
      return res.status(400).json({ error: 'Missing or invalid "messages" array' });
    }


    // Get your hidden API key from Vercel env vars
    const apiKey = process.env.xai-nSUhuxyI0OBvj5Em9AL0x4S7elx9KR7Jbe4HZdFyF3vcmE5zBiVQMInbTC36kHxEN00jrUFXUN7bRFZm;
    console.log('API key present?', !!apiKey);


    if (!apiKey) {
      console.error('CRITICAL: GROK_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Server misconfigured: missing API key' });
    }


    console.log(`Forwarding to xAI – model: ${model}, messages count: ${messages.length}`);


    // Send to xAI/Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });


    console.log('xAI responded with status:', response.status);


    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      return res.status(response.status).json({ error: `xAI API error: ${errorText}` });
    }


    const data = await response.json();
    console.log('Success – returning Grok response');


    return res.status(200).json(data);


  } catch (error) {
    console.error('Proxy crashed:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Internal server error – see Vercel logs for details' });
  }
}