'use client';

import { Suspense } from 'react';
import { PreviewPage } from '../../../src/views/Receiver.jsx';

export default function Page() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#061208] text-emerald-100 text-sm font-semibold">Đang gói quà…</div>}>
      <PreviewPage />
    </Suspense>
  );
}
