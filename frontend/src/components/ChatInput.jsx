import { useState, useRef, useEffect } from 'react';

export function ChatInput({ onSend, isStreaming, onStop, accentColor }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea up to ~120px
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

  return (
    <div className="chat-input-area">
      <div
        className="chat-input-inner"
        style={{ '--accent-color': accentColor }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button className="stop-btn" onClick={onStop} title="Stop generating">
            ■
          </button>
        ) : (
          <button
            className="send-btn"
            style={{ background: accentColor }}
            onClick={handleSubmit}
            disabled={!value.trim()}
            title="Send message"
          >
            ↑
          </button>
        )}
      </div>
      <p className="input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
