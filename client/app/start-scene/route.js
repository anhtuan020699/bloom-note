import { NextResponse } from 'next/server';

function safeBack(raw) {
  const path = String(raw || '/').split('?')[0];
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  if (path.startsWith('/preview/') || path.startsWith('/card/') || path === '/show') return path;
  return '/';
}

export async function POST(req) {
  const form = await req.formData();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '127.0.0.1:5173';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const dest = new URL(safeBack(form.get('back')), `${proto}://${host}`);
  dest.searchParams.set('start', '1');
  if (String(form.get('letter') || '') === '1') dest.searchParams.set('letter', '1');
  else dest.searchParams.delete('letter');
  return NextResponse.redirect(dest, 303);
}
