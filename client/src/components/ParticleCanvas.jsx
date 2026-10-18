import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

const EMITTERS = {
  rose_petals: (c) => [
    { kind: 'petal', density: 2.2, motion: 'fall', colors: [...c.petals, '#fce4ec'], size: [8, 16] },
    { kind: 'sparkle', density: 0.5, motion: 'twinkle', colors: ['#ffffff', c.accent], size: [3, 6] },
  ],
  sakura: (c) => [
    { kind: 'sakura', density: 2.8, motion: 'wind', colors: [...c.petals, '#fff0f7'], size: [7, 13] },
    { kind: 'sparkle', density: 0.35, motion: 'twinkle', colors: ['#ffffff'], size: [2, 4] },
  ],
  stardust: (c) => [
    { kind: 'sparkle', density: 2.2, motion: 'rise', colors: ['#ffd700', '#f5d77a', '#fff3c4'], size: [2.5, 6] },
    { kind: 'glow', density: 2.6, motion: 'twinkle', colors: ['#ffe9a0', '#ffffff'], size: [1, 2.4] },
    { kind: 'petal', density: 0.5, motion: 'fall', colors: c.petals, size: [8, 13] },
  ],
  sunshine: (c) => [
    { kind: 'rays', density: 0 },
    { kind: 'firefly', density: 1.6, motion: 'float', colors: ['#ffd54f', '#ffb300', '#fff59d'], size: [3, 6] },
    { kind: 'petal', density: 0.6, motion: 'fall', colors: c.petals, size: [6, 11] },
  ],
  starlight: () => [
    { kind: 'glow', density: 5, motion: 'twinkle', colors: ['#ffffff', '#e1d5ff', '#ffd1f0'], size: [0.8, 2.2] },
    { kind: 'sparkle', density: 0.5, motion: 'twinkle', colors: ['#ffffff', '#ffd1f0'], size: [3, 6] },
    { kind: 'firefly', density: 1.1, motion: 'float', colors: ['#ff6ec7', '#c4a2ff', '#ffb3e6'], size: [3, 6] },
    { kind: 'shooting', density: 0 },
  ],
  hearts_confetti: (c) => [
    { kind: 'heart', density: 1.1, motion: 'rise', colors: [c.primary, c.secondary, '#ff80ab', '#ffb3c8'], size: [7, 14] },
    { kind: 'confetti', density: 1.8, motion: 'fall', colors: c.petals, size: [5, 9] },
  ],
  lanterns: (c) => [
    { kind: 'lantern', density: 1.3, motion: 'rise', colors: ['#fb923c', '#f59e0b', '#fb7185', '#fde047'], size: [12, 24] },
    { kind: 'sparkle', density: 1.5, motion: 'twinkle', colors: ['#fde68a', '#ffffff', c.primary], size: [2, 5] },
    { kind: 'glow', density: 2.2, motion: 'rise', colors: ['#fbbf24', '#fb7185'], size: [1.5, 3.5] },
  ],
  butterflies: (c) => [
    { kind: 'butterfly', density: 1.1, motion: 'float', colors: ['#38bdf8', '#f472b6', '#c084fc', '#67e8f9'], size: [10, 18] },
    { kind: 'sparkle', density: 1.8, motion: 'twinkle', colors: ['#a5f3fc', '#f9a8d4', '#ffffff'], size: [2.5, 5.5] },
    { kind: 'firefly', density: 1.5, motion: 'float', colors: ['#38bdf8', '#f472b6', '#fef08a'], size: [2.5, 5] },
  ],
};

const spriteCache = new Map();
function glowSprite(color) {
  if (spriteCache.has(color)) return spriteCache.get(color);
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.15, color);
  grad.addColorStop(0.45, `${color}55`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  spriteCache.set(color, cv);
  return cv;
}

function drawShape(ctx, p) {
  const s = p.size;
  ctx.fillStyle = p.color;
  switch (p.kind) {
    case 'petal':
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.6, s * 0.85, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.85, -s * 0.95, -s * 0.55, 0, -s);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(-s * 0.2, -s * 0.2, s * 0.18, s * 0.45, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'sakura':
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s * 1.1, s * 0.2, -s * 0.8, -s, -s * 0.2, -s);
      ctx.lineTo(0, -s * 0.72);
      ctx.lineTo(s * 0.2, -s);
      ctx.bezierCurveTo(s * 0.8, -s, s * 1.1, s * 0.2, 0, s);
      ctx.fill();
      break;
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s * 1.2, -s * 0.4, -s * 0.45, -s * 1.1, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.45, -s * 1.1, s * 1.2, -s * 0.4, 0, s * 0.35);
      ctx.fill();
      break;
    case 'confetti':
      ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      break;
    case 'lantern': {
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(glowSprite(p.color), -s * 2.2, -s * 2.2, s * 4.4, s * 4.4);
      ctx.globalCompositeOperation = 'source-over';
      const lg = ctx.createLinearGradient(0, -s, 0, s);
      lg.addColorStop(0, p.color);
      lg.addColorStop(0.7, '#fde047');
      lg.addColorStop(1, '#fffbeb');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, -s * 0.75);
      ctx.quadraticCurveTo(0, -s * 1.1, s * 0.55, -s * 0.75);
      ctx.lineTo(s * 0.38, s * 0.75);
      ctx.quadraticCurveTo(0, s * 0.9, -s * 0.38, s * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, s * 0.45, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'butterfly': {
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(glowSprite(p.color), -s * 1.8, -s * 1.8, s * 3.6, s * 3.6);
      ctx.fillStyle = p.color;
      // Upper wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s * 1.2, -s * 1.1, -s * 1.3, s * 0.2, 0, s * 0.15);
      ctx.bezierCurveTo(s * 1.3, s * 0.2, s * 1.2, -s * 1.1, 0, 0);
      ctx.fill();
      // Lower wings
      ctx.beginPath();
      ctx.moveTo(0, s * 0.1);
      ctx.bezierCurveTo(-s * 0.9, s * 0.2, -s * 0.8, s * 1.05, 0, s * 0.5);
      ctx.bezierCurveTo(s * 0.8, s * 1.05, s * 0.9, s * 0.2, 0, s * 0.1);
      ctx.fill();
      break;
    }
    case 'sparkle': {
      ctx.globalCompositeOperation = 'lighter';
      const sp = glowSprite(p.color);
      ctx.drawImage(sp, -s * 2, -s * 2, s * 4, s * 4);
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.6);
      ctx.quadraticCurveTo(0, 0, s * 1.6, 0);
      ctx.quadraticCurveTo(0, 0, 0, s * 1.6);
      ctx.quadraticCurveTo(0, 0, -s * 1.6, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s * 1.6);
      ctx.fillStyle = '#fffbe8';
      ctx.fill();
      break;
    }
    case 'glow':
    case 'firefly': {
      ctx.globalCompositeOperation = 'lighter';
      const k = p.kind === 'firefly' ? 5 : 3;
      ctx.drawImage(glowSprite(p.color), -s * k, -s * k, s * k * 2, s * k * 2);
      break;
    }
    default:
  }
}

function spawn(e, w, h, initial) {
  const p = {
    kind: e.kind,
    motion: e.motion,
    color: pick(e.colors),
    size: rand(...e.size),
    x: rand(0, w),
    y: initial ? rand(0, h) : 0,
    rot: rand(0, Math.PI * 2),
    vr: rand(-1.2, 1.2),
    flipPhase: rand(0, Math.PI * 2),
    flipSpeed: rand(1.2, 3),
    phase: rand(0, Math.PI * 2),
    freq: rand(0.4, 1.2),
    amp: rand(15, 45),
    speed: 0,
    alpha: 1,
  };
  switch (e.motion) {
    case 'fall':
      p.speed = rand(28, 70);
      if (!initial) p.y = -20;
      break;
    case 'wind':
      p.speed = rand(30, 60);
      p.vx = rand(25, 70);
      if (!initial) {
        if (Math.random() < 0.5) { p.x = -20; p.y = rand(-h * 0.2, h * 0.8); } else { p.y = -20; p.x = rand(-w * 0.3, w); }
      }
      break;
    case 'rise':
      p.speed = rand(12, 34);
      if (!initial) p.y = h + 20;
      break;
    case 'float':
      p.speed = rand(8, 22);
      p.dir = rand(0, Math.PI * 2);
      break;
    default:
      p.speed = rand(0.6, 2.2);
  }
  return p;
}

const ParticleCanvas = forwardRef(function ParticleCanvas(
  { type = 'rose_petals', colors, density = 1, className = '', fixed = true, ambient = true },
  ref,
) {
  const canvasRef = useRef(null);
  const burstsRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useImperativeHandle(ref, () => ({
    burst(clientX, clientY, count = 140) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const palette = [...colors.petals, colors.primary, colors.secondary, colors.accent];
      const kinds = ['petal', 'petal', 'heart', 'confetti', 'confetti', 'sparkle', type === 'sakura' ? 'sakura' : 'petal'];
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(180, 720);
        const kind = pick(kinds);
        burstsRef.current.push({
          kind,
          color: kind === 'sparkle' ? '#ffe9a0' : pick(palette),
          size: kind === 'sparkle' ? rand(3, 6) : rand(6, 14),
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 180,
          rot: rand(0, Math.PI * 2),
          vr: rand(-8, 8),
          flipPhase: rand(0, 6),
          flipSpeed: rand(4, 10),
          life: 0,
          maxLife: rand(2, 3.6),
          alpha: 1,
        });
      }
    },
  }), [colors, type]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const emitters = ambient ? (EMITTERS[type] || EMITTERS.rose_petals)(colors) : [];
    let particles = [];
    let shooting = [];
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let t = 0;

    const populate = () => {
      const { w, h } = sizeRef.current;
      const mobile = w < 700;
      const units = Math.max((w * h) / 140000, 4) * density * (reduced ? 0.3 : mobile ? 0.5 : 0.85);
      particles = [];
      for (const e of emitters) {
        if (!e.density) continue;
        const n = Math.min(Math.round(e.density * units), mobile ? 48 : 90);
        for (let i = 0; i < n; i++) particles.push({ ...spawn(e, w, h, true), emitter: e });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 700 ? 1.15 : 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const prev = sizeRef.current;
      sizeRef.current = { w: rect.width, h: rect.height };
      if (Math.abs(prev.w - rect.width) > 80 || Math.abs(prev.h - rect.height) > 160 || !particles.length) populate();
    };

    const drawRays = (w, h) => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const ox = w * 0.85;
      const oy = -h * 0.1;
      for (let i = 0; i < 6; i++) {
        const a = Math.PI * 0.55 + i * 0.16 + Math.sin(t * 0.25 + i) * 0.04;
        const len = Math.hypot(w, h) * 1.2;
        const spread = 0.05 + (i % 2) * 0.03;
        const grad = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len);
        grad.addColorStop(0, 'rgba(255,240,180,0.35)');
        grad.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.6 + i * 1.7);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(a - spread) * len, oy + Math.sin(a - spread) * len);
        ctx.lineTo(ox + Math.cos(a + spread) * len, oy + Math.sin(a + spread) * len);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      if (ambient && type === 'sunshine') drawRays(w, h);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        switch (p.motion) {
          case 'fall':
            p.y += p.speed * dt;
            p.x += Math.sin(t * p.freq + p.phase) * p.amp * dt;
            if (p.y > h + 24) p = particles[i] = { ...spawn(p.emitter, w, h, false), emitter: p.emitter };
            break;
          case 'wind':
            p.y += p.speed * dt;
            p.x += (p.vx + Math.sin(t * p.freq + p.phase) * p.amp) * dt;
            if (p.y > h + 24 || p.x > w + 24) p = particles[i] = { ...spawn(p.emitter, w, h, false), emitter: p.emitter };
            break;
          case 'rise':
            p.y -= p.speed * dt;
            p.x += Math.sin(t * p.freq + p.phase) * p.amp * 0.5 * dt;
            p.alpha = Math.min(1, p.y / (h * 0.25));
            if (p.y < -24) p = particles[i] = { ...spawn(p.emitter, w, h, false), emitter: p.emitter };
            break;
          case 'float':
            p.dir += Math.sin(t * p.freq + p.phase) * 0.9 * dt;
            p.x += Math.cos(p.dir) * p.speed * dt;
            p.y += Math.sin(p.dir) * p.speed * dt;
            if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
            p.alpha = 0.35 + 0.65 * Math.abs(Math.sin(t * p.freq * 1.4 + p.phase));
            break;
          default:
            p.alpha = 0.2 + 0.8 * Math.abs(Math.sin(t * p.speed + p.phase));
        }
        p.rot += p.vr * dt;
        const flip = p.motion === 'twinkle' || p.motion === 'float' ? 1 : Math.cos(t * p.flipSpeed + p.flipPhase);
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha) * 0.9;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.kind === 'heart' ? Math.sin(t + p.phase) * 0.3 : p.rot);
        if (p.kind === 'sparkle') ctx.scale(0.6 + p.alpha * 0.4, 0.6 + p.alpha * 0.4);
        else ctx.scale(Math.abs(flip) < 0.15 ? 0.15 * Math.sign(flip || 1) : flip, 1);
        drawShape(ctx, p);
        ctx.restore();
      }

      if (ambient && type === 'starlight' && Math.random() < dt * 0.35 && shooting.length < 2) {
        shooting.push({ x: rand(w * 0.2, w), y: rand(0, h * 0.4), vx: -rand(500, 800), vy: rand(220, 360), life: 0, max: rand(0.9, 1.4) });
      }
      shooting = shooting.filter((s) => (s.life += dt) < s.max);
      for (const s of shooting) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const k = 1 - s.life / s.max;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.18, s.y - s.vy * 0.18);
        grad.addColorStop(0, `rgba(255,255,255,${0.95 * k})`);
        grad.addColorStop(1, 'rgba(255,200,240,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.18, s.y - s.vy * 0.18);
        ctx.stroke();
      }

      const bursts = burstsRef.current;
      if (bursts.length) {
        const drag = Math.pow(0.12, dt);
        let n = 0;
        for (const b of bursts) {
          b.life += dt;
          if (b.life >= b.maxLife) continue;
          b.vx *= drag;
          b.vy = b.vy * drag + 260 * dt;
          b.x += b.vx * dt + Math.sin(b.life * 3 + b.flipPhase) * 20 * dt;
          b.y += b.vy * dt;
          b.rot += b.vr * dt;
          const fade = b.life / b.maxLife;
          ctx.save();
          ctx.globalAlpha = fade > 0.6 ? 1 - (fade - 0.6) / 0.4 : 1;
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.scale(Math.cos(b.life * b.flipSpeed + b.flipPhase), 1);
          drawShape(ctx, b);
          ctx.restore();
          bursts[n++] = b;
        }
        bursts.length = n;
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [type, colors, density, ambient]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 h-full w-full ${className}`}
    />
  );
});

export default ParticleCanvas;
