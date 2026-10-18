import { Suspense } from 'react';
import { CardPage } from '../../../src/views/Receiver.jsx';

const API = process.env.API_URL || 'http://127.0.0.1:4000';

async function loadCard(slug) {
  try {
    const res = await fetch(`${API}/api/cards/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { card: null, error: data.error || data.message || 'Không tìm thấy thiệp.' };
    return { card: data, error: '' };
  } catch {
    return { card: null, error: 'Không kết nối được máy chủ.' };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const { card, error } = await loadCard(slug);
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-[#be123c] text-sm font-semibold">Đang gói quà…</div>}>
      <CardPage initialCard={card} initialError={error} />
    </Suspense>
  );
}
