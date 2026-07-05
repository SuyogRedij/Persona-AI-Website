import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat.js';
import { Header } from './components/Header.jsx';
import { PersonaSelector } from './components/PersonaSelector.jsx';
import { ChatWindow } from './components/ChatWindow.jsx';
import { ChatInput } from './components/ChatInput.jsx';

function App() {
  const { messages, isStreaming, currentPersona, sendMessage, switchPersona, stopStreaming } =
    useChat();

  const [theme, setTheme] = useState(() => localStorage.getItem('persona-ai-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('persona-ai-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="app" style={{ '--accent-color': currentPersona.color }}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div className="main-content">
        <PersonaSelector currentPersona={currentPersona} onSwitch={switchPersona} />
        <main className="chat-area">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            persona={currentPersona}
            onSend={sendMessage}
          />
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            accentColor={currentPersona.color}
            persona={currentPersona}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
