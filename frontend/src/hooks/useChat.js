import { useState, useRef, useCallback } from 'react';
import { PERSONAS } from '../data/personas.js';

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const formatTime = () => {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
};

export function useChat() {
  const [currentPersona, setCurrentPersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState(() => [
    { id: 'greeting', role: 'assistant', content: PERSONAS[0].greeting, timestamp: formatTime() },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef(null);

  const switchPersona = useCallback(
    (persona) => {
      if (persona.id === currentPersona.id) return;

      if (
        messages.length > 1 &&
        !window.confirm(`Switch to ${persona.name}? This will clear the current conversation.`)
      ) {
        return;
      }

      abortControllerRef.current?.abort();
      setIsStreaming(false);
      setCurrentPersona(persona);
      setMessages([{ id: 'greeting', role: 'assistant', content: persona.greeting, timestamp: formatTime() }]);
    },
    [currentPersona.id, messages.length]
  );

  const sendMessage = useCallback(
    async (content) => {
      if (isStreaming || !content.trim()) return;

      const now = formatTime();
      const userMsg = { id: makeId('user'), role: 'user', content, timestamp: now };
      const assistantId = makeId('assistant');

      // Snapshot current messages for the API call (before state updates)
      const historySnapshot = messages;

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', timestamp: now },
      ]);
      setIsStreaming(true);

      // Build the messages array to send: history + new user message (no greeting, no empty placeholder)
      const apiMessages = [
        ...historySnapshot.filter((m) => m.id !== 'greeting'),
        userMsg,
      ].map(({ role, content }) => ({ role, content }));

      abortControllerRef.current = new AbortController();

      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId: currentPersona.id,
            messages: apiMessages,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(errJson.error || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // keep incomplete trailing chunk

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') {
              reader.cancel();
              break outer;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.token) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + parsed.token } : m
                  )
                );
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
              // Ignore malformed SSE lines
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // User stopped streaming — keep partial content

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `Sorry, something went wrong: ${err.message}. Please try again.`,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, currentPersona.id]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isStreaming,
    currentPersona,
    sendMessage,
    switchPersona,
    stopStreaming,
  };
}
