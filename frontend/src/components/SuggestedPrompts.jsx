import { useState } from 'react';

export function SuggestedPrompts({ prompts, onSelect }) {
  const [page, setPage] = useState(0);
  const perPage = 5;
  const totalPages = Math.ceil(prompts.length / perPage);
  const visible = prompts.slice(page * perPage, page * perPage + perPage);

  const refresh = () => setPage((p) => (p + 1) % totalPages);

  return (
    <div className="suggested-prompts">
      <div className="suggested-prompts-header">
        <span className="suggested-prompts-label">💡 Suggested prompts</span>
        {totalPages > 1 && (
          <button className="refresh-btn" onClick={refresh} title="More suggestions">↻</button>
        )}
      </div>
      <div className="suggested-prompts-list">
        {visible.map((prompt) => (
          <button key={prompt} className="prompt-pill" onClick={() => onSelect(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
