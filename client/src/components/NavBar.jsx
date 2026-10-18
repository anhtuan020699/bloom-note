'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, Wand2, X } from 'lucide-react';
import { onOfflineChange } from '../lib/api.js';

export function BrandLogo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#be123c_0%,#e11d48_50%,#a21caf_100%)] text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.45)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current drop-shadow-sm" aria-hidden="true">
          <path d="M12 2C9.5 2 8 4.2 8 6.5c0 1.4.6 2.6 1.5 3.4C7.1 9.6 5 11.4 5 14c0 2.5 2 4.5 4.5 4.5 1 0 1.9-.3 2.5-.9.6.6 1.5.9 2.5.9 2.5 0 4.5-2 4.5-4.5 0-2.6-2.1-4.4-4.5-4.1.9-.8 1.5-2 1.5-3.4C16 4.2 14.5 2 12 2zm0 7.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-white text-[9px] font-extrabold text-[#e11d48] shadow">
          ✦
        </span>
      </span>
      <span className="leading-none">
        <span className="block font-script text-[26px] font-bold tracking-tight bg-[linear-gradient(135deg,#be123c_0%,#e11d48_55%,#a21caf_100%)] bg-clip-text text-transparent">
          BloomNote
        </span>
        <span className="block text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#9a8490]">
          Tiệm Hoa &amp; Thiệp 20/10
        </span>
      </span>
    </span>
  );
}

export default function NavBar({ lang = 'vi', onLangChange }) {
  const [offline, setOffline] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => onOfflineChange(setOffline), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const sectionHref = (hash) => (pathname === '/' ? hash : `/${hash}`);

  const navItems = lang === 'en'
    ? [
        { label: 'Home', hash: '#home' },
        { label: 'Templates', hash: '#gifts' },
        { label: 'How It Works', hash: '#how-it-works' },
        { label: 'FAQ', hash: '#faq' },
      ]
    : [
        { label: 'Trang chủ', hash: '#home' },
        { label: 'Sản phẩm', hash: '#gifts' },
        { label: 'Hướng dẫn', hash: '#how-it-works' },
        { label: 'Câu hỏi', hash: '#faq' },
      ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-rose-500/12 bg-[#fffcfd]/92 py-2.5 shadow-[0_8px_28px_rgba(42,31,39,0.06)] backdrop-blur-xl'
            : 'border-b border-transparent bg-[#fffcfd]/70 py-3.5 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto grid max-w-[1340px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 justify-self-start">
            <a href="/" aria-label="BloomNote Trang chủ">
              <BrandLogo />
            </a>
            {offline && (
              <span
                className="hidden rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-300/60 xl:inline-flex"
                title="Đang lưu trữ cục bộ trên trình duyệt"
              >
                Local Mode
              </span>
            )}
          </div>

          {/* Center: Nav links (Desktop) */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Điều hướng chính">
            {navItems.map((item) => (
              <a
                key={item.hash}
                href={sectionHref(item.hash)}
                className="group relative py-1.5 text-[15px] font-semibold text-[#2a1f27]/85 transition hover:text-[#e11d48]"
              >
                {item.label}
                <span className="
                  absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 rounded-full
                  bg-[linear-gradient(90deg,#e11d48,#c084fc)] transition-transform duration-300 group-hover:scale-x-100
                " />
              </a>
            ))}
            <a
              href="/studio"
              className={`relative py-1.5 text-[15px] font-semibold transition ${
                pathname === '/studio' ? 'text-[#e11d48]' : 'text-[#2a1f27]/85 hover:text-[#e11d48]'
              }`}
            >
              {lang === 'en' ? 'Creator Studio' : 'Phòng thiết kế'}
            </a>
          </nav>

          {/* Right: Lang switch + CTA + Hamburger */}
          <div className="flex items-center gap-2.5 justify-self-end">
            {onLangChange && (
              <div
                className="inline-flex items-center rounded-full border border-rose-500/15 bg-white/85 p-0.5 text-xs font-bold shadow-xs"
                role="group"
                aria-label="Ngôn ngữ"
              >
                <button
                  type="button"
                  onClick={() => onLangChange('vi')}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${
                    lang === 'vi'
                      ? 'bg-[linear-gradient(135deg,#be123c,#e11d48)] text-white shadow-xs'
                      : 'text-[#6f5965] hover:text-[#2a1f27]'
                  }`}
                >
                  <span>🇻🇳</span> VI
                </button>
                <button
                  type="button"
                  onClick={() => onLangChange('en')}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${
                    lang === 'en'
                      ? 'bg-[linear-gradient(135deg,#be123c,#e11d48)] text-white shadow-xs'
                      : 'text-[#6f5965] hover:text-[#2a1f27]'
                  }`}
                >
                  <span>🇬🇧</span> EN
                </button>
              </div>
            )}

            <a
              href="/studio"
              className="hg-btn-primary rounded-full px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <Wand2 size={15} />
              <span>{lang === 'en' ? 'Create Gift' : 'Tạo quà ngay'}</span>
            </a>

            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-rose-500/15 bg-white/90 text-[#2a1f27] shadow-xs lg:hidden"
              aria-label="Menu"
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#1a0d14]/45 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(320px,86vw)] flex-col justify-between bg-[#fffcfd] p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
                <BrandLogo />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rose-700"
                  aria-label="Đóng menu"
                >
                  <X size={18} />
                </button>
              </div>
              <ul className="mt-5 space-y-1.5">
                {navItems.map((item) => (
                  <li key={item.hash}>
                    <a
                      href={sectionHref(item.hash)}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-[#2a1f27] hover:bg-rose-50 hover:text-[#e11d48]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/studio"
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold text-[#e11d48] hover:bg-rose-50"
                  >
                    <Sparkles size={16} />
                    {lang === 'en' ? 'Creator Studio (20/10)' : 'Phòng thiết kế thiệp'}
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 border-t border-rose-500/10 pt-4">
              <a
                href="/studio"
                className="hg-btn-primary w-full rounded-full py-3 text-sm"
              >
                <Wand2 size={16} />
                {lang === 'en' ? 'Create 20/10 Gift Now' : 'Tạo món quà 20/10 ngay'}
              </a>
              <p className="text-center text-xs text-[#9a8490]">
                © 2026 BloomNote · Tiệm Hoa &amp; Thiệp 20/10
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
