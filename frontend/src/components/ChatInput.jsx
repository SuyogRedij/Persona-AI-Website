import { useState, useRef, useEffect } from 'react';

const PLACEHOLDERS = {
  hitesh: 'Ask anything about JavaScript, React, Node.js...',
  piyush: 'Ask anything about TypeScript, Docker, System Design...',
};

export function ChatInput({ onSend, isStreaming, onStop, accentColor, persona }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholder = PLACEHOLDERS[persona?.id] ?? 'Ask a question…';

  return (
    <div className="chat-input-area">
      <div className="chat-input-inner" style={{ '--accent-color': accentColor }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isStreaming}
        />
        <span className="model-badge">GPT-4o-mini</span>
        {isStreaming ? (
          <button className="stop-btn" onClick={onStop} title="Stop generating">■</button>
        ) : (
          <button
            className="send-btn"
            style={{ background: accentColor }}
            onClick={handleSubmit}
            disabled={!value.trim()}
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
      <p className="input-hint">Press Enter to send, Shift + Enter for new line</p>
    </div>
  );
}
