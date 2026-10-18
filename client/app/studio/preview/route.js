import { NextResponse } from 'next/server';
import { cardFromForm, originOf } from '../../../src/lib/cardForm.js';

export async function POST(req) {
  const origin = originOf(req);
  const form = await req.formData();
  const body = cardFromForm(form);
  const dest = new URL('/show', origin);
  const out = NextResponse.redirect(dest, 303);
  out.cookies.set('bloomnote-show', encodeURIComponent(JSON.stringify(body)), {
    path: '/',
    maxAge: 60 * 60,
    sameSite: 'lax',
  });
  return out;
}
