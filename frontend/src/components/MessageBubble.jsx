import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MessageBubble({ message, persona, isLastStreaming }) {
  const isUser = message.role === 'user';
  const isThinking = !isUser && message.content === '' && isLastStreaming;

  return (
    <div className={`message-bubble${isUser ? ' user' : ' assistant'}`}>
      {!isUser && (
        <div className="message-avatar" style={{ background: persona.color }}>
          {persona.initials}
        </div>
      )}
      <div className="message-content">
        <div
          className={`bubble${isUser ? ' user-bubble' : ' assistant-bubble'}`}
          style={!isUser ? { '--accent-color': persona.color } : undefined}
        >
          {isThinking ? (
            <div className="typing-dots">
              <span />
              <span />
              <span />
            </div>
          ) : isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
