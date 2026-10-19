import './globals.css';

export const metadata = {
  title: 'BloomNote 20/10: Tiệm Hoa & Thiệp Kỹ Thuật Số Cá Nhân Hóa',
  description:
    'BloomNote · Tiệm Hoa & Thiệp 20/10 Online - Tạo website quà tặng hoa nở, thư tay và nhạc cá nhân hóa.',
};

export const viewport = {
  themeColor: '#fdf8fa',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Dancing+Script:wght@500;600;700&family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Great+Vibes&family=Pacifico&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
