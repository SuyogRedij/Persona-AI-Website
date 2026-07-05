import { useChat } from './hooks/useChat.js';
import { Header } from './components/Header.jsx';
import { PersonaSelector } from './components/PersonaSelector.jsx';
import { ChatWindow } from './components/ChatWindow.jsx';
import { ChatInput } from './components/ChatInput.jsx';

function App() {
  const { messages, isStreaming, currentPersona, sendMessage, switchPersona, stopStreaming } =
    useChat();

  return (
    <div className="app" style={{ '--accent-color': currentPersona.color }}>
      <Header currentPersona={currentPersona} />
      <div className="main-content">
        <PersonaSelector currentPersona={currentPersona} onSwitch={switchPersona} />
        <main className="chat-area">
          <ChatWindow messages={messages} isStreaming={isStreaming} persona={currentPersona} />
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            accentColor={currentPersona.color}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
