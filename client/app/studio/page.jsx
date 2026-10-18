'use client';

import { Suspense } from 'react';
import Studio from '../../src/views/Studio.jsx';

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-[#be123c] text-sm font-semibold">Đang mở…</div>}>
      <Studio />
    </Suspense>
  );
}
