import { NextResponse } from 'next/server';

const API = process.env.API_URL || 'http://127.0.0.1:4000';

export async function POST(req) {
  const form = await req.formData();
  const username = String(form.get('username') || '').trim();
  const password = String(form.get('password') || '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '127.0.0.1:5173';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const fail = (msg) =>
    NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(msg)}`, origin));

  let data;
  try {
    const res = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    data = await res.json();
  } catch {
    return fail('Không kết nối được máy chủ.');
  }
  if (!data?.token) return fail(data?.error || 'Sai tài khoản hoặc mật khẩu.');

  const out = NextResponse.redirect(new URL('/admin', origin));
  out.cookies.set('bloomnote-admin', data.token, {
    path: '/',
    maxAge: 12 * 60 * 60,
    sameSite: 'lax',
  });
  return out;
}
