export const config = { runtime: 'edge' };


export default async function handler(req) {
if (req.method !== 'POST') {
return new Response(JSON.stringify({ error: 'Use POST' }), { status: 405 });
}


let body;
try {
body = await req.json();
} catch (e) {
return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
}


const { model = 'gpt-4o-mini', prompt = '' } = body || {};
if (!prompt) {
return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
}


const apiKey = process.env.OPENAI_API_KEY || req.headers.get('X-Dev-Key');
if (!apiKey) {
return new Response(JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }), { status: 500 });
}


// Basic chat request (non-streaming)
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
return new Response(JSON.stringify({ error: 'Upstream error', detail: text }), { status: 500 });
}


const data = await resp.json();
const reply = data.choices?.[0]?.message?.content || '';
return new Response(JSON.stringify({ reply }), {
status: 200,
headers: { 'Content-Type': 'application/json' }
});
}