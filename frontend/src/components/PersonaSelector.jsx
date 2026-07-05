import { PERSONAS } from '../data/personas.js';

export function PersonaSelector({ currentPersona, onSwitch }) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Choose Persona</p>
      {PERSONAS.map((persona) => {
        const isActive = persona.id === currentPersona.id;
        return (
          <div
            key={persona.id}
            className={`persona-card${isActive ? ' active' : ''}`}
            style={{ '--card-accent': persona.color }}
            onClick={() => onSwitch(persona)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSwitch(persona)}
            aria-pressed={isActive}
          >
            <div className="persona-card-top">
              <div className="persona-avatar-wrapper">
                <div className="persona-avatar" style={{ background: persona.color }}>
                  {persona.image
                    ? <img src={persona.image} alt={persona.name} className="persona-avatar-img" />
                    : persona.initials}
                </div>
                <span className="online-dot" />
              </div>
              <div className="persona-card-info">
                <p className="persona-name">
                  {persona.name}
                  <span className="verified-badge"> ✓</span>
                </p>
                <p className="persona-skills">{persona.skills}</p>
              </div>
              {isActive && (
                <span className="active-badge" style={{ color: persona.color }}>Active</span>
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
