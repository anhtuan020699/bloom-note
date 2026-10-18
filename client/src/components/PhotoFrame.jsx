import { useState } from 'react';

const FALLBACK = '/stickers/cat.svg';

function Img({ src, className }) {
  const [failed, setFailed] = useState(null);
  const url = !src || failed === src ? FALLBACK : src;
  return <img src={url} alt="Ảnh kỷ niệm" draggable="false" onError={() => setFailed(src)} className={`block object-cover ${className}`} />;
}

function MiniFlower({ color, center = '#ffd54f', size = 22 }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-5.5" rx="4" ry="6" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r="3.2" fill={center} />
    </svg>
  );
}

export default function PhotoFrame({ style = 'polaroid', src, caption, width = 260, tilt = true }) {
  const tiltCls = tilt ? '-rotate-3 hover:rotate-0' : '';
  const base = `relative transition-transform duration-500 ease-out ${tiltCls}`;

  if (style === 'floral') {
    const n = 14;
    const r = width / 2;
    return (
      <figure className={base} style={{ width, paddingBottom: caption ? 44 : 0 }}>
        <div className="relative" style={{ width, height: width }}>
          <div className="absolute inset-[10%] overflow-hidden rounded-full shadow-xl ring-4 ring-white" style={{ boxShadow: '0 0 0 6px var(--secondary), 0 18px 40px rgba(0,0,0,.2)' }}>
            <Img src={src} className="h-full w-full" />
          </div>
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const rr = r * 0.86;
            const s = i % 3 === 0 ? 30 : i % 3 === 1 ? 22 : 16;
            return (
              <div key={i} className="absolute" style={{ left: r + Math.cos(a) * rr - s / 2, top: r + Math.sin(a) * rr - s / 2 }}>
                {i % 3 === 2 ? (
                  <svg width={s} height={s} viewBox="-10 -10 20 20" style={{ transform: `rotate(${(a * 180) / Math.PI + 90}deg)` }}>
                    <path d="M0 -9 C7 -4 6 5 0 9 C-6 5 -7 -4 0 -9Z" fill="#66bb6a" />
                  </svg>
                ) : (
                  <MiniFlower size={s} color={i % 2 ? 'var(--secondary)' : 'var(--accent)'} />
                )}
              </div>
            );
          })}
        </div>
        {caption && (
          <figcaption className="absolute inset-x-0 bottom-0 mx-auto w-fit max-w-full truncate rounded-full bg-white/90 px-4 py-1.5 text-center font-script text-lg text-[var(--primary)] shadow-md">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (style === 'stamp') {
    return (
      <figure className={base} style={{ width }}>
        <div className="frame-stamp">
          <div className="relative border-2 border-dashed border-[color-mix(in_srgb,var(--primary)_35%,transparent)] p-2">
            <Img src={src} className="aspect-[4/5] w-full sepia-[.15]" />
            <div className="mt-2 flex items-end justify-between gap-2 font-display text-[var(--primary)]">
              <span className="truncate text-sm italic">{caption || 'Thanh xuân'}</span>
              <span className="shrink-0 text-xl font-bold leading-none">20<sup className="text-[0.6em]">/10</sup></span>
            </div>
          </div>
        </div>
        <svg className="pointer-events-none absolute -right-8 -top-6 opacity-70" width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <path id="pm-circle" d="M50 50 m-34 0 a34 34 0 1 1 68 0 a34 34 0 1 1 -68 0" />
          </defs>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="2" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
          <text fontSize="9" letterSpacing="2" fill="var(--primary)" fontFamily="Be Vietnam Pro" fontWeight="600">
            <textPath href="#pm-circle">VIỆT NAM · NGÀY PHỤ NỮ ·</textPath>
          </text>
          <text x="50" y="55" textAnchor="middle" fontSize="13" fill="var(--primary)" fontWeight="700" fontFamily="Playfair Display">20·10</text>
          <path d="M0 40 q12 -8 25 0 t25 0 t25 0 t25 0 M0 60 q12 -8 25 0 t25 0 t25 0 t25 0" fill="none" stroke="var(--primary)" strokeWidth="1.5" transform="translate(-30 0)" />
        </svg>
      </figure>
    );
  }

  if (style === 'glass') {
    return (
      <figure
        className={`${base} rounded-[28px] border border-white/50 bg-white/20 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl`}
        style={{ width }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        <Img src={src} className="relative aspect-square w-full rounded-[20px]" />
        {caption && <figcaption className="relative mt-2.5 truncate px-1 text-center text-sm font-medium">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className={`${base} bg-white p-3 pb-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]`} style={{ width }}>
      <div
        className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[-4deg] opacity-80 shadow-sm"
        style={{ background: 'repeating-linear-gradient(45deg, var(--accent) 0 8px, color-mix(in srgb, var(--accent) 60%, white) 8px 16px)' }}
      />
      <Img src={src} className="aspect-square w-full bg-neutral-100" />
      <figcaption className="mt-3 min-h-[1.75rem] truncate text-center font-script text-2xl text-neutral-700">{caption}</figcaption>
    </figure>
  );
}
