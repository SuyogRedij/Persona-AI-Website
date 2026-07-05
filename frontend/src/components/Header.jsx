export function Header({ currentPersona }) {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-icon">🤖</span>
        <h1>Persona AI</h1>
      </div>
      <p className="header-subtitle">
        Chatting with{' '}
        <span style={{ color: currentPersona.color, fontWeight: 600 }}>
          {currentPersona.name}
        </span>
      </p>
    </header>
  );
}
