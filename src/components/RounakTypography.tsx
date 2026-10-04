import React from 'react';
import { motion } from 'motion/react';
import { AnimationStage } from '../types';

interface RounakTypographyProps {
  text: string;
  stage: AnimationStage;
  typedLength: number;
  vibrationIntensity: number; // 0 to 1
  isDissolving: boolean;
}

export const RounakTypography: React.FC<RounakTypographyProps> = ({
  text,
  stage,
  typedLength,
  vibrationIntensity,
  isDissolving,
}) => {
  const characters = text.split('');

  // Harmonic jitter offset when heart is vibrating
  const getJitterStyle = (index: number) => {
    if (vibrationIntensity <= 0.05) return {};
    const seed = index * 1.7;
    const jx = Math.sin(Date.now() * 0.05 + seed) * 3 * vibrationIntensity;
    const jy = Math.cos(Date.now() * 0.07 + seed) * 3 * vibrationIntensity;
    const rot = Math.sin(Date.now() * 0.04 + seed) * 1.5 * vibrationIntensity;
    return {
      transform: `translate3d(${jx}px, ${jy}px, 0px) rotate(${rot}deg)`,
      textShadow: `0 0 ${12 + vibrationIntensity * 25}px rgba(255, 64, 129, ${0.4 + vibrationIntensity * 0.6}),
                   ${-2 * vibrationIntensity}px 0 4px rgba(0, 240, 255, 0.4),
                   ${2 * vibrationIntensity}px 0 4px rgba(255, 0, 80, 0.6)`,
    };
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-10 pointer-events-none">
      {/* Background kinetic ambient illumination */}
      <motion.div
        className="absolute -inset-16 rounded-full blur-3xl opacity-25 pointer-events-none"
        animate={{
          scale: stage === 'HEART_VIBRATING' ? [1, 1.35, 1.05, 1.4, 1] : isDissolving ? [1.2, 0.4] : [1, 1.08, 1],
          opacity: stage === 'HEART_VIBRATING' ? [0.25, 0.65, 0.35, 0.7, 0.3] : isDissolving ? [0.6, 0.15] : 0.25,
          background: stage === 'HEART_VIBRATING'
            ? 'radial-gradient(circle, rgba(255,20,100,0.4) 0%, rgba(180,0,80,0.1) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(255,100,160,0.2) 0%, rgba(100,20,60,0.05) 50%, transparent 75%)',
        }}
        transition={{
          duration: stage === 'HEART_VIBRATING' ? 0.35 : 3.5,
          repeat: stage === 'HEART_VIBRATING' ? Infinity : Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Bold Lettering Display */}
      <div className="relative flex items-center justify-center tracking-[0.25em] md:tracking-[0.4em] font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
        {characters.map((char, index) => {
          const isRevealed = index < typedLength;
          const isCurrentActive = index === typedLength - 1;

          return (
            <motion.span
              key={index}
              className="inline-block relative font-display text-white transition-colors duration-200"
              initial={{ opacity: 0, scale: 0.2, y: 20, filter: 'blur(10px)' }}
              animate={
                isRevealed
                  ? {
                      opacity: 1,
                      scale: isCurrentActive ? [1.35, 1] : 1,
                      y: 0,
                      filter: 'blur(0px)',
                    }
                  : { opacity: 0, scale: 0.2, y: 20, filter: 'blur(10px)' }
              }
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 24,
                mass: 0.8,
              }}
              style={getJitterStyle(index)}
            >
              {/* Crisp high-contrast bold font */}
              <span
                className={`relative z-10 transition-all duration-300 ${
                  isDissolving
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-rose-300 drop-shadow-[0_0_25px_rgba(255,100,160,0.8)]'
                    : 'text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]'
                }`}
                style={{
                  textShadow:
                    stage === 'HEART_VIBRATING'
                      ? undefined
                      : '0 0 20px rgba(255, 255, 255, 0.4), 0 0 45px rgba(255, 64, 129, 0.3)',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>

              {/* Kinetic ink stamp flash on appearance */}
              {isRevealed && isCurrentActive && (
                <motion.span
                  className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                  initial={{ opacity: 0.95, scale: 1.4 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,64,129,0.4) 60%, transparent 100%)',
                  }}
                />
              )}
            </motion.span>
          );
        })}

        {/* Glowing Typist Cursor */}
        {stage === 'TYPING' && (
          <motion.div
            className="w-1.5 sm:w-2 h-10 sm:h-14 md:h-16 ml-2 rounded-full bg-gradient-to-b from-rose-200 via-rose-500 to-pink-600 shadow-[0_0_15px_#ff4081]"
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Subtle kinetic sub-label with zero-pill discipline */}
      <motion.div
        className="mt-4 flex items-center gap-3 text-xs md:text-sm tracking-[0.3em] uppercase text-rose-300/60 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: typedLength === characters.length ? 0.8 : 0,
          y: typedLength === characters.length ? 0 : 10,
        }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span>True Devotion</span>
        <span aria-hidden="true" className="text-rose-500">·</span>
        <span>Kinetic Emotion</span>
        <span aria-hidden="true" className="text-rose-500">·</span>
        <span>Everlasting</span>
      </motion.div>
    </div>
  );
};
