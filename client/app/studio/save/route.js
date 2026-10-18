import { NextResponse } from 'next/server';
import { cardFromForm, originOf } from '../../../src/lib/cardForm.js';

const API = process.env.API_URL || 'http://127.0.0.1:4000';

function fail(origin, msg, templateId) {
  const dest = new URL('/studio', origin);
  if (templateId) dest.searchParams.set('template', templateId);
  dest.searchParams.set('error', msg);
  return NextResponse.redirect(dest, 303);
}

export async function POST(req) {
  const origin = originOf(req);
  const form = await req.formData();
  const body = cardFromForm(form);
  if (!body.recipientName) return fail(origin, 'Nhập tên người nhận nhé!', body.templateId);

  try {
    const photo = form.get('photo');
    if (photo && typeof photo === 'object' && photo.size) {
      const fd = new FormData();
      fd.append('file', photo);
      const up = await fetch(`${API}/api/upload/photo`, { method: 'POST', body: fd });
      const data = await up.json().catch(() => ({}));
      if (!up.ok) return fail(origin, data.error || 'Không tải được ảnh.', body.templateId);
      body.photoUrl = data.url;
    }

    const musicFile = form.get('musicFile');
    if (musicFile && typeof musicFile === 'object' && musicFile.size) {
      const fd = new FormData();
      fd.append('file', musicFile);
      const up = await fetch(`${API}/api/upload/music`, { method: 'POST', body: fd });
      const data = await up.json().catch(() => ({}));
      if (!up.ok) return fail(origin, data.error || 'Không tải được nhạc.', body.templateId);
      body.musicConfig = { source: 'upload', url: data.url, title: data.name || 'Nhạc của bạn' };
    }

    const editingId = String(form.get('editingId') || '').trim();
    const res = await fetch(editingId ? `${API}/api/cards/${encodeURIComponent(editingId)}` : `${API}/api/cards`, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const card = await res.json().catch(() => ({}));
    if (!res.ok || !card?.slug) {
      const msg = card.error || (Array.isArray(card.message) ? card.message.join(' ') : card.message);
      return fail(origin, msg || 'Không lưu được thiệp.', body.templateId);
    }

    const dest = new URL('/studio', origin);
    dest.searchParams.set('saved', card.slug);
    dest.searchParams.set('template', card.templateId || body.templateId);
    return NextResponse.redirect(dest, 303);
  } catch {
    return fail(origin, 'Không kết nối được máy chủ.', body.templateId);
  }
}
