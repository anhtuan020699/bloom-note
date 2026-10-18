'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, Copy, Eye, ImagePlus, Link2, Loader2, Music2, Pause, Pencil, Play, Plus, QrCode, Save,
  Search, Sparkles, Trash2, Upload, Wand2, X,
} from 'lucide-react';
import { TEMPLATES, MUSIC_LIBRARY, PHOTO_FRAMES, getTemplate } from '@shared/templates.js';
import { MESSAGE_SUGGESTIONS, fillMessage } from '@shared/messages.js';
import NavBar from '../components/NavBar.jsx';
import Flower from '../components/Flower.jsx';
import PhotoFrame from '../components/PhotoFrame.jsx';
import LetterCard from '../components/LetterCard.jsx';
import ParticleCanvas from '../components/ParticleCanvas.jsx';
import ShareModal from '../components/ShareModal.jsx';
import { api, cardUrl, shareBaseUrl } from '../lib/api.js';
import { player, usePlayer, musicKey } from '../lib/player.js';
import { DEFAULT_CARD, STICKERS, themeVars } from '../lib/theme.js';
import { SHOW_KEY } from './Receiver.jsx';

const DRAFT_KEY = 'tiemhoa:draft';
const FIELDS = Object.keys(DEFAULT_CARD);
const pickFields = (obj) => Object.fromEntries(FIELDS.map((k) => [k, obj[k] ?? DEFAULT_CARD[k]]));

const FRAME_ICONS = { polaroid: '📸', floral: '🌼', stamp: '✉️', glass: '🔮' };

function Section({ step, title, children, right }) {
  return (
    <section className="rounded-[24px] border border-rose-500/12 bg-white/95 p-5 shadow-[0_14px_36px_-14px_rgba(90,40,65,0.1)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#be123c_0%,#e11d48_50%,#a21caf_100%)] text-xs font-extrabold text-white shadow-xs">{step}</span>
        <h2 className="font-display text-lg font-bold text-[#2a1f27]">{title}</h2>
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-neutral-700">
        {label}
        {hint && <span className="text-xs font-normal text-neutral-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100';

export default function Studio() {
  const params = useSearchParams();
  const fileRef = useRef(null);
  const musicFileRef = useRef(null);
  const audioPreviewRef = useRef(null);

  const urlTemplate = params.get('template');
  const savedSlug = params.get('saved');
  const formError = params.get('error');
  const [form, setForm] = useState(() => {
    let base = { ...DEFAULT_CARD };
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (saved?.form) base = pickFields(saved.form);
    } catch { /* ignore */ }
    if (urlTemplate) base = { ...base, templateId: urlTemplate };
    return base;
  });
  const [editingId, setEditingId] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY))?.editingId || null; } catch { return null; }
  });
  const [musicTab, setMusicTab] = useState(form.musicConfig.source === 'library' || form.musicConfig.source === 'none' ? 'library' : 'custom');
  const [musicTouched, setMusicTouched] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [musicUrlInput, setMusicUrlInput] = useState(form.musicConfig.source === 'url' ? form.musicConfig.url : '');
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [query, setQuery] = useState('');
  const [sharing, setSharing] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [errors, setErrors] = useState({});
  const [templates, setTemplates] = useState(TEMPLATES);
  const [musicLibrary, setMusicLibrary] = useState(MUSIC_LIBRARY);
  const playerState = usePlayer();

  useEffect(() => {
    api.catalog().then((data) => {
      if (data.templates?.length) setTemplates(data.templates);
      if (data.music?.length) setMusicLibrary(data.music);
    }).catch(() => {});
  }, []);

  const findTemplate = (id) => templates.find((t) => t.id === id) || templates[0] || getTemplate(id);
  const template = findTemplate(form.templateId);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const notify = useCallback((msg, type = 'ok') => {
    setToast({ msg, type, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const chooseTemplate = useCallback((id) => {
    const t = templates.find((x) => x.id === id) || templates[0] || getTemplate(id);
    if (!t) return;
    setForm((f) => ({
      ...f,
      templateId: t.id,
      musicConfig: !musicTouched && f.musicConfig.source === 'library'
        ? { source: 'library', trackId: t.defaultMusicId }
        : f.musicConfig,
    }));
  }, [musicTouched, templates]);

  useEffect(() => {
    const t = params.get('template');
    if (t) chooseTemplate(t);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, editingId }));
  }, [form, editingId]);

  const loadCards = useCallback(() => {
    setLoadingCards(true);
    api.listCards().then(setCards).catch((e) => notify(e.message, 'error')).finally(() => setLoadingCards(false));
  }, [notify]);
  useEffect(() => { loadCards(); }, [loadCards]);

  useEffect(() => () => player.stop(), []);

  // ---------- message suggestions ----------
  const suggest = (group) => {
    const pool = group.samples.filter((s) => fillMessage(s, form.recipientName) !== form.message);
    const sample = pool[Math.floor(Math.random() * pool.length)] || group.samples[0];
    set({ message: fillMessage(sample, form.recipientName) });
  };

  // ---------- photo ----------
  const onPhotoFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Vui lòng chọn file ảnh.', 'error');
    setUploading('photo');
    try {
      const { url } = await api.uploadPhoto(file);
      set({ photoUrl: url });
      notify('Đã tải ảnh lên 📸');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };
  const applyPhotoUrl = () => {
    const url = photoUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) return notify('Link ảnh cần bắt đầu bằng http:// hoặc https://', 'error');
    set({ photoUrl: url });
    setPhotoUrlInput('');
  };

  // ---------- music ----------
  const setMusic = (musicConfig) => {
    setMusicTouched(true);
    player.stop();
    set({ musicConfig });
  };
  const onMusicFile = async (file) => {
    if (!file) return;
    setUploading('music');
    try {
      const { url, name } = await api.uploadMusic(file);
      setMusic({ source: 'upload', url, title: name });
      notify('Đã tải nhạc lên 🎵');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setUploading(null);
      if (musicFileRef.current) musicFileRef.current.value = '';
    }
  };
  const applyMusicUrl = () => {
    const url = musicUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) return notify('Link nhạc cần bắt đầu bằng http:// hoặc https://', 'error');
    setMusic({ source: 'url', url, title: url.split('/').pop()?.split('?')[0] || 'Nhạc từ link' });
  };
  const previewTrack = (trackId) => {
    audioPreviewRef.current?.pause();
    player.toggle({ source: 'library', trackId });
  };

  // ---------- save / show ----------
  const validate = () => {
    const e = {};
    if (!form.recipientName.trim()) e.recipientName = 'Nhập tên người nhận nhé!';
    setErrors(e);
    if (e.recipientName) document.getElementById('recipientName')?.focus();
    return !Object.keys(e).length;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const card = editingId ? await api.updateCard(editingId, form) : await api.createCard(form);
      setEditingId(card.id);
      notify(editingId ? 'Đã cập nhật thiệp 💾' : 'Đã lưu vào danh sách lớp 🎉');
      setSharing(card);
      loadCards();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const prepareShow = () => {
    player.stop();
    try { sessionStorage.setItem(SHOW_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  };

  const newCard = () => {
    player.stop();
    setEditingId(null);
    setMusicTouched(false);
    setForm({ ...DEFAULT_CARD, templateId: form.templateId, musicConfig: { source: 'library', trackId: template.defaultMusicId } });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editCard = (card) => {
    player.stop();
    setForm(pickFields(card));
    setEditingId(card.id);
    setMusicTouched(true);
    setMusicTab(card.musicConfig?.source === 'upload' || card.musicConfig?.source === 'url' ? 'custom' : 'library');
    setMusicUrlInput(card.musicConfig?.source === 'url' ? card.musicConfig.url : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Đang sửa thiệp của ${card.recipientName}`);
  };

  const deleteCard = async (card) => {
    if (!window.confirm(`Xóa thiệp gửi "${card.recipientName}"?`)) return;
    try {
      await api.deleteCard(card.id);
      if (editingId === card.id) setEditingId(null);
      setCards((cs) => cs.filter((c) => c.id !== card.id));
      notify('Đã xóa thiệp');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const copyLink = async (card) => {
    const url = cardUrl(await shareBaseUrl(), card);
    try { await navigator.clipboard.writeText(url); } catch { window.prompt('Copy link thiệp:', url); }
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cards.filter((c) => `${c.recipientName} ${c.senderName}`.toLowerCase().includes(q)) : cards;
  }, [cards, query]);

  const isPlayingTrack = (cfg) => playerState.playing && playerState.key === musicKey(cfg);

  return (
    <div className="min-h-dvh">
      <NavBar />

      <div className="mx-auto max-w-[1340px] px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-white/90 px-3.5 py-1 text-xs font-bold text-[#be123c] shadow-xs">
              <Sparkles size={12} /> BloomNote Studio · Cá nhân hóa quà tặng 20/10
            </span>
            <h1 className="hg-title-grad mt-2 text-3xl font-bold sm:text-4xl">Phòng Thiết Kế & Chèn Nhạc</h1>
            <p className="mt-1 text-sm text-[#6f5965]">
              {editingId ? (
                <>Đang chỉnh sửa thiệp gửi <b className="text-[#e11d48]">{form.recipientName || '…'}</b></>
              ) : (
                'Điền thông tin bên trái — bản xem trước hoa nở & thư tay cập nhật tức thì bên phải.'
              )}
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={newCard} className="hg-btn-preview rounded-full px-4 py-2 text-sm">
              <Plus size={16} /> Tạo thiệp mới
            </button>
          )}
        </div>

        {formError ? (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {formError}
          </div>
        ) : null}
        {savedSlug ? (
          <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
            <p className="font-semibold">Đã lưu thiệp. Gửi link này cho bạn ấy:</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input readOnly className={inputCls} value={`/card/${savedSlug}`} />
              <a href={`/card/${savedSlug}?from=studio`} className="hg-btn-primary rounded-full px-4 py-2 text-sm">
                Xem thiệp
              </a>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* ================= LEFT: FORM ================= */}
          <form id="studio-form" action="/studio/save" method="post" encType="multipart/form-data" className="space-y-5">
            <input type="hidden" name="editingId" value={editingId || ''} />
            <input type="hidden" name="photoUrl" value={form.photoUrl || ''} />
            <input type="hidden" name="musicUrl" value={form.musicConfig?.url || ''} />
            <input type="hidden" name="musicTitle" value={form.musicConfig?.title || ''} />
            <Section step="1" title="Chọn mẫu giao diện">
              <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
                {templates.map((t) => {
                  const active = t.id === form.templateId;
                  return (
                    <label
                      key={t.id}
                      className={`relative w-32 shrink-0 snap-start overflow-hidden rounded-2xl text-left transition ${active ? 'ring-[3px] ring-rose-500 ring-offset-2' : 'ring-1 ring-neutral-200 hover:ring-rose-300'}`}
                    >
                      <input
                        type="radio"
                        name="templateId"
                        value={t.id}
                        defaultChecked={active}
                        onChange={() => chooseTemplate(t.id)}
                        className="sr-only"
                      />
                      <div className="flex h-20 justify-center overflow-hidden pt-1" style={{ background: t.themeColors.bgGradient }}>
                        <Flower template={t} bloom size={78} glow={false} instant />
                      </div>
                      <div className="bg-white px-2.5 py-2">
                        <p className="truncate text-xs font-semibold text-neutral-800">{t.name}</p>
                      </div>
                      {active && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white"><Check size={12} /></span>}
                    </label>
                  );
                })}
              </div>
            </Section>

            <Section step="2" title="Người nhận & người gửi">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Gửi tới (người nhận) *">
                  <input
                    id="recipientName"
                    name="recipientName"
                    required
                    className={`${inputCls} ${errors.recipientName ? '!border-rose-400 !ring-4 !ring-rose-100' : ''}`}
                    placeholder="VD: Bạn Ngọc Ánh xinh đẹp"
                    maxLength={80}
                    defaultValue={form.recipientName}
                    onChange={(e) => { set({ recipientName: e.target.value }); setErrors({}); }}
                  />
                  {errors.recipientName && <span className="mt-1 block text-xs text-rose-500">{errors.recipientName}</span>}
                </Field>
                <Field label="Từ (người gửi)">
                  <input name="senderName" className={inputCls} placeholder="VD: Hội con trai lớp 12A1" maxLength={80} defaultValue={form.senderName} onChange={(e) => set({ senderName: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section step="3" title="Nội dung bức thư">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500"><Sparkles size={13} /> Gợi ý lời chúc nhanh</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {MESSAGE_SUGGESTIONS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => suggest(g)}
                    className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100 active:scale-95"
                  >
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
              <Field label="Lời chúc" hint={`${form.message.length}/3000`}>
                <textarea
                  name="message"
                  className={`${inputCls} min-h-40 resize-y leading-relaxed`}
                  placeholder="Viết vài dòng thật lòng gửi bạn ấy…"
                  maxLength={3000}
                  defaultValue={form.message}
                  onChange={(e) => set({ message: e.target.value })}
                />
              </Field>
            </Section>

            <Section step="4" title="Ảnh kỷ niệm">
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200">
                  {form.photoUrl ? <img src={form.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-neutral-400">Chưa có ảnh</div>}
                  {uploading === 'photo' && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="animate-spin text-rose-500" /></div>}
                  {form.photoUrl && (
                    <button type="button" onClick={() => set({ photoUrl: '' })} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70" aria-label="Bỏ ảnh"><X size={12} /></button>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-3 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                    <input ref={fileRef} type="file" name="photo" accept="image/*" className="sr-only" onChange={(e) => onPhotoFile(e.target.files?.[0])} />
                    <ImagePlus size={18} /> Tải ảnh từ máy (hoặc kéo thả vào đây)
                  </label>
                  <div className="flex gap-2">
                    <input name="photoLink" className={inputCls} placeholder="…hoặc dán link ảnh https://" defaultValue={photoUrlInput} onChange={(e) => setPhotoUrlInput(e.target.value)} />
                    <button type="button" onClick={applyPhotoUrl} className="shrink-0 rounded-xl bg-neutral-800 px-3.5 text-sm font-medium text-white hover:bg-neutral-700">Dùng</button>
                  </div>
                </div>
              </div>

              <p className="mb-2 mt-4 text-xs font-medium text-neutral-500">Hoặc chọn sticker dễ thương</p>
              <div className="flex gap-2">
                {STICKERS.map((s) => (
                  <label
                    key={s.url}
                    title={s.name}
                    className={`h-14 w-14 overflow-hidden rounded-xl transition hover:scale-105 ${form.photoUrl === s.url ? 'ring-[3px] ring-rose-500 ring-offset-1' : 'ring-1 ring-neutral-200'}`}
                  >
                    <input
                      type="radio"
                      name="sticker"
                      value={s.url}
                      defaultChecked={form.photoUrl === s.url}
                      onChange={() => set({ photoUrl: s.url })}
                      className="sr-only"
                    />
                    <img src={s.url} alt={s.name} className="h-full w-full" />
                  </label>
                ))}
              </div>

              <p className="mb-2 mt-4 text-xs font-medium text-neutral-500">Kiểu khung ảnh</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PHOTO_FRAMES.map((f) => (
                  <label
                    key={f.id}
                    className={`rounded-xl px-2 py-2.5 text-center text-sm font-medium transition ${form.photoFrameStyle === f.id ? 'bg-rose-600 text-white shadow' : 'bg-neutral-50 text-neutral-600 ring-1 ring-neutral-200 hover:bg-rose-50'}`}
                  >
                    <input
                      type="radio"
                      name="photoFrameStyle"
                      value={f.id}
                      defaultChecked={form.photoFrameStyle === f.id}
                      onChange={() => set({ photoFrameStyle: f.id })}
                      className="sr-only"
                    />
                    <span className="mr-1">{FRAME_ICONS[f.id]}</span> {f.name}
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <Field label="Chú thích dưới ảnh" hint={`${form.photoCaption.length}/120`}>
                  <input name="photoCaption" className={inputCls} maxLength={120} placeholder="VD: Thanh xuân có cậu 💕" defaultValue={form.photoCaption} onChange={(e) => set({ photoCaption: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section
              step="5"
              title="Chèn nhạc nền"
              right={
                <div className="flex rounded-full bg-neutral-100 p-1 text-xs font-semibold">
                  {[['library', 'Kho nhạc'], ['custom', 'Upload / Link']].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setMusicTab(id)} className={`rounded-full px-3 py-1.5 transition ${musicTab === id ? 'bg-white text-rose-600 shadow' : 'text-neutral-500'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              }
            >
              {musicTab === 'library' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {musicLibrary.map((m) => {
                    const cfg = { source: 'library', trackId: m.id };
                    const selected = form.musicConfig.source === 'library' && form.musicConfig.trackId === m.id;
                    const playing = isPlayingTrack(cfg);
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition ${selected ? 'bg-rose-50 ring-2 ring-rose-400' : 'bg-neutral-50 ring-1 ring-neutral-200 hover:bg-rose-50/50'}`}
                      >
                        <input
                          type="radio"
                          name="music"
                          value={`library:${m.id}`}
                          defaultChecked={selected}
                          onChange={() => setMusic(cfg)}
                          className="sr-only"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); previewTrack(m.id); }}
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow transition ${playing ? 'bg-rose-600' : 'bg-neutral-800 hover:bg-rose-600'}`}
                          aria-label={playing ? 'Dừng nghe thử' : 'Nghe thử'}
                        >
                          {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
                        </button>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-800">{m.name}</p>
                          <p className="truncate text-xs text-neutral-500">{m.mood} · {m.bpm} BPM</p>
                        </div>
                        {selected && <Check size={18} className="ml-auto shrink-0 text-rose-500" />}
                      </label>
                    );
                  })}
                  <label
                    className={`rounded-2xl p-3 text-center text-sm font-medium sm:col-span-2 ${form.musicConfig.source === 'none' ? 'bg-neutral-800 text-white' : 'bg-neutral-50 text-neutral-500 ring-1 ring-neutral-200 hover:bg-neutral-100'}`}
                  >
                    <input
                      type="radio"
                      name="music"
                      value="none"
                      defaultChecked={form.musicConfig.source === 'none'}
                      onChange={() => setMusic({ source: 'none' })}
                      className="sr-only"
                    />
                    🔕 Không dùng nhạc nền
                  </label>
                  <p className="text-xs text-neutral-400 sm:col-span-2">Nhạc trong kho được tổng hợp trực tiếp bằng Web Audio API — không cần tải file, phát mượt cả khi mạng yếu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/40 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50">
                    <input ref={musicFileRef} type="file" name="musicFile" accept=".mp3,.wav,.m4a,.ogg,.aac,audio/*" className="sr-only" onChange={(e) => onMusicFile(e.target.files?.[0])} />
                    {uploading === 'music' ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Chọn file nhạc (.mp3 / .wav / .m4a)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input name="musicLink" className={`${inputCls} pl-9`} placeholder="Dán link nhạc trực tiếp (https://…/bai-hat.mp3)" defaultValue={musicUrlInput} onChange={(e) => setMusicUrlInput(e.target.value)} />
                    </div>
                    <button type="button" onClick={applyMusicUrl} className="shrink-0 rounded-xl bg-neutral-800 px-3.5 text-sm font-medium text-white hover:bg-neutral-700">Dùng</button>
                  </div>
                  <input type="radio" name="music" value="url" defaultChecked={form.musicConfig.source === 'url'} className="sr-only" />
                  <p className="text-xs text-neutral-400">Link cần trỏ thẳng tới file audio (không dùng link trang YouTube/Spotify).</p>

                  {(form.musicConfig.source === 'upload' || form.musicConfig.source === 'url') && (
                    <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-700">
                        <Music2 size={15} /> <span className="truncate">{form.musicConfig.title || 'Nhạc của bạn'}</span>
                      </p>
                      <audio ref={audioPreviewRef} src={form.musicConfig.url} controls preload="none" className="w-full" onPlay={() => player.stop()} />
                    </div>
                  )}
                </div>
              )}
            </Section>

            <div className="sticky bottom-3 z-20 grid grid-cols-2 gap-3 rounded-3xl border border-rose-500/15 bg-white/90 p-3 shadow-[0_14px_40px_rgba(42,31,39,0.14)] backdrop-blur-xl">
              <button
                type="submit"
                className="hg-btn-primary rounded-2xl py-3.5 text-sm"
              >
                <Save size={18} />
                {editingId ? 'Cập nhật thiệp' : 'Lưu & Tạo Link Thiệp'}
              </button>
              <button
                type="submit"
                formAction="/studio/preview"
                className="hg-btn-preview rounded-2xl py-3.5 text-sm"
              >
                <Wand2 size={18} /> Trình Chiếu Ngay
              </button>
            </div>
          </form>

          {/* ================= RIGHT: PREVIEW + LIST ================= */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="themed relative overflow-hidden rounded-[30px] p-5 shadow-[0_20px_60px_rgba(216,27,96,0.15)] sm:p-7" style={themeVars(template)}>
              <ParticleCanvas type={template.particleType} colors={template.themeColors} density={0.4} fixed={false} />
              <div className="relative mb-4 flex items-center justify-between">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] shadow-sm">Xem trước · {template.name}</span>
                <button type="submit" form="studio-form" formAction="/studio/preview" className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-white">
                  <Eye size={13} /> Toàn màn hình
                </button>
              </div>
              <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  {form.photoUrl ? (
                    <PhotoFrame style={form.photoFrameStyle} src={form.photoUrl} caption={form.photoCaption} width={170} />
                  ) : (
                    <Flower template={template} bloom size={150} />
                  )}
                </div>
                <div className="w-full min-w-0 flex-1">
                  <LetterCard key={form.templateId} card={form} compact />
                </div>
              </div>
            </div>

            <section className="rounded-3xl bg-white p-5 shadow-[0_6px_30px_rgba(216,27,96,0.06)] ring-1 ring-rose-100">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-semibold text-neutral-800">Thiệp đã chuẩn bị cho lớp</h2>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">{cards.length}</span>
              </div>
              {cards.length > 3 && (
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input className={`${inputCls} py-2 pl-9 text-sm`} placeholder="Tìm theo tên…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              )}

              {loadingCards ? (
                <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />)}</div>
              ) : filteredCards.length === 0 ? (
                <div className="rounded-2xl bg-rose-50/50 p-6 text-center text-sm text-neutral-500">
                  {cards.length ? 'Không tìm thấy thiệp nào.' : 'Chưa có thiệp nào. Hãy tạo tấm thiệp đầu tiên cho lớp nhé! 💐'}
                </div>
              ) : (
                <ul className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {filteredCards.map((c) => {
                      const t = findTemplate(c.templateId);
                      return (
                        <motion.li
                          key={c.id}
                          layout
                          initial={false}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center gap-3 rounded-2xl p-2.5 ring-1 transition ${editingId === c.id ? 'bg-rose-50 ring-rose-300' : 'ring-neutral-100 hover:bg-neutral-50'}`}
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl" style={{ background: t.themeColors.bgGradient }}>
                            {c.photoUrl ? <img src={c.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xl">🌸</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-800">{c.recipientName}</p>
                            <p className="truncate text-xs text-neutral-500">
                              {t.name} · {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                              {c.views ? ` · 👀 ${c.views}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <a
                              href={`/card/${c.slug}?from=studio`}
                              title="Xem"
                              aria-label="Xem"
                              className="rounded-lg p-2 text-neutral-500 transition hover:bg-rose-100 hover:text-rose-600"
                            >
                              <Eye size={16} />
                            </a>
                            {[
                              { icon: Pencil, label: 'Sửa', onClick: () => editCard(c) },
                              { icon: copiedId === c.id ? Check : Copy, label: 'Copy link', onClick: () => copyLink(c) },
                              { icon: QrCode, label: 'Mã QR', onClick: () => setSharing(c) },
                              { icon: Trash2, label: 'Xóa', onClick: () => deleteCard(c), danger: true },
                            ].map(({ icon: Icon, label, onClick, danger }) => (
                              <button
                                key={label}
                                type="button"
                                onClick={onClick}
                                title={label}
                                aria-label={label}
                                className={`rounded-lg p-2 transition ${danger ? 'text-neutral-400 hover:bg-red-50 hover:text-red-500' : 'text-neutral-500 hover:bg-rose-100 hover:text-rose-600'}`}
                              >
                                <Icon size={16} />
                              </button>
                            ))}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-xl ${toast.type === 'error' ? 'bg-red-500' : 'bg-neutral-900'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {sharing && (
        <ShareModal
          card={sharing}
          onClose={() => setSharing(null)}
          openHref={`/card/${sharing.slug}?from=studio`}
        />
      )}
    </div>
  );
}
