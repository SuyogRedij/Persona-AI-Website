import { Router } from 'express';
import OpenAI from 'openai';
import { getPersona } from '../personas/index.js';

const router = Router();
const openai = new OpenAI();

function trimMessages(messages, maxCount) {
  if (messages.length <= maxCount) return messages;
  return messages.slice(messages.length - maxCount);
}

router.post('/', async (req, res) => {
  const { personaId, messages } = req.body;

  if (!personaId || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'personaId (string) and messages (array) are required' });
  }

  let persona;
  try {
    persona = getPersona(personaId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const openaiMessages = [
    { role: 'system', content: persona.systemPrompt },
    ...trimMessages(messages, persona.maxContextMessages),
  ];

  // Set SSE headers before any async work, then flush immediately
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: persona.model,
      temperature: persona.temperature,
      messages: openaiMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    const errData = JSON.stringify({ error: err.message || 'Stream error' });
    res.write(`event: error\ndata: ${errData}\n\n`);
    res.end();
  }
});

export default router;
