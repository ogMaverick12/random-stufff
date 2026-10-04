import React from 'react';
import { motion } from 'motion/react';

interface HandRendererProps {
  side: 'left' | 'right';
  x: number;
  y: number;
  angle: number; // in degrees
  opacity: number;
  scale?: number;
  isDrawing?: boolean;
}

/**
 * An artistic, ethereal glowing hand rendered in SVG.
 * Designed with elegant proportions, extended index finger drawing tip,
 * and warm luminescence for romantic expression.
 */
export const HandRenderer: React.FC<HandRendererProps> = ({
  side,
  x,
  y,
  angle,
  opacity,
  scale = 1,
  isDrawing = false,
}) => {
  const isLeft = side === 'left';
  // Adjust base orientation so index fingertip points directly at (x, y)
  // Base SVG fingertip is positioned at (0, 0)
  const rotation = isLeft ? angle - 45 : angle + 45;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${isLeft ? scale : -scale}, ${scale})`}
      style={{
        opacity,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 12px rgba(255, 64, 129, 0.6))',
      }}
    >
      <defs>
        {/* Gradients for the ethereal hand */}
        <linearGradient id={`handGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ff80ab" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#f50057" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4a0020" stopOpacity="0.05" />
        </linearGradient>

        <radialGradient id={`glowTip-${side}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ff4081" />
          <stop offset="70%" stopColor="#e91e63" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e91e63" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Arm / Wrist flow trailing backwards */}
      <path
        d="M -12, 110 C -25, 140 -40, 180 -55, 230 C -15, 235 25, 235 45, 230 C 30, 180 15, 140 8, 110 Z"
        fill={`url(#handGrad-${side})`}
        opacity="0.3"
      />

      {/* Palm body */}
      <path
        d="M -15, 75 C -25, 45 -22, 25 -10, 15 C 5, 5 18, 12 25, 28 C 30, 45 28, 70 12, 85 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 182, 193, 0.4)"
        strokeWidth="1.2"
      />

      {/* Thumb (gently tucked inwards in expressive gesture) */}
      <path
        d="M -18, 55 C -35, 45 -38, 28 -28, 20 C -20, 15 -14, 25 -10, 35 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 182, 193, 0.5)"
        strokeWidth="1"
      />

      {/* Curled Middle, Ring, Pinky fingers showing natural anatomical warmth */}
      {/* Pinky */}
      <path
        d="M 16, 68 C 28, 62 34, 48 30, 42 C 26, 38 20, 44 14, 55 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 182, 193, 0.4)"
        strokeWidth="0.8"
      />
      {/* Ring */}
      <path
        d="M 18, 52 C 32, 45 36, 32 30, 26 C 24, 22 18, 30 12, 40 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 182, 193, 0.45)"
        strokeWidth="0.8"
      />
      {/* Middle finger slightly bent */}
      <path
        d="M 12, 35 C 22, 25 24, 12 18, 6 C 12, 2 6, 12 4, 25 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 182, 193, 0.5)"
        strokeWidth="0.9"
      />

      {/* Elegant extended Index Finger - tip reaches exactly (0, 0) */}
      <path
        d="M -3, 22 C -6, 10 -4, -10 0, 0 C 4, -10 6, 10 3, 22 Z"
        fill={`url(#handGrad-${side})`}
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.2"
      />

      {/* Luminous skin contour highlight */}
      <path
        d="M -4, 20 Q 0, -2 0, 0 Q 1, 8 2, 20"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Radiant drawing light orb at fingertip (0, 0) */}
      {isDrawing && (
        <>
          {/* Broad soft halo */}
          <circle cx="0" cy="0" r="28" fill={`url(#glowTip-${side})`} />
          {/* Inner intense pulse */}
          <circle cx="0" cy="0" r="10" fill="#ffffff" opacity="0.9" />
          <circle cx="0" cy="0" r="4" fill="#ff4081" />

          {/* Starlight sparkle cross on fingertip */}
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
        </>
      )}
    </g>
  );
};
