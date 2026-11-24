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
  depth: number;
  tint: string;
}

export function CosmicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let scrollOffset = window.scrollY || 0;

    const tints = ['#F5F0FC', '#DCEEFF', '#D9B8FF'];

    const initStars = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 768 ? 18 : 26;
      stars = Array.from({length: count}, (_, i) => {
        const depth = 0.3 + (i % 3) * 0.25;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: i % 6 === 0 ? 1.45 : Math.random() * 0.9 + 0.5,
          baseAlpha: i % 6 === 0 ? 0.72 : Math.random() * 0.38 + 0.18,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.0014 + 0.0006,
          vx: (Math.random() - 0.5) * 0.03 * depth,
          vy: -(0.015 + Math.random() * 0.025) * depth,
          depth,
          tint: tints[i % tints.length],
        };
      });
    };

    const onScroll = () => {
      scrollOffset = window.scrollY || 0;
    };

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!prefersReduced) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < -8) star.x = width + 8;
          if (star.x > width + 8) star.x = -8;
          if (star.y < -8) star.y = height + 8;
          if (star.y > height + 8) star.y = -8;
        }

        const parallaxY = ((star.y - scrollOffset * 0.05 * star.depth) % height + height) % height;
        const twinkle = prefersReduced
          ? 1
          : 0.5 + 0.5 * Math.sin(star.phase + time * star.twinkleSpeed);

        ctx.globalAlpha = star.baseAlpha * twinkle;
        ctx.fillStyle = star.tint;
        ctx.beginPath();
        ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    initStars();
    animationFrameId = requestAnimationFrame(drawFrame);

    window.addEventListener('resize', initStars);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('resize', initStars);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(60% 42% at 24% 22%, rgba(91, 24, 154, 0.20) 0%, rgba(11, 7, 20, 0) 70%)',
            'radial-gradient(54% 44% at 78% 76%, rgba(142, 68, 236, 0.16) 0%, rgba(4, 2, 8, 0) 68%)',
            '#040208',
          ].join(', '),
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
