import { memo, useId } from 'react';

const VIEW = { x: -175, y: -175, w: 350, h: 430 };
/** Vertical position of the flower head center, as a ratio of the SVG height. */
export const HEAD_Y_RATIO = -VIEW.y / VIEW.h;

const petalPath = (shape, L, W) => {
  switch (shape) {
    case 'heart':
      return `M0 0 C${-W} ${-L * 0.35} ${-W * 0.85} ${-L} ${-W * 0.2} ${-L} L0 ${-L * 0.84} L${W * 0.2} ${-L} C${W * 0.85} ${-L} ${W} ${-L * 0.35} 0 0Z`;
    case 'pointed':
      return `M0 0 C${-W} ${-L * 0.3} ${-W * 0.55} ${-L * 0.8} 0 ${-L} C${W * 0.55} ${-L * 0.8} ${W} ${-L * 0.3} 0 0Z`;
    case 'ruffle':
      return `M0 0 C${-W} ${-L * 0.3} ${-W * 1.05} ${-L * 0.82} ${-W * 0.6} ${-L * 0.94} Q${-W * 0.42} ${-L * 1.06} ${-W * 0.2} ${-L * 0.95} Q0 ${-L * 1.08} ${W * 0.2} ${-L * 0.95} Q${W * 0.42} ${-L * 1.06} ${W * 0.6} ${-L * 0.94} C${W * 1.05} ${-L * 0.82} ${W} ${-L * 0.3} 0 0Z`;
    case 'round':
    default:
      return `M0 0 C${-W} ${-L * 0.2} ${-W * 0.95} ${-L} 0 ${-L} C${W * 0.95} ${-L} ${W} ${-L * 0.2} 0 0Z`;
  }
};

// Layers listed outer → inner. `tone` picks [base, tip] from the palette.
const FLOWERS = {
  rose: {
    layers: [
      { count: 6, L: 122, W: 82, shape: 'round', tone: [1, 0], offset: 0, twist: -40 },
      { count: 5, L: 98, W: 68, shape: 'round', tone: [2, 0], offset: 36, twist: -25 },
      { count: 5, L: 72, W: 52, shape: 'round', tone: [2, 1], offset: 12, twist: -10 },
      { count: 4, L: 46, W: 38, shape: 'round', tone: [2, 1], offset: 55, twist: 10 },
    ],
    pistil: 'rose',
  },
  sakura: {
    layers: [
      { count: 5, L: 120, W: 74, shape: 'heart', tone: [2, 0], offset: 0, twist: -30 },
      { count: 5, L: 62, W: 40, shape: 'heart', tone: [1, 0], offset: 36, twist: -10, opacity: 0.85 },
    ],
    pistil: 'stamens',
  },
  tulip: {
    layers: [
      { count: 3, L: 132, W: 66, shape: 'pointed', tone: [2, 0], offset: 0, twist: -20 },
      { count: 3, L: 118, W: 60, shape: 'pointed', tone: [2, 1], offset: 60, twist: -10 },
      { count: 6, L: 64, W: 32, shape: 'pointed', tone: [2, 1], offset: 30, twist: 0 },
    ],
    pistil: 'gold',
  },
  sunflower: {
    layers: [
      { count: 18, L: 124, W: 24, shape: 'pointed', tone: [2, 1], offset: 0, twist: -30 },
      { count: 18, L: 106, W: 22, shape: 'pointed', tone: [1, 0], offset: 10, twist: -15 },
    ],
    pistil: 'seeds',
  },
  peony: {
    layers: [
      { count: 8, L: 126, W: 64, shape: 'ruffle', tone: [1, 0], offset: 0, twist: -40 },
      { count: 7, L: 102, W: 56, shape: 'ruffle', tone: [2, 0], offset: 25, twist: -25 },
      { count: 6, L: 78, W: 46, shape: 'ruffle', tone: [2, 1], offset: 10, twist: -10 },
      { count: 5, L: 52, W: 34, shape: 'ruffle', tone: [2, 1], offset: 40, twist: 10 },
    ],
    pistil: 'stamens-gold',
  },
  bouquet: {
    layers: [
      { count: 8, L: 112, W: 56, shape: 'round', multi: true, offset: 0, twist: -30 },
      { count: 6, L: 72, W: 46, shape: 'heart', multi: true, offset: 30, twist: -10 },
    ],
    pistil: 'gold',
    side: [
      { x: -98, y: 70, s: 0.5, type: 'sakura', delay: 0.35 },
      { x: 100, y: 62, s: 0.46, type: 'peony', delay: 0.55 },
      { x: -52, y: 118, s: 0.34, type: 'rose', delay: 0.8 },
      { x: 60, y: 126, s: 0.32, type: 'sakura', delay: 0.95 },
    ],
  },
};

const normAngle = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

const BUD_SPREAD = 0.1;

function Pistil({ kind, ids, colors, bloom, delay, dur }) {
  const style = {
    transformBox: 'view-box',
    transformOrigin: '0px 0px',
    transform: bloom ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)',
    opacity: bloom ? 1 : 0,
    transitionDuration: `${dur * 0.8}s`,
    transitionDelay: `${bloom ? delay : 0}s`,
  };
  const center = colors.center;

  let content;
  if (kind === 'seeds') {
    const seeds = [];
    for (let i = 0; i < 140; i++) {
      const r = 3.6 * Math.sqrt(i);
      const a = i * 2.39996;
      seeds.push(<circle key={i} cx={r * Math.cos(a)} cy={r * Math.sin(a)} r={1.9} fill="#3e2723" opacity={0.75} />);
    }
    content = (
      <>
        <circle r="48" fill={`url(#${ids.disk})`} />
        {seeds}
        <circle r="48" fill="none" stroke="#4e342e" strokeOpacity="0.5" strokeWidth="3" />
      </>
    );
  } else if (kind === 'rose') {
    content = (
      <>
        <circle r="20" fill={center} />
        <path d="M0 -2 C8 -4 9 8 0 9 C-12 10 -13 -10 0 -12 C15 -13 18 10 4 16" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
      </>
    );
  } else {
    const n = kind === 'stamens' ? 12 : 18;
    const gold = kind === 'stamens' ? '#ffe082' : '#ffd54f';
    content = (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          const len = (kind === 'stamens' ? 28 : 22) + (i % 3) * 5;
          return (
            <g key={i}>
              <line x1="0" y1="0" x2={Math.cos(a) * len} y2={Math.sin(a) * len} stroke={kind === 'stamens' ? center : '#c79100'} strokeWidth="1.6" strokeOpacity="0.85" />
              <circle cx={Math.cos(a) * len} cy={Math.sin(a) * len} r="3.4" fill={gold} />
            </g>
          );
        })}
        <circle r={kind === 'gold' ? 14 : 10} fill={kind === 'stamens' ? center : `url(#${ids.disk})`} />
      </>
    );
  }
  return <g className="petal" style={style}>{content}</g>;
}

function FlowerHead({ type, colors, bloom, baseDelay = 0, speed = 1, uid }) {
  const def = FLOWERS[type] || FLOWERS.rose;
  const palette = colors.petals;
  const ids = {
    tone: (a, b) => `${uid}-t${a}${b}`,
    multi: (i) => `${uid}-m${i}`,
    disk: `${uid}-disk`,
    sepal: `${uid}-sepal`,
    shadow: `${uid}-shadow`,
  };
  const dur = 1.5 * speed;
  const layerCount = def.layers.length;

  return (
    <g>
      <defs>
        {[...new Set(def.layers.filter((l) => l.tone).map((l) => l.tone.join('')))].map((ab) => [...ab].map(Number)).map(([a, b]) => (
          <linearGradient key={`${a}${b}`} id={ids.tone(a, b)} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={palette[a] || palette[0]} />
            <stop offset="1" stopColor={palette[b] || palette[0]} />
          </linearGradient>
        ))}
        {palette.map((c, i) => (
          <linearGradient key={c + i} id={ids.multi(i)} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={c} />
            <stop offset="0.65" stopColor={c} />
            <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${c} 45%, white)` }} />
          </linearGradient>
        ))}
        <radialGradient id={ids.disk}>
          <stop offset="0" stopColor={type === 'sunflower' ? '#8d6e63' : '#fff59d'} />
          <stop offset="1" stopColor={type === 'sunflower' ? colors.center : '#f9a825'} />
        </radialGradient>
        <linearGradient id={ids.sepal} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2e7d32" />
          <stop offset="1" stopColor="#81c784" />
        </linearGradient>
      </defs>

      {/* sepals: cup the bud, fold beneath the bloom */}
      {[-1, 0, 1].map((k) => {
        const open = 180 + k * 55;
        const closed = k * 28;
        return (
          <path
            key={k}
            className="petal"
            d={petalPath('pointed', 62, 30)}
            fill={`url(#${ids.sepal})`}
            style={{
              transformBox: 'view-box',
              transformOrigin: '0px 0px',
              transform: bloom ? `rotate(${open}deg) scale(1.1)` : `rotate(${closed}deg) scale(0.7, 0.9)`,
              transitionDuration: `${dur}s`,
              transitionDelay: `${baseDelay}s`,
            }}
          />
        );
      })}

      {def.layers.map((layer, li) => {
        const delay = baseDelay + li * 0.22 * speed;
        const budScale = `scale(${0.34 + li * 0.04}, ${0.5 + li * 0.03})`;
        return (
          <g key={li} opacity={layer.opacity ?? 1}>
            {Array.from({ length: layer.count }, (_, i) => {
              const angle = normAngle((i * 360) / layer.count + layer.offset);
              const fill = layer.multi
                ? `url(#${ids.multi((i + li) % palette.length)})`
                : `url(#${ids.tone(...layer.tone)})`;
              return (
                <path
                  key={i}
                  className="petal"
                  d={petalPath(layer.shape, layer.L, layer.W)}
                  fill={fill}
                  stroke="#fff"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  style={{
                    transformBox: 'view-box',
                    transformOrigin: '0px 0px',
                    transform: bloom
                      ? `rotate(${angle}deg) scale(1)`
                      : `rotate(${angle * BUD_SPREAD + layer.twist * 0.3}deg) ${budScale}`,
                    transitionDuration: `${dur + (layerCount - li) * 0.1}s`,
                    transitionDelay: `${bloom ? delay : (layerCount - li) * 0.08}s`,
                  }}
                />
              );
            })}
          </g>
        );
      })}

      <Pistil kind={def.pistil} ids={ids} colors={colors} bloom={bloom} delay={baseDelay + layerCount * 0.22 * speed + 0.2} dur={dur} />
    </g>
  );
}

function Flower({ template, bloom = false, size = 320, instant = false, className = '', glow = true, onClick }) {
  const uid = useId().replace(/[:«»]/g, '');
  const colors = template.themeColors;
  const def = FLOWERS[template.flowerType] || FLOWERS.rose;
  const isBouquet = !!def.side;

  return (
    <div
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: (size * VIEW.h) / VIEW.w }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Chạm vào đóa hoa để mở thư' : undefined}
    >
      {glow && (
        <div
          className={`pointer-events-none absolute left-1/2 rounded-full blur-2xl ${bloom ? '' : 'glow-pulse'}`}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            top: `calc(${HEAD_Y_RATIO * 100}% - ${size * 0.375}px)`,
            marginLeft: -size * 0.375,
            background: `radial-gradient(circle, ${colors.secondary} 0%, ${colors.accent}88 45%, transparent 70%)`,
            opacity: bloom ? 0.55 : undefined,
            transition: 'opacity 1s',
          }}
        />
      )}
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        width="100%"
        height="100%"
        className={instant ? 'instant' : ''}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`${uid}-stem`} x1="0" x2="1">
            <stop offset="0" stopColor="#2e7d32" />
            <stop offset="1" stopColor="#66bb6a" />
          </linearGradient>
          <linearGradient id={`${uid}-wrap`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff8f0" />
            <stop offset="1" stopColor={colors.accent} />
          </linearGradient>
        </defs>

        {/* stems & leaves */}
        <g stroke={`url(#${uid}-stem)`} strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M0 0 C-10 80 12 160 0 252" />
          {isBouquet &&
            def.side.map((s, i) => <path key={i} d={`M${s.x} ${s.y} Q${s.x * 0.4} ${(s.y + 250) / 2} ${s.x * 0.08} 252`} strokeWidth="5" />)}
        </g>
        <path d="M2 150 C-40 120 -78 130 -92 150 C-60 168 -30 170 2 150Z" fill={`url(#${uid}-stem)`} />
        <path d="M0 190 C40 160 80 168 94 186 C64 206 30 208 0 190Z" fill={`url(#${uid}-stem)`} />

        {isBouquet &&
          def.side.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
              <FlowerHead
                type={s.type}
                colors={{ ...colors, petals: [colors.petals[(i + 1) % 5], colors.petals[(i + 2) % 5], colors.petals[(i + 3) % 5]] }}
                bloom={bloom}
                baseDelay={s.delay}
                uid={`${uid}-s${i}`}
              />
            </g>
          ))}

        <FlowerHead type={template.flowerType} colors={colors} bloom={bloom} uid={`${uid}-main`} />

        {isBouquet && (
          <g>
            <path d="M-110 168 L110 168 L40 262 L-40 262Z" fill={`url(#${uid}-wrap)`} stroke={colors.secondary} strokeOpacity="0.5" strokeWidth="2" />
            <path d="M-110 168 L-40 262 M110 168 L40 262 M-60 168 L-18 262 M60 168 L18 262" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
            <g transform="translate(0 214)" fill={colors.primary}>
              <path d="M0 0 C-30 -26 -48 6 0 0 C-30 26 -48 -6 0 0Z" />
              <path d="M0 0 C30 -26 48 6 0 0 C30 26 48 -6 0 0Z" />
              <path d="M0 0 L-16 40 L-6 36 Z M0 0 L16 40 L6 36 Z" />
              <circle r="8" fill={colors.secondary} />
            </g>
          </g>
        )}

        {bloom && !instant && (
          <circle r="40" fill="none" stroke={colors.accent} strokeWidth="3" style={{ animation: 'ring 1.6s ease-out forwards', transformBox: 'view-box', transformOrigin: '0px 0px' }} />
        )}
      </svg>
    </div>
  );
}

export default memo(Flower);
