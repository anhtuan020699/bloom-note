import { usePlayer, player } from '../lib/player.js';

export default function VinylButton({ music, className = '' }) {
  const { playing, muted, error } = usePlayer();
  const spinning = playing && !muted;

  const onClick = () => {
    if (!playing) player.play(music);
    else player.setMuted(!muted);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={error || (spinning ? 'Tắt tiếng' : 'Bật nhạc')}
      aria-label={spinning ? 'Tắt tiếng nhạc nền' : 'Bật nhạc nền'}
      className={`group relative grid h-14 w-14 place-items-center rounded-full shadow-xl ring-2 ring-white/60 transition hover:scale-105 ${className}`}
    >
      <svg viewBox="0 0 100 100" className={`h-full w-full spin-slow ${spinning ? '' : 'paused'}`} aria-hidden="true">
        <defs>
          <radialGradient id="vinyl" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#333" />
            <stop offset="1" stopColor="#0d0d0d" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#vinyl)" />
        {[44, 38, 32, 26].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeOpacity="0.08" />)}
        <path d="M50 8 A42 42 0 0 1 88 36" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="17" fill="var(--primary)" />
        <circle cx="50" cy="50" r="17" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 4" />
        <circle cx="50" cy="50" r="3" fill="#fff" />
      </svg>
      {!spinning && (
        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/35 text-lg text-white">
          {playing ? '🔇' : '▶'}
        </span>
      )}
      {spinning && (
        <span className="absolute -bottom-1 -right-1 flex h-5 items-end gap-[2px] rounded-full bg-white px-1.5 pb-1 pt-1 shadow" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[3px] rounded-full bg-[var(--primary)]" style={{ height: 10, animation: `eq 0.${7 + i}s ease-in-out ${i * 0.15}s infinite alternate` }} />
          ))}
        </span>
      )}
    </button>
  );
}
