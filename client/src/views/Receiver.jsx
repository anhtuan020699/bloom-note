'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Wand2 } from 'lucide-react';
import { getTemplate } from '@shared/templates.js';
import GiftScene from '../components/GiftScene.jsx';
import ShareModal from '../components/ShareModal.jsx';
import NotFound from './NotFound.jsx';
import { api } from '../lib/api.js';
import { DEMO_CARD, DEFAULT_CARD } from '../lib/theme.js';

export const SHOW_KEY = 'tiemhoa:show';

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="text-center text-rose-700">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
        <p className="mt-4 font-display text-lg">Đang gói quà…</p>
      </div>
    </div>
  );
}

export function CardPage({ initialCard = null, initialError = '' }) {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const owner = searchParams.get('from') === 'studio';
  const [card, setCard] = useState(initialCard);
  const [template, setTemplate] = useState(() => (initialCard ? getTemplate(initialCard.templateId) : null));
  const [error, setError] = useState(initialError);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    api.getCard(slug, { countView: !owner }).then(setCard, (e) => setError(e.message));
  }, [slug, owner]);

  useEffect(() => {
    if (!card?.templateId) return;
    api.templates()
      .then((list) => setTemplate(list.find((t) => t.id === card.templateId) || getTemplate(card.templateId)))
      .catch(() => setTemplate(getTemplate(card.templateId)));
  }, [card]);

  if (error) return <NotFound title="Không tìm thấy thiệp" message={error} />;
  if (!card || !template) return <Loading />;
  return (
    <>
      <GiftScene
        card={card}
        template={template}
        owner={owner}
        backHref={owner ? '/studio' : '/'}
        onShare={() => setSharing(true)}
      />
      {sharing && <ShareModal card={card} onClose={() => setSharing(false)} />}
    </>
  );
}

export function ShowPage({ preview }) {
  const [card] = useState(() => {
    if (preview?.templateId || preview?.recipientName) return preview;
    try {
      const live = JSON.parse(sessionStorage.getItem(SHOW_KEY));
      if (live) return live;
    } catch { /* ignore */ }
    try {
      const draft = JSON.parse(localStorage.getItem('tiemhoa:draft'));
      if (draft?.form) return draft.form;
    } catch { /* ignore */ }
    return DEMO_CARD;
  });
  return (
    <GiftScene
      card={{ ...DEFAULT_CARD, ...card }}
      template={getTemplate(card.templateId)}
      owner
      backHref="/studio"
    />
  );
}

export function PreviewPage() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(() => getTemplate(templateId));

  useEffect(() => {
    api.templates()
      .then((list) => setTemplate(list.find((t) => t.id === templateId) || getTemplate(templateId)))
      .catch(() => setTemplate(getTemplate(templateId)));
  }, [templateId]);

  if (!template) return <Loading />;
  const card = { ...DEMO_CARD, templateId: template.id, musicConfig: { source: 'library', trackId: template.defaultMusicId } };

  return (
    <GiftScene
      key={template.id}
      card={card}
      template={template}
      owner
      backHref="/"
      extraActions={
        <a
          href={`/studio?template=${template.id}`}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow"
          style={{ background: `linear-gradient(135deg, ${template.themeColors.primary}, ${template.themeColors.secondary})` }}
        >
          <Wand2 size={15} /> Chọn mẫu này
        </a>
      }
    />
  );
}
