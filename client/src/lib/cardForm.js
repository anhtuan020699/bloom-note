export function originOf(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '127.0.0.1:5173';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export function cardFromForm(form) {
  const music = String(form.get('music') || 'library:piano-youth');
  let musicConfig;
  if (music === 'none') {
    musicConfig = { source: 'none' };
  } else if (music === 'url' || music === 'upload') {
    musicConfig = {
      source: music,
      url: String(form.get('musicLink') || form.get('musicUrl') || '').trim(),
      title: String(form.get('musicTitle') || '').trim(),
    };
  } else {
    const trackId = music.startsWith('library:') ? music.slice(8) : String(form.get('musicTrackId') || 'piano-youth');
    musicConfig = { source: 'library', trackId };
  }

  const photoLink = String(form.get('photoLink') || '').trim();
  const sticker = String(form.get('sticker') || '').trim();
  const photoUrl = photoLink || sticker || String(form.get('photoUrl') || '').trim();

  return {
    templateId: String(form.get('templateId') || '').trim(),
    recipientName: String(form.get('recipientName') || '').trim(),
    senderName: String(form.get('senderName') || '').trim(),
    message: String(form.get('message') || ''),
    photoUrl,
    photoFrameStyle: String(form.get('photoFrameStyle') || 'polaroid'),
    photoCaption: String(form.get('photoCaption') || '').trim(),
    musicConfig,
  };
}
