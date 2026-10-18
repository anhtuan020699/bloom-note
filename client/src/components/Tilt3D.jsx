import { memo, useEffect, useRef } from 'react';

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
