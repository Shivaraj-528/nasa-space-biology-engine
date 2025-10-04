export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function openrouterChat(messages: ChatMessage[], model?: string, temperature = 0.2) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY missing');
  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const referer = process.env.OPENROUTER_REFERRER || 'http://localhost:3000';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return { content, raw: data };
}
