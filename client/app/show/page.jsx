import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { ShowPage } from '../../src/views/Receiver.jsx';

export default async function Page() {
  const raw = (await cookies()).get('bloomnote-show')?.value;
  let preview = null;
  try {
    preview = raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch {
    preview = null;
  }
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-[#be123c] text-sm font-semibold">Đang gói quà…</div>}>
      <ShowPage preview={preview} />
    </Suspense>
  );
}
