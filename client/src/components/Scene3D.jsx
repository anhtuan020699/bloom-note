import { memo, useEffect, useMemo, useRef } from 'react';
import { MoveHorizontal, Rotate3d, Sparkles, Volume2 } from 'lucide-react';
import Flower from './Flower.jsx';

/* ============================================================
   1. ZERO-RERENDER 3D TILT + SPECULAR GLARE WRAPPER (Direct DOM)
   ============================================================ */
export const Tilt3DWrapper = memo(function Tilt3DWrapper({
  children,
  className = '',
  maxTilt = 10,
  glare = true,
  scale = 1.015,
  style,
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(0);

  const onMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / Math.max(1, r.width);
      const y = (clientY - r.top) / Math.max(1, r.height);
      const ry = ((x - 0.5) * maxTilt * 2).toFixed(2);
      const rx = ((0.5 - y) * maxTilt * 2).toFixed(2);
      if (innerRef.current) {
        innerRef.current.style.transition = 'transform 0.06s linear';
        innerRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale}, ${scale}, 1)`;
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0.48';
        glareRef.current.style.background = `radial-gradient(circle at ${Math.round(
          x * 100
        )}% ${Math.round(
          y * 100
        )}%, rgba(255,255,255,0.55) 0%, rgba(255,192,225,0.15) 38%, transparent 68%)`;
      }
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(rafRef.current);
    if (innerRef.current) {
      innerRef.current.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative ${className}`}
      style={{ perspective: '1000px', ...style }}
    >
      <div
        ref={innerRef}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        className="relative h-full w-full"
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] opacity-0 transition-opacity duration-300"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
      </div>
    </div>
  );
});

/* ============================================================
   2. FAST 3D HEART GALAXY ENGINE (Pre-allocated + Visibility Pause)
   ============================================================ */
export const HeartGalaxy3DStage = memo(function HeartGalaxy3DStage({
  template,
  card,
  progress = 0,
  bloom = false,
  size = 320,
  mini = false,
  active = true,
  onClick,
}) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const rotRef = useRef({
    x: -0.18,
    y: 0.35,
    vx: 0,
    vy: 0.008,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  const progressRef = useRef(progress);
  const bloomRef = useRef(bloom);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    bloomRef.current = bloom;
  }, [bloom]);

  const floatingTags = useMemo(() => {
    const recipient = card?.recipientName || 'Bạn xinh đẹp';
    return [
      { text: `💖 ${recipient}`, radius: 165, y: -35, angle: 0 },
      { text: '🌸 Happy 20/10', radius: 175, y: 28, angle: (Math.PI * 2) / 5 },
      { text: '✨ Luôn Rạng Rỡ', radius: 160, y: -15, angle: (Math.PI * 4) / 5 },
      { text: '💌 Thanh Xuân Có Cậu', radius: 180, y: 40, angle: (Math.PI * 6) / 5 },
    ];
  }, [card?.recipientName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Optimized particle count for locked 60fps
    const small = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 700;
    const heartCount = mini ? 70 : small ? 220 : 320;
    const ringCount = mini ? 28 : small ? 70 : 110;
    const total = heartCount + ringCount;

    const palette = [
      '#ff2a85',
      '#ff75b5',
      '#fde047',
      '#c084fc',
      '#ffffff',
      ...(template?.themeColors?.petals || []),
    ];

    // Pre-allocate flat typed arrays so GC never runs during animation
    const ox = new Float32Array(total);
    const oy = new Float32Array(total);
    const oz = new Float32Array(total);
    const pSize = new Float32Array(total);
    const pColor = new Array(total);
    const order = new Int32Array(total);
    const sxArr = new Float32Array(total);
    const syArr = new Float32Array(total);
    const szArr = new Float32Array(total);
    const srArr = new Float32Array(total);

    for (let i = 0; i < heartCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shell = 0.74 + Math.pow(Math.random(), 0.55) * 0.34;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );
      const thickness = (1 - Math.abs(Math.cos(t)) * 0.45) * 8;
      const hz = (Math.random() - 0.5) * 2 * thickness;

      ox[i] = hx * 6.2 * shell;
      oy[i] = (hy - 2) * 6.2 * shell;
      oz[i] = hz * 5.2 * shell;
      pSize[i] = mini ? 1.6 + Math.random() * 1.2 : 1.8 + Math.random() * 2.2;
      pColor[i] = palette[i % palette.length];
      order[i] = i;
    }

    for (let j = 0; j < ringCount; j++) {
      const i = heartCount + j;
      const arm = j % 3;
      const u = j / ringCount;
      const angle = u * Math.PI * 6 + (arm * Math.PI * 2) / 3;
      const r = (mini ? 65 : 105) + u * (mini ? 65 : 120) + (Math.random() - 0.5) * 20;
      const tiltY = Math.sin(angle * 2) * 16 + (Math.random() - 0.5) * 14;

      ox[i] = Math.cos(angle) * r;
      oy[i] = tiltY + 24;
      oz[i] = Math.sin(angle) * r;
      pSize[i] = mini ? 1.4 + Math.random() : 1.5 + Math.random() * 1.8;
      pColor[i] = j % 4 === 0 ? '#fde047' : palette[j % palette.length];
      order[i] = i;
    }

    let raf = 0;
    let time = 0;
    let visible = true;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, mini ? 1.25 : 1.75);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    let renderedOnce = false;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden || !width || !height) return;
      if (mini && !activeRef.current && renderedOnce) return;
      renderedOnce = true;

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const rot = rotRef.current;
      const p = progressRef.current;
      const isBloom = bloomRef.current;

      if (!rot.dragging) {
        const targetVy = 0.008 + p * 0.032 + (isBloom ? 0.005 : 0);
        rot.vy += (targetVy - rot.vy) * 0.08;
        rot.vx *= 0.92;
        rot.y += rot.vy;
        rot.x += rot.vx;
        rot.x += (-0.16 - rot.x) * 0.04;
      }

      const beatFreq = 2.6 + p * 4.5;
      const beat =
        1 +
        Math.pow(Math.sin(time * beatFreq), 6) * (0.07 + p * 0.1) +
        p * 0.16 +
        (isBloom ? 0.1 : 0);

      const cx = width / 2;
      const cy = height / 2 - (mini ? 0 : 10);
      const fov = mini ? 260 : 420;
      const scaleFactor = (mini ? 0.56 : Math.min(width, height) / 420) * beat;

      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);
      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);

      // Soft central glow
      const glowR = (mini ? 85 : 165) * beat;
      const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, glowR);
      coreGrad.addColorStop(0, `rgba(255, 110, 190, ${0.38 + p * 0.35})`);
      coreGrad.addColorStop(0.5, `rgba(192, 38, 211, ${0.18 + p * 0.2})`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Project all points into pre-allocated typed arrays
      const boost = 1 + p * 0.35;
      for (let i = 0; i < total; i++) {
        const x0 = ox[i] * scaleFactor;
        const y0 = oy[i] * scaleFactor;
        const z0 = oz[i] * scaleFactor;

        const x1 = x0 * cosY - z0 * sinY;
        const z1 = z0 * cosY + x0 * sinY;
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = z1 * cosX + y0 * sinX;

        const depth = fov + z2 + 240;
        const persp = depth > 40 ? fov / depth : 0;
        sxArr[i] = cx + x1 * persp;
        syArr[i] = cy + y2 * persp;
        szArr[i] = z2;
        srArr[i] = pSize[i] * persp * boost;
      }

      // Draw particles directly (grouped by front/back pass for speed)
      for (let i = 0; i < total; i++) {
        const r = srArr[i];
        if (r <= 0.1) continue;
        const z2 = szArr[i];
        ctx.globalAlpha = Math.min(1, Math.max(0.2, (z2 + 180) / 320));
        ctx.fillStyle = pColor[i];
        ctx.fillRect(sxArr[i] - r, syArr[i] - r, r * 2, r * 2);
      }

      // Floating 3D wish tags (only 4 tags in full view)
      if (!mini) {
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < floatingTags.length; i++) {
          const tag = floatingTags[i];
          const a = tag.angle + time * 0.35;
          const tx0 = Math.cos(a) * tag.radius * scaleFactor;
          const tz0 = Math.sin(a) * tag.radius * scaleFactor;
          const ty0 = (tag.y + Math.sin(time * 1.5 + i) * 9) * scaleFactor;

          const x1 = tx0 * cosY - tz0 * sinY;
          const z1 = tz0 * cosY + tx0 * sinY;
          const y2 = ty0 * cosX - z1 * sinX;
          const z2 = z1 * cosX + ty0 * sinX;

          const depth = fov + z2 + 240;
          if (depth <= 50) continue;
          const persp = fov / depth;
          const sx = cx + x1 * persp;
          const sy = cy + y2 * persp;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.scale(persp, persp);
          ctx.globalAlpha = Math.min(0.95, Math.max(0.3, (z2 + 200) / 340));
          const tw = ctx.measureText(tag.text).width;
          const pw = tw + 18;
          const ph = 24;
          ctx.fillStyle = 'rgba(35, 10, 48, 0.82)';
          ctx.strokeStyle = 'rgba(255, 140, 205, 0.55)';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 12);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff0f8';
          ctx.fillText(tag.text, 0, 1);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [mini, template, floatingTags]);

  const onPointerDown = (e) => {
    const r = rotRef.current;
    r.dragging = true;
    r.lastX = e.clientX;
    r.lastY = e.clientY;
  };

  const onPointerMove = (e) => {
    const r = rotRef.current;
    if (!r.dragging) return;
    const dx = e.clientX - r.lastX;
    const dy = e.clientY - r.lastY;
    r.lastX = e.clientX;
    r.lastY = e.clientY;
    r.vy = dx * 0.008;
    r.vx = dy * 0.006;
    r.y += r.vy;
    r.x = Math.max(-0.85, Math.min(0.85, r.x + r.vx));
  };

  const onPointerUp = () => {
    rotRef.current.dragging = false;
  };

  if (mini) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
      className="relative flex cursor-grab flex-col items-center justify-center select-none active:cursor-grabbing"
      style={{ width: Math.max(320, size * 1.38), height: Math.max(340, size * 1.25) }}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div
        className="pointer-events-none relative z-10 transition-transform duration-500"
        style={{
          transform: `scale(${bloom ? 0.92 : 0.62 + progress * 0.25})`,
        }}
      >
        <Flower template={template} bloom={bloom} size={size * 0.72} />
      </div>

      <div className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-300/35 bg-black/45 px-3 py-1 text-[11px] font-semibold text-pink-100 backdrop-blur-md">
          <Rotate3d size={13} />
          Kéo ngang/dọc để xoay 360° Vũ Trụ Tim 3D
        </span>
      </div>
    </div>
  );
});

/* ============================================================
   3. ZERO-RERENDER 3D MEMORY CAROUSEL 360° (Direct GPU DOM Transform)
   ============================================================ */
export const MemoryCarousel3DStage = memo(function MemoryCarousel3DStage({
  template,
  card,
  progress = 0,
  bloom = false,
  size = 320,
  mini = false,
  active = true,
  onClick,
}) {
  const cylinderRef = useRef(null);
  const flowerCounterRef = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const stateRef = useRef({
    angle: 0,
    dragging: false,
    startX: 0,
    startAngle: 0,
    moved: false,
    speed: 0.22,
  });

  useEffect(() => {
    stateRef.current.speed = mini ? 0.28 : 0.22 + progress * 0.85;
  }, [mini, progress]);

  // Direct DOM rotation inside rAF — ZERO React re-renders!
  useEffect(() => {
    const el = cylinderRef.current;
    if (!el) return;
    let raf = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    let renderedOnce = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (mini && !activeRef.current && renderedOnce) return;
      renderedOnce = true;
      const s = stateRef.current;
      if (!s.dragging) {
        s.angle = (s.angle + s.speed) % 360;
      }
      const a = s.angle.toFixed(2);
      el.style.transform = `rotateX(-9deg) rotateY(${a}deg)`;
      if (flowerCounterRef.current) {
        flowerCounterRef.current.style.transform = `rotateY(${-a}deg) translateY(${
          mini ? 6 : 12
        }px)`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [mini]);

  const panels = useMemo(() => {
    const recipient = card?.recipientName || 'Bạn Ngọc Ánh';
    const sender = card?.senderName || 'Tập thể lớp mình';
    const photo =
      card?.photoUrl ||
      'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffdde1"/><stop offset="1" stop-color="#ee9ca7"/></linearGradient></defs><rect width="240" height="240" rx="28" fill="url(#g)"/><text x="120" y="118" text-anchor="middle" font-size="68">🌸</text><text x="120" y="168" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#881337">20/10 Rực Rỡ</text></svg>`
        );

    return [
      {
        type: 'photo',
        title: recipient,
        subtitle: card?.photoCaption || 'Thanh xuân rực rỡ 💕',
        photo,
      },
      {
        type: 'wish',
        badge: 'Lời chúc 01',
        quote: '“Chúc cậu một ngày 20/10 luôn tỏa sáng, rạng rỡ như đóa hoa đẹp nhất!”',
        icon: '🌷',
      },
      {
        type: 'photo',
        title: 'Kỷ Niệm 20/10',
        subtitle: `Gửi từ ${sender}`,
        photo,
      },
      {
        type: 'wish',
        badge: 'Lời chúc 02',
        quote: '“Cảm ơn cậu vì đã mang nụ cười và năng lượng tích cực đến cho cả lớp mình.”',
        icon: '✨',
      },
      {
        type: 'music',
        title: 'Giai Điệu Riêng',
        subtitle: 'Bản nhạc dành tặng cậu 🎶',
        icon: '💝',
      },
      {
        type: 'wish',
        badge: 'Lời chúc 03',
        quote: '“Mọi điều dịu dàng và may mắn nhất sẽ luôn đồng hành cùng cậu!”',
        icon: '🏮',
      },
    ];
  }, [card]);

  const radius = mini ? 102 : Math.min(230, Math.max(165, size * 0.64));
  const cardW = mini ? 74 : 138;
  const cardH = mini ? 98 : 182;

  const onDown = (e) => {
    const s = stateRef.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.startAngle = s.angle;
    s.moved = false;
  };

  const onMove = (e) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.startX;
    if (Math.abs(dx) > 6) s.moved = true;
    s.angle = s.startAngle + dx * 0.45;
  };

  const onUp = () => {
    const s = stateRef.current;
    const wasMoved = s.moved;
    s.dragging = false;
    if (!wasMoved && onClick) onClick();
  };

  return (
    <div
      onPointerDown={mini ? undefined : onDown}
      onPointerMove={mini ? undefined : onMove}
      onPointerUp={mini ? undefined : onUp}
      onPointerLeave={() => {
        stateRef.current.dragging = false;
      }}
      className={`relative flex flex-col items-center justify-center select-none ${
        mini ? 'h-full w-full' : 'cursor-grab active:cursor-grabbing'
      }`}
      style={{
        width: mini ? '100%' : Math.max(320, size * 1.45),
        height: mini ? '100%' : Math.max(330, size * 1.18),
        perspective: mini ? '750px' : '1300px',
      }}
    >
      {!mini && (
        <div className="pointer-events-none absolute top-0 left-1/2 z-30 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/40 bg-black/45 px-3.5 py-1 text-[11px] font-semibold text-amber-100 backdrop-blur-md">
            <MoveHorizontal size={13} />
            Kéo qua lại để xoay Vòng Quay Kỷ Niệm 3D 360°
          </span>
        </div>
      )}

      {/* Glowing 3D Floor Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full blur-2xl"
        style={{
          width: radius * 2.1,
          height: radius * 0.65,
          background:
            'radial-gradient(ellipse at center, rgba(251,113,133,0.5) 0%, rgba(245,158,11,0.25) 50%, transparent 78%)',
        }}
      />

      {/* 3D Preserve-3D Cylinder Stage */}
      <div
        ref={cylinderRef}
        className="relative flex items-center justify-center"
        style={{
          width: cardW,
          height: cardH,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <div
          ref={flowerCounterRef}
          className="pointer-events-none absolute flex items-center justify-center"
          style={{ willChange: 'transform' }}
        >
          <Flower
            template={template}
            bloom={bloom || mini}
            size={mini ? 92 : size * 0.68}
            glow={false}
          />
        </div>

        {panels.map((p, i) => {
          const itemAngle = i * 60;
          return (
            <div
              key={i}
              style={{
                width: cardW,
                height: cardH,
                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'visible',
              }}
              className="absolute inset-0 rounded-2xl border border-pink-200/55 bg-gradient-to-b from-white/95 via-rose-50/92 to-pink-100/92 p-2 text-[#3b0a20] shadow-[0_8px_22px_rgba(225,29,72,0.28)]"
            >
              {p.type === 'photo' ? (
                <div className="flex h-full flex-col">
                  <div className="relative flex-1 overflow-hidden rounded-xl bg-rose-100">
                    <img
                      src={p.photo}
                      alt={p.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <span className="absolute top-1 right-1 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[8px] font-bold text-white">
                      3D
                    </span>
                  </div>
                  {!mini && (
                    <div className="mt-1.5 text-center">
                      <p className="truncate font-display text-[11px] font-bold text-rose-900">
                        {p.title}
                      </p>
                      <p className="truncate font-hand text-xs text-rose-600">
                        {p.subtitle}
                      </p>
                    </div>
                  )}
                </div>
              ) : p.type === 'music' ? (
                <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-amber-400/20 p-2 text-center">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-rose-600 text-white shadow-md">
                    <Volume2 size={mini ? 14 : 18} />
                  </div>
                  {!mini && (
                    <>
                      <p className="mt-2 font-display text-xs font-bold text-rose-900">
                        {p.title}
                      </p>
                      <p className="mt-1 text-[10px] text-rose-700">{p.subtitle}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between rounded-xl bg-gradient-to-br from-rose-50 to-amber-50/70 p-2 text-center">
                  <span className="mx-auto rounded-full bg-rose-500/15 px-2 py-0.5 text-[8px] font-bold text-rose-700">
                    {p.badge}
                  </span>
                  <p
                    className={`font-display font-medium text-rose-950 ${
                      mini ? 'line-clamp-3 text-[8px]' : 'text-[11px] leading-snug'
                    }`}
                  >
                    {p.quote}
                  </p>
                  <span className="text-sm">{p.icon}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ============================================================
   4. 3D CRYSTAL MUSIC BOX & FLUTTERING 3D BUTTERFLIES
   ============================================================ */
export const CrystalMusicBox3DStage = memo(function CrystalMusicBox3DStage({
  template,
  progress = 0,
  bloom = false,
  size = 320,
  mini = false,
  onClick,
}) {
  const butterflies = [
    { orbitR: mini ? 62 : 125, speed: 7, delay: '0s', y: -45, color: '#38bdf8' },
    { orbitR: mini ? 74 : 148, speed: 9, delay: '-2.2s', y: -10, color: '#f472b6' },
    { orbitR: mini ? 55 : 112, speed: 6, delay: '-4.1s', y: -80, color: '#c084fc' },
    { orbitR: mini ? 82 : 158, speed: 10, delay: '-1.3s', y: 20, color: '#fde047' },
  ];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        width: mini ? '100%' : Math.max(300, size * 1.25),
        height: mini ? '100%' : Math.max(330, size * 1.2),
        perspective: '1100px',
      }}
    >
      {/* Holographic Soft Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[280px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          opacity: 0.4 + progress * 0.5,
          background:
            'radial-gradient(circle, rgba(56,189,248,0.45) 0%, rgba(244,114,182,0.4) 50%, transparent 75%)',
        }}
      />

      {/* 3D Orbiting Butterflies with Flapping Wings */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {butterflies.map((b, idx) => (
          <div
            key={idx}
            style={{
              transformStyle: 'preserve-3d',
              animation: `orbit3dSpin ${b.speed}s linear infinite`,
              animationDelay: b.delay,
              '--orbit-r': `${b.orbitR}px`,
              '--orbit-y': `${b.y}px`,
            }}
            className="absolute"
          >
            <div
              className="relative flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span
                className="block h-5 w-4 origin-right rounded-tl-full rounded-bl-full"
                style={{
                  background: `radial-gradient(circle, #ffffff 0%, ${b.color} 70%)`,
                  animation: 'wingFlapLeft 0.38s ease-in-out infinite alternate',
                }}
              />
              <span
                className="block h-5 w-4 origin-left rounded-tr-full rounded-br-full"
                style={{
                  background: `radial-gradient(circle, #ffffff 0%, ${b.color} 70%)`,
                  animation: 'wingFlapRight 0.38s ease-in-out infinite alternate',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Central Flower over Crystal Prism Pedestal */}
      <div className="relative z-10 translate-y-2">
        <Flower
          template={template}
          bloom={bloom || mini}
          size={mini ? 120 : size * 0.84}
        />
      </div>

      {/* 3D Spinning Crystal Music Box Pedestal */}
      <div
        className="relative -mt-3 flex flex-col items-center"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(68deg)' }}
      >
        <div
          className="rounded-full border-2 border-cyan-200/75 bg-[conic-gradient(from_0deg,rgba(56,189,248,0.45),rgba(244,114,182,0.55),rgba(255,255,255,0.7),rgba(192,132,252,0.55),rgba(56,189,248,0.45))] shadow-[0_0_24px_rgba(56,189,248,0.55)]"
          style={{
            width: mini ? 110 : Math.max(210, size * 0.82),
            height: mini ? 110 : Math.max(210, size * 0.82),
            animation: 'superHotSpin 6s linear infinite',
          }}
        />
        <div className="absolute inset-4 rounded-full border border-dashed border-white/80" />
      </div>
    </div>
  );
});

/* ============================================================
   5. 3D SURPRISE GIFT BOX UNBOXING STAGE (True 6-Faced 3D Cube)
   ============================================================ */
export const SurpriseGiftBox3DStage = memo(function SurpriseGiftBox3DStage({
  template,
  progress = 0,
  bloom = false,
  size = 320,
  mini = false,
  onClick,
}) {
  const boxSize = mini ? 84 : Math.min(168, Math.max(136, Math.round(size * 0.48)));
  const half = boxSize / 2;
  const lidOpenDeg = bloom ? 135 : progress * 65;
  const flowerRise = bloom ? -boxSize * 0.72 : -progress * 38;
  const flowerScale = bloom ? 0.95 : 0.35 + progress * 0.45;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        width: mini ? '100%' : Math.min(size * 1.12, 420),
        height: mini ? '100%' : Math.min(size * 1.18, 440),
        perspective: '1200px',
      }}
    >
      {/* Rising 3D Flower Bouquet emerging from inside the 3D Cube */}
      <div
        className="pointer-events-none relative z-20 transition-all duration-700"
        style={{
          transform: `translateY(${flowerRise}px) scale(${mini ? 0.72 : flowerScale})`,
          opacity: mini ? 1 : 0.35 + progress * 0.65 + (bloom ? 1 : 0),
        }}
      >
        <Flower
          template={template}
          bloom={bloom || mini}
          size={mini ? 120 : size * 0.86}
          glow={false}
        />
      </div>

      {/* True 6-Sided 3D Gift Cube */}
      <div
        className="relative z-10 -mt-16"
        style={{
          width: boxSize,
          height: boxSize,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-20deg) rotateY(-32deg)',
          animation: bloom ? 'none' : 'giftBoxFloat3d 3.4s ease-in-out infinite',
        }}
      >
        <div
          className="absolute inset-0 rounded-lg border border-rose-300/60 bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700"
          style={{ transform: `translateZ(${half}px)` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500" />
          <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500" />
        </div>

        <div
          className="absolute inset-0 rounded-lg border border-rose-300/60 bg-gradient-to-br from-rose-700 to-purple-900"
          style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-amber-400/80" />
        </div>

        <div
          className="absolute inset-0 rounded-lg border border-rose-300/60 bg-gradient-to-br from-pink-600 via-rose-700 to-purple-800"
          style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500" />
          <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500" />
        </div>

        <div
          className="absolute inset-0 rounded-lg border border-rose-300/60 bg-gradient-to-br from-rose-600 to-pink-800"
          style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-amber-400/85" />
        </div>

        <div
          className="absolute inset-0 rounded-lg bg-rose-950 shadow-[0_0_40px_rgba(225,29,72,0.75)]"
          style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}
        />

        {/* Hinged 3D Top Lid */}
        <div
          className="absolute inset-0 origin-top rounded-lg border-2 border-amber-200/80 bg-gradient-to-br from-rose-400 via-rose-600 to-purple-700 shadow-lg transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateY(${-half}px) translateZ(${-half}px) rotateX(${90 + lidOpenDeg}deg)`,
          }}
        >
          <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500" />
          <div className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500" />
          <div
            className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-200 bg-amber-400"
            style={{ transform: 'translateZ(14px)' }}
          />
        </div>
      </div>

      {!mini && (
        <div className="pointer-events-none mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-white/80 px-3.5 py-1 text-[11px] font-bold text-rose-800 shadow-xs backdrop-blur-md">
            <Sparkles size={12} className="text-rose-600" />
            Chạm để mở hộp quà 3D
          </span>
        </div>
      )}
    </div>
  );
});
