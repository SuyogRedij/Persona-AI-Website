export function PersonaHeader({ persona }) {
  return (
    <div className="persona-profile-header">
      <div className="persona-profile-left">
        <div className="persona-profile-avatar-wrapper">
          <div
            className="persona-profile-avatar"
            style={{ borderColor: persona.color, background: persona.color }}
          >
            {persona.image
              ? <img src={persona.image} alt={persona.name} />
              : persona.initials}
          </div>
          <span className="online-dot-profile" />
        </div>
        <div className="persona-profile-info">
          <div className="persona-profile-name">
            {persona.name}
            <span className="verified-badge-lg">✓</span>
          </div>
          <div className="persona-profile-subtitle">{persona.subtitle}</div>
          <div className="persona-profile-status">
            <span className="online-status-dot" />
            Online
          </div>
        </div>
      </div>
      <div className="persona-profile-tags">
        {persona.tags?.map((tag) => (
          <span key={tag} className="persona-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
