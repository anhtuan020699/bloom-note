'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import Flower from './Flower.jsx';
import { player } from '../lib/player.js';
import styles from './loveverse.module.css';

const ROSE_FACE = {
  flowerType: 'rose',
  themeColors: {
    primary: '#e11d48',
    secondary: '#ffe4ec',
    accent: '#fda4af',
    petals: ['#fff1f5', '#fb7185', '#be123c'],
    center: '#fff5f7',
    textColor: '#fff',
    cardBg: 'transparent',
    bgGradient: 'none',
  },
};

const BOUQUET_FACE = {
  flowerType: 'bouquet',
  themeColors: {
    ...ROSE_FACE.themeColors,
    petals: ['#fecdd3', '#fb7185', '#f9a8d4', '#fda4af', '#e11d48'],
    primary: '#e11d48',
    secondary: '#fff7f9',
    accent: '#fecdd3',
  },
};

const HOLD_MS = 2400;

const stars = Array.from({ length: 46 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 17) % 62}%`,
  delay: `${(i % 7) * 0.35}s`,
  size: 1.5 + (i % 3),
}));

const flies = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + ((i * 23) % 80)}%`,
  top: `${40 + ((i * 13) % 45)}%`,
  delay: `${i * 0.6}s`,
}));

function wishesOf(card) {
  const name = card?.recipientName?.trim() || 'em';
  const bits = String(card?.message || '')
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  return [
    ...bits,
    `Chúc ${name} một ngày 20/10 thật dịu dàng`,
    'Luôn được yêu theo cách khiến mình bình yên',
    'Hôm nay và những ngày sau, vẫn được cười như thế',
    '20/10 vui vẻ nhé',
  ].slice(0, 6);
}

function galleryOf(card) {
  const photo = card?.photoUrl;
  const caption = card?.photoCaption || '20/10';
  const items = [];
  if (photo) items.push({ type: 'photo', src: photo, caption });
  wishesOf(card).forEach((text, i) => {
    items.push({ type: 'wish', text, caption: `Lời chúc ${String(i + 1).padStart(2, '0')}` });
  });
  if (photo) items.push({ type: 'photo', src: photo, caption: card?.recipientName || 'For you' });
  return items;
}

function NightSky() {
  return (
    <>
      <div className={styles.moon} aria-hidden="true" />
      <div className={styles.hills} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className={styles.star}
            style={{ left: s.left, top: s.top, animationDelay: s.delay, width: s.size, height: s.size }}
          />
        ))}
      </div>
      <div className={styles.flies} aria-hidden="true">
        {flies.map((f, i) => (
          <span key={i} className={styles.fly} style={{ left: f.left, top: f.top, animationDelay: f.delay }} />
        ))}
      </div>
    </>
  );
}

function NameBurst({ text }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 180;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = `${text.length > 18 ? 42 : 64}px "Playfair Display", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    const pixels = ctx.getImageData(0, 0, w, h).data;
    ctx.clearRect(0, 0, w, h);
    const pts = [];
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        if (pixels[(y * w + x) * 4 + 3] > 140) {
          pts.push({ x, y, sx: Math.random() * w, sy: Math.random() * h });
        }
      }
    }
    let raf = 0;
    const t0 = performance.now();
    const draw = (now) => {
      const p = Math.min(1, (now - t0) / 1500);
      const e = 1 - (1 - p) ** 3;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 246, 250, 0.95)';
      for (const pt of pts) {
        ctx.fillRect(pt.sx + (pt.x - pt.sx) * e, pt.sy + (pt.y - pt.sy) * e, 2, 2);
      }
      if (p < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return <canvas ref={ref} className={styles.nameCanvas} aria-hidden="true" />;
}

export default function LoveVerseScene({ card }) {
  const [stage, setStage] = useState('cloche');
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState(false);
  const [burst, setBurst] = useState(false);
  const [bouquetIn, setBouquetIn] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loadPct, setLoadPct] = useState(0);
  const [rainReady, setRainReady] = useState(false);
  const rafRef = useRef(0);
  const litRef = useRef(false);
  const items = useMemo(() => galleryOf(card), [card]);
  const wishes = useMemo(() => wishesOf(card), [card]);
  const name = card?.recipientName?.trim() || 'For you';

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (stage !== 'meadow') return undefined;
    const timer = setTimeout(() => setBouquetIn(true), 2300);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'gallery') return undefined;
    setGalleryReady(false);
    const timer = setTimeout(() => setGalleryReady(true), 700);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'rain') return undefined;
    setRainReady(false);
    setLoadPct(0);
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(100, pct + 5);
      setLoadPct(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => setRainReady(true), 320);
      }
    }, 45);
    return () => clearInterval(timer);
  }, [stage]);

  const startHold = (event) => {
    if (lit) return;
    if (event.cancelable) event.preventDefault();
    try { player.ensureContext(); } catch { /* autoplay unlock */ }
    cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const tick = (now) => {
      if (litRef.current) return;
      const next = Math.min(1, (now - t0) / HOLD_MS);
      setProgress(next);
      if (next >= 1) {
        litRef.current = true;
        setLit(true);
        setProgress(1);
        player.play(card?.musicConfig);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (litRef.current) return;
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  };

  const tapRose = () => {
    if (!lit || burst) return;
    setBurst(true);
    setTimeout(() => setStage('meadow'), 720);
  };

  const openLetter = () => setStage('letter');
  const openEnvelope = () => setEnvelopeOpen(true);

  const showPhoto = (index) => setLightbox(index);
  const stepPhoto = (dir) => {
    setLightbox((i) => (i + dir + items.length) % items.length);
  };

  const litLevel = 0.55 + progress * 0.7;
  const sat = 0.75 + progress * 0.45;
  const drops = useMemo(() => {
    const pool = [
      ...wishes.map((text) => ({ kind: 'text', text })),
      ...(card?.photoUrl ? [{ kind: 'photo', src: card.photoUrl }, { kind: 'photo', src: card.photoUrl }] : []),
    ];
    return Array.from({ length: 16 }, (_, i) => {
      const item = pool[i % pool.length];
      return {
        ...item,
        left: `${(i * 17) % 92}%`,
        delay: `${(i % 8) * 0.7}s`,
        duration: `${9 + (i % 5) * 1.6}s`,
        drift: `${((i % 5) - 2) * 28}px`,
        rot: `${((i % 7) - 3) * 4}deg`,
      };
    });
  }, [wishes, card?.photoUrl]);

  return (
    <div className={styles.root}>
      {stage === 'cloche' && (
        <div className={`${styles.stage} ${styles.cloche}`}>
          <button
            type="button"
            className={styles.chamber}
            style={{ '--lit': litLevel, '--sat': sat, '--glow': progress }}
            onClick={tapRose}
            aria-label="Đóa hồng trong lồng kính ma thuật"
          >
            <span className={styles.halo} />
            <span className={styles.glassShell}>
              <span className={styles.knob} />
              <span className={styles.knobNeck} />
              <span className={styles.flowerIn}>
                <Flower template={ROSE_FACE} bloom glow={lit} size={158} instant />
              </span>
              <span className={styles.spark} style={{ left: '22%', top: '28%' }} />
              <span className={styles.spark} style={{ left: '70%', top: '36%', animationDelay: '0.7s' }} />
              <span className={styles.spark} style={{ left: '48%', top: '18%', animationDelay: '1.1s' }} />
              <span className={styles.rim} />
            </span>
            <span className={styles.table} />
          </button>
          <p className={`${styles.hint} ${lit ? styles.hintOn : ''}`}>Chạm nhẹ bông hoa</p>
          {!lit && (
          <button
            type="button"
            className={styles.hold}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onPointerLeave={endHold}
            aria-label="Nhấn giữ để thắp sáng đóa hồng"
          >
            <span className={styles.holdCore}>
              <svg viewBox="0 0 76 76" aria-hidden="true">
                <defs>
                  <linearGradient id="lvHold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffd1dc" />
                    <stop offset="1" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <circle cx="38" cy="38" r="34" fill="rgba(255,105,180,0.22)" />
                <circle cx="38" cy="38" r="30" fill="rgba(35,12,24,0.88)" stroke="rgba(255,160,195,0.35)" strokeWidth="3.5" />
                <circle
                  cx="38"
                  cy="38"
                  r="30"
                  fill="none"
                  stroke="url(#lvHold)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="188.5"
                  strokeDashoffset={188.5 * (1 - progress)}
                  transform="rotate(-90 38 38)"
                />
              </svg>
              <span className={styles.print}>
                <Fingerprint size={30} strokeWidth={1.75} color="#ff9ec4" />
              </span>
            </span>
            <span className={styles.holdLabel}>Nhấn giữ để bắt đầu</span>
          </button>
          )}
          <div className={`${styles.burst} ${burst ? styles.burstOn : ''}`} />
        </div>
      )}

      {stage === 'meadow' && (
        <div className={`${styles.stage} ${styles.meadow}`}>
          <NightSky />
          {!bouquetIn && <NameBurst text={name} />}
          <div className={`${styles.bouquet} ${bouquetIn ? styles.bouquetIn : ''}`}>
            <Flower template={BOUQUET_FACE} bloom size={320} glow={false} instant />
          </div>
          <button
            type="button"
            className={`${styles.forYou} ${bouquetIn ? styles.forYouOn : ''}`}
            onClick={openLetter}
            aria-label="For you, my love"
          >
            For you, my love
          </button>
        </div>
      )}

      {stage === 'letter' && (
        <div className={`${styles.stage} ${styles.letter}`}>
          <NightSky />
          {envelopeOpen && (
            <article className={styles.sheet}>
              <h2 className={styles.letterTitle}>Gửi {name},</h2>
              <p className={styles.letterBody}>
                {card?.message?.trim() || `Nhân ngày 20/10, muốn gửi ${name} một khoảng lặng thật dịu. Chúc những ngày phía trước vẫn có chỗ để cười thoải mái, làm điều mình thích, và được yêu theo cách khiến mình thấy bình yên.`}
              </p>
              <cite className={styles.sign}>{card?.senderName?.trim() || 'Người luôn thương em.'}</cite>
              <button type="button" className={styles.continue} onClick={() => setStage('gallery')}>
                Tiếp tục
              </button>
            </article>
          )}
          <div className={`${styles.envelope} ${envelopeOpen ? styles.envelopeOpen : ''}`}>
            <div className={styles.sideL} />
            <div className={styles.sideR} />
            <div className={styles.pocket} />
            <div className={`${styles.flap} ${envelopeOpen ? styles.flapOpen : ''}`} />
            {!envelopeOpen && (
              <button
                type="button"
                className={styles.heart}
                onClick={openEnvelope}
                aria-label="Mở phong bì"
              >
                <span>Open</span>
              </button>
            )}
          </div>
        </div>
      )}

      {stage === 'gallery' && (
        <div className={`${styles.stage} ${styles.gallery}`}>
          <NightSky />
          <h2 className={styles.bunting}>Memory Gallery</h2>
          {!galleryReady ? (
            <p className={styles.loadingNote}>Đang tải kỷ niệm...</p>
          ) : (
            <div className={styles.grid}>
              {items.map((item, i) => (
                <button key={i} type="button" className={styles.card} style={{ '--tilt': `${(i % 2 ? 1.4 : -1.6)}deg` }} onClick={() => showPhoto(i)}>
                  {item.type === 'photo' ? (
                    <img src={item.src} alt={item.caption} />
                  ) : (
                    <span className={styles.wishCard}>{item.text}</span>
                  )}
                  <span className={styles.cap}>{item.caption}</span>
                </button>
              ))}
            </div>
          )}
          {galleryReady && (
            <button type="button" className={styles.next} aria-label="Tiếp tục màn tiếp theo" onClick={() => setStage('rain')}>
              →
            </button>
          )}
          {lightbox != null && (
            <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Xem ảnh phóng to">
              <button type="button" className={`${styles.lbBtn} ${styles.close}`} aria-label="Đóng" onClick={() => setLightbox(null)}>×</button>
              <button type="button" className={styles.lbBtn} aria-label="Ảnh trước" onClick={() => stepPhoto(-1)}>‹</button>
              <figure>
                {items[lightbox].type === 'photo' ? (
                  <img src={items[lightbox].src} alt={items[lightbox].caption} />
                ) : (
                  <span className={styles.wishCard}>{items[lightbox].text}</span>
                )}
                <figcaption className={styles.counter}>{lightbox + 1} / {items.length}</figcaption>
              </figure>
              <button type="button" className={styles.lbBtn} aria-label="Ảnh tiếp theo" onClick={() => stepPhoto(1)}>›</button>
            </div>
          )}
        </div>
      )}

      {stage === 'rain' && (
        <div className={`${styles.stage} ${styles.rain}`}>
          {rainReady && drops.map((drop, i) => (
            <div
              key={i}
              className={styles.drop}
              style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration, '--drift': drop.drift, '--rot': drop.rot }}
            >
              {drop.kind === 'photo' ? (
                <div className={styles.photoDrop}><img src={drop.src} alt="" /></div>
              ) : (
                <div className={styles.textDrop}>{drop.text}</div>
              )}
            </div>
          ))}
          {!rainReady && (
            <div className={styles.loader} aria-label="Đang tải dữ liệu">
              <div className={styles.loaderCard}>
                <strong>Đang chuẩn bị Love Rain</strong>
                <p>Đang tải ảnh và dữ liệu...</p>
                <div className={styles.bar}><span style={{ width: `${loadPct}%` }} /></div>
                <div className={styles.pct}>{loadPct}%</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
