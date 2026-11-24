import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, LayoutGroup, motion, type PanInfo} from 'motion/react';
import {ArrowRight, ChevronLeft, ChevronRight, Images, X} from 'lucide-react';
import {
  CREDITS_LIST,
  EMBLEM_ELEMENTS,
  LOGO_ALTERNATIVES,
  MISSION_VISION_CONTENT,
  NAME_MEANING_CONTENT,
  SERENITY_SLOGAN,
  SERENITY_WORDMARK,
  UNFORGETTABLE_CONTENT,
  type EmblemElement,
  type SerenitySymbolId,
} from '../data/serenityContent';
import {ResilientEmblemImage} from './ResilientEmblemImage';

type StepId = 'inolvidable' | 'mision-vision' | 'emblema' | 'nombre' | 'ending';
type InicioPhase = 'united' | 'icons' | 'blocks';

const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;
const ASSEMBLY_EASE = [0.16, 1, 0.3, 1] as const;

const SMOOTH_TRANSITION = {
  duration: 0.65,
  ease: LUXURY_EASE,
};

const FADE_TRANSITION = {
  duration: 0.46,
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

const ALTERNATIVE_SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 72 : -72,
    opacity: 0,
    scale: 0.94,
    filter: 'blur(6px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -72 : 72,
    opacity: 0,
    scale: 0.94,
    filter: 'blur(6px)',
  }),
};

export function SerenityFlow() {
  const [introDone, setIntroDone] = useState(false);
  const [step, setStep] = useState<StepId>('inolvidable');
  const [inicioPhase, setInicioPhase] = useState<InicioPhase>('united');
  const [hasInspectedIcon, setHasInspectedIcon] = useState(false);
  const [showStatements, setShowStatements] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EmblemElement | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [altDirection, setAltDirection] = useState(1);
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
    const timer = window.setTimeout(() => {
      setIntroDone(true);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const update = () => setViewport({w: window.innerWidth, h: window.innerHeight});
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const paginateAlternatives = useCallback((direction: number) => {
    setAltDirection(direction);
    setAltIndex(
      (prev) => (prev + direction + LOGO_ALTERNATIVES.length) % LOGO_ALTERNATIVES.length
    );
  }, []);

  useEffect(() => {
    if (!selectedElement && !showAlternatives) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedElement) setSelectedElement(null);
        else if (showAlternatives) setShowAlternatives(false);
      } else if (showAlternatives) {
        if (e.key === 'ArrowRight') paginateAlternatives(1);
        else if (e.key === 'ArrowLeft') paginateAlternatives(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedElement, showAlternatives, paginateAlternatives]);

  const geometry = useMemo(() => {
    const effectiveW = Math.min(viewport.w, 430);
    const emblemW = Math.min(effectiveW * 0.5, viewport.h * 0.255, 200);
    const emblemH = emblemW * (1419 / 1097);

    const spreadX = Math.min(effectiveW * 0.23, 94);
    const spreadYTop = Math.min(viewport.h * 0.13, 98);
    const spreadYBottom = Math.min(viewport.h * 0.12, 90);

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

    const nameCardWordmarkY = Math.max(24, viewport.h * 0.14 - wordmarkMetrics.top);
    const introCenterWordmarkY = Math.max(
      0,
      viewport.h / 2 - (wordmarkMetrics.top + wordmarkMetrics.height / 2)
    );

    return {emblemW, emblemH, iconDeltas, nameCardWordmarkY, introCenterWordmarkY};
  }, [viewport, wordmarkMetrics]);

  // Measure exact un-transformed coordinates from each emblem piece to its block's left icon slot
  useLayoutEffect(() => {
    const wm = wordmarkRef.current;
    if (wm) {
      setWordmarkMetrics({
        top: wm.offsetTop || 40,
        height: wm.offsetHeight || 64,
      });
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
      }
    } else if (step === 'mision-vision') {
      setShowStatements(true);
      setStep('inolvidable');
    } else if (step === 'emblema') {
      if (inicioPhase === 'blocks') setInicioPhase('icons');
      else if (inicioPhase === 'icons') setInicioPhase('united');
      else goToStep('mision-vision');
    } else if (step === 'nombre') {
      setStep('emblema');
      setInicioPhase(hasInspectedIcon ? 'icons' : 'blocks');
    } else if (step === 'ending') {
      if (showAlternatives) {
        setShowAlternatives(false);
      } else {
        goToStep('nombre');
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

  const wordmarkTargetY = !introDone
    ? geometry.introCenterWordmarkY
    : step === 'nombre'
      ? geometry.nameCardWordmarkY
      : 0;
  const wordmarkTargetScale = !introDone ? 1.22 : 1;

  const currentAlternative = LOGO_ALTERNATIVES[altIndex];

  return (
    <LayoutGroup>
      <main className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col items-center overflow-hidden px-5 pt-safe pb-safe">
        {/* Subtle quiet back chevron */}
        {introDone && (step !== 'inolvidable' || showStatements) ? (
          <div className="absolute left-3 top-3 z-30 pt-safe">
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

        {/* PERSISTENT SERENITY WORDMARK (Starts centered & slightly larger for 3s, then glides to resting top) */}
        <div className="relative z-20 shrink-0 pt-5 sm:pt-7">
          <div ref={wordmarkRef}>
            <motion.div
              initial={{opacity: 0, y: geometry.introCenterWordmarkY, scale: 1.22}}
              animate={{
                opacity: 1,
                y: wordmarkTargetY,
                scale: wordmarkTargetScale,
              }}
              transition={{duration: 0.85, ease: LUXURY_EASE}}
              className="flex origin-center items-center justify-center"
            >
              <ResilientEmblemImage
                src={SERENITY_WORDMARK}
                alt="Serenity"
                className="h-auto w-[195px] object-contain drop-shadow-[0_0_24px_rgba(245,240,252,0.18)] sm:w-[220px]"
              />
            </motion.div>
          </div>
        </div>

        {/* SCREEN CONTENT STAGE */}
        <div className="relative flex flex-1 w-full flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ==================== 1. QUÉ HACE INOLVIDABLE A UNA PROMOCIÓN (Appears after 3s splash) ==================== */}
            {step === 'inolvidable' && (
              <motion.section
                key="inolvidable"
                initial={{opacity: 0}}
                animate={{opacity: introDone ? 1 : 0}}
                exit={{opacity: 0}}
                transition={{duration: 0.65, delay: introDone ? 0.34 : 0, ease: LUXURY_EASE}}
                className={`flex flex-1 flex-col items-center justify-between overflow-hidden pb-6 pt-2 sm:pb-8 ${
                  introDone ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center px-0.5">
                  <AnimatePresence mode="wait">
                    {!showStatements ? (
                      <motion.div
                        key="question-card"
                        initial={{opacity: 0, y: 18, scale: 0.96}}
                        animate={
                          introDone
                            ? {opacity: 1, y: 0, scale: 1}
                            : {opacity: 0, y: 18, scale: 0.96}
                        }
                        exit={{
                          opacity: 0,
                          scale: 0.94,
                          y: -22,
                          filter: 'blur(8px)',
                          transition: {duration: 0.35, ease: LUXURY_EASE},
                        }}
                        transition={{
                          duration: 0.7,
                          delay: introDone ? 0.36 : 0,
                          ease: LUXURY_EASE,
                        }}
                        className="w-full rounded-3xl border border-[#e5d9f8]/15 bg-[#0b0714]/82 p-6 text-center backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] sm:p-7"
                      >
                        <h2 className="font-serif text-2xl font-semibold leading-tight text-[#f5f0fc] sm:text-3xl [text-wrap:balance]">
                          {UNFORGETTABLE_CONTENT.question}
                        </h2>
                        <p className="mt-3.5 text-sm leading-relaxed text-[#cfc4e3] sm:text-[15px]">
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
                        {UNFORGETTABLE_CONTENT.statements.map((segments, idx) => {
                          const hairlineGradients = [
                            'from-transparent via-[#d900ff]/35 to-transparent',
                            'from-transparent via-[#dceeff]/30 to-transparent',
                            'from-transparent via-[#b4a6cc]/25 to-transparent',
                          ];

                          return (
                            <motion.div
                              key={idx}
                              initial={{
                                opacity: 0,
                                y: 38,
                                scale: 0.94,
                                filter: 'blur(8px)',
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                              }}
                              transition={{
                                duration: 0.76,
                                delay: 0.08 + idx * 0.15,
                                ease: [0.19, 1, 0.22, 1],
                              }}
                              whileTap={{scale: 0.985}}
                              className="relative overflow-hidden w-full rounded-3xl border border-[#e5d9f8]/16 bg-[#0b0714]/85 px-6 py-7 text-center text-[15px] leading-relaxed text-[#cfc4e3] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] sm:px-7 sm:py-8 sm:text-base [text-wrap:balance]"
                            >
                              <div
                                aria-hidden="true"
                                className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r ${hairlineGradients[idx]}`}
                              />
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
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex w-full justify-center pt-3">
                  {introDone ? (
                    <ContinueButton
                      delay={showStatements ? 0.12 : 0.48}
                      onClick={() => {
                        if (!showStatements) {
                          setShowStatements(true);
                        } else {
                          goToStep('mision-vision');
                        }
                      }}
                    />
                  ) : (
                    <div className="h-12 shrink-0" aria-hidden="true" />
                  )}
                </div>
              </motion.section>
            )}

            {/* ==================== 2. MISIÓN Y VISIÓN ==================== */}
            {step === 'mision-vision' && (
              <motion.section
                key="mision-vision"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FADE_TRANSITION}
                className="flex flex-1 flex-col items-center justify-between pb-6 pt-2 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center space-y-8 text-center">
                  <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{...SMOOTH_TRANSITION, delay: 0.08}}
                    className="max-w-[330px] space-y-2.5"
                  >
                    <span className="block text-xs font-medium tracking-[0.16em] text-[#d900ff] uppercase">
                      {MISSION_VISION_CONTENT.mission.label}
                    </span>
                    <p className="font-serif text-2xl font-medium leading-snug text-[#f5f0fc] sm:text-3xl [text-wrap:balance]">
                      {MISSION_VISION_CONTENT.mission.text}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{scaleX: 0, opacity: 0}}
                    animate={{scaleX: 1, opacity: 1}}
                    transition={{duration: 0.6, delay: 0.16, ease: LUXURY_EASE}}
                    className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-[#e5d9f8]/35 to-transparent"
                  />

                  <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{...SMOOTH_TRANSITION, delay: 0.22}}
                    className="max-w-[330px] space-y-2.5"
                  >
                    <span className="block text-xs font-medium tracking-[0.16em] text-[#dceeff] uppercase">
                      {MISSION_VISION_CONTENT.vision.label}
                    </span>
                    <p className="font-serif text-2xl font-medium leading-snug text-[#f5f0fc] sm:text-3xl [text-wrap:balance]">
                      {MISSION_VISION_CONTENT.vision.text}
                    </p>
                  </motion.div>
                </div>

                <ContinueButton onClick={() => goToStep('emblema')} delay={0.25} />
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
                className="relative flex flex-1 flex-col items-center justify-between pb-5 pt-2 sm:pb-7"
              >
                <div className="relative flex flex-1 w-full flex-col items-center justify-center">
                  {/* 4 HORIZONTAL RECTANGLE BLOCKS LAYER (slots measured continuously; revealed AFTER icons land) */}
                  <div
                    className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 ${
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
                        className="flex w-full items-center gap-3.5 rounded-2xl border border-[#e5d9f8]/14 bg-[#0b0714]/80 px-3.5 py-2.5 backdrop-blur-xl sm:gap-4 sm:px-4 sm:py-3"
                      >
                        {/* Left Icon Landing Slot (always measured in layout, stays empty so persistent icon sits right inside) */}
                        <div
                          ref={(node) => {
                            slotRefs.current[el.id] = node;
                          }}
                          className="h-12 w-12 shrink-0 sm:h-13 sm:w-13"
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
                          <h2 className="font-serif text-base font-semibold leading-tight text-[#f5f0fc] sm:text-lg">
                            {el.title}
                          </h2>
                          <p className="mt-0.5 text-[11.5px] leading-snug text-[#cfc4e3] sm:text-xs">
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
                    {/* Cosmic Glow behind logo */}
                    <motion.div
                      aria-hidden="true"
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
                          repeat: inicioPhase === 'united' ? Infinity : 0,
                          ease: 'easeInOut',
                        },
                        scale: {
                          duration: inicioPhase === 'united' ? 4.5 : 0.45,
                          repeat: inicioPhase === 'united' ? Infinity : 0,
                          ease: 'easeInOut',
                        },
                      }}
                      className="pointer-events-none absolute -inset-10 rounded-full blur-3xl"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(217,0,255,0.34) 0%, rgba(142,68,236,0.28) 42%, rgba(220,238,255,0.08) 68%, rgba(4,2,8,0) 80%)',
                      }}
                    />

                    {(['galaxia', 'silueta', 'cometa', 'estrella'] as const).map((id, idx) => {
                      const el = EMBLEM_ELEMENTS.find((item) => item.id === id)!;
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

                      const dropShadowClass =
                        id === 'estrella'
                          ? 'drop-shadow-[0_0_24px_rgba(217,0,255,0.9)]'
                          : id === 'galaxia'
                            ? 'brightness-125 drop-shadow-[0_0_18px_rgba(142,68,236,0.85)]'
                            : id === 'cometa'
                              ? 'drop-shadow-[0_0_16px_rgba(220,238,255,0.48)]'
                              : 'drop-shadow-[0_0_14px_rgba(233,226,245,0.28)]';

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
                            className="origin-center"
                          >
                            {/* Gentle subtle breathing in 'icons' mode so user intuitively knows to tap */}
                            <motion.div
                              animate={
                                inicioPhase === 'icons' && !isCurrentlyInOverlay
                                  ? {scale: [1, 1.045, 1], y: [0, -3, 0]}
                                  : {scale: 1, y: 0}
                              }
                              transition={
                                inicioPhase === 'icons' && !isCurrentlyInOverlay
                                  ? {
                                      duration: 3.0,
                                      delay: idx * 0.32,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }
                                  : {duration: 0.25}
                              }
                            >
                              {!isCurrentlyInOverlay ? (
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
                                    className={`h-auto w-full object-contain ${dropShadowClass}`}
                                  />
                                </motion.button>
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
                          initial={{opacity: 0, y: 6}}
                          animate={{opacity: 1, y: 0}}
                          exit={{opacity: 0, y: -4}}
                          transition={FADE_TRANSITION}
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
                className="flex flex-1 flex-col items-center justify-between pb-6 pt-2 sm:pb-8"
              >
                <div className="flex flex-1 w-full flex-col items-center justify-center">
                  <motion.div
                    initial={{opacity: 0, y: 18, scale: 0.97}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{...SMOOTH_TRANSITION, delay: 0.14}}
                    className="mt-6 w-full rounded-3xl border border-[#e5d9f8]/15 bg-[#0b0714]/82 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-[#e5d9f8]/10 pb-3.5">
                      <span className="text-[11px] font-medium tracking-[0.14em] text-[#82739e] uppercase">
                        Significado
                      </span>
                      <span className="font-serif text-lg font-medium tracking-wide text-[#e9e2f5]">
                        {NAME_MEANING_CONTENT.pronunciation}
                      </span>
                    </div>

                    <p className="mt-4 text-center text-sm leading-relaxed text-[#cfc4e3]">
                      {NAME_MEANING_CONTENT.whyThisName}
                    </p>
                  </motion.div>
                </div>

                <ContinueButton onClick={() => goToStep('ending')} delay={0.22} />
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
                className="flex flex-1 flex-col items-center justify-between pb-6 pt-2 sm:pb-8"
              >
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div
                    style={{
                      width: `${geometry.emblemW}px`,
                      height: `${geometry.emblemH}px`,
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
                      className="pointer-events-none absolute -inset-10 rounded-full blur-3xl"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(217,0,255,0.34) 0%, rgba(142,68,236,0.28) 42%, rgba(220,238,255,0.08) 68%, rgba(4,2,8,0) 80%)',
                      }}
                    />

                    {(
                      [
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
                      ] as const
                    ).map((item) => {
                      const el = EMBLEM_ELEMENTS.find((entry) => entry.id === item.id)!;
                      const dropShadowClass =
                        item.id === 'estrella'
                          ? 'drop-shadow-[0_0_24px_rgba(217,0,255,0.9)]'
                          : item.id === 'galaxia'
                            ? 'brightness-125 drop-shadow-[0_0_18px_rgba(142,68,236,0.85)]'
                            : item.id === 'cometa'
                              ? 'drop-shadow-[0_0_16px_rgba(220,238,255,0.48)]'
                              : 'drop-shadow-[0_0_14px_rgba(233,226,245,0.28)]';

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
                          className="absolute z-10 origin-center"
                        >
                          <ResilientEmblemImage
                            src={el.image}
                            alt={el.title}
                            className={`h-auto w-full object-contain ${dropShadowClass}`}
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
                    className="mt-5 text-center font-serif text-lg italic tracking-[0.04em] text-[#e9e2f5] sm:text-xl"
                  >
                    {SERENITY_SLOGAN}
                  </motion.p>
                </div>

                {/* Small Credits + Alternativas de logo CTA */}
                <div className="flex w-full flex-col items-center gap-3.5 pb-1">
                  <motion.div
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 1.32, ease: LUXURY_EASE}}
                    className="space-y-0.5 text-center text-[11px] leading-relaxed text-[#82739e]"
                  >
                    {CREDITS_LIST.map((credit) => (
                      <p key={credit.role}>
                        <span className="text-[#a99bc4]">{credit.role}:</span> {credit.name}
                      </p>
                    ))}
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setAltDirection(1);
                      setAltIndex(0);
                      setShowAlternatives(true);
                    }}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, delay: 1.48, ease: LUXURY_EASE}}
                    className="group flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#e5d9f8]/25 bg-[#120c21]/85 px-6 py-2.5 text-xs font-semibold tracking-wide text-[#f5f0fc] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-200 hover:border-[#e5d9f8]/45 hover:bg-[#1a112d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d900ff]"
                  >
                    <Images
                      className="h-3.5 w-3.5 text-[#d900ff] transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span>Alternativas de logo</span>
                  </motion.button>
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
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040208]/72 px-7 backdrop-blur-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#b4a6cc] transition-colors hover:text-[#f5f0fc] focus-visible:outline-2 focus-visible:outline-[#d900ff] pt-safe"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex max-w-[310px] flex-col items-center text-center">
                <div className="relative flex h-[170px] w-[170px] items-center justify-center">
                  <motion.div
                    aria-hidden="true"
                    initial={{opacity: 0, scale: 0.7}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={SMOOTH_TRANSITION}
                    className="pointer-events-none absolute h-44 w-44 rounded-full blur-3xl"
                    style={{
                      background: `radial-gradient(circle, ${selectedElement.glowColor} 0%, rgba(4,2,8,0) 72%)`,
                    }}
                  />

                  <motion.div
                    layoutId={`symbol-${selectedElement.id}`}
                    transition={SMOOTH_TRANSITION}
                    className="relative flex h-[155px] w-[155px] items-center justify-center sm:h-[170px] sm:w-[170px]"
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
                  className="mt-6 font-serif text-3xl font-semibold tracking-tight text-[#f5f0fc]"
                >
                  {selectedElement.title}
                </motion.h2>

                <motion.p
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 6}}
                  transition={{...FADE_TRANSITION, delay: 0.16}}
                  className="mt-3 text-sm leading-relaxed text-[#cfc4e3] [text-wrap:balance]"
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
              className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#040208]/88 px-5 py-6 backdrop-blur-2xl pt-safe pb-safe"
            >
              {/* Top header */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex w-full max-w-[400px] items-center justify-center pt-1"
              >
                <h2
                  id="alternatives-overlay-title"
                  className="font-serif text-lg font-medium tracking-wide text-[#e9e2f5]"
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
                className="flex w-full max-w-[400px] flex-1 flex-col items-center justify-center overflow-hidden py-3"
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
                    <div className="relative aspect-square w-full max-w-[270px] overflow-hidden rounded-3xl border border-[#e5d9f8]/20 bg-[#f8f5fc] p-2.5 shadow-[0_24px_64px_rgba(0,0,0,0.68)] sm:max-w-[300px]">
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
                      className="mt-5 text-center"
                    >
                      <p className="font-serif text-2xl font-semibold tracking-tight text-[#f5f0fc]">
                        {currentAlternative.author}
                      </p>
                      {currentAlternative.subtitle ? (
                        <p className="mt-1 font-serif text-base italic tracking-wide text-[#cfc4e3]">
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
                className="flex w-full max-w-[320px] items-center justify-between pb-2"
              >
                <button
                  type="button"
                  onClick={() => paginateAlternatives(-1)}
                  aria-label="Alternativa anterior"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e5d9f8]/15 bg-[#0b0714]/75 text-[#e9e2f5] transition-colors hover:border-[#e5d9f8]/35 hover:bg-[#160e29] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar alternativa">
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
                        className="flex min-h-[44px] min-w-[28px] items-center justify-center focus-visible:outline-2 focus-visible:outline-[#d900ff]"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-6 bg-[#f5f0fc] shadow-[0_0_10px_rgba(245,240,252,0.5)]'
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
      </main>
    </LayoutGroup>
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
      className="group flex min-h-[48px] w-full max-w-[260px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#f5f0fc] px-6 py-3 text-sm font-semibold tracking-wide text-[#040208] shadow-[0_0_28px_rgba(229,217,248,0.2)] transition-all duration-200 hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0fc]"
    >
      <span>Continuar</span>
      <ArrowRight
        className="h-4 w-4 text-[#5b189a] transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </motion.button>
  );
}
