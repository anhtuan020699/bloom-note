'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Cake, CalendarHeart, Database, Eye, Gift, Heart, LayoutDashboard, LayoutGrid,
  Loader2, Lock, LogOut, Pencil, Plus, Save, Search, Shield, Sparkles, Trash2, UserRound, X,
} from 'lucide-react';
import { BrandLogo } from '../components/NavBar.jsx';
import Toast from '../components/Toast.jsx';
import { adminToken, api } from '../lib/api.js';

const ICONS = {
  'layout-grid': LayoutGrid,
  heart: Heart,
  sparkles: Sparkles,
  'calendar-heart': CalendarHeart,
  gift: Gift,
  cake: Cake,
};

const TABS = [
  { id: 'overview', label: 'Tổng quan', Icon: LayoutDashboard },
  { id: 'categories', label: 'Danh mục', Icon: LayoutGrid },
  { id: 'templates', label: 'Mẫu thiệp', Icon: Gift },
  { id: 'cards', label: 'Thiệp đã tạo', Icon: Heart },
];

const fieldCls =
  'w-full rounded-xl border border-rose-500/15 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100';

function formatTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', { hour12: false });
  } catch {
    return iso;
  }
}

export default function Admin({
  initialUser = null,
  initialToken = '',
  initialCatalog = { categories: [], templates: [], music: [] },
  initialCards = [],
  initialHealth = null,
  initialTab = 'overview',
}) {
  const [authed, setAuthed] = useState(Boolean(initialUser));
  const [checking, setChecking] = useState(false);
  const [me, setMe] = useState(initialUser);

  const allowedTabs = TABS.map((t) => t.id);
  const [tab, setTab] = useState(allowedTabs.includes(initialTab) ? initialTab : 'overview');
  useEffect(() => {
    if (allowedTabs.includes(initialTab)) setTab(initialTab);
  }, [initialTab]);
  const [health, setHealth] = useState(initialHealth);
  const [categories, setCategories] = useState(initialCatalog.categories || []);
  const [templates, setTemplates] = useState(initialCatalog.templates || []);
  const [music, setMusic] = useState(initialCatalog.music || []);
  const [cards, setCards] = useState(initialCards);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = 'ok') => {
    setToast({ msg, type, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (initialToken) adminToken.set(initialToken);
    const err = new URLSearchParams(window.location.search).get('error');
    if (err) notify(err, 'error');
    if (initialUser) return;
    const token = adminToken.get();
    if (!token) return;
    setChecking(true);
    api.adminSession()
      .then((data) => {
        setMe(data.user || null);
        setAuthed(true);
      })
      .catch(() => adminToken.set(''))
      .finally(() => setChecking(false));
  }, [notify, initialToken, initialUser]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalog, list, stats] = await Promise.all([
        api.catalog(),
        api.listCards(),
        api.health().catch(() => null),
      ]);
      setCategories(catalog.categories || []);
      setTemplates(catalog.templates || []);
      setMusic(catalog.music || []);
      setCards(list || []);
      setHealth(stats);
    } catch (err) {
      notify(err.message || 'Không tải được dữ liệu.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#fdf8fa] text-[#be123c]">
        <Loader2 className="animate-spin" size={28} />
        <Toast toast={toast} />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(255,228,238,0.85),transparent_60%),#fdf8fa] px-4">
        <Toast toast={toast} />
        <form
          method="post"
          action="/admin/auth"
          className="w-full max-w-md rounded-[28px] border border-rose-500/12 bg-white/95 p-7 shadow-[0_24px_60px_-24px_rgba(90,40,65,0.25)]"
        >
          <BrandLogo />
          <h1 className="mt-5 text-2xl font-bold text-[#2a1f27]">Trang quản trị</h1>
          <p className="mt-1 text-sm text-[#6f5965]">Tài khoản: <b>admin</b> · Mật khẩu: <b>admin</b></p>
          <label className="mt-6 block text-sm font-medium text-[#2a1f27]">
            Tài khoản
            <input
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              className={`${fieldCls} mt-1.5`}
              defaultValue="admin"
              placeholder="admin"
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-[#2a1f27]">
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className={`${fieldCls} mt-1.5`}
              defaultValue="admin"
              placeholder="Nhập mật khẩu"
            />
          </label>
          <button
            type="submit"
            className="hg-btn-primary mt-5 w-full justify-center rounded-full py-3 text-sm"
          >
            <Lock size={16} />
            Vào trang admin
          </button>
          <a href="/" className="mt-4 block text-center text-sm font-semibold text-[#be123c] hover:underline">
            Về cửa hàng
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fdf8fa]">
      <header className="sticky top-0 z-30 border-b border-rose-500/12 bg-[#fffcfd]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Về cửa hàng"><BrandLogo /></a>
            <span className="hidden items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#be123c] sm:inline-flex">
              <Shield size={12} /> Admin
            </span>
            {me?.username && (
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6f5965] ring-1 ring-rose-500/15 sm:inline-flex">
                <UserRound size={12} /> {me.username}
              </span>
            )}
            {health?.db && (
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6f5965] ring-1 ring-rose-500/15 md:inline-flex">
                <Database size={12} /> {health.db}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="rounded-full border border-rose-500/15 bg-white px-3 py-2 text-xs font-semibold text-[#5a4550] hover:bg-rose-50">
              Làm mới
            </button>
            <form method="post" action="/admin/logout">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#2a1f27] px-3 py-2 text-xs font-semibold text-white">
                <LogOut size={13} /> Thoát
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1340px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="flex gap-2 overflow-x-auto lg:block lg:space-y-1.5">
          {TABS.map(({ id, label, Icon }) => (
            <a
              key={id}
              href={id === 'overview' ? '/admin' : `/admin?tab=${id}`}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? 'bg-[linear-gradient(135deg,#be123c,#e11d48)] text-white shadow-xs'
                  : 'bg-white text-[#5a4550] ring-1 ring-rose-500/10 hover:bg-rose-50'
              }`}
            >
              <Icon size={15} /> {label}
            </a>
          ))}
        </aside>

        <main className="min-w-0">
          {loading && (
            <p className="mb-4 inline-flex items-center gap-2 text-sm text-[#be123c]">
              <Loader2 size={14} className="animate-spin" /> Đang tải…
            </p>
          )}
          {tab === 'overview' && (
            <Overview health={health} categories={categories} templates={templates} cards={cards} />
          )}
          {tab === 'categories' && (
            <CategoriesPanel
              categories={categories}
              templates={templates}
              onChange={load}
              notify={notify}
            />
          )}
          {tab === 'templates' && (
            <TemplatesPanel
              categories={categories}
              templates={templates}
              music={music}
              onChange={load}
              notify={notify}
            />
          )}
          {tab === 'cards' && (
            <CardsPanel cards={cards} templates={templates} onChange={load} notify={notify} />
          )}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

function Stat({ label, value, href }) {
  return (
    <a
      href={href}
      className="rounded-[22px] border border-rose-500/12 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-rose-500/25"
    >
      <p className="text-xs font-bold tracking-wide text-[#9a8490] uppercase">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[#2a1f27]">{value}</p>
    </a>
  );
}

function Overview({ health, categories, templates, cards }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2a1f27]">Bảng điều khiển</h1>
      <p className="mt-1 text-sm text-[#6f5965]">Sửa catalog ở đây — Shop đọc trực tiếp từ API.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Danh mục" value={categories.length} href="/admin?tab=categories" />
        <Stat label="Mẫu thiệp" value={templates.length} href="/admin?tab=templates" />
        <Stat label="Thiệp đã tạo" value={cards.length} href="/admin?tab=cards" />
        <Stat label="Lượt xem" value={cards.reduce((n, c) => n + (c.views || 0), 0)} href="/admin?tab=cards" />
      </div>
      <div className="mt-5 rounded-[22px] border border-rose-500/12 bg-white p-5 text-sm text-[#5a4550]">
        <p><b>Database:</b> {health?.db || '—'}</p>
        <p className="mt-1">Mẫu mới clone scene 3D có sẵn (lucky / matrix / vip…). Scene code vẫn nằm ở frontend.</p>
      </div>
    </div>
  );
}

function CategoriesPanel({ categories, templates, onChange, notify }) {
  const [form, setForm] = useState({ label: '', labelEn: '', icon: 'gift' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const countOf = (id) => templates.filter((t) => t.category === id).length;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateCategory(editing, form);
        notify('Đã lưu danh mục.');
      } else {
        await api.createCategory(form);
        notify('Đã thêm danh mục.');
      }
      setForm({ label: '', labelEn: '', icon: 'gift' });
      setEditing(null);
      await onChange();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm(`Xoá danh mục “${id}”?`)) return;
    try {
      await api.deleteCategory(id);
      notify('Đã xoá danh mục.');
      if (editing === id) {
        setEditing(null);
        setForm({ label: '', labelEn: '', icon: 'gift' });
      }
      await onChange();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-[22px] border border-rose-500/12 bg-white p-5">
        <h2 className="text-lg font-bold text-[#2a1f27]">Danh mục cửa hàng</h2>
        <ul className="mt-4 space-y-2">
          {categories.map((c) => {
            const Icon = ICONS[c.icon] || Gift;
            return (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-rose-500/10 px-3 py-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-[#e11d48]">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#2a1f27]">{c.label}</p>
                  <p className="text-xs text-[#9a8490]">{c.id} · {c.labelEn || '—'} · {countOf(c.id)} mẫu</p>
                </div>
                <button type="button" className="rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-[#be123c]" onClick={() => { setEditing(c.id); setForm({ label: c.label, labelEn: c.labelEn || '', icon: c.icon || 'gift' }); }}>
                  <Pencil size={15} />
                </button>
                {c.id !== 'all' && (
                  <button type="button" className="rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(c.id)}>
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <form onSubmit={submit} className="h-fit rounded-[22px] border border-rose-500/12 bg-white p-5">
        <h3 className="font-bold text-[#2a1f27]">{editing ? `Sửa “${editing}”` : 'Thêm danh mục'}</h3>
        <label className="mt-4 block text-sm font-medium">Tên tiếng Việt
          <input className={`${fieldCls} mt-1`} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required />
        </label>
        <label className="mt-3 block text-sm font-medium">Tên tiếng Anh
          <input className={`${fieldCls} mt-1`} value={form.labelEn} onChange={(e) => setForm((f) => ({ ...f, labelEn: e.target.value }))} />
        </label>
        <label className="mt-3 block text-sm font-medium">Icon
          <select className={`${fieldCls} mt-1`} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
            {Object.keys(ICONS).map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
        <div className="mt-4 flex gap-2">
          <button type="submit" disabled={saving} className="hg-btn-primary flex-1 justify-center rounded-full py-2.5 text-sm">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {editing ? 'Lưu' : 'Thêm'}
          </button>
          {editing && (
            <button type="button" className="rounded-full border border-rose-500/15 px-3 text-sm" onClick={() => { setEditing(null); setForm({ label: '', labelEn: '', icon: 'gift' }); }}>
              <X size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function TemplatesPanel({ categories, templates, music, onChange, notify }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label || id;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? templates.filter((t) => `${t.name} ${t.category} ${t.id}`.toLowerCase().includes(q)) : templates;
  }, [templates, query]);

  const openEdit = (t) => {
    setCreating(false);
    setEditing(t.id);
    setForm({
      name: t.name,
      category: t.category,
      description: t.description || '',
      tagText: t.tagText || '',
      ribbon: t.ribbon || '',
      ribbonText: t.ribbonText || '',
      scene3d: t.scene3d || '',
      flowerType: t.flowerType || '',
      defaultMusicId: t.defaultMusicId || '',
      primary: t.themeColors?.primary || '#e11d48',
      secondary: t.themeColors?.secondary || '#a21caf',
    });
  };

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({
      name: '',
      cloneFrom: templates[0]?.id || '',
      category: categories.find((c) => c.id !== 'all')?.id || 'playful',
      description: '',
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (creating) {
        await api.createTemplate({
          name: form.name,
          cloneFrom: form.cloneFrom,
          category: form.category,
          description: form.description,
        });
        notify('Đã tạo mẫu (clone scene).');
      } else {
        await api.updateTemplate(editing, {
          name: form.name,
          category: form.category,
          description: form.description,
          tagText: form.tagText,
          ribbon: form.ribbon,
          ribbonText: form.ribbonText,
          scene3d: form.scene3d,
          flowerType: form.flowerType,
          defaultMusicId: form.defaultMusicId,
          themeColors: { primary: form.primary, secondary: form.secondary },
        });
        notify('Đã lưu mẫu.');
      }
      setCreating(false);
      setEditing(null);
      setForm(null);
      await onChange();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Xoá mẫu “${t.name}”?`)) return;
    try {
      await api.deleteTemplate(t.id);
      notify('Đã xoá mẫu.');
      if (editing === t.id) {
        setEditing(null);
        setForm(null);
      }
      await onChange();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const scenes = [...new Set(templates.map((t) => t.scene3d).filter(Boolean))];
  const flowers = [...new Set(templates.map((t) => t.flowerType).filter(Boolean))];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="rounded-[22px] border border-rose-500/12 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#2a1f27]">Mẫu thiệp</h2>
          <button type="button" onClick={openCreate} className="hg-btn-primary rounded-full px-3.5 py-2 text-xs">
            <Plus size={14} /> Thêm mẫu
          </button>
        </div>
        <div className="relative mt-4">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9a8490]" />
          <input className={`${fieldCls} pl-9`} placeholder="Tìm mẫu…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <ul className="mt-4 space-y-2">
          {shown.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-rose-500/10 px-3 py-2.5">
              <span className="h-10 w-10 shrink-0 rounded-xl" style={{ background: t.themeColors?.bgGradient || t.themeColors?.primary }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#2a1f27]">{t.name}</p>
                <p className="text-xs text-[#9a8490]">{catLabel(t.category)} · {t.scene3d || 'no-scene'} · {t.id}</p>
              </div>
              <a href={`/preview/${t.id}`} className="rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-[#be123c]" title="Xem trước">
                <Eye size={15} />
              </a>
              <button type="button" className="rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-[#be123c]" onClick={() => openEdit(t)}>
                <Pencil size={15} />
              </button>
              <button type="button" className="rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(t)}>
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {form && (
        <form onSubmit={save} className="h-fit rounded-[22px] border border-rose-500/12 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#2a1f27]">{creating ? 'Thêm mẫu (clone)' : 'Sửa mẫu'}</h3>
            <button type="button" onClick={() => { setForm(null); setEditing(null); setCreating(false); }} className="rounded-full p-1.5 hover:bg-rose-50">
              <X size={16} />
            </button>
          </div>
          <label className="mt-4 block text-sm font-medium">Tên mẫu
            <input className={`${fieldCls} mt-1`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          {creating && (
            <label className="mt-3 block text-sm font-medium">Clone scene từ
              <select className={`${fieldCls} mt-1`} value={form.cloneFrom} onChange={(e) => setForm((f) => ({ ...f, cloneFrom: e.target.value }))}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          )}
          <label className="mt-3 block text-sm font-medium">Danh mục
            <select className={`${fieldCls} mt-1`} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium">Mô tả
            <textarea className={`${fieldCls} mt-1 min-h-24`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          {!creating && (
            <>
              <label className="mt-3 block text-sm font-medium">Tag
                <input className={`${fieldCls} mt-1`} value={form.tagText} onChange={(e) => setForm((f) => ({ ...f, tagText: e.target.value }))} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-sm font-medium">Ribbon
                  <select className={`${fieldCls} mt-1`} value={form.ribbon} onChange={(e) => setForm((f) => ({ ...f, ribbon: e.target.value }))}>
                    <option value="">Không</option>
                    <option value="super-hot">super-hot</option>
                    <option value="hot">hot</option>
                    <option value="new">new</option>
                  </select>
                </label>
                <label className="text-sm font-medium">Chữ ribbon
                  <input className={`${fieldCls} mt-1`} value={form.ribbonText} onChange={(e) => setForm((f) => ({ ...f, ribbonText: e.target.value }))} />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Scene 3D
                <select className={`${fieldCls} mt-1`} value={form.scene3d} onChange={(e) => setForm((f) => ({ ...f, scene3d: e.target.value }))}>
                  <option value="">Không</option>
                  {scenes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="mt-3 block text-sm font-medium">Kiểu hoa
                <select className={`${fieldCls} mt-1`} value={form.flowerType} onChange={(e) => setForm((f) => ({ ...f, flowerType: e.target.value }))}>
                  {flowers.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="mt-3 block text-sm font-medium">Nhạc mặc định
                <select className={`${fieldCls} mt-1`} value={form.defaultMusicId} onChange={(e) => setForm((f) => ({ ...f, defaultMusicId: e.target.value }))}>
                  {music.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-sm font-medium">Màu chính
                  <input type="color" className="mt-1 h-10 w-full rounded-lg border border-rose-500/15" value={form.primary} onChange={(e) => setForm((f) => ({ ...f, primary: e.target.value }))} />
                </label>
                <label className="text-sm font-medium">Màu phụ
                  <input type="color" className="mt-1 h-10 w-full rounded-lg border border-rose-500/15" value={form.secondary} onChange={(e) => setForm((f) => ({ ...f, secondary: e.target.value }))} />
                </label>
              </div>
            </>
          )}
          <button type="submit" disabled={saving} className="hg-btn-primary mt-4 w-full justify-center rounded-full py-2.5 text-sm">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {creating ? 'Tạo mẫu' : 'Lưu mẫu'}
          </button>
        </form>
      )}
    </div>
  );
}

function CardsPanel({ cards, templates, onChange, notify }) {
  const [query, setQuery] = useState('');
  const nameOf = (id) => templates.find((t) => t.id === id)?.name || id;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? cards.filter((c) => `${c.recipientName} ${c.senderName} ${c.slug}`.toLowerCase().includes(q))
      : cards;
  }, [cards, query]);

  const remove = async (card) => {
    if (!window.confirm(`Xoá thiệp gửi “${card.recipientName}”?`)) return;
    try {
      await api.deleteCard(card.id);
      notify('Đã xoá thiệp.');
      await onChange();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <section className="rounded-[22px] border border-rose-500/12 bg-white p-5">
      <h2 className="text-lg font-bold text-[#2a1f27]">Thiệp đã tạo</h2>
      <div className="relative mt-4">
        <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9a8490]" />
        <input className={`${fieldCls} pl-9`} placeholder="Tìm theo tên, slug…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-[#9a8490] uppercase">
            <tr>
              <th className="pb-2 font-bold">Người nhận</th>
              <th className="pb-2 font-bold">Người gửi</th>
              <th className="pb-2 font-bold">Mẫu</th>
              <th className="pb-2 font-bold">Xem</th>
              <th className="pb-2 font-bold">Tạo lúc</th>
              <th className="pb-2 font-bold" />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-[#9a8490]">Chưa có thiệp nào.</td></tr>
            )}
            {shown.map((c) => (
              <tr key={c.id} className="border-t border-rose-500/8">
                <td className="py-3 font-semibold text-[#2a1f27]">{c.recipientName}</td>
                <td className="py-3 text-[#5a4550]">{c.senderName || '—'}</td>
                <td className="py-3 text-[#5a4550]">{nameOf(c.templateId)}</td>
                <td className="py-3">{c.views || 0}</td>
                <td className="py-3 text-[#9a8490]">{formatTime(c.createdAt)}</td>
                <td className="py-3 text-right">
                  <a href={`/card/${c.slug}`} className="mr-1 inline-flex rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-[#be123c]">
                    <Eye size={15} />
                  </a>
                  <button type="button" onClick={() => remove(c)} className="inline-flex rounded-full p-2 text-[#6f5965] hover:bg-rose-50 hover:text-rose-700">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
