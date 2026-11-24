import {useEffect, useRef} from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
  isHero: boolean;
  hasCrossFlare: boolean;
  tintIndex: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  width: number;
  tint: string;
}

const TINTS = ['#F5F0FC', '#DCEEFF', '#E2C4FF'] as const;

function createGlowSprite(color: string, size = 32): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const sCtx = sprite.getContext('2d');
  if (!sCtx) return sprite;

  const half = size / 2;
  const grad = sCtx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.22, color);
  grad.addColorStop(0.55, `${color}44`);
  grad.addColorStop(1, 'rgba(4, 2, 8, 0)');

  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, size, size);
  return sprite;
}

export function CosmicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', {alpha: true});
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glowSprites = TINTS.map((tint) => createGlowSprite(tint, 32));

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let comets: Comet[] = [];
    let lastTime = performance.now();
    let nextCometIn = 1400;

    const spawnComet = (): Comet => {
      const fromRight = Math.random() > 0.35;
      const startX = fromRight
        ? width * (0.45 + Math.random() * 0.55)
        : width * (0.05 + Math.random() * 0.45);
      const startY = height * (0.04 + Math.random() * 0.42);
      const speed = 0.24 + Math.random() * 0.16; // px per ms
      const angle = fromRight
        ? Math.PI * (0.72 + Math.random() * 0.1)
        : Math.PI * (0.18 + Math.random() * 0.1);

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 68 + Math.random() * 52,
        life: 0,
        maxLife: 1350 + Math.random() * 650,
        width: 1.3 + Math.random() * 0.6,
        tint: Math.random() > 0.45 ? '#DCEEFF' : '#E8D5FF',
      };
    };

    const initScene = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Tasteful density: visible across phones without visual noise
      const count = width < 768 ? 44 : 68;
      stars = Array.from({length: count}, (_, i) => {
        const isHero = i % 7 === 0;
        const isMedium = i % 3 === 0;
        const depth = isHero ? 0.95 : isMedium ? 0.62 : 0.34;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: isHero
            ? 1.55 + Math.random() * 0.45
            : isMedium
              ? 1.05 + Math.random() * 0.35
              : 0.65 + Math.random() * 0.35,
          baseAlpha: isHero
            ? 0.78 + Math.random() * 0.2
            : isMedium
              ? 0.52 + Math.random() * 0.25
              : 0.3 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.001 + Math.random() * 0.0018,
          vx: (Math.random() - 0.5) * 0.006 * depth,
          vy: -(0.005 + Math.random() * 0.009) * depth,
          isHero,
          hasCrossFlare: i % 11 === 0,
          tintIndex: i % TINTS.length,
        };
      });
    };

    const drawFrame = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Draw stars
      for (const star of stars) {
        if (!prefersReduced) {
          star.x += star.vx * dt;
          star.y += star.vy * dt;
          if (star.x < -10) star.x = width + 10;
          if (star.x > width + 10) star.x = -10;
          if (star.y < -10) star.y = height + 10;
          if (star.y > height + 10) star.y = -10;
        }

        const twinkle = prefersReduced
          ? 0.9
          : 0.52 + 0.48 * Math.sin(star.phase + now * star.twinkleSpeed);
        const alpha = star.baseAlpha * twinkle;

        if (star.isHero) {
          const spriteSize = star.radius * 7.5;
          ctx.globalAlpha = alpha * 0.75;
          ctx.drawImage(
            glowSprites[star.tintIndex],
            star.x - spriteSize / 2,
            star.y - spriteSize / 2,
            spriteSize,
            spriteSize
          );
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = TINTS[star.tintIndex];
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (star.hasCrossFlare && twinkle > 0.72) {
          const flareLen = star.radius * 3.4 * twinkle;
          ctx.globalAlpha = alpha * 0.55;
          ctx.strokeStyle = TINTS[star.tintIndex];
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();
        }
      }

      // Update & draw subtle comets (max 2 simultaneously)
      if (!prefersReduced) {
        nextCometIn -= dt;
        if (nextCometIn <= 0 && comets.length < 2) {
          comets.push(spawnComet());
          nextCometIn = 2600 + Math.random() * 2400;
        }

        for (let i = comets.length - 1; i >= 0; i--) {
          const c = comets[i];
          c.life += dt;
          if (c.life >= c.maxLife) {
            comets.splice(i, 1);
            continue;
          }

          c.x += c.vx * dt;
          c.y += c.vy * dt;

          const progress = c.life / c.maxLife;
          const envelope = Math.sin(progress * Math.PI);
          const speedMag = Math.hypot(c.vx, c.vy) || 1;
          const tailX = c.x - (c.vx / speedMag) * c.length;
          const tailY = c.y - (c.vy / speedMag) * c.length;

          const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
          grad.addColorStop(0, c.tint);
          grad.addColorStop(0.28, `${c.tint}88`);
          grad.addColorStop(1, 'rgba(4, 2, 8, 0)');

          ctx.globalAlpha = 0.78 * envelope;
          ctx.strokeStyle = grad;
          ctx.lineWidth = c.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Luminous comet head using cached sprite
          const headSize = c.width * 10;
          ctx.globalAlpha = 0.85 * envelope;
          ctx.drawImage(
            glowSprites[1],
            c.x - headSize / 2,
            c.y - headSize / 2,
            headSize,
            headSize
          );
        }
      }

      ctx.globalAlpha = 1;
      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    const handleVisibilityChange = () => {
      if (prefersReduced) return;
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    initScene();
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(drawFrame);

    window.addEventListener('resize', initScene);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', initScene);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden contain-strict"
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(62% 44% at 22% 20%, rgba(91, 24, 154, 0.22) 0%, rgba(11, 7, 20, 0) 70%)',
            'radial-gradient(56% 46% at 80% 78%, rgba(142, 68, 236, 0.18) 0%, rgba(4, 2, 8, 0) 68%)',
            '#040208',
          ].join(', '),
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
