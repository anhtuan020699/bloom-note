import { NextResponse } from 'next/server';

const API = process.env.API_URL || 'http://127.0.0.1:4000';

export async function POST(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '127.0.0.1:5173';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const token = req.cookies.get('bloomnote-admin')?.value;

  if (token) {
    await fetch(`${API}/api/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  const out = NextResponse.redirect(new URL('/admin', origin));
  out.cookies.set('bloomnote-admin', '', { path: '/', maxAge: 0 });
  return out;
}
