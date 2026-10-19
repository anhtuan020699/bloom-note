'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Fingerprint,
  Heart,
  Lock,
  RotateCcw,
  Share2,
  Sparkles,
} from 'lucide-react';
import Flower, { HEAD_Y_RATIO } from './Flower.jsx';
import ParticleCanvas from './ParticleCanvas.jsx';
import PhotoFrame from './PhotoFrame.jsx';
import LetterCard from './LetterCard.jsx';
import VinylButton from './VinylButton.jsx';
import { Tilt3DWrapper } from './Tilt3D.jsx';
import { ReferenceExperience, ReferenceMini } from './ReferenceFlows.jsx';
import LoveVerseScene from './LoveVerseScene.jsx';
import {
  HeartGalaxy3DStage,
  MemoryCarousel3DStage,
  CrystalMusicBox3DStage,
  SurpriseGiftBox3DStage,
} from './Scene3D.jsx';
import { player, usePlayer } from '../lib/player.js';
import { themeVars } from '../lib/theme.js';

const LOCK_KEY = 'tiemhoa:locked';
const CIRCUMFERENCE = 188.5; // 2 * PI * 30
const SHOW_SEQUENCE = [
  { id: 'letter', label: 'Thư tay & ảnh', ms: 11000 },
  { id: 'carousel', label: 'Vòng quay kỷ niệm', ms: 12000 },
  { id: 'galaxy', label: 'Vũ trụ trái tim', ms: 12000 },
];

function useFlowerSize() {
  const [size, setSize] = useState(280);
  useEffect(() => {
    const calc = () =>
      Math.round(
        Math.min(
          window.innerWidth * 0.8,
          window.innerHeight * 0.56 * (350 / 430),
          380
        )
      );
    setSize(calc());
    const onResize = () => setSize(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

function HoldToUnlock({ onUnlock }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef();
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onUnlock();
    }, 1400);
  };
  const cancel = () => {
    setHolding(false);
    clearTimeout(timer.current);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed bottom-4 left-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white opacity-35 transition hover:opacity-85"
      title="Giữ 1.5 giây để mở khóa"
      aria-label="Giữ để mở khóa màn hình"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="126"
          strokeDashoffset={holding ? 0 : 126}
          style={{
            transition: holding ? 'stroke-dashoffset 1.4s linear' : 'none',
          }}
        />
      </svg>
      <Lock size={16} />
    </button>
  );
}

/* ============================================================
   LOVEVERSE GLASS CLOCHE DOME + ENCHANTED FLOWER
   ============================================================ */
function GlassClocheChamber({ template, progress, bloom, size, onClick }) {
  const brightness = 0.72 + progress * 0.45;
  const saturate = 0.85 + progress * 0.4;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      aria-label="Đoá hoa trong lồng kính ma thuật"
      className="group relative flex cursor-pointer flex-col items-center select-none"
      style={{
        filter: `brightness(${brightness.toFixed(2)}) saturate(${saturate.toFixed(2)})`,
        transition: 'filter 0.2s ease-out',
      }}
    >
      {/* Magical Rose Halo Behind Glass */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[360px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-300"
        style={{
          opacity: 0.22 + progress * 0.78,
          transform: `translate(-50%, -50%) scale(${(0.82 + progress * 0.38).toFixed(2)})`,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,105,180,0.55) 0%, rgba(244,63,94,0.32) 40%, rgba(162,28,175,0.16) 68%, transparent 85%)',
        }}
      />

      {/* Glass Bell Jar (Cloche) */}
      <div
        className="relative flex items-end justify-center pt-8 pb-3"
        style={{
          width: Math.max(230, size * 0.88),
          height: Math.max(310, size * 1.12),
        }}
      >
        {/* Top glass knob handle */}
        <div
          className="pointer-events-none absolute -top-3.5 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border border-white/65 bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.45)] backdrop-blur-xs"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1.5 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full border-t border-white/60"
          aria-hidden="true"
        />

        {/* Glass Dome Arch */}
        <div
          className="pointer-events-none absolute inset-x-2 top-2 bottom-3 rounded-t-[150px] border-t border-r border-l border-white/55 bg-gradient-to-b from-white/14 via-pink-200/5 to-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.18),0_0_25px_rgba(244,114,182,0.2)]"
          aria-hidden="true"
        >
          {/* Left & Right Curved Specular Highlights */}
          <div className="absolute top-6 bottom-8 left-3 w-3 rounded-full bg-white/30 blur-[2px]" />
          <div className="absolute top-10 bottom-10 right-4 w-5 rounded-full bg-white/20 blur-[4px]" />

          {/* Floating Magic Dust inside the jar */}
          {[
            { left: '22%', top: '28%', delay: '0s', size: 4 },
            { left: '74%', top: '24%', delay: '0.6s', size: 3 },
            { left: '30%', top: '52%', delay: '1.1s', size: 3.5 },
            { left: '68%', top: '46%', delay: '0.3s', size: 4.5 },
            { left: '48%', top: '20%', delay: '0.9s', size: 3 },
            { left: '25%', top: '72%', delay: '1.4s', size: 3.5 },
            { left: '72%', top: '68%', delay: '0.5s', size: 4 },
          ].map((d, i) => (
            <span
              key={i}
              className="glow-pulse absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.9)]"
              style={{
                left: d.left,
                top: d.top,
                width: d.size,
                height: d.size,
                animationDelay: d.delay,
              }}
            />
          ))}

          {/* Animated Falling Petal inside Cloche */}
          <span
            className="falling-petal-anim absolute top-[38%] left-[54%] h-3.5 w-4 rounded-tl-full rounded-br-full bg-gradient-to-br from-rose-300 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            aria-hidden="true"
          />
        </div>

        {/* The Interactive Multi-layer Flower */}
        <div className="relative z-10 translate-y-2">
          <Flower template={template} bloom={bloom} size={size * 0.84} />
        </div>

        {/* Bottom Glass Rim */}
        <div
          className="pointer-events-none absolute inset-x-1 bottom-2 h-5 rounded-full border border-white/60 bg-[radial-gradient(ellipse_at_center,rgba(235,75,120,0.2)_0%,rgba(255,255,255,0.35)_100%)] shadow-[0_0_14px_rgba(235,75,120,0.3)]"
          aria-hidden="true"
        />
      </div>

      {/* Wooden Pedestal Base (#table in LoveVerse) */}
      <div
        className="relative -mt-1.5 h-8 rounded-full border border-amber-900/60 bg-[radial-gradient(ellipse_at_50%_42%,#7a3c1c_0%,#58260f_48%,#3c190a_78%,#240e05_100%)] shadow-[0_3px_0_#421c0b,0_7px_0_#250e04,0_12px_0_#140602,0_20px_30px_rgba(0,0,0,0.65),inset_0_1.5px_2px_rgba(255,215,175,0.45)]"
        style={{ width: Math.max(246, size * 0.94) }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ============================================================
   HOLD-TO-LIGHT FINGERPRINT SENSOR BUTTON (LoveVerse Style)
   ============================================================ */
function HoldFingerprintButton({ onProgress, onComplete }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const doneRef = useRef(false);

  const updateProgress = useCallback(
    (p) => {
      const clamped = Math.max(0, Math.min(1, p));
      setProgress(clamped);
      onProgress?.(clamped);
    },
    [onProgress]
  );

  const startHold = (e) => {
    if (doneRef.current) return;
    if (e.cancelable) e.preventDefault();
    setHolding(true);
    startRef.current = performance.now() - progress * 900;
    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / 900); // 0.9s smooth hold (or quick tap boost)
      updateProgress(p);
      if (p >= 1) {
        doneRef.current = true;
        setHolding(false);
        onComplete?.();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (doneRef.current || !holding) return;
    setHolding(false);
    cancelAnimationFrame(rafRef.current);

    // If user tapped quickly (< 350ms), complete automatically so single-click also works!
    if (progress < 0.38) {
      doneRef.current = true;
      updateProgress(1);
      onComplete?.();
      return;
    }

    const from = progress;
    const t0 = performance.now();
    const rollback = (now) => {
      const t = Math.min(1, (now - t0) / 240);
      const next = from * (1 - t);
      updateProgress(next);
      if (t < 1) rafRef.current = requestAnimationFrame(rollback);
    };
    rafRef.current = requestAnimationFrame(rollback);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onClick={() => {
        if (!doneRef.current) {
          doneRef.current = true;
          updateProgress(1);
          onComplete?.();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          doneRef.current = true;
          updateProgress(1);
          onComplete?.();
        }
      }}
      aria-label="Nhấn giữ để thắp sáng đoá hoa"
      className={`mt-3 flex cursor-pointer flex-col items-center gap-2.5 select-none transition-transform duration-300 ${
        holding ? 'scale-108' : 'hover:scale-104'
      }`}
    >
      <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full">
        {/* Upward Light Beam when holding */}
        <div
          className="pointer-events-none absolute bottom-10 left-1/2 h-44 w-20 -translate-x-1/2 transition-opacity duration-300"
          style={{
            opacity: holding ? 0.95 : 0,
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(255,105,180,0.55) 0%, rgba(244,63,94,0.22) 48%, transparent 78%)',
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_14px_rgba(255,105,180,0.8)]"
          viewBox="0 0 76 76"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lvHoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd1dc" />
              <stop offset="40%" stopColor="#ff758c" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Breathing outer pulse */}
          <circle
            cx="38"
            cy="38"
            r="34"
            fill="rgba(255, 105, 180, 0.25)"
            style={{
              animation: 'ringPulseAnim 2.2s ease-in-out infinite',
              transformOrigin: '38px 38px',
            }}
          />

          {/* Frosted glass track */}
          <circle
            cx="38"
            cy="38"
            r="30"
            fill="rgba(35, 12, 24, 0.85)"
            stroke="rgba(255, 160, 195, 0.4)"
            strokeWidth="3.5"
          />

          {/* Progress stroke */}
          <circle
            cx="38"
            cy="38"
            r="30"
            fill="none"
            stroke="url(#lvHoldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset.toFixed(2)}
            style={{
              transformOrigin: '38px 38px',
              transform: 'rotate(-90deg)',
            }}
          />
        </svg>

        {/* Glowing Rose Fingerprint Core */}
        <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-pink-200/35 bg-[radial-gradient(circle_at_center,rgba(255,105,180,0.35)_0%,rgba(30,8,20,0.85)_85%)] text-pink-200 shadow-[inset_0_0_12px_rgba(255,105,180,0.55)]">
          <Fingerprint
            size={28}
            className="text-pink-200 drop-shadow-[0_0_10px_rgba(255,105,180,0.95)]"
          />
        </div>
      </div>

      <span className="rounded-full bg-black/35 px-4 py-1 text-xs font-semibold tracking-wider text-pink-100 shadow-sm backdrop-blur-md">
        {holding
          ? 'Đang thắp sáng đoá hoa... ✨'
          : 'Nhấn giữ hoặc chạm để thắp sáng đoá hoa'}
      </span>
    </div>
  );
}

/* ============================================================
   MAIN GIFT SCENE (Receiver / Show / Preview)
   ============================================================ */
export default function GiftScene({
  card,
  template,
  owner = false,
  backHref,
  onBack,
  onShare,
  extraActions,
}) {
  const [phase, setPhase] = useState('unopened');
  const [holdProgress, setHoldProgress] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(true);
  const [view3dMode, setView3dMode] = useState(SHOW_SEQUENCE[0].id);
  const [locked, setLocked] = useState(false);
  const particlesRef = useRef(null);
  const flowerRef = useRef(null);
  const timers = useRef([]);
  const size = useFlowerSize();
  const { error } = usePlayer();
  const colors = template.themeColors;
  const showChrome = owner && !locked;

  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    if (owner && sessionStorage.getItem(LOCK_KEY) === '1') setLocked(true);
  }, [owner]);

  useEffect(() => {
    document.title = `Món quà 20/10 cho ${card.recipientName || 'bạn'} · BloomNote 🌸`;
    return () => {
      timers.current.forEach(clearTimeout);
      player.stop();
      document.title =
        'BloomNote 20/10: Tiệm Hoa & Thiệp Kỹ Thuật Số Cá Nhân Hóa';
    };
  }, [card.recipientName]);

  const bloom = useCallback(() => {
    setPhase('blooming');
    setHoldProgress(1);
    const fire = (count) => {
      const el = flowerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      particlesRef.current?.burst(
        r.left + r.width / 2,
        r.top + r.height * HEAD_Y_RATIO,
        count
      );
    };
    later(450, () => fire(70));
    later(1200, () => fire(45));
    later(1900, () => fire(30));
    later(2500, () => setPhase('opened'));
  }, []);

  const open = useCallback(() => {
    if (phase !== 'unopened') return;
    player.play(card.musicConfig);
    bloom();
  }, [phase, card.musicConfig, bloom]);

  const replay = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHoldProgress(0);
    setPhase('unopened');
    window.scrollTo({ top: 0 });
    if (!player.getState().playing) player.play(card.musicConfig);
    later(850, bloom);
  };

  const toggleLock = () => {
    const next = !locked;
    setLocked(next);
    sessionStorage.setItem(LOCK_KEY, next ? '1' : '0');
    if (next) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.();
  };

  const opened = phase === 'opened';
  const stepIndex = Math.max(0, SHOW_SEQUENCE.findIndex((step) => step.id === view3dMode));

  useEffect(() => {
    if (!opened) {
      setView3dMode(SHOW_SEQUENCE[0].id);
      return;
    }
    let index = 0;
    let timer;
    const advance = () => {
      timer = setTimeout(() => {
        index = (index + 1) % SHOW_SEQUENCE.length;
        setView3dMode(SHOW_SEQUENCE[index].id);
        advance();
      }, SHOW_SEQUENCE[index].ms);
    };
    setView3dMode(SHOW_SEQUENCE[0].id);
    advance();
    return () => clearTimeout(timer);
  }, [opened]);
  const referenceKind = ['lucky', 'matrix', 'vip'].includes(template.scene3d)
    ? template.scene3d
    : null;
  const loveverse = template.scene3d === 'loveverse';

  // When unopened, blend into a deep enchanted velvet twilight backdrop like LoveVerse
  const unopenedBackdrop =
    phase === 'unopened'
      ? {
          background:
            'radial-gradient(circle at 50% 42%, #3a0d28 0%, #1d0614 55%, #0b0208 100%)',
          color: '#fff5f8',
        }
      : {};

  return (
    <div
      className="themed relative min-h-dvh overflow-x-hidden transition-colors duration-700"
      style={{ ...themeVars(template), ...unopenedBackdrop }}
    >
      {!loveverse && !referenceKind && (phase !== 'unopened' || holdProgress > 0) && (
        <ParticleCanvas
          ref={particlesRef}
          type={template.particleType}
          colors={colors}
          className="z-[20]"
        />
      )}

      {/* Top owner toolbar */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-40 flex flex-wrap items-center gap-2 p-3 sm:p-4"
          >
            {(backHref || onBack) && (
              backHref ? (
                <a
                  href={backHref}
                  className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-white/90 px-4 py-2 text-xs font-bold text-[#2a1f27] shadow-md backdrop-blur-md transition hover:bg-white sm:text-sm"
                >
                  <ArrowLeft size={15} />
                  <span>Quay lại</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-white/90 px-4 py-2 text-xs font-bold text-[#2a1f27] shadow-md backdrop-blur-md transition hover:bg-white sm:text-sm"
                >
                  <ArrowLeft size={15} />
                  <span>Quay lại</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={toggleLock}
              className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-white/90 px-4 py-2 text-xs font-bold text-[#2a1f27] shadow-md backdrop-blur-md transition hover:bg-white sm:text-sm"
            >
              <Lock size={14} />
              <span className="hidden sm:inline">Khóa màn hình tặng quà</span>
              <span className="sm:hidden">Khóa</span>
            </button>
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="hg-btn-primary rounded-full px-4 py-2 text-xs sm:text-sm"
              >
                <Share2 size={14} />
                <span>Chia sẻ &amp; QR</span>
              </button>
            )}
            {extraActions}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Round Music Button (LoveVerse style) */}
      {(loveverse || phase !== 'unopened') && card.musicConfig?.source !== 'none' && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          className="fixed top-3 right-3 z-40 sm:top-4 sm:right-5"
        >
          <VinylButton music={card.musicConfig} />
        </motion.div>
      )}

      {error && phase !== 'unopened' && (
        <div className="fixed right-4 bottom-4 z-40 max-w-xs rounded-xl bg-black/75 px-3 py-2 text-xs text-white">
          {error}
        </div>
      )}

      {locked && <HoldToUnlock onUnlock={toggleLock} />}

      {loveverse ? (
        <LoveVerseScene card={card} />
      ) : referenceKind ? (
        <ReferenceExperience kind={referenceKind} card={card} />
      ) : (
      <>
      {/* ============================================================
          STAGE 1 & 2: ENCHANTED CLOCHE + BLOOMING FLOWER
          ============================================================ */}
      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center px-4">
        <AnimatePresence>
          {phase === 'unopened' && (
            <motion.div
              key="intro"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }}
              transition={{ duration: 0.7 }}
              className="mb-3 text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-300/30 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.22em] text-pink-200 uppercase backdrop-blur-md">
                <Sparkles size={12} /> BloomNote · Quà tặng 20/10
              </span>
              <h1 className="mt-2.5 font-display text-2xl font-bold text-white drop-shadow-[0_2px_16px_rgba(244,114,182,0.65)] sm:text-4xl">
                Dành tặng {card.recipientName || 'cô bạn xinh đẹp'}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={
            opened
              ? { scale: 0.58, y: '32vh', opacity: 0.32 }
              : { scale: 1, y: 0, opacity: 1 }
          }
          transition={{ type: 'spring', stiffness: 52, damping: 16 }}
          className="pointer-events-auto"
        >
          <div ref={flowerRef} className={phase === 'unopened' ? 'sway' : ''}>
            <Suspense fallback={<Flower template={template} bloom size={size} />}>
              {template.scene3d === 'galaxy' ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-90">
                    <ReferenceMini kind="galaxy" />
                  </div>
                  <HeartGalaxy3DStage
                    template={template}
                    card={card}
                    progress={holdProgress}
                    bloom
                    size={size}
                    onClick={open}
                  />
                </div>
              ) : template.scene3d === 'carousel' ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-90">
                    <ReferenceMini kind="carousel" />
                  </div>
                  <MemoryCarousel3DStage
                    template={template}
                    card={card}
                    progress={holdProgress}
                    bloom
                    size={size}
                    onClick={open}
                  />
                </div>
              ) : template.scene3d === 'crystal' ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-90">
                    <ReferenceMini kind="crystal" />
                  </div>
                  <CrystalMusicBox3DStage
                    template={template}
                    progress={holdProgress}
                    bloom
                    size={size}
                    onClick={open}
                  />
                </div>
              ) : template.scene3d === 'giftbox' ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-90">
                    <ReferenceMini kind="giftbox" />
                  </div>
                  <SurpriseGiftBox3DStage
                    template={template}
                    progress={holdProgress}
                    bloom
                    size={size}
                    onClick={open}
                  />
                </div>
              ) : phase === 'unopened' ? (
                <GlassClocheChamber
                  template={template}
                  progress={holdProgress}
                  bloom
                  size={size}
                  onClick={open}
                />
              ) : (
                <Flower template={template} bloom size={size} />
              )}
            </Suspense>
          </div>
        </motion.div>

        {/* Hold-to-light Fingerprint Sensor Button */}
        <AnimatePresence>
          {phase === 'unopened' && (
            <motion.div
              key="hold-sensor"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-auto"
            >
              <HoldFingerprintButton
                onProgress={setHoldProgress}
                onComplete={open}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Magical Light Burst Flash during transition */}
      <AnimatePresence>
        {phase === 'blooming' && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.6, times: [0, 0.32, 1], delay: 0.25 }}
            className="pointer-events-none fixed inset-0 z-20"
            style={{
              background: `radial-gradient(circle at 50% ${HEAD_Y_RATIO * 100}%, #ffffff 0%, ${colors.accent}88 32%, transparent 68%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ============================================================
          STAGE 3: OPENED LETTER & INTERACTIVE 3D EXPERIENCE
          ============================================================ */}
      {opened && (
        <main className="relative z-30 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-6 px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-xl"
            aria-live="polite"
          >
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {SHOW_SEQUENCE.map((step, i) => (
                <span
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/35'}`}
                />
              ))}
            </span>
            <span>{stepIndex + 1}/{SHOW_SEQUENCE.length} · {SHOW_SEQUENCE[stepIndex].label}</span>
          </motion.div>

          {view3dMode === 'carousel' ? (
            <motion.div
              key="mode-carousel"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <Suspense fallback={null}>
                <MemoryCarousel3DStage
                  template={template}
                  card={card}
                  progress={1}
                  bloom
                  size={Math.min(360, size * 1.05)}
                />
              </Suspense>
            </motion.div>
          ) : view3dMode === 'galaxy' ? (
            <motion.div
              key="mode-galaxy"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 rounded-3xl border border-pink-300/25 bg-[#12031f]/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
            >
              <Suspense fallback={null}>
                <HeartGalaxy3DStage
                  template={template}
                  card={card}
                  progress={1}
                  bloom
                  size={Math.min(350, size)}
                />
              </Suspense>
            </motion.div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-8 md:flex-row md:items-center md:gap-12">
              {card.photoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.15, y: 240, rotate: -18 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 12,
                    mass: 0.9,
                  }}
                  className="shrink-0"
                >
                  <Tilt3DWrapper maxTilt={15} scale={1.04} className="rounded-3xl">
                    <PhotoFrame
                      style={card.photoFrameStyle}
                      src={card.photoUrl}
                      caption={card.photoCaption}
                      width={Math.min(285, size)}
                    />
                  </Tilt3DWrapper>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, scale: 0.15, y: 260 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 70,
                  damping: 13,
                  delay: 0.2,
                }}
                className="w-full max-w-xl"
              >
                {!envelopeOpen ? (
                  /* Interactive 3D Envelope option */
                  <div className="flex flex-col items-center py-6">
                    <Tilt3DWrapper maxTilt={14} scale={1.03} className="rounded-2xl">
                      <div
                        onClick={() => setEnvelopeOpen(true)}
                        className="lv-envelope flex cursor-pointer flex-col items-center justify-center p-6 text-center"
                      >
                        <p className="font-display text-sm font-semibold text-[#b84d6e]">
                          Gửi tới: {card.recipientName || 'Bạn'}
                        </p>
                        <button
                          type="button"
                          className="lv-heart-seal mt-4 flex items-center justify-center text-white"
                          aria-label="Mở phong bì"
                        >
                          <span className="-translate-y-1.5 font-script text-lg font-bold">
                            Open
                          </span>
                        </button>
                        <p className="mt-3 text-xs font-medium text-[#9a7a85]">
                          Chạm vào phong bì để đọc bức thư 💌
                        </p>
                      </div>
                    </Tilt3DWrapper>
                  </div>
                ) : (
                  <Tilt3DWrapper maxTilt={8} scale={1.01} className="rounded-3xl">
                    <LetterCard
                      card={card}
                      typing
                      footer={
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              replay();
                            }}
                            className="hg-btn-primary rounded-full px-5 py-2.5 text-sm"
                          >
                            <RotateCcw size={15} />
                            <span>Xem lại hiệu ứng 3D</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnvelopeOpen(false);
                            }}
                            className="hg-btn-preview rounded-full px-4 py-2.5 text-xs"
                          >
                            <Heart size={14} className="fill-current" />
                            <span>Gập vào phong bì</span>
                          </button>
                        </div>
                      }
                    />
                  </Tilt3DWrapper>
                )}
              </motion.div>
            </div>
          )}
        </main>
      )}
      </>
      )}
    </div>
  );
}
