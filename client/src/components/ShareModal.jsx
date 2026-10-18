import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Check, Copy, Download, ExternalLink, X } from 'lucide-react';
import { cardUrl, shareBaseUrl, isOffline } from '../lib/api.js';
import Modal from './Modal.jsx';

export default function ShareModal({ card, onClose, openHref }) {
  const viewHref = openHref || (card?.slug ? `/card/${card.slug}` : '#');
  const [url, setUrl] = useState('');
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    shareBaseUrl().then(async (base) => {
      const link = cardUrl(base, card);
      const data = await QRCode.toDataURL(link, { width: 520, margin: 1, color: { dark: '#3d1f2b', light: '#ffffff' } });
      if (alive) { setUrl(link); setQr(data); }
    });
    return () => { alive = false; };
  }, [card]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Modal onClose={onClose}>
      <motion.div
        initial={false}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100" aria-label="Đóng">
          <X size={18} />
        </button>
        <div className="text-4xl">💌</div>
        <h3 className="mt-2 font-display text-2xl font-bold text-rose-700">Thiệp đã sẵn sàng!</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Gửi link hoặc mã QR cho <b className="text-neutral-700">{card.recipientName}</b>
        </p>

        <div className="mx-auto mt-5 grid aspect-square w-56 place-items-center rounded-2xl border border-rose-100 bg-rose-50/50 p-3">
          {qr ? <img src={qr} alt="Mã QR thiệp" className="h-full w-full rounded-lg" /> : <span className="animate-pulse text-sm text-rose-300">Đang tạo mã QR…</span>}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 pl-3">
          <input readOnly value={url} className="min-w-0 flex-1 bg-transparent text-sm text-neutral-600 outline-none" onFocus={(e) => e.target.select()} />
          <button onClick={copy} className="flex shrink-0 items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700">
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Đã copy' : 'Copy'}
          </button>
        </div>

        {isOffline() && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
            Đang chạy chế độ demo (không có server): link chỉ mở được trên trình duyệt này. Hãy chạy backend để chia sẻ cho bạn khác.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={qr || undefined}
            download={`qr-thiep-${card.slug}.png`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            <Download size={16} /> Tải mã QR
          </a>
          <a href={viewHref} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm font-semibold text-white shadow hover:brightness-105">
            <ExternalLink size={16} /> Mở thiệp
          </a>
        </div>
      </motion.div>
    </Modal>
  );
}
