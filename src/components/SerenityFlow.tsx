import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  type PanInfo,
} from 'motion/react';
import {ArrowRight, ChevronLeft, ChevronRight, Images, Shirt, X} from 'lucide-react';
import {
  CREDITS_LIST,
  EMBLEM_ELEMENTS,
  GARMENT_DESIGNS,
  LEGACY_PROMO_CONTENT,
  LOGO_ALTERNATIVES,
  MIRROR_ICON,
  MISSION_VISION_CONTENT,
  NAME_MEANING_CONTENT,
  SERENITY_SLOGAN,
  SERENITY_WORDMARK,
  UNFORGETTABLE_CONTENT,
  type EmblemElement,
  type SerenitySymbolId,
} from '../data/serenityContent';
import {ResilientEmblemImage} from './ResilientEmblemImage';

type StepId =
  | 'portada'
  | 'inolvidable'
  | 'mision'
  | 'vision'
  | 'emblema'
  | 'nombre'
  | 'legado'
  | 'ending';
type InicioPhase = 'united' | 'icons' | 'blocks';

const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;
const ASSEMBLY_EASE = [0.16, 1, 0.3, 1] as const;

const SMOOTH_TRANSITION = {
  duration: 0.65,
  ease: LUXURY_EASE,
};

const FADE_TRANSITION = {
  duration: 0.44,
  ease: LUXURY_EASE,
};

interface DeltaTransform {
  dx: number;
  dy: number;
  scale: number;
}

const DEFAULT_BLOCK_DELTAS: Record<SerenitySymbolId, DeltaTransform> = {
  cometa: {dx: -95, dy: -118, scale: 0.46},
  galaxia: {dx: -115, dy: -36, scale: 0.25},
  silueta: {dx: -102, dy: 42, scale: 0.32},
  estrella: {dx: -96, dy: 82, scale: 0.45},
};

const LAYER_ASPECT_RATIOS: Record<SerenitySymbolId, number> = {
  cometa: 1075 / 1231,
  galaxia: 1662 / 2606,
  silueta: 2503 / 1681,
  estrella: 1534 / 1243,
};

const LAYER_ORDER: readonly SerenitySymbolId[] = ['galaxia', 'silueta', 'cometa', 'estrella'];

const LAYER_DROP_SHADOW: Record<SerenitySymbolId, string> = {
  estrella: 'drop-shadow-[0_0_24px_rgba(217,0,255,0.9)]',
  galaxia: 'brightness-125 drop-shadow-[0_0_18px_rgba(142,68,236,0.85)]',
  cometa: 'drop-shadow-[0_0_16px_rgba(220,238,255,0.48)]',
  silueta: 'drop-shadow-[0_0_14px_rgba(233,226,245,0.28)]',
};

const ELEMENT_BY_ID = Object.fromEntries(
  EMBLEM_ELEMENTS.map((el) => [el.id, el])
) as Record<SerenitySymbolId, EmblemElement>;

const ENDING_FRAGMENTS = [
  {
    id: 'galaxia' as const,
    init: {x: 48, y: -38, rotate: 14, scale: 0.84},
    delay: 0.06,
    duration: 1.05,
  },
  {
    id: 'silueta' as const,
    init: {x: -46, y: 42, rotate: -9, scale: 0.88},
    delay: 0.15,
    duration: 1.1,
  },
  {
    id: 'cometa' as const,
    init: {x: -74, y: -62, rotate: -18, scale: 1.12},
    delay: 0.24,
    duration: 1.12,
  },
  {
    id: 'estrella' as const,
    init: {x: 58, y: 56, rotate: 24, scale: 1.2},
    delay: 0.34,
    duration: 1.16,
  },
] as const;

const HAIRLINE_GRADIENTS = [
  'from-transparent via-[#d900ff]/35 to-transparent',
  'from-transparent via-[#dceeff]/30 to-transparent',
  'from-transparent via-[#b4a6cc]/25 to-transparent',
] as const;

// Distinct serene layered unveiling for the first emblem appearance (never scattered/rotated like the ending)
const EMBLEM_UNVEIL_ENTRANCE: Record<
  SerenitySymbolId,
  {initial: {opacity: number; x?: number; y?: number; scale?: number}; delay: number; duration: number}
> = {
  galaxia: {
    initial: {opacity: 0, scale: 0.82},
    delay: 0.04,
    duration: 0.85,
  },
  silueta: {
    initial: {opacity: 0, y: 20, scale: 0.96},
    delay: 0.16,
    duration: 0.9,
  },
  estrella: {
    initial: {opacity: 0, scale: 0.45},
    delay: 0.34,
    duration: 0.85,
  },
  cometa: {
    initial: {opacity: 0, x: 26, y: -18, scale: 0.92},
    delay: 0.44,
    duration: 0.9,
  },
};

const ALTERNATIVE_SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 64 : -64,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -64 : 64,
    opacity: 0,
    scale: 0.96,
  }),
};

const GARMENT_SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 72 : -72,
    opacity: 0,
    scale: 0.93,
    rotate: direction >= 0 ? 1.8 : -1.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -72 : 72,
    opacity: 0,
    scale: 0.93,
    rotate: direction >= 0 ? -1.8 : 1.8,
  }),
};

export function SerenityFlow() {
  const [step, setStep] = useState<StepId>('portada');
  const [inicioPhase, setInicioPhase] = useState<InicioPhase>('united');
  const [hasInspectedIcon, setHasInspectedIcon] = useState(false);
  const [showStatements, setShowStatements] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EmblemElement | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [altDirection, setAltDirection] = useState(1);
  const [showGarments, setShowGarments] = useState(false);
  const [garmentIndex, setGarmentIndex] = useState(0);
  const [garmentDirection, setGarmentDirection] = useState(1);
  const [viewport, setViewport] = useState(() =>
    typeof window !== 'undefined'
      ? {w: window.innerWidth, h: window.innerHeight}
      : {w: 390, h: 844}
  );
  const [wordmarkMetrics, setWordmarkMetrics] = useState({top: 24, height: 62});
  const [blockDeltas, setBlockDeltas] =
    useState<Record<SerenitySymbolId, DeltaTransform>>(DEFAULT_BLOCK_DELTAS);

  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const emblemRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Record<SerenitySymbolId, HTMLDivElement | null>>({
    cometa: null,
    galaxia: null,
    silueta: null,
    estrella: null,
  });
  const layerRefs = useRef<Record<SerenitySymbolId, HTMLDivElement | null>>({
    cometa: null,
    galaxia: null,
    silueta: null,
    estrella: null,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = Math.round(window.visualViewport?.height ?? window.innerHeight);
      setViewport({w, h});
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  const paginateAlternatives = useCallback((direction: number) => {
    setAltDirection(direction);
    setAltIndex(
      (prev) => (prev + direction + LOGO_ALTERNATIVES.length) % LOGO_ALTERNATIVES.length
    );
  }, []);

  const paginateGarments = useCallback((direction: number) => {
    setGarmentDirection(direction);
    setGarmentIndex(
      (prev) => (prev + direction + GARMENT_DESIGNS.length) % GARMENT_DESIGNS.length
    );
  }, []);

  useEffect(() => {
    if (!selectedElement && !showAlternatives && !showGarments) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedElement) setSelectedElement(null);
        else if (showAlternatives) setShowAlternatives(false);
        else if (showGarments) setShowGarments(false);
      } else if (showAlternatives) {
        if (e.key === 'ArrowRight') paginateAlternatives(1);
        else if (e.key === 'ArrowLeft') paginateAlternatives(-1);
      } else if (showGarments) {
        if (e.key === 'ArrowRight') paginateGarments(1);
        else if (e.key === 'ArrowLeft') paginateGarments(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedElement, showAlternatives, showGarments, paginateAlternatives, paginateGarments]);

  const geometry = useMemo(() => {
    const isNarrowW = viewport.w < 370;
    const isShortH = viewport.h < 690;
    const effectiveW = Math.min(viewport.w, 430);
    const emblemW = Math.max(
      118,
      Math.min(effectiveW * 0.48, viewport.h * 0.245, 200)
    );
    const emblemH = emblemW * (1419 / 1097);

    // Ending screen stacks slogan + 2 buttons + credits below emblem, so scale slightly tighter on short phones
    const endingEmblemW = Math.max(
      106,
      Math.min(emblemW, viewport.h * (isShortH ? 0.2 : 0.235))
    );
    const endingEmblemH = endingEmblemW * (1419 / 1097);

    const spreadX = Math.min(effectiveW * 0.225, 94);
    const spreadYTop = Math.max(54, Math.min(viewport.h * 0.125, 96));
    const spreadYBottom = Math.max(50, Math.min(viewport.h * 0.115, 88));

    const initCenters: Record<SerenitySymbolId, {cx: number; cy: number}> = {
      cometa: {cx: -0.23 * emblemW, cy: -0.33 * emblemH},
      galaxia: {cx: -0.001 * emblemW, cy: -0.025 * emblemH},
      silueta: {cx: -0.062 * emblemW, cy: -0.025 * emblemH},
      estrella: {cx: -0.06 * emblemW, cy: 0.265 * emblemH},
    };

    const targetCenters: Record<SerenitySymbolId, {tx: number; ty: number}> = {
      cometa: {tx: -spreadX, ty: -spreadYTop},
      galaxia: {tx: spreadX, ty: -spreadYTop},
      silueta: {tx: -spreadX, ty: spreadYBottom},
      estrella: {tx: spreadX, ty: spreadYBottom},
    };

    const iconDeltas: Record<SerenitySymbolId, {dx: number; dy: number}> = {
      cometa: {
        dx: targetCenters.cometa.tx - initCenters.cometa.cx,
        dy: targetCenters.cometa.ty - initCenters.cometa.cy,
      },
      galaxia: {
        dx: targetCenters.galaxia.tx - initCenters.galaxia.cx,
        dy: targetCenters.galaxia.ty - initCenters.galaxia.cy,
      },
      silueta: {
        dx: targetCenters.silueta.tx - initCenters.silueta.cx,
        dy: targetCenters.silueta.ty - initCenters.silueta.cy,
      },
      estrella: {
        dx: targetCenters.estrella.tx - initCenters.estrella.cx,
        dy: targetCenters.estrella.ty - initCenters.estrella.cy,
      },
    };

    const nameCardWordmarkY = isShortH
      ? 6
      : Math.max(8, Math.min(24, Math.round(viewport.h * 0.025)));
    const maxSafeIntroY = Math.max(
      8,
      viewport.h - 148 - (wordmarkMetrics.top + wordmarkMetrics.height)
    );
    const introCenterWordmarkY = Math.max(
      0,
      Math.min(
        viewport.h / 2 - (wordmarkMetrics.top + wordmarkMetrics.height / 2),
        maxSafeIntroY
      )
    );

    return {
      isNarrowW,
      isShortH,
      emblemW,
      emblemH,
      endingEmblemW,
      endingEmblemH,
      iconDeltas,
      nameCardWordmarkY,
      introCenterWordmarkY,
    };
  }, [viewport, wordmarkMetrics]);

  // Measure exact un-transformed coordinates from each emblem piece to its block's left icon slot
  useLayoutEffect(() => {
    const wm = wordmarkRef.current;
    if (wm) {
      const parentTop = wm.parentElement?.offsetTop ?? 0;
      const nextTop = parentTop + wm.offsetTop || 28;
      const nextHeight = wm.offsetHeight || 64;
      setWordmarkMetrics((prev) =>
        prev.top === nextTop && prev.height === nextHeight
          ? prev
          : {top: nextTop, height: nextHeight}
      );
    }

    if (step !== 'emblema') return;
    const emblemEl = emblemRef.current;
    if (!emblemEl) return;

    const emblemRect = emblemEl.getBoundingClientRect();
    const nextDeltas = {} as Record<SerenitySymbolId, DeltaTransform>;
    let allMeasured = true;

    for (const el of EMBLEM_ELEMENTS) {
      const slotEl = slotRefs.current[el.id];
      const layerEl = layerRefs.current[el.id];
      if (!slotEl || !layerEl) {
        allMeasured = false;
        break;
      }

      const slotRect = slotEl.getBoundingClientRect();
      // Deterministic untransformed center of layerEl inside emblemEl
      const baseW = geometry.emblemW * (parseFloat(el.layout.width) / 100);
      const baseH = baseW * LAYER_ASPECT_RATIOS[el.id];
      const baseLeft = geometry.emblemW * (parseFloat(el.layout.left) / 100);
      const baseTop = geometry.emblemH * (parseFloat(el.layout.top) / 100);
      const baseCenterX = emblemRect.left + baseLeft + baseW / 2;
      const baseCenterY = emblemRect.top + baseTop + baseH / 2;

      const slotCenterX = slotRect.left + slotRect.width / 2;
      const slotCenterY = slotRect.top + slotRect.height / 2;

      const targetBox = Math.min(slotRect.width, slotRect.height) * 0.94;
      const scaleFit = Math.min(targetBox / Math.max(baseW, 1), targetBox / Math.max(baseH, 1));

      nextDeltas[el.id] = {
        dx: slotCenterX - baseCenterX,
        dy: slotCenterY - baseCenterY,
        scale: Number.isFinite(scaleFit) && scaleFit > 0 ? scaleFit : 0.4,
      };
    }

    if (allMeasured) {
      setBlockDeltas(nextDeltas);
    }
  }, [viewport, step, inicioPhase, geometry.emblemW, geometry.emblemH]);

  const goToStep = (next: StepId) => {
    setSelectedElement(null);
    setShowAlternatives(false);
    setShowGarments(false);
    if (next === 'emblema') {
      setInicioPhase('united');
      setHasInspectedIcon(false);
    }
    if (next !== 'inolvidable') {
      setShowStatements(false);
    }
    setStep(next);
  };

  const handleEmblemContinue = () => {
    if (inicioPhase === 'united') {
      setInicioPhase('icons');
      return;
    }
    if (inicioPhase === 'icons') {
      if (!hasInspectedIcon) {
        setInicioPhase('blocks');
      } else {
        goToStep('nombre');
      }
      return;
    }
    // inicioPhase === 'blocks'
    goToStep('nombre');
  };

  const handleBack = () => {
    if (step === 'inolvidable') {
      if (showStatements) {
        setShowStatements(false);
      } else {
        goToStep('portada');
      }
    } else if (step === 'mision') {
      setShowStatements(true);
      setStep('inolvidable');
    } else if (step === 'vision') {
      goToStep('mision');
    } else if (step === 'emblema') {
      if (inicioPhase === 'blocks') setInicioPhase('icons');
      else if (inicioPhase === 'icons') setInicioPhase('united');
      else goToStep('vision');
    } else if (step === 'nombre') {
      setStep('emblema');
      setInicioPhase(hasInspectedIcon ? 'icons' : 'blocks');
    } else if (step === 'legado') {
      goToStep('nombre');
    } else if (step === 'ending') {
      if (showAlternatives) {
        setShowAlternatives(false);
      } else if (showGarments) {
        setShowGarments(false);
      } else {
        goToStep('legado');
      }
    }
  };

  const handleAlternativeDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -42 || info.velocity.x < -280) {
      paginateAlternatives(1);
    } else if (info.offset.x > 42 || info.velocity.x > 280) {
      paginateAlternatives(-1);
    }
  };

  const handleGarmentDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -42 || info.velocity.x < -280) {
      paginateGarments(1);
    } else if (info.offset.x > 42 || info.velocity.x > 280) {
      paginateGarments(-1);
    }
  };

  const isCentered = step === 'portada';
  const wordmarkTargetY = isCentered
    ? geometry.introCenterWordmarkY
    : step === 'nombre'
      ? geometry.nameCardWordmarkY
      : 0;
  const wordmarkTargetScale = isCentered
    ? geometry.isNarrowW
      ? 1.16
      : 1.25
    : step === 'nombre'
      ? geometry.isNarrowW
        ? 1.04
        : 1.1
      : 1;

  const currentAlternative = LOGO_ALTERNATIVES[altIndex];
  const currentGarment = GARMENT_DESIGNS[garmentIndex];

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col items-center overflow-x-clip px-4 min-[375px]:px-5 pt-safe pb-safe">
          {/* Subtle quiet back chevron */}
          {step !== 'portada' ? (
            <div className="absolute left-2 top-2.5 z-30 min-[375px]:left-3 min-[375px]:top-3 pt-safe">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Volver"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#82739e] transition-colors duration-200 hover:text-[#f5f0fc] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {/* PERSISTENT SERENITY WORDMARK (Starts centered with blur on portada, then glides to resting top) */}
          <div className="relative z-20 shrink-0 pt-3 min-[375px]:pt-4 sm:pt-6">
            <div ref={wordmarkRef} className="relative">
              {/* Soft breathing halo behind wordmark exclusively on portada */}
              <motion.div
                aria-hidden="true"
                initial={{opacity: 0, scale: 0.75}}
                animate={
                  isCentered
                    ? {opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.08, 0.95], y: wordmarkTargetY}
                    : {opacity: 0, scale: 0.75, y: wordmarkTargetY}
                }
                transition={{
                  opacity: isCentered
                    ? {duration: 4.2, repeat: Infinity, ease: 'easeInOut'}
                    : {duration: 0.35, ease: LUXURY_EASE},
                  scale: isCentered
                    ? {duration: 4.2, repeat: Infinity, ease: 'easeInOut'}
                    : {duration: 0.35, ease: LUXURY_EASE},
                  y: {duration: 0.85, ease: LUXURY_EASE},
                }}
                className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-full blur-2xl will-change-transform"
                style={{
                  background:
                    'radial-gradient(circle, rgba(142,68,236,0.34) 0%, rgba(217,0,255,0.14) 48%, rgba(4,2,8,0) 76%)',
                }}
              />
              <motion.div
                initial={{
                  opacity: 0,
                  y: geometry.introCenterWordmarkY,
                  scale: geometry.isNarrowW ? 1.16 : 1.25,
                  filter: 'blur(16px)',
                }}
                animate={{
                  opacity: 1,
                  y: wordmarkTargetY,
                  scale: wordmarkTargetScale,
                  filter: 'blur(0px)',
                }}
                transition={{duration: 0.85, ease: LUXURY_EASE}}
                className="relative flex flex-col origin-center items-center justify-center will-change-transform"
              >
                <ResilientEmblemImage
                  src={SERENITY_WORDMARK}
                  alt="Serenity"
                  className="h-auto w-[166px] min-[375px]:w-[190px] sm:w-[215px] object-contain drop-shadow-[0_0_24px_rgba(245,240,252,0.18)]"
                />
                <span className="mt-1 text-[9.5px] font-medium tracking-[0.26em] text-[#b4a6cc]/75 uppercase min-[375px]:text-[10px] sm:text-[10.5px]">
                  Logo 14
                </span>
              </motion.div>
            </div>
          </div>

          {/* SCREEN CONTENT STAGE */}
          <div className="relative flex flex-1 w-full flex-col overflow-x-clip">
            <AnimatePresence mode="wait">
              {/* ==================== 0. PORTADA (LOGO IN CENTER WITH BLUR + CONTINUAR) ==================== */}
              {step === 'portada' && (
                <motion.section
                  key="portada"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  transition={FADE_TRANSITION}
                  className="flex flex-1 flex-col items-center justify-end pb-5 pt-2 min-[375px]:pb-7 sm:pb-9"
                >
                  <div className="flex-1" />
                  <ContinueButton onClick={() => goToStep('inolvidable')} delay={0.32} />
                </motion.section>
              )}
            {/* ==================== 1. QUÉ HACE INOLVIDABLE A UNA PROMOCIÓN ==================== */}
            {step === 'inolvidable' && (
              <motion.section
                key="inolvidable"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between gap-4 pb-5 pt-2 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center py-2">
                  <AnimatePresence mode="wait">
                    {!showStatements ? (
                      <motion.div
                        key="question-card"
                        initial={{opacity: 0, y: 18, scale: 0.96}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{
                          opacity: 0,
                          scale: 0.94,
                          y: -20,
                          transition: {duration: 0.3, ease: LUXURY_EASE},
                        }}
                        transition={SMOOTH_TRANSITION}
                        className="w-full rounded-3xl border border-[#e5d9f8]/15 bg-[#0b0714]/82 p-5 text-center backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] will-change-transform min-[375px]:p-6 sm:p-7"
                      >
                        <h2 className="font-serif text-[22px] font-semibold leading-tight text-[#f5f0fc] min-[375px]:text-2xl sm:text-3xl [text-wrap:balance]">
                          {UNFORGETTABLE_CONTENT.question}
                        </h2>
                        <p className="mt-3 text-[13.5px] leading-relaxed text-[#cfc4e3] min-[375px]:mt-3.5 min-[375px]:text-sm sm:text-[15px]">
                          {UNFORGETTABLE_CONTENT.answer}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="statements-stack"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.2}}
                        className="flex w-full flex-col gap-3 sm:gap-3.5"
                      >
                        {UNFORGETTABLE_CONTENT.statements.map((segments, idx) => (
                          <motion.div
                            key={idx}
                            initial={{
                              opacity: 0,
                              y: 34,
                              scale: 0.95,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            transition={{
                              duration: 0.72,
                              delay: 0.06 + idx * 0.14,
                              ease: [0.19, 1, 0.22, 1],
                            }}
                            whileTap={{scale: 0.985}}
                            className="relative mt-5 w-full rounded-3xl border border-[#e5d9f8]/16 bg-[#0b0714]/85 px-5 pb-6 pt-8 text-center text-[14px] leading-relaxed text-[#cfc4e3] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] will-change-transform min-[375px]:px-6 min-[375px]:pb-7 min-[375px]:pt-9 min-[375px]:text-[15px] sm:px-7 sm:pb-8 sm:pt-10 sm:text-base [text-wrap:balance]"
                          >
                            {/* Centered top-margin mirror icon medallion */}
                            <motion.div
                              initial={{opacity: 0, scale: 0.72, y: 6}}
                              animate={{opacity: 1, scale: 1, y: 0}}
                              transition={{duration: 0.55, delay: 0.16, ease: LUXURY_EASE}}
                              className="absolute left-1/2 top-0 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5d9f8]/24 bg-[#0b0714] shadow-[0_0_24px_rgba(217,0,255,0.22),0_6px_18px_rgba(0,0,0,0.65)] min-[375px]:h-11 min-[375px]:w-11"
                            >
                              <img
                                src={MIRROR_ICON}
                                alt=""
                                aria-hidden="true"
                                loading="eager"
                                decoding="sync"
                                className="h-[18px] w-[18px] brightness-0 invert opacity-90 drop-shadow-[0_0_8px_rgba(229,217,248,0.4)] min-[375px]:h-5 min-[375px]:w-5"
                              />
                            </motion.div>

                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
                            >
                              <div
                                className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r ${HAIRLINE_GRADIENTS[idx % HAIRLINE_GRADIENTS.length]}`}
                              />
                            </div>

                            {segments.map((seg, sIdx) =>
                              seg.bold ? (
                                <strong key={sIdx} className="font-semibold text-[#f5f0fc]">
                                  {seg.text}
                                </strong>
                              ) : (
                                <span key={sIdx}>{seg.text}</span>
                              )
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex w-full justify-center pt-1">
                  <ContinueButton
                    delay={showStatements ? 0.12 : 0.22}
                    onClick={() => {
                      if (!showStatements) {
                        setShowStatements(true);
                      } else {
                        goToStep('mision');
                      }
                    }}
                  />
                </div>
              </motion.section>
            )}

            {/* ==================== 2. MISIÓN ==================== */}
            {step === 'mision' && (
              <motion.section
                key="mision"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between gap-4 pb-5 pt-2 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center py-2 text-center">
                  <div className="relative -mt-3 max-w-[340px] space-y-3.5 px-2 min-[375px]:-mt-6 min-[375px]:space-y-4 sm:-mt-10">
                    {/* Quiet organic aura behind mission statement */}
                    <motion.div
                      aria-hidden="true"
                      animate={{opacity: [0.22, 0.4, 0.22], scale: [0.96, 1.04, 0.96]}}
                      transition={{duration: 6.5, repeat: Infinity, ease: 'easeInOut'}}
                      className="pointer-events-none absolute -inset-x-10 -inset-y-8 rounded-full blur-3xl will-change-transform"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(217,0,255,0.16) 0%, rgba(142,68,236,0.1) 45%, rgba(4,2,8,0) 75%)',
                      }}
                    />
                    <motion.span
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{...SMOOTH_TRANSITION, delay: 0.05}}
                      className="relative block text-xs font-medium tracking-[0.18em] text-[#d900ff] uppercase"
                    >
                      {MISSION_VISION_CONTENT.mission.label}
                    </motion.span>
                    <motion.div
                      initial={{scaleX: 0, opacity: 0}}
                      animate={{scaleX: 1, opacity: 1}}
                      transition={{duration: 0.55, delay: 0.12, ease: LUXURY_EASE}}
                      className="relative mx-auto h-px w-16 bg-gradient-to-r from-transparent via-[#d900ff]/55 to-transparent will-change-transform"
                    />
                    <motion.p
                      initial={{opacity: 0, y: 14, scale: 0.97}}
                      animate={{opacity: 1, y: 0, scale: 1}}
                      transition={{...SMOOTH_TRANSITION, delay: 0.16}}
                      className="relative font-serif text-[26px] font-medium leading-snug text-[#f5f0fc] min-[375px]:text-3xl sm:text-4xl [text-wrap:balance]"
                    >
                      {MISSION_VISION_CONTENT.mission.text}
                    </motion.p>
                  </div>
                </div>

                <ContinueButton onClick={() => goToStep('vision')} delay={0.22} />
              </motion.section>
            )}

            {/* ==================== 3. VISIÓN ==================== */}
            {step === 'vision' && (
              <motion.section
                key="vision"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between gap-4 pb-5 pt-2 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center py-2 text-center">
                  <div className="relative -mt-3 max-w-[340px] space-y-3.5 px-2 min-[375px]:-mt-6 min-[375px]:space-y-4 sm:-mt-10">
                    {/* Quiet organic aura behind vision statement */}
                    <motion.div
                      aria-hidden="true"
                      animate={{opacity: [0.2, 0.36, 0.2], scale: [0.96, 1.04, 0.96]}}
                      transition={{duration: 6.5, repeat: Infinity, ease: 'easeInOut'}}
                      className="pointer-events-none absolute -inset-x-10 -inset-y-8 rounded-full blur-3xl will-change-transform"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(220,238,255,0.14) 0%, rgba(142,68,236,0.12) 45%, rgba(4,2,8,0) 75%)',
                      }}
                    />
                    <motion.span
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{...SMOOTH_TRANSITION, delay: 0.05}}
                      className="relative block text-xs font-medium tracking-[0.18em] text-[#dceeff] uppercase"
                    >
                      {MISSION_VISION_CONTENT.vision.label}
                    </motion.span>
                    <motion.div
                      initial={{scaleX: 0, opacity: 0}}
                      animate={{scaleX: 1, opacity: 1}}
                      transition={{duration: 0.55, delay: 0.12, ease: LUXURY_EASE}}
                      className="relative mx-auto h-px w-16 bg-gradient-to-r from-transparent via-[#dceeff]/55 to-transparent will-change-transform"
                    />
                    <motion.p
                      initial={{opacity: 0, y: 14, scale: 0.97}}
                      animate={{opacity: 1, y: 0, scale: 1}}
                      transition={{...SMOOTH_TRANSITION, delay: 0.16}}
                      className="relative font-serif text-[26px] font-medium leading-snug text-[#f5f0fc] min-[375px]:text-3xl sm:text-4xl [text-wrap:balance]"
                    >
                      {MISSION_VISION_CONTENT.vision.text}
                    </motion.p>
                  </div>
                </div>

                <ContinueButton onClick={() => goToStep('emblema')} delay={0.22} />
              </motion.section>
            )}

            {/* ==================== 3. EMBLEMA (UNITED -> 4 ICONS -> 4 BLOCKS) ==================== */}
            {step === 'emblema' && (
              <motion.section
                key="emblema"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="relative flex flex-1 flex-col items-center justify-between gap-3 pb-5 pt-2 sm:pb-7"
              >
                <div
                  className={`relative flex flex-1 w-full flex-col items-center justify-center ${
                    inicioPhase === 'blocks' ? 'min-h-[305px] min-[375px]:min-h-[335px]' : 'min-h-[240px]'
                  }`}
                >
                  {/* 4 HORIZONTAL RECTANGLE BLOCKS LAYER (slots measured continuously; revealed AFTER icons land) */}
                  <div
                    className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 min-[375px]:gap-2.5 sm:gap-3 ${
                      inicioPhase === 'blocks' ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    {EMBLEM_ELEMENTS.map((el, idx) => (
                      <motion.div
                        key={`block-${el.id}`}
                        initial={false}
                        animate={{opacity: inicioPhase === 'blocks' ? 1 : 0}}
                        transition={{
                          duration: 0.45,
                          delay: inicioPhase === 'blocks' ? 0.36 + idx * 0.06 : 0,
                          ease: LUXURY_EASE,
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-[#e5d9f8]/14 bg-[#0b0714]/80 px-3 py-2 backdrop-blur-xl min-[375px]:gap-3.5 min-[375px]:px-3.5 min-[375px]:py-2.5 sm:gap-4 sm:px-4 sm:py-3"
                      >
                        {/* Left Icon Landing Slot (always measured in layout, stays empty so persistent icon sits right inside) */}
                        <div
                          ref={(node) => {
                            slotRefs.current[el.id] = node;
                          }}
                          className="h-10 w-10 shrink-0 min-[375px]:h-12 min-[375px]:w-12 sm:h-13 sm:w-13"
                        />

                        {/* Text appears smoothly beside the icon after icon arrives */}
                        <motion.div
                          initial={false}
                          animate={
                            inicioPhase === 'blocks'
                              ? {opacity: 1, x: 0}
                              : {opacity: 0, x: 10}
                          }
                          transition={{
                            duration: 0.45,
                            delay: inicioPhase === 'blocks' ? 0.52 + idx * 0.07 : 0,
                            ease: LUXURY_EASE,
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <h2 className="font-serif text-[15px] font-semibold leading-tight text-[#f5f0fc] min-[375px]:text-base sm:text-lg">
                            {el.title}
                          </h2>
                          <p className="mt-0.5 text-[11px] leading-snug text-[#cfc4e3] min-[375px]:text-[11.5px] sm:text-xs">
                            {el.shortMeaning}
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  {/* PERSISTENT 4-ELEMENT EMBLEM (Moves continuously: United -> 2x2 Breathing Icons -> Block Slots) */}
                  <div
                    ref={emblemRef}
                    style={{
                      width: `${geometry.emblemW}px`,
                      height: `${geometry.emblemH}px`,
                    }}
                    className="relative pointer-events-none"
                  >
                    {/* Cosmic Glow blooms gently on first reveal and breathes when united */}
                    <motion.div
                      aria-hidden="true"
                      initial={inicioPhase === 'united' ? {opacity: 0, scale: 0.65} : false}
                      animate={{
                        opacity:
                          inicioPhase === 'united'
                            ? [0.75, 1, 0.75]
                            : inicioPhase === 'icons'
                              ? 0.24
                              : 0,
                        scale:
                          inicioPhase === 'united'
                            ? [0.97, 1.04, 0.97]
                            : 1.2,
                      }}
                      transition={{
                        opacity: {
                          duration: inicioPhase === 'united' ? 4.5 : 0.45,
                          delay: inicioPhase === 'united' ? 0.1 : 0,
                          repeat: inicioPhase === 'united' ? Infinity : 0,
                          ease: 'easeInOut',
                        },
                        scale: {
                          duration: inicioPhase === 'united' ? 4.5 : 0.45,
                          delay: inicioPhase === 'united' ? 0.1 : 0,
                          repeat: inicioPhase === 'united' ? Infinity : 0,
                          ease: 'easeInOut',
                        },
                      }}
                      className="pointer-events-none absolute -inset-10 rounded-full blur-3xl will-change-transform"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(217,0,255,0.34) 0%, rgba(142,68,236,0.28) 42%, rgba(220,238,255,0.08) 68%, rgba(4,2,8,0) 80%)',
                      }}
                    />

                    {LAYER_ORDER.map((id, idx) => {
                      const el = ELEMENT_BY_ID[id];
                      const iconDelta = geometry.iconDeltas[id];
                      const blockDelta = blockDeltas[id];
                      const isCurrentlyInOverlay = selectedElement?.id === el.id;

                      const targetX =
                        inicioPhase === 'united'
                          ? 0
                          : inicioPhase === 'icons'
                            ? iconDelta.dx
                            : blockDelta.dx;
                      const targetY =
                        inicioPhase === 'united'
                          ? 0
                          : inicioPhase === 'icons'
                            ? iconDelta.dy
                            : blockDelta.dy;
                      const targetScale =
                        inicioPhase === 'united'
                          ? 1
                          : inicioPhase === 'icons'
                            ? el.iconScale
                            : blockDelta.scale;

                      const tilt = idx % 2 === 0 ? 1.4 : -1.4;

                      return (
                        <div
                          key={el.id}
                          ref={(node) => {
                            layerRefs.current[el.id] = node;
                          }}
                          style={{
                            left: el.layout.left,
                            top: el.layout.top,
                            width: el.layout.width,
                          }}
                          className="absolute z-10 origin-center"
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              x: targetX,
                              y: targetY,
                              scale: targetScale,
                            }}
                            transition={{
                              duration: 0.72,
                              delay: inicioPhase === 'blocks' ? idx * 0.04 : 0,
                              ease: LUXURY_EASE,
                            }}
                            className="origin-center will-change-transform"
                          >
                            {/* Gentle serene levitation when united, orbital micro-tilt when icons */}
                            <motion.div
                              animate={
                                inicioPhase === 'icons' && !isCurrentlyInOverlay
                                  ? {
                                      scale: [1, 1.045, 1],
                                      y: [0, -3.5, 0],
                                      rotate: [0, tilt, 0],
                                    }
                                  : inicioPhase === 'united'
                                    ? {
                                        scale: 1,
                                        y: [0, -3.5, 0],
                                        rotate: 0,
                                      }
                                    : {scale: 1, y: 0, rotate: 0}
                              }
                              transition={
                                inicioPhase === 'icons' && !isCurrentlyInOverlay
                                  ? {
                                      duration: 3.2,
                                      delay: idx * 0.35,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }
                                  : inicioPhase === 'united'
                                    ? {
                                        y: {
                                          duration: 5.0,
                                          delay: 0.9,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                        },
                                        scale: {duration: 0.25},
                                        rotate: {duration: 0.25},
                                      }
                                    : {duration: 0.25}
                              }
                              className="will-change-transform"
                            >
                              {!isCurrentlyInOverlay ? (
                                <motion.div
                                  initial={
                                    inicioPhase === 'united'
                                      ? EMBLEM_UNVEIL_ENTRANCE[id].initial
                                      : false
                                  }
                                  animate={{opacity: 1, x: 0, y: 0, scale: 1}}
                                  transition={{
                                    duration: EMBLEM_UNVEIL_ENTRANCE[id].duration,
                                    delay:
                                      inicioPhase === 'united'
                                        ? EMBLEM_UNVEIL_ENTRANCE[id].delay
                                        : 0,
                                    ease: LUXURY_EASE,
                                  }}
                                  className="will-change-transform"
                                >
                                  <motion.button
                                    layoutId={inicioPhase === 'icons' ? `symbol-${el.id}` : undefined}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (inicioPhase === 'united') {
                                        setInicioPhase('icons');
                                      } else if (inicioPhase === 'icons') {
                                        setHasInspectedIcon(true);
                                        setSelectedElement(el);
                                      }
                                    }}
                                    aria-label={
                                      inicioPhase === 'icons'
                                        ? `Ver significado de ${el.title}`
                                        : el.title
                                    }
                                    transition={SMOOTH_TRANSITION}
                                    className={`block w-full border-0 bg-transparent p-0 m-0 focus-visible:outline-2 focus-visible:outline-[#d900ff] ${
                                      inicioPhase === 'blocks'
                                        ? 'pointer-events-none'
                                        : 'pointer-events-auto cursor-pointer active:scale-95'
                                    }`}
                                  >
                                    <ResilientEmblemImage
                                      src={el.image}
                                      alt={el.title}
                                      className={`h-auto w-full object-contain ${LAYER_DROP_SHADOW[id]}`}
                                    />
                                  </motion.button>
                                </motion.div>
                              ) : (
                                <div className="w-full aspect-square opacity-0" />
                              )}
                            </motion.div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slogan: visible ONLY when united */}
                  <div className="mt-5 flex h-7 items-center justify-center">
                    <AnimatePresence mode="wait">
                      {inicioPhase === 'united' ? (
                        <motion.p
                          key="slogan-united"
                          initial={{opacity: 0, y: 8}}
                          animate={{opacity: 1, y: 0}}
                          exit={{opacity: 0, y: -4}}
                          transition={{duration: 0.55, delay: 0.56, ease: LUXURY_EASE}}
                          className="text-center font-serif text-lg italic tracking-[0.04em] text-[#e9e2f5] sm:text-xl"
                        >
                          {SERENITY_SLOGAN}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>

                <ContinueButton onClick={handleEmblemContinue} />
              </motion.section>
            )}

            {/* ==================== 4. SIGNIFICADO DEL NOMBRE ==================== */}
            {step === 'nombre' && (
              <motion.section
                key="nombre"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                style={{paddingTop: `${geometry.nameCardWordmarkY + 14}px`}}
                className="flex flex-1 flex-col items-center justify-between gap-4 pb-5 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center">
                  {/* Single Unified Card: Meaning text on top, full-width top-cropped summit art flush at bottom */}
                  <motion.div
                    initial={{opacity: 0, y: 16, scale: 0.97}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{...SMOOTH_TRANSITION, delay: 0.12}}
                    className="relative w-full max-w-[390px] overflow-hidden rounded-3xl border border-[#e5d9f8]/18 bg-[#0b0714]/88 pt-4 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.72)] will-change-transform min-[375px]:pt-5 sm:pt-6"
                  >
                    {/* Subtle top border light catch */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e5d9f8]/30 to-transparent"
                    />

                    <div className="px-4 min-[375px]:px-5 sm:px-6">
                      {/* Header: Significado label & pronunciation */}
                      <div className="relative flex items-center justify-between gap-3 pb-2 min-[375px]:pb-2.5">
                        <span className="text-[10.5px] font-semibold tracking-[0.16em] text-[#b8a7d6] uppercase min-[375px]:text-[11px]">
                          Significado
                        </span>
                        <span className="font-serif text-base font-medium tracking-wide text-[#f5f0fc] min-[375px]:text-lg">
                          {NAME_MEANING_CONTENT.pronunciation}
                        </span>
                        <motion.div
                          aria-hidden="true"
                          initial={{scaleX: 0}}
                          animate={{scaleX: 1}}
                          transition={{duration: 0.65, delay: 0.28, ease: LUXURY_EASE}}
                          className="absolute inset-x-0 bottom-0 h-px origin-center bg-gradient-to-r from-transparent via-[#e5d9f8]/24 to-transparent"
                        />
                      </div>

                      {/* Meaning Statement Text (primary visual focus) */}
                      <motion.div
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.3, ease: LUXURY_EASE}}
                        className="mt-3 space-y-2 text-center min-[375px]:mt-3.5 min-[375px]:space-y-2.5"
                      >
                        <p className="text-[13.5px] leading-relaxed text-[#f0eafb] min-[375px]:text-[14.5px] sm:text-[15px] font-normal">
                          {NAME_MEANING_CONTENT.whyThisName}
                        </p>
                        <p className="text-[12.5px] leading-relaxed text-[#d7cce9] min-[375px]:text-[13.5px] sm:text-[14px] font-normal">
                          {NAME_MEANING_CONTENT.extraMeaning}
                        </p>
                      </motion.div>
                    </div>

                    {/* Full-width compact cropped mountain summit image: zero stretching, top summit figure always preserved */}
                    <motion.div
                      initial={{opacity: 0, filter: 'blur(12px)'}}
                      animate={{opacity: 1, filter: 'blur(0px)'}}
                      transition={{duration: 0.85, delay: 0.36, ease: LUXURY_EASE}}
                      className="relative mt-3.5 h-[clamp(108px,18dvh,154px)] w-full overflow-hidden min-[375px]:mt-4"
                    >
                      <ResilientEmblemImage
                        src={NAME_MEANING_CONTENT.image}
                        alt="Serenity — Cima de la montaña"
                        className="pointer-events-none block h-full w-full object-cover object-[50%_18%]"
                      />
                      {/* Smooth top melt so purple sky integrates cleanly into obsidian card */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0b0714] via-[#0b0714]/55 to-transparent"
                      />
                    </motion.div>
                  </motion.div>
                </div>

                <ContinueButton onClick={() => goToStep('legado')} delay={0.22} />
              </motion.section>
            )}

            {/* ==================== 5. LEGADO / PROMOCIÓN SERENITY ==================== */}
            {step === 'legado' && (
              <motion.section
                key="legado"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between gap-4 pb-5 pt-2 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center py-1">
                  <motion.div
                    initial={{opacity: 0, y: 18, scale: 0.97}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{...SMOOTH_TRANSITION, delay: 0.1}}
                    className="relative w-full max-w-[395px] overflow-hidden rounded-3xl border border-[#e5d9f8]/18 bg-[#0b0714]/88 p-4 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.72)] will-change-transform min-[375px]:p-5 sm:p-6"
                  >
                    {/* Subtle cosmic top edge highlight */}
                    <motion.div
                      aria-hidden="true"
                      initial={{scaleX: 0, opacity: 0}}
                      animate={{scaleX: 1, opacity: 1}}
                      transition={{duration: 0.8, delay: 0.2, ease: LUXURY_EASE}}
                      className="mx-auto mb-3.5 h-px w-24 origin-center bg-gradient-to-r from-transparent via-[#d900ff]/65 to-transparent min-[375px]:mb-4"
                    />

                    <div className="space-y-3 text-center min-[375px]:space-y-4">
                      {LEGACY_PROMO_CONTENT.paragraphs.map((paragraph, pIdx) => (
                        <motion.p
                          key={pIdx}
                          initial={{opacity: 0, y: 10}}
                          animate={{opacity: 1, y: 0}}
                          transition={{
                            duration: 0.55,
                            delay: 0.18 + pIdx * 0.14,
                            ease: LUXURY_EASE,
                          }}
                          className="text-[12.5px] leading-relaxed text-[#cfc4e3] min-[375px]:text-[13.5px] sm:text-[14.5px] [text-wrap:pretty]"
                        >
                          {paragraph.map((seg, sIdx) =>
                            seg.bold ? (
                              <strong key={sIdx} className="font-semibold text-[#ffffff]">
                                {seg.text}
                              </strong>
                            ) : (
                              <span key={sIdx}>{seg.text}</span>
                            )
                          )}
                        </motion.p>
                      ))}
                    </div>

                    <motion.div
                      aria-hidden="true"
                      initial={{scaleX: 0, opacity: 0}}
                      animate={{scaleX: 1, opacity: 1}}
                      transition={{duration: 0.8, delay: 0.38, ease: LUXURY_EASE}}
                      className="mx-auto mt-3.5 h-px w-16 origin-center bg-gradient-to-r from-transparent via-[#e5d9f8]/30 to-transparent min-[375px]:mt-4"
                    />
                  </motion.div>
                </div>

                <ContinueButton onClick={() => goToStep('ending')} delay={0.28} />
              </motion.section>
            )}

            {/* ==================== 5. ENDING (DEFRAGMENTADO -> SE ORDENA CON FLUJO PREMIUM) ==================== */}
            {step === 'ending' && (
              <motion.section
                key="ending"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between gap-3 pb-4 pt-2 min-[375px]:pb-6 sm:pb-8"
              >
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div
                    style={{
                      width: `${geometry.endingEmblemW}px`,
                      height: `${geometry.endingEmblemH}px`,
                    }}
                    className="relative"
                  >
                    {/* Cosmic glow blooms as the 4 fragments assemble together */}
                    <motion.div
                      aria-hidden="true"
                      initial={{opacity: 0.1, scale: 0.65}}
                      animate={{
                        opacity: [0.75, 1, 0.75],
                        scale: [0.97, 1.04, 0.97],
                      }}
                      transition={{
                        opacity: {duration: 4.5, delay: 0.65, repeat: Infinity, ease: 'easeInOut'},
                        scale: {duration: 4.5, delay: 0.65, repeat: Infinity, ease: 'easeInOut'},
                      }}
                      className="pointer-events-none absolute -inset-10 rounded-full blur-3xl will-change-transform"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(217,0,255,0.34) 0%, rgba(142,68,236,0.28) 42%, rgba(220,238,255,0.08) 68%, rgba(4,2,8,0) 80%)',
                      }}
                    />

                    {/* Subtle radial lock-in pulse ring when the 4 fragments finish uniting */}
                    <motion.div
                      aria-hidden="true"
                      initial={{opacity: 0, scale: 0.5}}
                      animate={{opacity: [0, 0.55, 0], scale: [0.55, 1.35, 1.55]}}
                      transition={{duration: 1.0, delay: 0.95, ease: LUXURY_EASE}}
                      className="pointer-events-none absolute inset-2 rounded-full border border-[#e5d9f8]/30 will-change-transform"
                    />

                    {ENDING_FRAGMENTS.map((item) => {
                      const el = ELEMENT_BY_ID[item.id];
                      return (
                        <motion.div
                          key={el.id}
                          style={{
                            left: el.layout.left,
                            top: el.layout.top,
                            width: el.layout.width,
                          }}
                          initial={{
                            opacity: 0,
                            x: item.init.x,
                            y: item.init.y,
                            rotate: item.init.rotate,
                            scale: item.init.scale,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                          }}
                          transition={{
                            duration: item.duration,
                            delay: item.delay,
                            ease: ASSEMBLY_EASE,
                          }}
                          className="absolute z-10 origin-center will-change-transform"
                        >
                          <ResilientEmblemImage
                            src={el.image}
                            alt={el.title}
                            className={`h-auto w-full object-contain ${LAYER_DROP_SHADOW[item.id]}`}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Slogan reveals smoothly once emblem finishes ordering itself */}
                  <motion.p
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.65, delay: 1.15, ease: LUXURY_EASE}}
                    className="mt-3 text-center font-serif text-base italic tracking-[0.04em] text-[#e9e2f5] min-[375px]:mt-4 min-[375px]:text-lg sm:mt-5 sm:text-xl"
                  >
                    {SERENITY_SLOGAN}
                  </motion.p>
                </div>

                {/* Action CTAs + Credits at the very bottom */}
                <div className="flex w-full flex-col items-center gap-2.5 pb-0.5 min-[375px]:gap-3">
                  <div className="flex w-full max-w-[270px] flex-col items-center gap-2 min-[375px]:gap-2.5">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setGarmentDirection(1);
                        setGarmentIndex(0);
                        setShowGarments(true);
                      }}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.55, delay: 1.32, ease: LUXURY_EASE}}
                      className="group flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#e5d9f8]/25 bg-[#120c21]/85 px-5 py-2.5 text-xs font-semibold tracking-wide text-[#f5f0fc] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-200 hover:border-[#e5d9f8]/45 hover:bg-[#1a112d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d900ff]"
                    >
                      <Shirt
                        className="h-3.5 w-3.5 text-[#d900ff] transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <span>Diseños de Polo y Jacket</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setAltDirection(1);
                        setAltIndex(0);
                        setShowAlternatives(true);
                      }}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.55, delay: 1.44, ease: LUXURY_EASE}}
                      className="group flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#e5d9f8]/25 bg-[#120c21]/85 px-5 py-2.5 text-xs font-semibold tracking-wide text-[#f5f0fc] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-200 hover:border-[#e5d9f8]/45 hover:bg-[#1a112d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d900ff]"
                    >
                      <Images
                        className="h-3.5 w-3.5 text-[#d900ff] transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <span>Alternativas de logo</span>
                    </motion.button>
                  </div>

                  <motion.div
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 1.56, ease: LUXURY_EASE}}
                    className="space-y-0.5 text-center text-[10.5px] leading-relaxed text-[#82739e] min-[375px]:text-[11px]"
                  >
                    {CREDITS_LIST.map((credit) => (
                      <p key={credit.role}>
                        <span className="text-[#a99bc4]">{credit.role}:</span> {credit.name}
                      </p>
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Blurred Background Overlay with Shared-Element Slide from the Icon Position */}
        <AnimatePresence>
          {selectedElement ? (
            <motion.div
              key="overlay-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="symbol-overlay-title"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.3, ease: LUXURY_EASE}}
              onClick={() => setSelectedElement(null)}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-[#040208]/72 px-6 py-8 backdrop-blur-2xl pt-safe pb-safe"
            >
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                aria-label="Cerrar"
                className="fixed right-3 top-3 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#b4a6cc] transition-colors hover:text-[#f5f0fc] focus-visible:outline-2 focus-visible:outline-[#d900ff] min-[375px]:right-4 min-[375px]:top-4 pt-safe"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="my-auto flex max-w-[310px] flex-col items-center text-center">
                <div className="relative flex h-[min(44vw,24dvh,170px)] w-[min(44vw,24dvh,170px)] items-center justify-center">
                  <motion.div
                    aria-hidden="true"
                    initial={{opacity: 0, scale: 0.7}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={SMOOTH_TRANSITION}
                    className="pointer-events-none absolute h-40 w-40 rounded-full blur-3xl sm:h-44 sm:w-44"
                    style={{
                      background: `radial-gradient(circle, ${selectedElement.glowColor} 0%, rgba(4,2,8,0) 72%)`,
                    }}
                  />

                  <motion.div
                    layoutId={`symbol-${selectedElement.id}`}
                    transition={SMOOTH_TRANSITION}
                    className="relative flex h-full w-full items-center justify-center p-1"
                  >
                    <ResilientEmblemImage
                      src={selectedElement.image}
                      alt={selectedElement.title}
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                </div>

                <motion.h2
                  id="symbol-overlay-title"
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 6}}
                  transition={{...FADE_TRANSITION, delay: 0.1}}
                  className="mt-5 font-serif text-2xl font-semibold tracking-tight text-[#f5f0fc] min-[375px]:mt-6 min-[375px]:text-3xl"
                >
                  {selectedElement.title}
                </motion.h2>

                <motion.p
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 6}}
                  transition={{...FADE_TRANSITION, delay: 0.16}}
                  className="mt-2.5 text-[13.5px] leading-relaxed text-[#cfc4e3] min-[375px]:mt-3 min-[375px]:text-sm [text-wrap:balance]"
                >
                  {selectedElement.shortMeaning}
                </motion.p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {/* Swipeable Logo Alternatives Gallery Overlay */}
        <AnimatePresence>
          {showAlternatives ? (
            <motion.div
              key="alternatives-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="alternatives-overlay-title"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.35, ease: LUXURY_EASE}}
              onClick={() => setShowAlternatives(false)}
              className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden bg-[#040208]/88 px-4 py-4 backdrop-blur-2xl min-[375px]:px-5 min-[375px]:py-6 pt-safe pb-safe"
            >
              {/* Top header */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex w-full max-w-[400px] shrink-0 items-center justify-center pt-1"
              >
                <h2
                  id="alternatives-overlay-title"
                  className="px-11 text-center font-serif text-base font-medium tracking-wide text-[#e9e2f5] min-[375px]:text-lg truncate"
                >
                  Alternativas de logo
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAlternatives(false)}
                  aria-label="Cerrar"
                  className="absolute right-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#b4a6cc] transition-colors hover:text-[#f5f0fc] focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Center Swipeable Card Stage (One by one with smooth left/right drag + transition) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-[400px] flex-1 flex-col items-center justify-center py-2 min-[375px]:py-3"
              >
                <AnimatePresence mode="wait" custom={altDirection}>
                  <motion.div
                    key={currentAlternative.id}
                    custom={altDirection}
                    variants={ALTERNATIVE_SLIDE_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{duration: 0.48, ease: LUXURY_EASE}}
                    drag="x"
                    dragConstraints={{left: 0, right: 0}}
                    dragElastic={0.28}
                    onDragEnd={handleAlternativeDragEnd}
                    className="flex w-full touch-pan-y flex-col items-center select-none cursor-grab active:cursor-grabbing"
                  >
                    <div className="relative aspect-square w-[min(74vw,max(168px,40dvh),300px)] overflow-hidden rounded-3xl border border-[#e5d9f8]/20 bg-[#f8f5fc] p-2 shadow-[0_24px_64px_rgba(0,0,0,0.68)] min-[375px]:p-2.5">
                      <ResilientEmblemImage
                        src={currentAlternative.image}
                        alt={`Alternativa de logo por ${currentAlternative.author}`}
                        className="pointer-events-none h-full w-full rounded-2xl object-contain"
                      />
                    </div>

                    <motion.div
                      initial={{opacity: 0, y: 8}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.4, delay: 0.1, ease: LUXURY_EASE}}
                      className="mt-4 text-center min-[375px]:mt-5"
                    >
                      <p className="font-serif text-xl font-semibold tracking-tight text-[#f5f0fc] min-[375px]:text-2xl">
                        {currentAlternative.author}
                      </p>
                      {currentAlternative.subtitle ? (
                        <p className="mt-1 font-serif text-sm italic tracking-wide text-[#cfc4e3] min-[375px]:text-base">
                          {currentAlternative.subtitle}
                        </p>
                      ) : null}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Left/Right Navigation Controls & Indicator Dots */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-[320px] shrink-0 items-center justify-between pb-1 min-[375px]:pb-2"
              >
                <button
                  type="button"
                  onClick={() => paginateAlternatives(-1)}
                  aria-label="Alternativa anterior"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e5d9f8]/15 bg-[#0b0714]/75 text-[#e9e2f5] transition-colors hover:border-[#e5d9f8]/35 hover:bg-[#160e29] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-0.5 min-[375px]:gap-1" role="tablist" aria-label="Seleccionar alternativa">
                  {LOGO_ALTERNATIVES.map((alt, idx) => {
                    const isActive = idx === altIndex;
                    return (
                      <button
                        key={alt.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Ver alternativa de ${alt.author}`}
                        onClick={() => {
                          if (idx === altIndex) return;
                          setAltDirection(idx > altIndex ? 1 : -1);
                          setAltIndex(idx);
                        }}
                        className="flex min-h-[44px] min-w-[22px] items-center justify-center min-[375px]:min-w-[26px] focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-5 min-[375px]:w-6 bg-[#f5f0fc] shadow-[0_0_10px_rgba(245,240,252,0.5)]'
                              : 'w-1.5 bg-[#82739e]/50 hover:bg-[#b4a6cc]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => paginateAlternatives(1)}
                  aria-label="Siguiente alternativa"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e5d9f8]/15 bg-[#0b0714]/75 text-[#e9e2f5] transition-colors hover:border-[#e5d9f8]/35 hover:bg-[#160e29] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Swipeable Polo & Jacket Designs Showcase Overlay */}
        <AnimatePresence>
          {showGarments ? (
            <motion.div
              key="garments-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="garments-overlay-title"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.35, ease: LUXURY_EASE}}
              onClick={() => setShowGarments(false)}
              className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden bg-[#040208]/90 px-4 py-4 backdrop-blur-2xl min-[375px]:px-5 min-[375px]:py-6 pt-safe pb-safe"
            >
              {/* Top header */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex w-full max-w-[400px] shrink-0 items-center justify-center pt-1"
              >
                <h2
                  id="garments-overlay-title"
                  className="px-11 text-center font-serif text-base font-medium tracking-wide text-[#e9e2f5] min-[375px]:text-lg truncate"
                >
                  Diseños de Polo y Jacket
                </h2>
                <button
                  type="button"
                  onClick={() => setShowGarments(false)}
                  aria-label="Cerrar"
                  className="absolute right-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#b4a6cc] transition-colors hover:text-[#f5f0fc] focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Center Animated Swipeable Showcase */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-[400px] flex-1 flex-col items-center justify-center py-2"
              >
                <AnimatePresence mode="wait" custom={garmentDirection}>
                  <motion.div
                    key={currentGarment.id}
                    custom={garmentDirection}
                    variants={GARMENT_SLIDE_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{duration: 0.52, ease: LUXURY_EASE}}
                    drag="x"
                    dragConstraints={{left: 0, right: 0}}
                    dragElastic={0.28}
                    onDragEnd={handleGarmentDragEnd}
                    className="flex w-full touch-pan-y flex-col items-center select-none cursor-grab active:cursor-grabbing will-change-transform"
                  >
                    {/* View angle eyebrow */}
                    <motion.span
                      initial={{opacity: 0, y: -4}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.35, delay: 0.08, ease: LUXURY_EASE}}
                      className="mb-2 text-[10.5px] font-semibold tracking-[0.16em] text-[#a99bc4] uppercase min-[375px]:mb-2.5 min-[375px]:text-[11px]"
                    >
                      {currentGarment.viewLabel}
                    </motion.span>

                    {/* Illuminated garment showcase card */}
                    <div className="relative flex w-[min(72vw,max(160px,36dvh),300px)] items-center justify-center">
                      <motion.div
                        aria-hidden="true"
                        initial={{opacity: 0, scale: 0.82}}
                        animate={{opacity: 0.75, scale: 1}}
                        transition={{duration: 0.6, ease: LUXURY_EASE}}
                        className="pointer-events-none absolute -inset-4 rounded-3xl blur-3xl will-change-transform"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(217,0,255,0.22) 0%, rgba(142,68,236,0.22) 48%, rgba(4,2,8,0) 78%)',
                        }}
                      />

                      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#e5d9f8]/25 bg-white p-2 shadow-[0_24px_64px_rgba(0,0,0,0.72)] min-[375px]:p-2.5">
                        <ResilientEmblemImage
                          src={currentGarment.image}
                          alt={`${currentGarment.title} — ${currentGarment.viewLabel}`}
                          className="pointer-events-none h-full w-full rounded-2xl object-contain"
                        />

                        {/* Diagonal premium shimmer sweep on slide reveal */}
                        <motion.div
                          aria-hidden="true"
                          initial={{x: '-130%', opacity: 0}}
                          animate={{x: '220%', opacity: [0, 0.55, 0]}}
                          transition={{duration: 1.25, delay: 0.14, ease: ASSEMBLY_EASE}}
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent will-change-transform"
                        />
                      </div>
                    </div>

                    {/* Large garment title + small illustrative disclaimer */}
                    <motion.div
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.42, delay: 0.12, ease: LUXURY_EASE}}
                      className="mt-3 flex max-w-[300px] flex-col items-center text-center min-[375px]:mt-4"
                    >
                      <p className="font-serif text-[22px] font-semibold tracking-tight text-[#f5f0fc] min-[375px]:text-2xl sm:text-[26px]">
                        {currentGarment.title}
                      </p>
                      <p className="mt-1 text-[10.5px] leading-snug text-[#9d8ec0] min-[375px]:mt-1.5 min-[375px]:text-[11px] [text-wrap:balance]">
                        {currentGarment.disclaimer}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Left/Right Navigation Controls & Indicator Dots */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-[320px] shrink-0 items-center justify-between pb-1 min-[375px]:pb-2"
              >
                <button
                  type="button"
                  onClick={() => paginateGarments(-1)}
                  aria-label="Diseño anterior"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e5d9f8]/15 bg-[#0b0714]/75 text-[#e9e2f5] transition-colors hover:border-[#e5d9f8]/35 hover:bg-[#160e29] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-0.5 min-[375px]:gap-1" role="tablist" aria-label="Seleccionar vista de diseño">
                  {GARMENT_DESIGNS.map((garment, idx) => {
                    const isActive = idx === garmentIndex;
                    return (
                      <button
                        key={garment.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Ver ${garment.viewLabel}`}
                        onClick={() => {
                          if (idx === garmentIndex) return;
                          setGarmentDirection(idx > garmentIndex ? 1 : -1);
                          setGarmentIndex(idx);
                        }}
                        className="flex min-h-[44px] min-w-[22px] items-center justify-center min-[375px]:min-w-[24px] focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-5 min-[375px]:w-6 bg-[#f5f0fc] shadow-[0_0_10px_rgba(245,240,252,0.5)]'
                              : 'w-1.5 bg-[#82739e]/50 hover:bg-[#b4a6cc]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => paginateGarments(1)}
                  aria-label="Siguiente diseño"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e5d9f8]/15 bg-[#0b0714]/75 text-[#e9e2f5] transition-colors hover:border-[#e5d9f8]/35 hover:bg-[#160e29] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </main>
    </LayoutGroup>
    </MotionConfig>
  );
}

interface ContinueButtonProps {
  onClick: () => void;
  delay?: number;
}

function ContinueButton({onClick, delay = 0.12}: ContinueButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.45, delay, ease: LUXURY_EASE}}
      className="group relative flex min-h-[48px] w-full max-w-[260px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#f5f0fc] px-6 py-3 text-sm font-semibold tracking-wide text-[#040208] shadow-[0_0_28px_rgba(229,217,248,0.2)] transition-all duration-200 hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0fc]"
    >
      {/* Subtle periodic light sheen across the CTA */}
      <motion.span
        aria-hidden="true"
        initial={{x: '-140%'}}
        animate={{x: '240%'}}
        transition={{
          duration: 1.5,
          delay: 1.2,
          repeat: Infinity,
          repeatDelay: 3.4,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent will-change-transform"
      />
      <span className="relative z-10">Continuar</span>
      <ArrowRight
        className="relative z-10 h-4 w-4 text-[#5b189a] transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </motion.button>
  );
}
