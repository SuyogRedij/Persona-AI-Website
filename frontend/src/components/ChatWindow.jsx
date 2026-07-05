import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { PersonaHeader } from './PersonaHeader.jsx';
import { SuggestedPrompts } from './SuggestedPrompts.jsx';

export function ChatWindow({ messages, isStreaming, persona, onSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showSuggested = messages.length <= 1 && !isStreaming;

  return (
    <div className="chat-window-wrapper">
      <PersonaHeader persona={persona} />
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
          {showSuggested && persona.suggestedPrompts && (
            <SuggestedPrompts prompts={persona.suggestedPrompts} onSelect={onSend} />
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
