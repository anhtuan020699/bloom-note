'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { player } from '../lib/player.js';

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe4f0"/><stop offset="1" stop-color="#fb7185"/></linearGradient></defs><rect width="240" height="300" fill="url(#g)"/><text x="120" y="150" text-anchor="middle" font-size="72">🌸</text><text x="120" y="200" text-anchor="middle" font-family="Georgia" font-size="18" fill="#881337">20/10</text></svg>`
  );

function nameOf(card) {
  return card?.recipientName?.trim() || 'bạn';
}
function senderOf(card) {
  return card?.senderName?.trim() || 'Người thương';
}
function messageOf(card) {
  const text = card?.message?.trim();
  if (text) return text;
  return `Hôm nay là ngày đặc biệt. Chúc ${nameOf(card)} luôn rạng rỡ, được yêu thương và gặp thật nhiều may mắn.`;
}
function wishesOf(card) {
  const bits = messageOf(card)
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6 && s.length < 48);
  return [
    `20/10 vui vẻ ${nameOf(card)}`,
    'Luôn rạng rỡ',
    'May mắn bên bạn',
    'Yêu thương nhiều',
    'Happy 20/10',
    ...bits,
  ].slice(0, 8);
}
function photoOf(card) {
  return card?.photoUrl || PHOTO;
}
function startMusic(card) {
  try {
    player.play(card?.musicConfig);
  } catch {
    /* ignore */
  }
}

function SceneForm({ pathname, letter, className, buttonClassName, ariaLabel, children }) {
  const dest = `${pathname || '/'}?start=1${letter ? '&letter=1' : ''}`;
  return (
    <form action="/start-scene" method="post" className={className}>
      <input type="hidden" name="back" value={pathname || '/'} />
      <input type="hidden" name="start" value="1" />
      {letter ? <input type="hidden" name="letter" value="1" /> : null}
      <button
        type="submit"
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={() => {
          window.location.assign(dest);
        }}
      >
        {children}
      </button>
    </form>
  );
}

function LetterSheet({ card, onClose, action, closePath }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
      {closePath ? (
        <SceneForm pathname={closePath} className="absolute inset-0" buttonClassName="h-full w-full" ariaLabel="Đóng thư" />
      ) : (
        <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Đóng thư" />
      )}
      <article className="relative z-10 max-h-[78dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#fffdf8] p-6 text-[#3b241c] shadow-2xl">
        <p className="text-center rf-script text-4xl text-[#b13d5c]">
          Gửi {nameOf(card)}
        </p>
        <p className="mt-4 rf-lora text-[15px] leading-relaxed whitespace-pre-wrap">
          {messageOf(card)}
        </p>
        <p className="mt-5 text-right rf-script text-2xl text-[#9b2f4d]">
          — {senderOf(card)}
        </p>
        {closePath ? (
          <SceneForm pathname={closePath} className="mt-5 text-center" buttonClassName="text-sm font-semibold text-[#9b2f4d]">
            Đóng thư
          </SceneForm>
        ) : null}
        {action}
      </article>
    </div>
  );
}

/* ============================================================
   LUCKY CHANCE — clover intro + 3D falling wishes
   ============================================================ */
function LuckyChance({ card }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const started = params.get('start') === '1';
  const letterOpen = params.get('letter') === '1';
  const [live, setLive] = useState(false);
  const spaceRef = useRef(null);
  const layerRef = useRef(null);
  const nodes = useRef([]);

  const specs = useMemo(() => {
    const wishes = wishesOf(card);
    const photo = photoOf(card);
    const count = typeof window !== 'undefined' && window.innerWidth < 700 ? 10 : 14;
    return Array.from({ length: count }, (_, i) => {
      const tier = i < 8 ? 0 : i < 16 ? 1 : 2;
      return {
        kind: card?.photoUrl && i % 3 === 0 ? 'photo' : 'text',
        text: wishes[i % wishes.length],
        photo,
        x: (i * 19 + 6) % 92,
        y: (i * 37) % 110,
        scale: [0.5, 0.82, 1.08][tier] + (i % 3) * 0.04,
        speed: [0.28, 0.55, 0.9][tier],
        opacity: [0.55, 0.82, 1][tier],
        drift: ((i % 5) - 2) * 0.04,
      };
    });
  }, [card]);

  useEffect(() => {
    if (!started) return undefined;
    const layer = layerRef.current;
    const root = spaceRef.current;
    if (!layer || !root) return undefined;
    const rot = { x: 10, y: -8, s: 1, vx: 0, vy: 0, drag: false, lx: 0, ly: 0, t: 0 };
    const items = specs.map((sp) => ({ ...sp }));
    const onDown = (e) => {
      if (e.target.closest('a, button')) return;
      rot.drag = true;
      rot.lx = e.clientX;
      rot.ly = e.clientY;
    };
    const onMove = (e) => {
      if (!rot.drag) return;
      const dx = e.clientX - rot.lx;
      const dy = e.clientY - rot.ly;
      rot.lx = e.clientX;
      rot.ly = e.clientY;
      rot.y = Math.max(-72, Math.min(72, rot.y + dx * 0.22));
      rot.x = Math.max(-50, Math.min(50, rot.x - dy * 0.16));
      rot.vy = dx * 0.22;
      rot.vx = -dy * 0.16;
    };
    const onUp = () => {
      rot.drag = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      rot.s = Math.max(0.72, Math.min(1.4, rot.s - e.deltaY * 0.001));
    };
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    root.addEventListener('wheel', onWheel, { passive: false });
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!rot.drag) {
        rot.vx *= 0.86;
        rot.vy *= 0.86;
        rot.x = Math.max(-50, Math.min(50, rot.x + rot.vx));
        rot.y = Math.max(-72, Math.min(72, rot.y + rot.vy));
        rot.x += (8 - rot.x) * 0.012;
      }
      rot.t += 0.02;
      const sc = rot.s * (1 + Math.sin(rot.t) * 0.012);
      layer.style.transform = `rotateX(${rot.x.toFixed(2)}deg) rotateY(${rot.y.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        it.y += it.speed;
        it.x += it.drift;
        if (it.y > 112) {
          it.y = -22;
          it.x = Math.random() * 90;
        }
        const el = nodes.current[i];
        if (el) el.style.transform = `translate3d(${it.x}vw, ${it.y}vh, 0) scale(${it.scale})`;
      }
    };
    raf = requestAnimationFrame(tick);
    setLive(true);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('wheel', onWheel);
    };
  }, [started, specs, card]);

  useEffect(() => {
    if (started) startMusic(card);
  }, [started, card]);

  if (!started) {
    return (
      <div
        className="fixed inset-0 z-30 grid place-items-center overflow-hidden text-center"
        style={{
          background:
            'radial-gradient(ellipse 100% 90% at 50% 35%, #1a4d32 0%, #0d2818 42%, #061208 100%)',
        }}
      >
        <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="rf-spark pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-emerald-200"
            style={{ left: `${12 + i * 14}%`, top: `${18 + (i % 3) * 22}%`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-[radial-gradient(ellipse_at_18%_110%,#14532d_0%,transparent_58%),radial-gradient(ellipse_at_78%_120%,#052e16_0%,transparent_62%)]" />
        <div className="relative z-10 flex flex-col items-center px-5">
          <p className="rf-lora text-[11px] tracking-[0.32em] text-emerald-100/80 italic sm:text-xs">
            LUCKY CHANCE
          </p>
          <h1 className="mt-3 rf-lora text-[1.7rem] text-white sm:text-5xl">
            Gửi may mắn đến
          </h1>
          <p className="mt-1 rf-script text-4xl text-[#a7f3d0] sm:text-6xl">
            {nameOf(card)}
          </p>
          <SceneForm
            pathname={pathname}
            ariaLabel="Chạm cỏ may mắn để bắt đầu"
            buttonClassName="rf-clover mt-8 grid h-28 w-28 place-items-center rounded-full sm:h-36 sm:w-36"
          >
            <CloverIcon />
          </SceneForm>
          <p className="mt-6 text-sm text-emerald-100/80">Chạm cỏ may mắn để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={spaceRef}
      className="fixed inset-0 z-30 overflow-hidden text-emerald-50"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #14532d 0%, #052e16 45%, #02150c 100%)',
        perspective: '1400px',
        touchAction: 'none',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-900/80 to-transparent" />
      <p className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 text-center text-xs text-emerald-100/80">
        Kéo để nghiêng không gian
      </p>
      <div
        ref={layerRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {specs.map((sp, i) => (
          <div
            key={i}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            className={`absolute top-0 left-0 will-change-transform ${live ? '' : 'rf-fall'}`}
            style={{
              opacity: sp.opacity,
              '--rf-x': `${sp.x}vw`,
              '--rf-y': `${(sp.y % 80) - 16}vh`,
              animationDuration: `${9 + (i % 5) * 1.6}s`,
              animationDelay: `${(i % 7) * 0.28}s`,
            }}
          >
            {sp.kind === 'photo' ? (
              <img
                src={sp.photo}
                alt=""
                draggable={false}
                className="h-32 w-24 rounded-xl border-4 border-white object-cover shadow-xl"
              />
            ) : (
              <span
                className="rf-pacifico text-lg text-[#d1fae5] sm:text-2xl"
                style={{ textShadow: '0 0 12px rgba(52,211,153,0.65)' }}
              >
                {sp.text}
              </span>
            )}
          </div>
        ))}
      </div>
      <SceneForm
        pathname={pathname}
        letter
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
        buttonClassName="rounded-full border border-emerald-200/70 bg-emerald-950/80 px-5 py-2.5 text-sm font-semibold text-emerald-50 shadow-[0_0_24px_rgba(52,211,153,0.45)]"
      >
        Mở thư tay
      </SceneForm>
      {letterOpen ? <LetterSheet card={card} closePath={pathname} /> : null}
    </div>
  );
}

function CloverIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 drop-shadow-[0_8px_18px_rgba(16,185,129,0.65)]">
      <g fill="#34d399">
        <ellipse cx="60" cy="34" rx="18" ry="24" />
        <ellipse cx="60" cy="86" rx="18" ry="24" />
        <ellipse cx="34" cy="60" rx="24" ry="18" />
        <ellipse cx="86" cy="60" rx="24" ry="18" />
      </g>
      <circle cx="60" cy="60" r="10" fill="#a7f3d0" />
      <path d="M60 70c8 16 6 28-2 36" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   LOVE MATRIX — gift, rain + particle text, folding card, photo heart
   ============================================================ */
function sampleText(text, w, h) {
  const off = document.createElement('canvas');
  off.width = Math.max(1, Math.floor(w));
  off.height = Math.max(1, Math.floor(h));
  const ctx = off.getContext('2d', { willReadFrequently: true });
  const gap = Math.min(w, h) < 640 ? 9 : 12;
  ctx.clearRect(0, 0, off.width, off.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = Math.min(w * 0.2, h * 0.32, 168);
  const fit = () => {
    ctx.font = `800 ${size}px Outfit, sans-serif`;
  };
  fit();
  while (ctx.measureText(text).width > w * 0.88 && size > 32) {
    size -= 6;
    fit();
  }
  ctx.lineWidth = Math.max(6, size * 0.06);
  ctx.strokeStyle = '#fff';
  ctx.strokeText(text, w / 2, h / 2);
  ctx.fillText(text, w / 2, h / 2);
  const data = ctx.getImageData(0, 0, off.width, off.height).data;
  const pts = [];
  for (let y = 0; y < off.height; y += gap) {
    for (let x = 0; x < off.width; x += gap) {
      if (data[(y * off.width + x) * 4 + 3] > 40) pts.push({ x, y });
    }
  }
  const cap = Math.min(w, h) < 640 ? 280 : 420;
  return pts.slice(0, cap);
}

function LoveMatrix({ card }) {
  const [stage, setStage] = useState('gift');
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(null);
  const rainRef = useRef(null);
  const shapeRef = useRef(null);

  const texts = useMemo(
    () => ['3', '2', '1', 'HAPPY', '20/10', nameOf(card).toUpperCase(), '♥'],
    [card]
  );

  useEffect(() => {
    if (stage !== 'matrix') return undefined;
    const rain = rainRef.current;
    const shape = shapeRef.current;
    if (!rain || !shape) return undefined;
    const rctx = rain.getContext('2d');
    const sctx = shape.getContext('2d');
    let running = true;
    let raf = 0;
    let timer = 0;
    const drops = [];
    const glyphs = '2010♥HAPPY'.split('');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const c of [rain, shape]) {
        c.width = Math.floor(c.clientWidth * dpr);
        c.height = Math.floor(c.clientHeight * dpr);
      }
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(rain.clientWidth / 16);
      drops.length = 0;
      for (let i = 0; i < cols; i++) drops.push(Math.random() * -20);
    };
    resize();

    const dots = [];
    const assign = (pts) => {
      while (dots.length < pts.length) {
        dots.push({
          x: Math.random() * shape.clientWidth,
          y: Math.random() * shape.clientHeight,
          tx: 0,
          ty: 0,
          z: 2,
          tz: 3,
        });
      }
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const p = pts[i];
        if (p) {
          d.tx = p.x;
          d.ty = p.y;
          d.tz = 3.1;
        } else {
          d.tx = Math.random() * shape.clientWidth;
          d.ty = Math.random() * shape.clientHeight;
          d.tz = 1;
        }
      }
    };

    let step = 0;
    const next = () => {
      if (!running) return;
      if (shape.clientWidth < 8 || shape.clientHeight < 8) {
        timer = setTimeout(next, 40);
        return;
      }
      if (step >= texts.length) {
        timer = setTimeout(() => {
          if (running) setStage('letter');
        }, 700);
        return;
      }
      assign(sampleText(texts[step], shape.clientWidth, shape.clientHeight));
      step += 1;
      timer = setTimeout(next, step <= 3 ? 1000 : 2200);
    };
    next();

    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      const w = rain.clientWidth;
      const h = rain.clientHeight;
      rctx.fillStyle = 'rgba(0,0,0,0.18)';
      rctx.fillRect(0, 0, w, h);
      rctx.font = 'bold 16px Outfit, sans-serif';
      rctx.fillStyle = '#f472b6';
      for (let i = 0; i < drops.length; i++) {
        if (drops[i] > 0) {
          rctx.fillText(glyphs[i % glyphs.length], i * 16, drops[i] * 16);
        }
        drops[i] += 1;
        if (drops[i] * 16 > h && Math.random() > 0.95) drops[i] = 0;
      }
      sctx.clearRect(0, 0, shape.clientWidth, shape.clientHeight);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += (d.tx - d.x) * 0.16;
        d.y += (d.ty - d.y) * 0.16;
        d.z += (d.tz - d.z) * 0.16;
        sctx.fillStyle = 'rgba(255,20,147,0.2)';
        sctx.beginPath();
        sctx.arc(d.x, d.y, d.z * 1.8, 0, Math.PI * 2);
        sctx.fill();
        sctx.fillStyle = '#ff1493';
        sctx.beginPath();
        sctx.arc(d.x, d.y, Math.max(1.2, d.z), 0, Math.PI * 2);
        sctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      running = false;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [stage, texts]);

  const heartCells = useMemo(() => {
    const cols = 11;
    const rows = 11;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -1.3 + (c / (cols - 1)) * 2.6;
        const y = -1.35 + (r / (rows - 1)) * 2.5;
        const iy = -y;
        const sum = x * x + iy * iy - 1;
        const inside = sum * sum * sum - x * x * iy * iy * iy <= 0;
        cells.push({ inside, delay: Math.hypot(x, y) * 0.12 });
      }
    }
    return cells;
  }, []);

  if (stage === 'gift') {
    return (
      <div className="fixed inset-0 z-30 grid place-items-center bg-[#14040c] text-center text-pink-50">
        <button
          type="button"
          onClick={() => {
            startMusic(card);
            setStage('matrix');
          }}
          className="rf-gift flex flex-col items-center"
          aria-label="Nhấn để mở món quà"
        >
          <GiftBox />
          <p className="mt-5 text-lg font-semibold">Nhấn để mở món quà</p>
          <p className="mt-1 text-sm text-pink-200/80">Một điều bất ngờ đang chờ bạn</p>
        </button>
      </div>
    );
  }

  if (stage === 'matrix') {
    return (
      <div className="fixed inset-0 z-30 bg-black">
        <canvas ref={rainRef} className="absolute inset-0 h-full w-full" />
        <canvas ref={shapeRef} className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  if (stage === 'heart') {
    return (
      <div className="fixed inset-0 z-30 grid place-items-center bg-[#1a0610] px-4">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
            width: 'min(92vw, 560px)',
            filter: 'drop-shadow(0 0 24px rgba(255,95,137,0.45))',
          }}
        >
          {heartCells.map((cell, i) =>
            cell.inside ? (
              <button
                key={i}
                type="button"
                onClick={() => setPicked(i)}
                className="aspect-square overflow-hidden rounded-sm border border-white/10"
                style={{ animation: `rf-pop 0.55s ease ${cell.delay}s both` }}
              >
                <img src={photoOf(card)} alt="" className="h-full w-full scale-150 object-cover" />
              </button>
            ) : (
              <span key={i} className="aspect-square" />
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => setStage('letter')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-pink-300/80 bg-[#18060e]/90 px-5 py-2 text-sm text-pink-50"
        >
          Quay lại thiệp
        </button>
        {picked != null && (
          <button
            type="button"
            className="absolute inset-0 grid place-items-center bg-black/70"
            onClick={() => setPicked(null)}
          >
            <img src={photoOf(card)} alt="" className="max-h-[70dvh] max-w-[80vw] rounded-2xl object-contain" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-[#2a0c18] px-4">
      <div
        className="relative h-[400px]"
        style={{ width: open ? 'min(560px, 94vw)' : 'min(280px, 86vw)' }}
      >
        <div className={`absolute inset-y-0 right-0 overflow-y-auto bg-[#fffdf8] p-4 text-[#2b161f] shadow-xl ${open ? 'w-1/2' : 'hidden'}`}>
          <p className="text-center rf-script text-3xl text-[#b13d5c]">Gửi {nameOf(card)}</p>
          <p className="mt-3 rf-lora text-sm leading-relaxed whitespace-pre-wrap">{messageOf(card)}</p>
          <p className="mt-4 text-right rf-script text-xl text-[#9b2f4d]">— {senderOf(card)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`absolute inset-y-0 left-0 h-full ${open ? 'w-1/2' : 'w-full'}`}
          style={{ perspective: '2000px' }}
        >
          <span
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              transform: open ? 'rotateY(-165deg)' : 'rotateY(0deg)',
              transition: 'transform 0.9s',
            }}
          >
            <span className="absolute inset-0 overflow-hidden bg-[#e7d5dc]" style={{ backfaceVisibility: 'hidden' }}>
              <img src={photoOf(card)} alt="" className="h-full w-full object-cover" />
              <span className="absolute top-6 right-3 rotate-12 rf-script text-4xl text-white drop-shadow">
                For You
              </span>
            </span>
            <span
              className="absolute inset-0 grid place-items-center bg-[#f6efe4] rf-script text-5xl text-[#b13d5c]"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              ♡
            </span>
          </span>
        </button>
      </div>
      <p className="absolute bottom-20 text-sm text-pink-100/80">Chạm bìa thiệp để mở</p>
      {open && (
        <button
          type="button"
          onClick={() => setStage('heart')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-pink-200 bg-[#18060e] px-5 py-2.5 text-sm text-pink-50"
        >
          Xem trái tim ảnh
        </button>
      )}
    </div>
  );
}

function GiftBox() {
  return (
    <span className="relative block h-36 w-36">
      <span className="absolute inset-x-2 bottom-0 h-24 rounded-xl bg-gradient-to-br from-rose-400 to-pink-700 shadow-[0_16px_40px_rgba(244,63,94,0.45)]" />
      <span className="absolute inset-x-0 top-6 h-8 rounded-md bg-gradient-to-r from-rose-300 to-fuchsia-400" />
      <span className="absolute top-0 left-1/2 h-10 w-8 -translate-x-1/2 rounded-t-full border-4 border-b-0 border-amber-200" />
      <span className="absolute inset-y-8 left-1/2 w-4 -translate-x-1/2 bg-amber-300" />
      <span className="absolute top-14 right-6 left-6 h-4 bg-amber-300" />
    </span>
  );
}

/* ============================================================
   VIP — gift, cake, flip album, envelope, flying wishes
   ============================================================ */
function VipCelebration({ card }) {
  const [stage, setStage] = useState('gift');
  const [blown, setBlown] = useState(false);
  const [page, setPage] = useState(0);
  const [envOpen, setEnvOpen] = useState(false);
  const photo = photoOf(card);
  const pages = useMemo(
    () => [
      { kind: 'cover', title: 'For You', sub: nameOf(card) },
      { kind: 'photo', src: photo },
      { kind: 'wish', text: wishesOf(card)[0] },
      { kind: 'photo', src: photo },
      { kind: 'end', title: '20/10' },
    ],
    [card, photo]
  );

  const goGift = () => {
    startMusic(card);
    setStage('cake');
  };

  return (
    <div
      className="fixed inset-0 z-30 overflow-hidden"
      style={{
        background:
          stage === 'fly'
            ? 'radial-gradient(ellipse at 50% 40%, #3b1020 0%, #14060c 70%)'
            : 'linear-gradient(180deg, #ffe4ef 0%, #fce4ec 40%, #fff5f7 100%)',
      }}
    >
      {stage === 'gift' && (
        <div className="grid h-full place-items-center text-center text-[#6b2b3a]">
          <button type="button" onClick={goGift} className="rf-gift flex flex-col items-center" aria-label="Chạm để bắt đầu">
            <GiftBox />
            <p className="mt-4 rf-pacifico text-xl">Chạm vào hộp quà để nhận điều bất ngờ</p>
          </button>
        </div>
      )}

      {stage === 'cake' && (
        <div className="grid h-full place-items-center text-center">
          <div className="rf-cake-drop flex flex-col items-center">
            <div className="relative mb-2 h-16 w-8">
              {!blown && (
                <>
                  <i className="rf-flame" />
                  <i className="rf-flame" style={{ animationDelay: '0.15s', left: '30%' }} />
                </>
              )}
              <span className="absolute bottom-0 left-1/2 h-12 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f4e0ea] to-[#c9899e]" />
            </div>
            <div className="h-8 w-52 rounded-t-[40%] bg-[#fefae9]" />
            <div className="h-10 w-60 rounded-md bg-[#f3bcd0]" />
            <div className="h-8 w-52 rounded-b-md bg-[#d97394]" />
            <div className="h-12 w-64 rounded-b-3xl bg-[#f3bcd0] shadow-lg" />
            <h2 className="mt-6 rf-pacifico text-4xl text-[#8b4558]">Happy 20/10</h2>
            <p className="rf-script text-4xl text-[#b13d5c]">{nameOf(card)}</p>
            <button
              type="button"
              onClick={() => {
                setBlown(true);
                setTimeout(() => setStage('book'), 700);
              }}
              className="mt-5 rounded-full bg-[#8b6a60] px-5 py-2 text-white"
            >
              Thổi nến
            </button>
          </div>
        </div>
      )}

      {stage === 'book' && (
        <div className="grid h-full place-items-center">
          <div className="relative h-[420px] w-[280px]" style={{ perspective: '1400px' }}>
            {pages.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i < page ? i : Math.min(pages.length, i + 1))}
                className="absolute inset-0 overflow-hidden rounded-r-xl bg-white text-left shadow-2xl"
                style={{
                  transformOrigin: 'left center',
                  transform: i < page ? 'rotateY(-178deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.8s',
                  zIndex: i < page ? i : pages.length - i,
                  backfaceVisibility: 'hidden',
                }}
              >
                {p.kind === 'photo' ? (
                  <img src={p.src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center bg-gradient-to-b from-rose-100 to-rose-200 px-6 text-center">
                    <span>
                      <span className="block rf-script text-5xl text-[#9b2f4d]">{p.title || '♡'}</span>
                      <span className="mt-2 block rf-lora text-sm text-[#6b2b3a]">{p.sub || p.text}</span>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="absolute bottom-20 text-sm text-[#8b4558]">Chạm trang để lật album</p>
          {page >= pages.length && (
            <button
              type="button"
              onClick={() => setStage('letter')}
              className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#9b2f4d] shadow"
            >
              Mở thư
            </button>
          )}
        </div>
      )}

      {stage === 'letter' && (
        <div className="grid h-full place-items-center px-4">
          {!envOpen ? (
            <button type="button" onClick={() => setEnvOpen(true)} className="text-center" aria-label="Mở phong bì">
              <span className="relative block h-44 w-72 bg-[#c9d0d2] shadow-xl">
                <span className="absolute inset-x-0 top-0 h-28 bg-[#b7c0c4]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <span className="absolute bottom-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-rose-500 text-white">♥</span>
              </span>
              <p className="mt-4 rf-pacifico text-[#8b4558]">Chạm phong bì để đọc thư</p>
            </button>
          ) : (
            <article className="max-h-[70dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#fffdf8] p-6 text-[#3a2a2c] shadow-2xl">
              <h2 className="rf-pacifico text-3xl text-[#9b2f4d]">Gửi {nameOf(card)},</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{messageOf(card)}</p>
              <p className="mt-4 text-right rf-pacifico text-xl">{senderOf(card)}</p>
              <button
                type="button"
                onClick={() => setStage('fly')}
                className="mt-5 rounded-full bg-[#8b4558] px-4 py-2 text-sm text-white"
              >
                Xem món quà cuối
              </button>
            </article>
          )}
        </div>
      )}

      {stage === 'fly' && <VipFly card={card} />}
    </div>
  );
}

function VipFly({ card }) {
  const layerRef = useRef(null);
  const nodes = useRef([]);
  const specs = useMemo(() => {
    const wishes = wishesOf(card);
    const photo = photoOf(card);
    const count = typeof window !== 'undefined' && window.innerWidth < 700 ? 8 : 12;
    return Array.from({ length: count }, (_, i) => ({
      kind: i % 2 === 0 ? 'text' : 'photo',
      text: wishes[i % wishes.length],
      photo,
      x: (i * 23) % 90,
      y: (i * 29) % 100,
      scale: 0.35 + (i % 4) * 0.12,
      speed: 0.35 + (i % 5) * 0.12,
    }));
  }, [card]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    const items = specs.map((s) => ({ ...s }));
    const rot = { x: 8, y: 0, drag: false, lx: 0, ly: 0 };
    const onDown = (e) => {
      rot.drag = true;
      rot.lx = e.clientX;
      rot.ly = e.clientY;
    };
    const onMove = (e) => {
      if (!rot.drag) return;
      rot.y = Math.max(-40, Math.min(40, rot.y + (e.clientX - rot.lx) * 0.15));
      rot.x = Math.max(-30, Math.min(30, rot.x - (e.clientY - rot.ly) * 0.12));
      rot.lx = e.clientX;
      rot.ly = e.clientY;
    };
    const onUp = () => {
      rot.drag = false;
    };
    layer.parentElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      layer.style.transform = `rotateX(${rot.x.toFixed(2)}deg) rotateY(${rot.y.toFixed(2)}deg)`;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        it.y += it.speed;
        it.scale = Math.min(1.35, it.scale + 0.004);
        if (it.y > 110) {
          it.y = -20;
          it.scale = 0.28;
          it.x = Math.random() * 88;
        }
        const el = nodes.current[i];
        if (el) el.style.transform = `translate3d(${it.x}vw, ${it.y}vh, 0) scale(${it.scale})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      layer.parentElement?.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [specs]);

  return (
    <div className="absolute inset-0" style={{ perspective: '1200px' }}>
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 rounded-b-3xl bg-pink-300/30 blur-sm" />
      <div ref={layerRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {specs.map((sp, i) => (
          <div
            key={i}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            className="absolute top-0 left-0"
          >
            {sp.kind === 'photo' ? (
              <img src={sp.photo} alt="" className="h-28 w-20 rounded-lg border-4 border-white object-cover shadow-lg" />
            ) : (
              <span className="rf-pacifico text-xl text-pink-200" style={{ textShadow: '0 0 12px #ff5fa8' }}>
                {sp.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferenceExperience({ kind, card }) {
  if (kind === 'lucky') return <LuckyChance card={card} />;
  if (kind === 'matrix') return <LoveMatrix card={card} />;
  return <VipCelebration card={card} />;
}

export const ReferenceMini = memo(function ReferenceMini({ kind }) {
  if (kind === 'lucky') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#166534,#052e16)]">
        <div className="rf-clover scale-75">
          <CloverIcon />
        </div>
      </div>
    );
  }
  if (kind === 'matrix') {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        <span className="glow-pulse font-sans text-4xl font-black tracking-widest text-[#ff1493]">20/10</span>
        <span className="rf-spark absolute top-6 left-8 h-2 w-2 rounded-full bg-pink-400" />
        <span className="rf-spark absolute right-10 bottom-8 h-2 w-2 rounded-full bg-pink-300" />
      </div>
    );
  }
  if (kind === 'galaxy') {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#2b0938,#05010a)]">
        <span className="glow-pulse text-6xl">💖</span>
        <span className="rf-spark absolute top-5 left-8 h-1.5 w-1.5 rounded-full bg-pink-200" />
        <span className="rf-spark absolute right-10 top-10 h-2 w-2 rounded-full bg-fuchsia-300" />
        <span className="rf-spark absolute bottom-8 left-12 h-1.5 w-1.5 rounded-full bg-rose-200" />
      </div>
    );
  }
  if (kind === 'carousel') {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#3d122e,#08020a)]">
        <span className="spin-slow text-6xl">📸</span>
        <span className="rf-spark absolute top-6 right-10 h-2 w-2 rounded-full bg-amber-200" />
      </div>
    );
  }
  if (kind === 'crystal') {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#132247,#030613)]">
        <span className="float-y text-6xl">🦋</span>
        <span className="rf-spark absolute top-7 left-10 h-2 w-2 rounded-full bg-sky-200" />
        <span className="rf-spark absolute bottom-8 right-12 h-1.5 w-1.5 rounded-full bg-violet-200" />
      </div>
    );
  }
  if (kind === 'giftbox') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-end bg-gradient-to-b from-rose-100 to-rose-200 pb-6">
        <div className="rf-gift origin-bottom scale-[0.55]">
          <GiftBox />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-gradient-to-b from-rose-100 to-rose-200 pb-6">
      <div className="rf-gift origin-bottom scale-[0.55]">
        <GiftBox />
      </div>
    </div>
  );
});
