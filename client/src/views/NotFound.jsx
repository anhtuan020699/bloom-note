'use client';

import Link from 'next/link';

export default function NotFound({ title = 'Không tìm thấy trang', message = 'Có vẻ đóa hoa này đã bay đi mất rồi…' }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-rose-50 to-pink-100 p-6 text-center">
      <div>
        <div className="text-6xl">🥀</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-rose-800">{title}</h1>
        <p className="mt-2 text-rose-900/70">{message}</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-rose-600 px-6 py-2.5 font-medium text-white shadow hover:bg-rose-700">
          Về tiệm hoa
        </Link>
      </div>
    </div>
  );
}
