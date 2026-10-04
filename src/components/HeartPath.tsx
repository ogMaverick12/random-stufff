import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimationStage, Point } from '../types';

interface HeartPathProps {
  stage: AnimationStage;
  drawProgress: number; // 0 to 1
  vibrationIntensity: number; // 0 to 1
  onHandCoordinates?: (left: { pos: Point; angle: number }, right: { pos: Point; angle: number }) => void;
  onEmitSparks?: (posLeft: Point, posRight: Point) => void;
}

// Symmetrical Heart Path definitions inside 800x640 coordinate space
// Centered over R O U N A K (which sits at x: 400, y: 320)
// Bottom tip: (400, 480)
// Left crest: curves out to (180, 260) and up to (260, 150), ending at top cleft (400, 220)
// Right crest: curves out to (620, 260) and up to (540, 150), ending at top cleft (400, 220)
export const LEFT_HEART_PATH =
  'M 400,480 C 310,430 200,370 170,280 C 140,195 190,140 270,140 C 335,140 375,180 400,220';
export const RIGHT_HEART_PATH =
  'M 400,480 C 490,430 600,370 630,280 C 660,195 610,140 530,140 C 465,140 425,180 400,220';

// Complete combined heart path for fill and glow effects
export const FULL_HEART_PATH =
  'M 400,220 C 375,180 335,140 270,140 C 190,140 140,195 170,280 C 200,370 310,430 400,480 C 490,430 600,370 630,280 C 660,195 610,140 530,140 C 465,140 425,180 400,220 Z';

export const HeartPath: React.FC<HeartPathProps> = ({
  stage,
  drawProgress,
  vibrationIntensity,
  onHandCoordinates,
  onEmitSparks,
}) => {
  const leftPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const [leftLength, setLeftLength] = useState(0);
  const [rightLength, setRightLength] = useState(0);

  // Initialize path lengths on mount
  useEffect(() => {
    if (leftPathRef.current && rightPathRef.current) {
      setLeftLength(leftPathRef.current.getTotalLength());
      setRightLength(rightPathRef.current.getTotalLength());
    }
  }, []);

  // Update hand positions & emit sparks based on current drawProgress
  useEffect(() => {
    if (!leftPathRef.current || !rightPathRef.current || leftLength === 0 || rightLength === 0) return;

    const clamped = Math.max(0, Math.min(1, drawProgress));
    const distL = leftLength * clamped;
    const distR = rightLength * clamped;

    const pL = leftPathRef.current.getPointAtLength(distL);
    const pR = rightPathRef.current.getPointAtLength(distR);

    // Compute tangent angles for smooth natural hand rotation
    const delta = 2;
    const pLNext = leftPathRef.current.getPointAtLength(Math.min(leftLength, distL + delta));
    const pRNext = rightPathRef.current.getPointAtLength(Math.min(rightLength, distR + delta));

    const angleL = (Math.atan2(pLNext.y - pL.y, pLNext.x - pL.x) * 180) / Math.PI;
    const angleR = (Math.atan2(pRNext.y - pR.y, pRNext.x - pR.x) * 180) / Math.PI;

    if (onHandCoordinates) {
      onHandCoordinates(
        { pos: { x: pL.x, y: pL.y }, angle: angleL },
        { pos: { x: pR.x, y: pR.y }, angle: angleR }
      );
    }

    if (stage === 'DRAWING_HEART' && onEmitSparks && clamped > 0 && clamped < 1) {
      onEmitSparks({ x: pL.x, y: pL.y }, { x: pR.x, y: pR.y });
    }
  }, [drawProgress, leftLength, rightLength, stage, onHandCoordinates, onEmitSparks]);

  const showHeart =
    stage === 'DRAWING_HEART' ||
    stage === 'HEART_VIBRATING' ||
    stage === 'HEART_DISSOLVING';

  // Compute strokeDashoffset based on drawProgress
  const dashOffsetL = leftLength * (1 - Math.min(1, drawProgress));
  const dashOffsetR = rightLength * (1 - Math.min(1, drawProgress));

  // Dynamic heartbeat vibration calculation
  const getHeartVibrationTransform = () => {
    if (stage !== 'HEART_VIBRATING' || vibrationIntensity <= 0.05) return '';
    const t = Date.now() * 0.02;
    const scale = 1 + Math.sin(t * 1.5) * 0.12 * vibrationIntensity;
    const dx = Math.sin(t * 3.1) * 6 * vibrationIntensity;
    const dy = Math.cos(t * 2.7) * 5 * vibrationIntensity;
    const rot = Math.sin(t * 1.8) * 3 * vibrationIntensity;
    return `translate(${dx}, ${dy}) scale(${scale}) rotate(${rot} 400 320)`;
  };

  return (
    <svg
      viewBox="0 0 800 640"
      className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="neonHeartGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur3" />
          <feMerge>
            <feMergeNode in="blur3" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="hyperVibrationGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 1
                    0 0.2 0 0 0.1
                    0 0 0.5 0 0.3
                    0 0 0 20 -4"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Heart Ribbon Gradient */}
        <linearGradient id="heartRibbonGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff1744" />
          <stop offset="45%" stopColor="#ff4081" />
          <stop offset="85%" stopColor="#ff80ab" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Inner Heart Radial Pulse Fill */}
        <radialGradient id="heartInnerFill" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ff1744" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#d50000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hidden reference paths for geometry length measuring */}
      <path ref={leftPathRef} d={LEFT_HEART_PATH} fill="none" stroke="transparent" />
      <path ref={rightPathRef} d={RIGHT_HEART_PATH} fill="none" stroke="transparent" />

      {/* Visible Heart Container with kinetic transforms */}
      {showHeart && (
        <g
          transform={getHeartVibrationTransform()}
          className="transition-opacity duration-300"
          style={{
            transformOrigin: '400px 320px',
            opacity: stage === 'HEART_DISSOLVING' ? 0.3 : 1,
            filter: stage === 'HEART_VIBRATING' ? 'url(#hyperVibrationGlow)' : 'url(#neonHeartGlow)',
          }}
        >
          {/* Pulsating Inner Heart Ambient Aura when fully drawn or vibrating */}
          {(drawProgress >= 0.95 || stage === 'HEART_VIBRATING') && (
            <motion.path
              d={FULL_HEART_PATH}
              fill="url(#heartInnerFill)"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                stage === 'HEART_VIBRATING'
                  ? {
                      opacity: [0.35, 0.75, 0.3, 0.8, 0.4],
                      scale: [0.98, 1.06, 0.97, 1.08, 1],
                    }
                  : { opacity: 0.4, scale: 1 }
              }
              transition={{
                duration: stage === 'HEART_VIBRATING' ? 0.32 : 1.2,
                repeat: stage === 'HEART_VIBRATING' ? Infinity : 0,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '400px 320px' }}
            />
          )}

          {/* LAYER 1: Deep wide bloom stroke */}
          <path
            d={LEFT_HEART_PATH}
            fill="none"
            stroke="#ff1744"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={leftLength || 1000}
            strokeDashoffset={dashOffsetL}
            opacity="0.35"
          />
          <path
            d={RIGHT_HEART_PATH}
            fill="none"
            stroke="#ff1744"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={rightLength || 1000}
            strokeDashoffset={dashOffsetR}
            opacity="0.35"
          />

          {/* LAYER 2: Radiant mid neon ribbon */}
          <path
            d={LEFT_HEART_PATH}
            fill="none"
            stroke="url(#heartRibbonGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={leftLength || 1000}
            strokeDashoffset={dashOffsetL}
            opacity="0.9"
          />
          <path
            d={RIGHT_HEART_PATH}
            fill="none"
            stroke="url(#heartRibbonGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={rightLength || 1000}
            strokeDashoffset={dashOffsetR}
            opacity="0.9"
          />

          {/* LAYER 3: Pure white intense electric core */}
          <path
            d={LEFT_HEART_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={leftLength || 1000}
            strokeDashoffset={dashOffsetL}
            opacity="0.95"
          />
          <path
            d={RIGHT_HEART_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={rightLength || 1000}
            strokeDashoffset={dashOffsetR}
            opacity="0.95"
          />
        </g>
      )}
    </svg>
  );
};
