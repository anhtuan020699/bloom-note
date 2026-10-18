export const themeVars = (template) => {
  const c = template.themeColors;
  return {
    '--bg': c.bgGradient,
    '--primary': c.primary,
    '--secondary': c.secondary,
    '--accent': c.accent,
    '--card-bg': c.cardBg,
    '--text': c.textColor,
    '--ink': c.ink || c.primary,
  };
};

export const DEFAULT_CARD = {
  templateId: 'pastel-rose',
  recipientName: '',
  senderName: '',
  message: '',
  photoUrl: '/stickers/cat.svg',
  photoFrameStyle: 'polaroid',
  photoCaption: 'Thanh xuân có cậu 💕',
  musicConfig: { source: 'library', trackId: 'piano-youth' },
};

export const DEMO_CARD = {
  ...DEFAULT_CARD,
  recipientName: 'Bạn Ngọc Ánh xinh đẹp',
  senderName: 'Hội con trai lớp 12A1',
  message:
    'Gửi Ngọc Ánh thân mến,\nChúc cậu một ngày 20/10 thật rực rỡ, luôn cười tươi như đóa hoa đang nở này. Cảm ơn cậu vì đã làm lớp mình vui hơn mỗi ngày. Học thật giỏi và luôn hạnh phúc nhé! 🌸',
};

export const STICKERS = [
  { url: '/stickers/cat.svg', name: 'Mèo hồng' },
  { url: '/stickers/bunny.svg', name: 'Thỏ bông' },
  { url: '/stickers/bear.svg', name: 'Gấu mật' },
  { url: '/stickers/girl.svg', name: 'Bé hoa' },
];
