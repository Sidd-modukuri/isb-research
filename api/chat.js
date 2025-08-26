// Node.js Serverless Function for Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  let body = {};
  try { body = req.body || {}; } catch (_) {}

  const { model = 'gpt-4o-mini', prompt = '' } = body;
  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || req.headers['x-dev-key'];
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing OPENAI_API_KEY' });
    return;
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a concise research assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      res.status(500).json({ error: 'Upstream error', detail: text });
      return;
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Server exception', detail: String(e) });
  }
}
