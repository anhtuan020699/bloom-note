'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  Box,
  Cake,
  CalendarHeart,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Flame,
  Gift,
  Headset,
  Heart,
  HeartHandshake,
  Info,
  LayoutGrid,
  Lock,
  Mail,
  MessageCircle,
  Music2,
  Palette,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
  X,
} from 'lucide-react';
import { CATEGORIES, TEMPLATES, MUSIC_LIBRARY } from '@shared/templates.js';
import NavBar, { BrandLogo } from '../components/NavBar.jsx';
import Flower from '../components/Flower.jsx';
import { ReferenceMini } from '../components/ReferenceFlows.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../lib/api.js';
import { themeVars } from '../lib/theme.js';

const PARTICLE_LABEL = {
  rose_petals: 'Cánh hồng rơi',
  sakura: 'Sakura bay trong gió',
  stardust: 'Bụi sao lấp lánh',
  sunshine: 'Nắng & đom đóm',
  starlight: 'Vũ trụ sao băng 3D',
  hearts_confetti: 'Tim bay & pháo giấy',
  lanterns: 'Đèn trời 3D lung linh',
  butterflies: 'Bướm ánh sáng 3D',
};

const CAT_ICONS = {
  all: { Icon: LayoutGrid, color: 'text-[#e11d48]' },
  romantic: { Icon: Heart, color: 'text-[#ec4899]' },
  genz: { Icon: Sparkles, color: 'text-[#8b5cf6]' },
  luxury: { Icon: CalendarHeart, color: 'text-[#d97706]' },
  playful: { Icon: Gift, color: 'text-[#10b981]' },
  birthday: { Icon: Cake, color: 'text-[#f59e0b]' },
  'layout-grid': { Icon: LayoutGrid, color: 'text-[#e11d48]' },
  heart: { Icon: Heart, color: 'text-[#ec4899]' },
  sparkles: { Icon: Sparkles, color: 'text-[#8b5cf6]' },
  'calendar-heart': { Icon: CalendarHeart, color: 'text-[#d97706]' },
  gift: { Icon: Gift, color: 'text-[#10b981]' },
  cake: { Icon: Cake, color: 'text-[#f59e0b]' },
};

/* ============================================================
   HERO SCRAPBOOK SHOWCASE (Like HeartGift's Hero Image)
   ============================================================ */
function HeroScrapbookShowcase({ template }) {
  const [bloom, setBloom] = useState(true);

  return (
    <div
      className="relative mx-auto flex h-[420px] w-full max-w-[600px] items-center justify-center select-none sm:h-[490px]"
      onClick={() => {
        setBloom(false);
        setTimeout(() => setBloom(true), 450);
      }}
    >
      {/* Glowing radial aura */}
      <div
        className="pointer-events-none absolute inset-4 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(244,114,182,0.38) 0%, rgba(192,132,252,0.25) 45%, transparent 72%)',
        }}
      />

      {/* Two tilted dashed elliptical orbits */}
      <div className="hero-orbit-1 pointer-events-none absolute h-[82%] w-[94%]" />
      <div className="hero-orbit-2 pointer-events-none absolute h-[76%] w-[88%]" />

      {/* Connecting dashed swirl SVG lines */}
      <svg
        viewBox="0 0 600 480"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
        fill="none"
      >
        <path
          d="M95 140 C 180 65, 310 85, 480 120"
          stroke="#e11d48"
          strokeWidth="1.6"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <path
          d="M110 340 C 230 410, 390 395, 505 315"
          stroke="#a21caf"
          strokeWidth="1.6"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      </svg>

      {/* Top-left Tilted Polaroid 1 */}
      <div className="float-y absolute left-1 top-6 z-20 w-36 -rotate-[9deg] rounded-2xl bg-white p-2.5 pb-6 shadow-[0_18px_38px_-10px_rgba(190,18,60,0.28)] ring-1 ring-rose-100 sm:left-4 sm:w-44">
        {/* Pink Washi Tape */}
        <span className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-xs bg-rose-300/70 backdrop-blur-xs" />
        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
          <img
            src="/stickers/girl.svg"
            alt="Kỷ niệm 20/10"
            className="h-full w-full object-contain p-2"
          />
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#e11d48] shadow-xs">
            20/10 🌸
          </span>
        </div>
        <p className="mt-2 text-center font-script text-sm font-bold text-[#5c2d42]">
          Nụ cười thanh xuân 💕
        </p>
      </div>

      {/* Top-right Quote Bubble */}
      <div className="absolute right-2 top-8 z-20 max-w-[195px] rotate-5 rounded-2xl border border-rose-200/80 bg-[#fff9fb]/95 px-4 py-3 shadow-[0_14px_30px_-8px_rgba(190,18,60,0.22)] backdrop-blur-md sm:right-5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#e11d48]">
          <Heart size={12} className="fill-current" /> For You, Always
        </div>
        <p className="mt-1 font-script text-[17px] leading-snug font-bold text-[#2a1f27]">
          “You are my favorite feeling in class!”
        </p>
      </div>

      {/* Center: Interactive Blooming Flower Card */}
      <div className="relative z-10 flex flex-col items-center rounded-[32px] border border-white/80 bg-white/75 px-7 pt-5 pb-4 shadow-[0_28px_65px_-15px_rgba(190,18,60,0.28)] backdrop-blur-xl">
        <div className="sway cursor-pointer" title="Chạm để hoa nở lại">
          <Flower template={template} bloom={bloom} size={235} />
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-semibold text-[#be123c] ring-1 ring-rose-200/70">
          <Sparkles size={12} /> Chạm để xem hoa bung nở
        </div>
      </div>

      {/* Bottom-left Stamp Quote Note */}
      <div className="absolute bottom-6 left-2 z-20 -rotate-5 rounded-2xl border border-dashed border-rose-300 bg-[#fffdf9] px-4 py-3 shadow-[0_14px_32px_-8px_rgba(42,31,39,0.16)] sm:left-6">
        <p className="font-display text-xs italic text-[#6f5965]">
          “Every moment with you matters”
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[#be123c]">
          <span>🎵 Bản nhạc riêng</span>
          <span>·</span>
          <span>💌 Thư tay</span>
        </div>
      </div>

      {/* Bottom-right Tilted Polaroid 2 */}
      <div className="absolute bottom-4 right-2 z-20 w-36 rotate-[8deg] rounded-2xl bg-white p-2.5 pb-5 shadow-[0_18px_38px_-10px_rgba(162,28,175,0.26)] ring-1 ring-purple-100 sm:right-6 sm:w-42">
        <span className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-2 rounded-xs bg-purple-300/70" />
        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50">
          <img
            src="/stickers/bunny.svg"
            alt="Lớp mình"
            className="h-full w-full object-contain p-2"
          />
        </div>
        <p className="mt-1.5 text-center font-script text-sm font-bold text-[#5c2d42]">
          With love, always ✨
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TEMPLATE CARD (.movie-card in HeartGift)
   ============================================================ */
function TemplateCard({ t, index, lang }) {
  const ref = useRef(null);
  const [bloom, setBloom] = useState(true);
  const timer = useRef();

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          timer.current = setTimeout(() => setBloom(true), 200 + index * 110);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      clearTimeout(timer.current);
    };
  }, [index]);

  const rebloom = () => {
    clearTimeout(timer.current);
    setBloom(false);
    timer.current = setTimeout(() => setBloom(true), 520);
  };

  const music = MUSIC_LIBRARY.find((m) => m.id === t.defaultMusicId);
  const isSuperHot = t.ribbon === 'super-hot';
  const ribbonClass =
    t.ribbon === 'super-hot'
      ? 'corner-ribbon--super-hot'
      : t.ribbon === 'new'
        ? 'corner-ribbon--new'
        : 'corner-ribbon--hot';

  return (
    <div className="h-full rounded-[24px] transition duration-300 hover:-translate-y-1">
      <article
        ref={ref}
        className={`hg-card group h-full ${isSuperHot ? 'hg-card--super-hot' : ''}`}
        style={themeVars(t)}
      >
        {/* Diagonal Corner Ribbon */}
        {t.ribbonText && (
          <div className={`corner-ribbon ${ribbonClass}`} aria-hidden="true">
            <span>{t.ribbonText}</span>
          </div>
        )}

        {/* 16:10 Thumbnail Area (.movie-img) with Live 3D Stage */}
        <div
          className="themed relative aspect-16/10 w-full overflow-hidden border-b border-rose-500/10"
          onMouseEnter={rebloom}
        >
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-106">
            <TemplateThumb template={t} bloom={bloom} />
          </div>

          {/* Top-left badge */}
          <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#2a1f27] shadow-xs backdrop-blur-md">
            {t.badge3d ? (
              <>
                <Box size={11} className="text-[#a21caf]" />
                <span className="bg-[linear-gradient(135deg,#be123c,#a21caf)] bg-clip-text font-extrabold text-transparent">
                  {t.badge3d}
                </span>
              </>
            ) : (
              <>
                <Sparkles size={11} className="text-[#e11d48]" />
                {PARTICLE_LABEL[t.particleType]}
              </>
            )}
          </span>

          {/* Bottom-left music pill */}
          <span className="absolute bottom-3 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Music2 size={11} />
            {music?.name.split('(')[0].trim()}
          </span>
        </div>

        {/* Card Body (.movie-info) */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-[19px] leading-snug font-bold text-[#2a1f27] transition-colors group-hover:text-[#e11d48]">
            {t.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-[#6f5965]">
            {t.description}
          </p>

          {/* Meta row: Flame count + Price/Tag */}
          <div className="mt-4 flex items-center justify-between border-t border-rose-500/10 pt-3.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#6f5965]">
              <Flame size={15} className="fill-orange-500 text-orange-500" />
              <strong className="font-bold text-[#2a1f27]">{t.createdCount || '1.250'}</strong>{' '}
              {lang === 'en' ? 'created' : 'lượt tạo'}
            </span>
            <span className="inline-flex items-baseline gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 font-bold text-[#be123c] ring-1 ring-rose-200/60">
              {t.tagText || 'Miễn phí'}
            </span>
          </div>

          {/* 2-Column Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <a
              href={`/preview/${t.id}`}
              className="hg-btn-preview rounded-xl py-2.5 text-[13px]"
            >
              <Eye size={15} />
              <span>{lang === 'en' ? 'Preview' : 'Xem trước'}</span>
            </a>
            <a
              href={`/studio?template=${t.id}`}
              className="hg-btn-primary rounded-xl py-2.5 text-[13px]"
            >
              <Sparkles size={15} />
              <span>{lang === 'en' ? 'Create Now' : 'Tạo mẫu này'}</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

function TemplateThumb({ template, bloom }) {
  const kind = template.scene3d;
  if (['lucky', 'matrix', 'vip', 'galaxy', 'carousel', 'crystal', 'giftbox'].includes(kind)) {
    return <ReferenceMini kind={kind === 'vip' ? 'vip' : kind} />;
  }
  return (
    <div className="sway translate-y-[18%]">
      <Flower template={template} bloom={bloom} instant size={185} glow={false} />
    </div>
  );
}

/* ============================================================
   4-STEP ILLUSTRATED SECTION (Exact SVGs from HeartGift)
   ============================================================ */
function FourStepsSection({ lang }) {
  const steps = [
    {
      num: 1,
      title: lang === 'en' ? 'Choose a Template' : 'Chọn mẫu web',
      desc:
        lang === 'en'
          ? 'Explore our romantic 20/10 collection, pick your favorite style and click preview to experience it live.'
          : 'Khám phá bộ sưu tập mẫu web lãng mạn, chọn phong cách ưng ý và bấm xem trước để trải nghiệm thực tế.',
      svg: (
        <svg viewBox="0 0 100 88" width="96" height="84" fill="none" aria-hidden="true">
          <rect x="8" y="10" width="80" height="62" rx="14" fill="#ffffff" stroke="#ffe4e6" strokeWidth="1.5" />
          <path d="M8 24C8 16.268 14.268 10 22 10H74C81.732 10 88 16.268 88 24H8Z" fill="url(#hg-step1-top)" />
          <circle cx="18" cy="17" r="2.5" fill="#fecdd3" />
          <circle cx="25" cy="17" r="2.5" fill="#fde68a" />
          <circle cx="32" cy="17" r="2.5" fill="#a7f3d0" />
          <rect x="16" y="31" width="30" height="32" rx="8" fill="#fff1f2" stroke="#fecdd3" />
          <path d="M31 53C31 53 23 47.5 23 42.5C23 39.8 25.1 38 27.5 38C29.1 38 30.4 38.9 31 40.1C31.6 38.9 32.9 38 34.5 38C36.9 38 39 39.8 39 42.5C39 47.5 31 53 31 53Z" fill="#e11d48" />
          <rect x="52" y="31" width="28" height="14" rx="6" fill="#faf5ff" stroke="#e9d5ff" />
          <rect x="52" y="49" width="28" height="14" rx="6" fill="#fff1f2" stroke="#fecdd3" />
          <path d="M70 50L83 69L77.5 70.5L82.5 79.5L79 81.5L74 72.5L69 76.5L70 50Z" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          <defs>
            <linearGradient id="hg-step1-top" x1="8" y1="10" x2="88" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#be123c" />
              <stop offset="0.5" stopColor="#e11d48" />
              <stop offset="1" stopColor="#a21caf" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      num: 2,
      title: lang === 'en' ? 'Customize Content' : 'Tùy chỉnh thông tin',
      desc:
        lang === 'en'
          ? 'Easily craft memories: upload personal photos, choose a background song, and write heartfelt wishes.'
          : 'Dễ dàng chắp bút kỷ niệm: thêm ảnh cá nhân, chọn bài hát yêu thích và viết những lời chúc ngọt ngào.',
      svg: (
        <svg viewBox="0 0 100 88" width="96" height="84" fill="none" aria-hidden="true">
          <rect x="8" y="10" width="80" height="64" rx="14" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1.5" />
          <path d="M8 24C8 16.268 14.268 10 22 10H74C81.732 10 88 16.268 88 24H8Z" fill="url(#hg-step2-top)" />
          <rect x="14" y="28" width="28" height="34" rx="8" fill="#fff1f2" stroke="#fecdd3" />
          <circle cx="28" cy="40" r="6" fill="#fda4af" />
          <path d="M19 55C19 49.5 23 48 28 48C33 48 37 49.5 37 55" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="46" y="28" width="36" height="15" rx="6" fill="#faf5ff" stroke="#e9d5ff" />
          <rect x="60" y="34" width="2" height="6" rx="1" fill="#c084fc" />
          <rect x="64" y="31" width="2" height="10" rx="1" fill="#8b5cf6" />
          <rect x="68" y="33" width="2" height="7" rx="1" fill="#c084fc" />
          <rect x="46" y="47" width="36" height="15" rx="6" fill="#fff5f5" stroke="#fed7d7" />
          <rect x="51" y="52" width="18" height="2" rx="1" fill="#f43f5e" />
          <rect x="51" y="56" width="12" height="2" rx="1" fill="#fda4af" />
          <defs>
            <linearGradient id="hg-step2-top" x1="8" y1="10" x2="88" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#be123c" />
              <stop offset="0.5" stopColor="#e11d48" />
              <stop offset="1" stopColor="#a21caf" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      num: 3,
      title: lang === 'en' ? 'Save & Generate QR' : 'Lưu & Tạo mã QR độc quyền',
      desc:
        lang === 'en'
          ? 'Instant card storage with automatic link & high-resolution QR code generation ready for printing or sharing.'
          : 'Hệ thống tự động khởi tạo đường link riêng và mã QR sắc nét cho từng bạn nữ trong danh sách lớp.',
      svg: (
        <svg viewBox="0 0 100 88" width="96" height="84" fill="none" aria-hidden="true">
          <rect x="14" y="10" width="72" height="68" rx="16" fill="#ffffff" stroke="#ffe4e6" strokeWidth="1.5" />
          <rect x="23" y="19" width="16" height="16" rx="4" stroke="#1e293b" strokeWidth="3" />
          <rect x="27" y="23" width="8" height="8" rx="2" fill="#1e293b" />
          <rect x="57" y="19" width="16" height="16" rx="4" stroke="#1e293b" strokeWidth="3" />
          <rect x="61" y="23" width="8" height="8" rx="2" fill="#1e293b" />
          <rect x="23" y="53" width="16" height="16" rx="4" stroke="#1e293b" strokeWidth="3" />
          <rect x="27" y="57" width="8" height="8" rx="2" fill="#1e293b" />
          <rect x="44" y="44" width="6" height="6" rx="1.5" fill="#334155" />
          <rect x="54" y="46" width="6" height="6" rx="1.5" fill="#64748b" />
          <rect x="60" y="54" width="12" height="5" rx="1.5" fill="#1e293b" />
          <line x1="18" y1="42" x2="82" y2="42" stroke="#e11d48" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="78" cy="16" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <path d="M74 16L77 19L82 13" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      num: 4,
      title: lang === 'en' ? 'Send & Surprise' : 'Nhận quà & Gửi trao',
      desc:
        lang === 'en'
          ? 'Share the link or QR code to deliver a touching, unforgettable 20/10 surprise to your special someone.'
          : 'Nhận ngay link web và mã QR độc quyền trong phần danh sách lớp để gửi trao bất ngờ xúc động tới người nhận.',
      svg: (
        <svg viewBox="0 0 100 88" width="96" height="84" fill="none" aria-hidden="true">
          <rect x="28" y="10" width="44" height="28" rx="6" fill="#ffffff" stroke="#fecdd3" strokeWidth="1.2" />
          <path d="M28 12L50 25L72 12" stroke="#fda4af" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="50" cy="22.5" r="5" fill="#e11d48" />
          <rect x="18" y="40" width="64" height="34" rx="10" fill="url(#hg-step4-box)" />
          <rect x="44" y="40" width="12" height="34" fill="#fbbf24" />
          <rect x="14" y="34" width="72" height="11" rx="5" fill="url(#hg-step4-box)" />
          <rect x="43" y="34" width="14" height="11" fill="#fbbf24" />
          <circle cx="80" cy="20" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="1.8" />
          <path d="M76 20L79 23L84 17" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="hg-step4-box" x1="18" y1="36" x2="82" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#be123c" />
              <stop offset="0.5" stopColor="#e11d48" />
              <stop offset="1" stopColor="#a21caf" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-y border-rose-500/10 bg-[linear-gradient(180deg,#fdf5f8_0%,#fbeef3_50%,#fdf8fa_100%)] py-16 sm:py-22"
    >
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6">
        <div className="text-center">
          <h2 className="hg-title-grad text-2xl font-bold sm:text-4xl">
            {lang === 'en' ? 'Just 4 Steps to Create a Gift' : 'Chỉ 4 bước để tạo 1 món quà'}
          </h2>
          {/* Heart Divider */}
          <div className="mt-3 inline-flex items-center gap-2.5 text-[#e11d48]">
            <span className="h-[1.5px] w-12 rounded-full bg-gradient-to-r from-transparent to-rose-400" />
            <Heart size={15} className="fill-current" />
            <span className="h-[1.5px] w-12 rounded-full bg-gradient-to-l from-transparent to-rose-400" />
          </div>
        </div>

        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting dashed line on desktop */}
          <div
            className="pointer-events-none absolute top-1/2 right-12 left-12 hidden -translate-y-10 border-t-2 border-dashed border-rose-300/70 lg:block"
            aria-hidden="true"
          />

          {steps.map((s) => (
            <div
              key={s.num}
              className="group relative flex flex-col items-center rounded-[24px] border border-rose-500/12 bg-white/95 px-6 pt-9 pb-7 text-center shadow-[0_14px_34px_-12px_rgba(90,40,65,0.1)] transition hover:-translate-y-1.5 hover:border-rose-500/25 hover:shadow-[0_22px_44px_-12px_rgba(190,18,60,0.18)]"
            >
              {/* Floating Number Badge */}
              <div className="
                absolute -top-4 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full
                bg-[linear-gradient(135deg,#be123c_0%,#e11d48_50%,#a21caf_100%)] text-sm font-extrabold text-white
                shadow-[0_6px_16px_rgba(190,18,60,0.38)] ring-4 ring-white
              ">
                {s.num}
              </div>

              {/* Icon Pod */}
              <div className="relative mb-4 flex h-24 w-28 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-50/80 to-purple-50/40 p-2 transition-transform duration-300 group-hover:scale-105">
                {s.svg}
              </div>

              <h3 className="font-display text-lg font-bold text-[#2a1f27]">
                {s.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#6f5965]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TRUST & STATS SECTION (Count-up + Commitment Banner)
   ============================================================ */
function TrustStatsSection({ lang }) {
  const stats = [
    {
      Icon: Gift,
      num: '12.860+',
      label: lang === 'en' ? 'Gifts Delivered' : 'Đơn quà gửi trao',
      bg: 'from-rose-500 to-pink-600',
    },
    {
      Icon: HeartHandshake,
      num: '13.680+',
      label: lang === 'en' ? 'Happy Customers' : 'Khách hàng gắn bó',
      bg: 'from-pink-500 to-purple-600',
    },
    {
      Icon: Palette,
      num: '6+',
      label: lang === 'en' ? 'Exclusive Templates' : 'Mẫu web độc quyền',
      bg: 'from-purple-500 to-indigo-600',
    },
    {
      Icon: Star,
      num: '4.9/5',
      label: lang === 'en' ? 'Satisfaction Rating' : 'Đánh giá hài lòng',
      bg: 'from-amber-500 to-rose-500',
    },
  ];

  return (
    <section id="why-us" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6">
        <div className="rounded-[32px] border border-rose-500/14 bg-white/90 p-6 shadow-[0_24px_60px_-18px_rgba(90,40,65,0.14)] backdrop-blur-xl sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="hg-title-grad text-2xl font-bold sm:text-4xl">
              {lang === 'en'
                ? 'Why Thousands Trust BloomNote?'
                : 'Vì Sao Hàng Ngàn Bạn Trẻ Tin Chọn BloomNote?'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6f5965] sm:text-base">
              {lang === 'en'
                ? 'Every digital gift is a priceless memory — proven by tens of thousands of love messages successfully delivered.'
                : 'Mỗi món quà số là một kỷ niệm vô giá được nâng niu — minh chứng từ hàng chục nghìn thông điệp yêu thương đã gửi trao thành công.'}
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ Icon, num, label, bg }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border border-rose-500/10 bg-[#fff9fb] p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${bg} text-white shadow-md`}
                >
                  <Icon size={22} />
                </div>
                <div className="mt-3.5 font-display text-3xl font-bold text-[#be123c]">
                  {num}
                </div>
                <div className="mt-1 text-sm font-medium text-[#6f5965]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Commitment Gradient Banner */}
          <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl bg-[linear-gradient(135deg,#be123c_0%,#e11d48_50%,#a21caf_100%)] p-6 text-white shadow-[0_16px_38px_-10px_rgba(190,18,60,0.45)] lg:flex-row sm:px-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-wide uppercase sm:text-lg">
                  {lang === 'en'
                    ? '100% QUALITY COMMITMENT FROM BLOOMNOTE'
                    : 'CAM KẾT CHẤT LƯỢNG 100% TỪ BLOOMNOTE'}
                </h3>
                <p className="mt-1 text-xs text-white/90 sm:text-sm">
                  {lang === 'en'
                    ? 'Instant creation · Exact preview match · Dedicated support & editing'
                    : 'Khởi tạo tức thì · Giao đúng mẫu xem trước · Hỗ trợ bảo hành & chỉnh sửa tận tâm'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { Icon: Lock, text: 'Bảo mật SSL' },
                { Icon: CheckCircle2, text: 'Đã xác minh' },
                { Icon: Heart, text: 'Uy tín BloomNote' },
              ].map(({ Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md"
                >
                  <Icon size={14} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ ACCORDION SECTION (6 HeartGift Questions)
   ============================================================ */
const FAQ_ITEMS = [
  {
    q: 'BloomNote là gì?',
    a: (
      <div className="space-y-2.5 text-sm leading-relaxed text-[#6f5965]">
        <p>
          <strong className="text-[#2a1f27]">BloomNote</strong> là dịch vụ tạo website quà tặng hoa &amp; thiệp cá nhân hóa, giúp bạn gửi gắm tình cảm qua hình ảnh, âm nhạc và những lời nhắn dành riêng cho người nhận. Mỗi món quà là một không gian kỷ niệm mang câu chuyện và dấu ấn của riêng bạn.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-[#2a1f27]">Cá nhân hóa món quà:</strong> Thêm ảnh kỷ niệm, chọn khung ảnh, chọn nhạc nền và viết lời chúc theo ý thích.</li>
          <li><strong className="text-[#2a1f27]">Tạo bất ngờ cho người nhận:</strong> Hiệu ứng chạm giữ vân tay thắp sáng hoa hồng, hoa bung nở 3 giai đoạn và thư tay gõ chữ.</li>
          <li><strong className="text-[#2a1f27]">Gửi quà dù ở gần hay xa:</strong> Chia sẻ website qua đường link riêng hoặc mã QR cực kỳ thuận tiện.</li>
        </ul>
      </div>
    ),
  },
  {
    q: 'Làm thế nào để tạo quà 20/10 trên BloomNote?',
    a: (
      <div className="space-y-2 text-sm leading-relaxed text-[#6f5965]">
        <p>Bạn có thể tạo website quà tặng chỉ qua 4 bước đơn giản:</p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li><strong className="text-[#2a1f27]">Chọn mẫu web:</strong> Khám phá bộ sưu tập mẫu hoa 20/10, bấm <em>Xem trước</em> hoặc <em>Tạo mẫu này</em>.</li>
          <li><strong className="text-[#2a1f27]">Tùy chỉnh thông tin:</strong> Điền tên người nhận, người gửi, chọn gợi ý lời chúc, tải ảnh kỷ niệm và chọn bài hát nền.</li>
          <li><strong className="text-[#2a1f27]">Lưu &amp; Tạo Link:</strong> Hệ thống lưu thiệp vào danh sách lớp và tạo ngay đường link kèm mã QR.</li>
          <li><strong className="text-[#2a1f27]">Gửi trao:</strong> Gửi link hoặc in mã QR đính kèm bó hoa/quà tặng cho các bạn nữ trong lớp.</li>
        </ol>
      </div>
    ),
  },
  {
    q: 'Website quà tặng được sử dụng như thế nào?',
    a: (
      <div className="space-y-2.5 text-sm leading-relaxed text-[#6f5965]">
        <p>Bạn có thể gửi món quà theo hai cách:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-[#2a1f27]">Gửi đường link trực tiếp:</strong> Chia sẻ link qua Messenger, Zalo hoặc mạng xã hội. Người nhận chỉ cần mở link để khám phá món quà.</li>
          <li><strong className="text-[#2a1f27]">Gửi hoặc in mã QR:</strong> Tải ảnh QR từ Phòng thiết kế hoặc in lên thiệp giấy, đặt cùng hoa. Người nhận dùng camera điện thoại quét mã để mở website.</li>
        </ul>
        <p className="flex items-center gap-2 rounded-xl bg-rose-50/80 p-3 text-xs text-[#be123c]">
          <Info size={16} className="shrink-0" />
          <span>Khi mở link, người nhận chạm vào đóa hoa hoặc nút vân tay để nhạc tự động vang lên và mở bức thư.</span>
        </p>
      </div>
    ),
  },
  {
    q: 'Tôi có cần biết lập trình hoặc thiết kế để tạo quà không?',
    a: (
      <p className="text-sm leading-relaxed text-[#6f5965]">
        <strong className="text-[#2a1f27]">Không.</strong> Các mẫu website đã được thiết kế sẵn hiệu ứng hạt Canvas 60fps, hoa nở nhiều tầng và hộp nhạc. Bạn chỉ cần lựa chọn mẫu và điền nội dung theo hướng dẫn mà không cần viết mã hay thiết kế từ đầu.
      </p>
    ),
  },
  {
    q: 'Tôi cần chuẩn bị những gì để tạo quà?',
    a: (
      <div className="space-y-2 text-sm leading-relaxed text-[#6f5965]">
        <p>Để quá trình tạo quà thuận tiện hơn, bạn nên chuẩn bị:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-[#2a1f27]">Thông tin cá nhân hóa:</strong> Tên người nhận và tên người gửi (hoặc tập thể lớp).</li>
          <li><strong className="text-[#2a1f27]">Hình ảnh:</strong> Ảnh kỷ niệm đẹp của người nhận (hoặc chọn bộ sticker dễ thương có sẵn).</li>
          <li><strong className="text-[#2a1f27]">Lời nhắn:</strong> Lời chúc chân thành (có sẵn 5 nhóm lời chúc gợi ý nhanh).</li>
          <li><strong className="text-[#2a1f27]">Âm nhạc:</strong> Chọn từ 4 giai điệu Web Audio có sẵn hoặc tải file nhạc MP3 yêu thích.</li>
        </ul>
      </div>
    ),
  },
  {
    q: 'Tôi có thể chỉnh sửa thông tin sau khi đã tạo quà không?',
    a: (
      <p className="text-sm leading-relaxed text-[#6f5965]">
        <strong className="text-[#2a1f27]">Hoàn toàn được!</strong> Trong mục <em>Phòng thiết kế → Thiệp đã chuẩn bị cho lớp</em>, bạn có thể bấm nút <strong>Sửa (biểu tượng cây bút)</strong> ở bất kỳ tấm thiệp nào để cập nhật lời chúc, đổi ảnh hoặc đổi nhạc nền mà vẫn giữ nguyên đường link và mã QR đã gửi.
      </p>
    ),
  },
];

function FaqSection({ lang }) {
  return (
    <section id="faq" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6">
        <div className="text-center">
          <h2 className="hg-title-grad text-2xl font-bold sm:text-4xl">
            {lang === 'en' ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp'}
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-rose-500/14 bg-white/95 shadow-[0_20px_50px_-18px_rgba(90,40,65,0.12)]">
          {FAQ_ITEMS.map((item, idx) => (
            <details
              key={item.q}
              open={idx === 0}
              className="group border-b border-rose-500/10 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-rose-50/40 sm:px-8 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-base font-bold text-[#2a1f27] sm:text-lg">
                  {item.q}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rose-200 bg-rose-50/60 text-[#be123c] transition-all duration-300 group-open:rotate-180 group-open:border-rose-500 group-open:bg-[linear-gradient(135deg,#be123c,#e11d48)] group-open:text-white group-open:shadow-xs">
                  <ChevronDown size={18} />
                </span>
              </summary>
              <div className="px-6 pb-6 sm:px-8">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FLOATING CONTACT FAB + LEGAL/CONTACT MODALS
   ============================================================ */
function FloatingContactFab({ onOpenLegal }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 w-72 overflow-hidden rounded-2xl border border-rose-500/15 bg-white p-4 shadow-[0_20px_50px_rgba(42,31,39,0.2)]"
          >
            <div className="flex items-center justify-between border-b border-rose-500/10 pb-2.5">
              <h3 className="font-display text-sm font-bold text-[#2a1f27]">
                Liên hệ hỗ trợ BloomNote
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              <li>
                <a
                  href="https://zalo.me/84365810365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-medium text-[#2a1f27] transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500 text-xs font-extrabold text-white">
                      Z
                    </span>
                    Nhắn tin qua Zalo
                  </span>
                  <ChevronRight size={16} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/ducduy.281024/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-medium text-[#2a1f27] transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1877F2] text-xs font-extrabold text-white">
                      f
                    </span>
                    Nhắn tin qua Facebook
                  </span>
                  <ChevronRight size={16} />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenLegal('contact');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-medium text-[#2a1f27] transition hover:bg-rose-50 hover:text-[#e11d48]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-500 text-white">
                      <Mail size={14} />
                    </span>
                    Xem tất cả kênh liên hệ
                  </span>
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Liên hệ hỗ trợ"
        className="hg-btn-primary h-13 w-13 rounded-full shadow-xl"
      >
        <Headset size={22} />
      </button>
    </div>
  );
}

/* ============================================================
   MAIN SHOP PAGE (HeartGift Landing Experience)
   ============================================================ */
export default function Shop() {
  const params = useSearchParams();
  const filter = params.get('cat') || 'all';
  const [templates, setTemplates] = useState(TEMPLATES);
  const [categories, setCategories] = useState(CATEGORIES);
  const [lang, setLang] = useState('vi');
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | 'contact' | null

  useEffect(() => {
    api.catalog().then((data) => {
      if (data.templates?.length) setTemplates(data.templates);
      if (data.categories?.length) setCategories(data.categories);
    }).catch(() => {});
  }, []);

  const shown =
    filter === 'all' ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="min-h-dvh">
      <NavBar lang={lang} onLangChange={setLang} />

      {/* ============================================================
          HERO SECTION (section.hero.hero--showcase#home)
          ============================================================ */}
      <section
        id="home"
        className="relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden bg-[radial-gradient(ellipse_115%_90%_at_72%_32%,rgba(255,228,238,0.75)_0%,rgba(252,231,243,0.42)_38%,transparent_68%),linear-gradient(165deg,#fff5f8_0%,#fdf2f7_38%,#faf5ff_72%,#fdf8fa_100%)] py-10 sm:py-16"
      >
        {/* Ambient blurred blobs */}
        <div
          className="pointer-events-none absolute -top-28 -left-24 h-96 w-96 rounded-full bg-rose-300/35 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-[1340px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.2fr]">
          {/* Left Hero Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-white/85 px-4 py-1.5 text-xs font-bold tracking-wide text-[#be123c] shadow-xs backdrop-blur-md">
              <Heart
                size={13}
                className="badge-heart-beat fill-[#e11d48] text-[#e11d48]"
              />
              <span>
                {lang === 'en'
                  ? 'Personalized Digital Gift Website · 20/10'
                  : 'Món quà kỹ thuật số cá nhân hóa · 20/10'}
              </span>
            </div>

            <h1 className="mt-5 font-sans text-3xl leading-[1.15] font-extrabold tracking-tight text-[#1e131d] sm:text-5xl lg:text-[46px]">
              <span className="block">
                {lang === 'en'
                  ? 'Some words of love.'
                  : 'Có những lời yêu thương.'}
              </span>
              <span className="hg-hero-grad mt-1.5 block">
                {lang === 'en'
                  ? 'Deserve to be given in a special way.'
                  : 'Xứng đáng được trao theo cách đặc biệt.'}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#5c4752] sm:text-[17px] lg:mx-0">
              {lang === 'en'
                ? 'Create a private digital space to tell your story with blooming flowers, heartfelt letters, personal photos, and melodies.'
                : 'Tạo một không gian riêng để kể câu chuyện của bạn bằng những đóa hoa bung nở, hình ảnh kỷ niệm, giai điệu và lời nhắn chân thành.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
              <a
                href="#gifts"
                className="hg-btn-primary rounded-full px-7 py-4 text-[15px]"
              >
                <span>
                  {lang === 'en' ? 'Explore Gift Templates' : 'Khám phá mẫu quà'}
                </span>
                <ArrowDown size={17} />
              </a>

              <a
                href="/studio"
                className="hg-btn-preview rounded-full px-6 py-4 text-[15px]"
              >
                <Wand2 size={17} />
                <span>
                  {lang === 'en' ? 'Open Creator Studio' : 'Vào phòng thiết kế'}
                </span>
              </a>
            </div>
          </div>

          {/* Right Hero Scrapbook Showcase */}
          <HeroScrapbookShowcase template={templates[0] || TEMPLATES[0]} />
        </div>
      </section>

      {/* ============================================================
          PRODUCTS / TEMPLATE EXPLORER (section.products#gifts)
          ============================================================ */}
      <section id="gifts" className="scroll-mt-20 py-14 sm:py-20">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6">
          <div className="text-center">
            <h2 className="hg-title-grad text-2xl font-bold sm:text-4xl">
              {lang === 'en' ? 'Explore Gift Templates' : 'Khám phá mẫu quà'}
            </h2>
            <p className="mt-2 text-sm text-[#6f5965]">
              {lang === 'en'
                ? 'Hover or tap any card to watch the flower bloom again ✨'
                : 'Chạm hoặc di chuột vào từng mẫu để xem hiệu ứng hoa nở ✨'}
            </p>
          </div>

          {/* Category Filter Tabs (.gift-categories) */}
          <div
            className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
            role="tablist"
            aria-label="Danh mục mẫu quà"
          >
            {categories.map((c) => {
              const active = filter === c.id;
              const { Icon, color } = CAT_ICONS[c.id] || CAT_ICONS[c.icon] || CAT_ICONS.all;
              const href = c.id === 'all' ? '/#gifts' : `/?cat=${encodeURIComponent(c.id)}#gifts`;
              return (
                <a
                  key={c.id}
                  href={href}
                  role="tab"
                  aria-selected={active}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[linear-gradient(135deg,#be123c_0%,#e11d48_50%,#a21caf_100%)] text-white shadow-[0_8px_22px_-4px_rgba(225,29,72,0.45)] -translate-y-0.5'
                      : 'border border-rose-500/14 bg-white/95 text-[#5a4550] shadow-xs hover:-translate-y-0.5 hover:border-rose-500/30 hover:bg-rose-50/60 hover:text-[#be123c]'
                  }`}
                >
                  <Icon
                    size={16}
                    className={active ? 'text-white' : color}
                  />
                  <span>{lang === 'en' ? c.labelEn || c.label : c.label}</span>
                </a>
              );
            })}
          </div>

          {/* 3-Column Movie Grid */}
          <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t, i) => (
              <TemplateCard key={t.id} t={t} index={i} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4 STEPS SECTION
          ============================================================ */}
      <FourStepsSection lang={lang} />

      {/* ============================================================
          TRUST & STATS SECTION
          ============================================================ */}
      <TrustStatsSection lang={lang} />

      {/* ============================================================
          FAQ ACCORDION SECTION
          ============================================================ */}
      <FaqSection lang={lang} />

      {/* ============================================================
          SITE FOOTER (footer.site-footer)
          ============================================================ */}
      <footer className="relative overflow-hidden border-t border-rose-500/14 bg-[linear-gradient(180deg,#fdf4f8_0%,#fae8f0_100%)] pt-14 pb-10">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <BrandLogo />
              <p className="mt-4 max-w-xl font-display text-base leading-relaxed text-[#5c4752]">
                Nơi bạn tạo quà kỹ thuật số mang dấu ấn riêng — để tình yêu và sự trân trọng ngày 20/10 không chỉ nói bằng lời, mà còn được{' '}
                <em className="font-semibold text-[#be123c]">
                  nhìn thấy, chạm vào và lưu giữ
                </em>
                .
              </p>

              <ul className="mt-5 flex flex-wrap items-center gap-5 text-sm font-semibold text-[#6f5965]">
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('contact')}
                    className="inline-flex items-center gap-1.5 transition hover:text-[#e11d48]"
                  >
                    <MessageCircle size={15} /> Liên hệ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="inline-flex items-center gap-1.5 transition hover:text-[#e11d48]"
                  >
                    <FileText size={15} /> Điều khoản
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="inline-flex items-center gap-1.5 transition hover:text-[#e11d48]"
                  >
                    <Shield size={15} /> Quyền riêng tư
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:text-right">
              <p className="text-xs font-bold tracking-wider uppercase text-[#9a8490]">
                Theo dõi &amp; liên lạc
              </p>
              <div className="mt-3 flex items-center gap-2.5 md:justify-end">
                {[
                  {
                    label: 'Facebook',
                    href: '#contact',
                    icon: 'f',
                  },
                  {
                    label: 'TikTok',
                    href: '#contact',
                    icon: '♪',
                  },
                  {
                    label: 'GitHub',
                    href: '#contact',
                    icon: '⌘',
                  },
                  {
                    label: 'Email',
                    href: 'mailto:hello@bloomnote.vn',
                    icon: '✉',
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    onClick={(e) => {
                      if (s.href === '#contact') {
                        e.preventDefault();
                        setLegalModal('contact');
                      }
                    }}
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-rose-500/15 bg-white text-sm font-bold text-[#2a1f27] shadow-xs transition hover:-translate-y-0.5 hover:border-rose-500 hover:bg-[#e11d48] hover:text-white"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-rose-500/12 pt-6 text-center text-xs text-[#9a8490]">
            © 2026 BloomNote · Tiệm Hoa &amp; Thiệp 20/10 Classmate Edition. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Contact FAB */}
      <FloatingContactFab onOpenLegal={setLegalModal} />

      {/* Legal & Contact Modals */}
      {legalModal && (
        <Modal
          title={
            legalModal === 'terms'
              ? 'Điều khoản sử dụng · BloomNote'
              : legalModal === 'privacy'
                ? 'Chính sách bảo mật · BloomNote'
                : 'Liên hệ với chúng tôi'
          }
          onClose={() => setLegalModal(null)}
        >
          {legalModal === 'contact' ? (
            <div className="space-y-3 text-sm text-[#5c4752]">
              <p>
                Có ý tưởng, góp ý hoặc cần hỗ trợ chỉnh sửa món quà 20/10? Đội ngũ BloomNote luôn sẵn sàng lắng nghe bạn!
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: 'Email hỗ trợ',
                    desc: 'hello@bloomnote.vn',
                    href: 'mailto:hello@bloomnote.vn',
                  },
                  {
                    label: 'Zalo hỗ trợ nhanh',
                    desc: 'Nhắn tin trực tiếp qua Zalo',
                    href: 'https://zalo.me',
                  },
                  {
                    label: 'Facebook',
                    desc: 'Nhắn tin qua Facebook Messenger',
                    href: 'https://facebook.com',
                  },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-rose-500/12 bg-rose-50/40 p-3.5 transition hover:border-rose-400 hover:bg-rose-50"
                  >
                    <div>
                      <p className="font-bold text-[#2a1f27]">{c.label}</p>
                      <p className="text-xs text-[#6f5965]">{c.desc}</p>
                    </div>
                    <ArrowUpRight size={18} className="text-[#e11d48]" />
                  </a>
                ))}
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/70 p-3.5 text-xs text-amber-900">
                <Clock size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  Thời gian phản hồi: trong vòng 24–48 giờ làm việc. Đối với vấn đề cần gấp cho dịp lễ 20/10, vui lòng nhắn qua Zalo.
                </span>
              </div>
            </div>
          ) : legalModal === 'terms' ? (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-[#5c4752]">
              <p className="text-xs text-[#9a8490]">Áp dụng cho dịch vụ BloomNote · Cập nhật năm 2026</p>
              <h4 className="font-bold text-[#2a1f27]">1. Giới thiệu</h4>
              <p>BloomNote là dịch vụ tạo website quà tặng hoa &amp; thiệp cá nhân hóa. Bằng việc truy cập và sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản này.</p>
              <h4 className="font-bold text-[#2a1f27]">2. Trách nhiệm nội dung</h4>
              <p>Bạn chịu trách nhiệm với hình ảnh, lời chúc và âm nhạc tải lên để gửi tặng bạn bè, đảm bảo văn minh và tôn trọng người nhận.</p>
              <h4 className="font-bold text-[#2a1f27]">3. Quyền sở hữu</h4>
              <p>Nội dung hình ảnh và bức thư bạn tạo thuộc quyền sở hữu của bạn. Hệ thống lưu trữ để phục vụ hiển thị qua đường link và mã QR của món quà.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-[#5c4752]">
              <p className="text-xs text-[#9a8490]">Chính sách bảo mật · Cập nhật năm 2026</p>
              <h4 className="font-bold text-[#2a1f27]">1. Thông tin lưu trữ</h4>
              <p>Chúng tôi chỉ lưu trữ tên người nhận, tên người gửi, lời chúc, ảnh kỷ niệm và bản nhạc bạn chọn để hiển thị trang quà tặng.</p>
              <h4 className="font-bold text-[#2a1f27]">2. Bảo mật &amp; Quyền riêng tư</h4>
              <p>Mỗi tấm thiệp có đường dẫn (slug) riêng biệt. Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân cho bất kỳ bên thứ ba nào.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
