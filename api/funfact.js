// Vercel Serverless Function — /api/funfact
// Receives two space objects, calls Anthropic, returns one fun fact.
// The API key is stored safely in Vercel Environment Variables,
// never exposed to the browser.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { objectA, objectB } = req.body;

  if (!objectA || !objectB) {
    return res.status(400).json({ error: 'Both objectA and objectB are required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are a space science communicator. Given these two cosmic objects being compared:

Object A: ${objectA.name} (type: ${objectA.type}, radius: ${objectA.radius})
Object B: ${objectB.name} (type: ${objectB.type}, radius: ${objectB.radius})

Generate exactly ONE surprising, specific fun fact about this exact pairing. The fact should highlight something genuinely mind-bending about their size relationship or an interesting connection between the two objects. Keep it to 2-3 sentences maximum. Do not use bullet points or headers. Write in an engaging, accessible tone.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const fact = data.content[0].text.trim();

    return res.status(200).json({ fact });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Anthropic API' });
  }
}
