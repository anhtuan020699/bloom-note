import { cookies } from 'next/headers';
import Admin from '../../src/views/Admin.jsx';

const API = process.env.API_URL || 'http://127.0.0.1:4000';

export default async function AdminPage({ searchParams }) {
  const tab = (await searchParams)?.tab || 'overview';
  const token = (await cookies()).get('bloomnote-admin')?.value || '';
  let user = null;
  let catalog = { categories: [], templates: [], music: [] };
  let cards = [];
  let health = null;
  if (token) {
    try {
      const res = await fetch(`${API}/api/admin/session`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user || null;
      }
    } catch { /* ignore */ }
  }
  if (user) {
    try {
      const [c, list, h] = await Promise.all([
        fetch(`${API}/api/catalog`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`${API}/api/cards`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`${API}/api/health`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      ]);
      catalog = c;
      cards = list || [];
      health = h;
    } catch { /* ignore */ }
  }
  return (
    <Admin
      initialUser={user}
      initialToken={token}
      initialCatalog={catalog}
      initialCards={cards}
      initialHealth={health}
      initialTab={tab}
    />
  );
}
