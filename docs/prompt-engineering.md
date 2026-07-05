# Prompt Engineering Strategy

## System Prompt Structure

Each persona's system prompt follows a consistent layered structure with 9 sections:

```
1. IDENTITY BLOCK        — who the person is, credentials, platform, core mantra
2. OPENING PATTERN       — exact greeting style and how to enter conversations
3. LANGUAGE / HINGLISH   — specific words, when to switch, how much, with examples
4. SIGNATURE PHRASES     — exact recurring expressions to use (not paraphrases)
5. EMOJI USAGE           — which emojis, what emotion each encodes (Piyush only)
6. STRONG OPINIONS       — opinionated stances to voice when relevant
7. COMMUNICATION STYLE   — pace, address, directness level
8. TEACHING METHODOLOGY  — step-by-step pedagogical pattern per question type
9. CONSTRAINTS BLOCK     — what NOT to do (break character, over-use Hinglish, etc.)
```

Earlier versions had 5 sections. The expanded structure was needed because the model would default to a generic "helpful teacher" persona without explicit behavioral rules for each scenario.

---

## Design Decisions

### 1. Identity First, Behavioral Rules Second
The system prompt opens with a rich identity paragraph (credentials, mantra, platform). This grounds the model in a specific person before adding stylistic rules. Without this anchor, the model drifts into a generic "friendly teacher" persona within 2–3 turns.

### 2. Exact Words, Not Descriptions
Providing explicit word lists with translations is more effective than describing style abstractly.

**Less effective:**
> "Hitesh uses Hinglish naturally, mixing Hindi words into his English."

**More effective:**
> - "haanji" — his affirmative, much warmer than "yes" (note: haanji, not hanji — he uses the extended form)
> - "samjha kya?" — go-to comprehension check after every explanation
> - "pehle samjho, syntax baad mein" — use this explicitly when teaching

The translation in parentheses prevents incorrect usage; the instruction to use specific phrases (not just similar ones) prevents the model from generating plausible-but-wrong alternatives.

### 3. Strategic vs Habitual Hinglish
The two personas use Hinglish in fundamentally different ways, and the prompts reflect this:

**Hitesh — Strategic code-switching**: He switches to Hindi at specific emotional moments (checking understanding, celebrating, encouraging). His Hinglish has *purpose*. The prompt specifies exactly which moments trigger a switch.

**Piyush — Habitual tics**: He teaches in English but drops Hindi words involuntarily. Words like "dekho", "yaar", "lagta hai", "bhai" are habits, not conscious choices. The prompt enforces this by requiring at least one Hindi word per response with a hard "No exceptions" rule and ❌/✅ examples:

```
❌ WRONG (pure English — not you):
"Okay so here's the thing — SQL databases are great for structured data..."

✅ RIGHT (your natural voice):
"Dekho, the real question is — why do you need SQL at all?"
"Bhai, lagta hai you haven't tried Docker yet 😂"
```

This ❌/✅ pattern was added after testing showed the model only used Hinglish when the user initiated it. Explicit negative examples ("this is what you must NOT do") were necessary to override the default mirroring behavior.

### 4. Teaching Pattern as a Numbered Sequence
Piyush's WHY → HOW → OHH! pattern is encoded as a literal sequence with examples at each step, not just mentioned as a general principle. This forces the model to structure responses accordingly rather than treating it as optional flavor.

Hitesh's no-spoon-feeding pattern is similarly encoded as a 6-step procedure per question type (code explanation, career advice, debugging), each with specific instructions.

### 5. Strong Opinions as Concrete Stances
Both prompts include a STRONG OPINIONS section with exact phrasing for each opinion. This prevents the model from hedging on questions where the real person has documented strong views:

- Hitesh on DSA: "DSA is not C++, Python, Java, or JavaScript. DSA is about problem-solving logic."
- Piyush on Docker: "Are you even a full stack developer if you don't know Docker?"

### 6. Emoji as Semantic Signal (Piyush)
Piyush's emoji usage is not cosmetic — each emoji encodes a specific emotion. The prompt maps them explicitly:

| Emoji | Meaning |
|-------|---------|
| 🔥 | something important or impressive |
| 😂 | humor, irony, or a provocative statement |
| 🥳 | celebration, launch |
| 💡 | insight or realization |
| 🚀 | growth, launch, momentum |

Mapping them explicitly prevents random emoji insertion.

### 7. Constraints Must Be Specific
Generic constraints like "don't break character" are ineffective alone. The prompts include specific anti-patterns:

- "Never say 'it depends' on a question where there's a clear answer — be direct"
- "Don't pepper every sentence with Hinglish — use it naturally or not at all" (Hitesh)
- "Don't over-explain basics to someone who's already a developer" (Piyush)
- "Never give a complete solution immediately — guide toward it" (Hitesh)

### 8. Temperature Settings
- **Hitesh: 0.85** — higher temperature produces more varied Hinglish, cultural references, and emotional warmth; matches his expressive teaching style
- **Piyush: 0.80** — slightly lower produces more precise, structured, direct responses; matches his opinion-driven, fast-paced style

---

## Context Management

### Stateless Backend Design
The backend holds no conversation state. The frontend sends the full `messages[]` array with every request. This simplifies scaling and avoids session management complexity.

### Message Window Trimming
The backend trims incoming messages to the last 20 before sending to OpenAI:

```js
function trimMessages(messages, maxCount) {
  if (messages.length <= maxCount) return messages;
  return messages.slice(messages.length - maxCount);
}
```

**Why 20 messages?**
- 20 messages ≈ 10 conversation turns
- Typical educational chat rarely needs more than 5–6 turns of active context
- gpt-4o-mini supports 128k context, but cost grows linearly with context length
- 20 messages keeps costs predictable while preserving conversational coherence

### System Prompt Always First
The system prompt is prepended as `{ role: 'system', content: systemPrompt }` before the trimmed messages. The system prompt is never trimmed — it stays in every request regardless of conversation length.

### Greeting Message
The persona greeting is a synthetic assistant message shown in the UI at conversation start. It is filtered out of the API payload (`m.id !== 'greeting'`) to avoid confusing the model with a ghost message it never actually generated.

---

## Handling Persona Switching

When the user switches personas:
1. The frontend prompts the user to confirm (avoids accidental conversation loss)
2. `AbortController` aborts any in-flight SSE stream
3. `messages` state clears and resets to only the new persona's greeting
4. `currentPersona` updates, which propagates the new `personaId` to all future API calls

---

## SSE Streaming Design

### Why SSE over WebSockets?
Server-Sent Events are a better fit for this use case:
- Unidirectional (server → client) — exactly what's needed for streaming text
- Native browser support via `fetch` + `ReadableStream` (no libraries)
- HTTP/1.1 compatible, no upgrade handshake
- Works naturally through Vite's dev proxy

### Critical: Headers Before Async Work
```js
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('X-Accel-Buffering', 'no');
res.flushHeaders(); // MUST be called before any await
```

`res.flushHeaders()` must be called **before** the `await openai.chat.completions.create(...)` call. Without it, Express buffers the headers until the first write, which delays stream start and can cause the client to time out.

### Buffer Strategy
Raw SSE data arrives in chunks that may split across event boundaries. The reader accumulates a buffer and splits on `\n\n`:

```js
buffer += decoder.decode(value, { stream: true });
const parts = buffer.split('\n\n');
buffer = parts.pop(); // keep incomplete trailing chunk
```

`{ stream: true }` in the decoder handles multi-byte characters (e.g., Hindi/emoji) that may split across chunks.

### Abort / Stop Generation
An `AbortController` is attached to each fetch. Clicking "Stop" calls `controller.abort()`, which throws an `AbortError` in the reader loop. The `finally` block resets `isStreaming`, and the partial assistant message is preserved in the UI (not cleared).
