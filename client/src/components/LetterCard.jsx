import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from './Typewriter.jsx';

export default function LetterCard({ card, typing = false, compact = false, footer = null }) {
  const [done, setDone] = useState(!typing);
  const [skip, setSkip] = useState(false);
  const message = card.message?.trim() || 'Chúc cậu một ngày 20/10 thật vui, thật xinh và thật nhiều niềm vui nhé! 🌸';
  const year = new Date().getFullYear();

  return (
    <article
      className={`relative overflow-hidden rounded-[26px] border border-white/70 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-md ${compact ? 'p-5' : 'p-5 sm:p-9'}`}
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 92%, white) 0%, var(--card-bg) 100%)',
        color: 'var(--text)',
      }}
      onClick={() => typing && !done && setSkip(true)}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl" style={{ background: 'var(--secondary)' }} />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full opacity-25 blur-2xl" style={{ background: 'var(--accent)' }} />

      <header className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-60">Ngày Phụ nữ Việt Nam · 20/10/{year}</p>
        <h2 className={`shimmer-text mt-2 font-display font-bold leading-tight ${compact ? 'text-2xl' : 'text-[1.65rem] sm:text-4xl'}`}>
          Gửi {card.recipientName || 'cô bạn xinh đẹp'}
        </h2>
        <div className="mt-3 flex items-center gap-2 opacity-60" aria-hidden="true">
          <span className="h-px flex-1 bg-current" />
          <span className="text-sm">❀</span>
          <span className="h-px flex-1 bg-current" />
        </div>
      </header>

      <div className={`paper-lines relative mt-4 ${compact ? 'text-[15px]' : 'text-base sm:text-[17px]'}`} style={{ lineHeight: '1.9em' }}>
        {typing ? (
          <Typewriter text={message} skip={skip} onDone={() => setDone(true)} />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message}</p>
        )}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mt-6 text-right"
          >
            <p className="text-sm opacity-70">Thân gửi,</p>
            <p className={`font-script font-bold text-[var(--ink)] ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
              {card.senderName || 'Một người bạn'}
            </p>
            {footer && <div className="mt-6 text-center">{footer}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {typing && !done && (
        <p className="relative mt-4 text-center text-xs opacity-50">Chạm vào thư để hiện toàn bộ</p>
      )}
    </article>
  );
}
