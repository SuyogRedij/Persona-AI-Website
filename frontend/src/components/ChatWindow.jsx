import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';

export function ChatWindow({ messages, isStreaming, persona }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            persona={persona}
            isLastStreaming={isStreaming && index === messages.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
