import { useEffect, useState } from 'react';

const PAUSES = { '.': 280, '!': 280, '?': 280, ',': 140, '\n': 360, '…': 300 };

export default function Typewriter({ text, speed = 42, start = true, skip = false, onDone, className = '' }) {
  const chars = Array.from(text || '');
  const [count, setCount] = useState(0);
  const done = skip || count >= chars.length;

  useEffect(() => { setCount(0); }, [text]);

  useEffect(() => {
    if (!start || done) return;
    const prev = chars[count - 1];
    const delay = (PAUSES[prev] || 0) + speed * (0.6 + Math.random() * 0.8);
    const id = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(id);
  });

  useEffect(() => {
    if (done && start) onDone?.();
  }, [done, start]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = done ? text : chars.slice(0, count).join('');
  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      <span className={done ? '' : 'caret'}>{shown}</span>
      {!done && <span className="invisible">{chars.slice(count).join('')}</span>}
    </p>
  );
}
