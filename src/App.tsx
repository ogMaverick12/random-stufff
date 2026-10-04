/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicCanvas, CanvasParticleAPI } from './components/CosmicCanvas';
import { RounakTypography } from './components/RounakTypography';
import { HeartPath } from './components/HeartPath';
import { HandRenderer } from './components/HandRenderer';
import { MotionControls } from './components/MotionControls';
import { MotionInspector } from './components/MotionInspector';
import { AnimationStage, Point, ActiveMotionTypes } from './types';
import { soundEngine } from './utils/audio';
import { Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<AnimationStage>('IDLE');
  const [nameText, setNameText] = useState('R O U N A K');
  const [typedLength, setTypedLength] = useState(0);
  const [drawProgress, setDrawProgress] = useState(0);
  const [vibrationIntensity, setVibrationIntensity] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [autoLoop, setAutoLoop] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInspector, setShowInspector] = useState(false);

  // Hand kinematics
  const [leftHand, setLeftHand] = useState<{ pos: Point; angle: number; opacity: number }>({
    pos: { x: -80, y: 480 },
    angle: 0,
    opacity: 0,
  });
  const [rightHand, setRightHand] = useState<{ pos: Point; angle: number; opacity: number }>({
    pos: { x: 880, y: 480 },
    angle: 0,
    opacity: 0,
  });

  // Screen-shake displacement during intense vibration
  const [screenOffset, setScreenOffset] = useState({ x: 0, y: 0, rot: 0 });

  // Canvas particle API ref
  const particleApiRef = useRef<CanvasParticleAPI | null>(null);

  // Active motion matrix tracking for inspector
  const [activeMotions, setActiveMotions] = useState<ActiveMotionTypes>({
    kineticTypography: false,
    pathTracing: false,
    skeletalKinematics: false,
    harmonicVibration: false,
    particlePhysics: false,
    radialShockwave: false,
    viewportDisplacement: false,
  });

  // Track active motions based on current state
  useEffect(() => {
    setActiveMotions({
      kineticTypography: stage === 'TYPING' || stage === 'HEART_VIBRATING',
      pathTracing: stage === 'DRAWING_HEART',
      skeletalKinematics: stage === 'HANDS_APPROACH' || stage === 'DRAWING_HEART',
      harmonicVibration: stage === 'HEART_VIBRATING',
      particlePhysics: stage === 'DRAWING_HEART' || stage === 'HEART_DISSOLVING' || stage === 'IDLE',
      radialShockwave: stage === 'HEART_VIBRATING' || stage === 'HEART_DISSOLVING',
      viewportDisplacement: stage === 'HEART_VIBRATING',
    });
  }, [stage]);

  // Audio mute/unmute sync
  const handleToggleSound = () => {
    const newState = soundEngine.toggleAudio();
    setSoundEnabled(newState);
  };

  // Callback from HeartPath for real-time hand coordinates along the curve
  const handleHandCoordinates = useCallback(
    (left: { pos: Point; angle: number }, right: { pos: Point; angle: number }) => {
      if (stage === 'DRAWING_HEART') {
        setLeftHand({ pos: left.pos, angle: left.angle, opacity: 1 });
        setRightHand({ pos: right.pos, angle: right.angle, opacity: 1 });
      }
    },
    [stage]
  );

  // Callback from HeartPath to emit fingertip sparks on canvas
  const handleEmitSparks = useCallback((posLeft: Point, posRight: Point) => {
    if (particleApiRef.current) {
      particleApiRef.current.emitDrawingSparks(posLeft, posRight, 3);
    }
  }, []);

  // Animation Sequence Orchestrator
  const startSequence = useCallback(() => {
    setStage('TYPING');
    setTypedLength(0);
    setDrawProgress(0);
    setVibrationIntensity(0);
    setScreenOffset({ x: 0, y: 0, rot: 0 });
    setLeftHand({ pos: { x: -80, y: 480 }, angle: 0, opacity: 0 });
    setRightHand({ pos: { x: 880, y: 480 }, angle: 0, opacity: 0 });
  }, []);

  // Auto-start on mount after brief cinematic pause
  useEffect(() => {
    const timer = setTimeout(() => {
      startSequence();
    }, 600);
    return () => clearTimeout(timer);
  }, [startSequence]);

  // STAGE 1: TYPING
  useEffect(() => {
    if (stage !== 'TYPING') return;

    const chars = nameText.split('');
    const typingInterval = Math.max(90, 220 / speed);

    const interval = setInterval(() => {
      setTypedLength((prev) => {
        const next = prev + 1;
        soundEngine.playTypingSound(prev);
        if (next >= chars.length) {
          clearInterval(interval);
          // Pause briefly, then bring in hands
          setTimeout(() => {
            setStage('HANDS_APPROACH');
          }, 450 / speed);
        }
        return next;
      });
    }, typingInterval);

    return () => clearInterval(interval);
  }, [stage, nameText, speed]);

  // STAGE 2: HANDS APPROACH
  useEffect(() => {
    if (stage !== 'HANDS_APPROACH') return;

    // Animate hands moving from off-screen to bottom meeting point (400, 480)
    const startTime = performance.now();
    const duration = 850 / speed;

    let reqId: number;
    const animateApproach = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      const lx = -80 + (400 - -80) * ease;
      const rx = 880 - (880 - 400) * ease;
      const ly = 480;
      const ry = 480;

      setLeftHand({
        pos: { x: lx, y: ly },
        angle: 45 * (1 - ease),
        opacity: Math.min(1, ease * 1.5),
      });
      setRightHand({
        pos: { x: rx, y: ry },
        angle: -45 * (1 - ease),
        opacity: Math.min(1, ease * 1.5),
      });

      if (t < 1) {
        reqId = requestAnimationFrame(animateApproach);
      } else {
        // Hands meet! Emit initial love flash
        if (particleApiRef.current) {
          particleApiRef.current.emitDrawingSparks({ x: 400, y: 480 }, { x: 400, y: 480 }, 20);
          particleApiRef.current.triggerHeartbeatShockwave(400, 480, 0.6);
        }
        soundEngine.playTypingSound(5);

        setTimeout(() => {
          setStage('DRAWING_HEART');
        }, 150 / speed);
      }
    };

    reqId = requestAnimationFrame(animateApproach);
    return () => cancelAnimationFrame(reqId);
  }, [stage, speed]);

  // STAGE 3: DRAWING HEART
  useEffect(() => {
    if (stage !== 'DRAWING_HEART') return;

    const startTime = performance.now();
    const duration = 2800 / speed;
    let lastSoundTime = 0;

    let reqId: number;
    const animateDrawing = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth sine in-out easing
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);

      setDrawProgress(ease);

      // Play continuous ascending harmonic shimmer sound
      if (now - lastSoundTime > 90) {
        soundEngine.playDrawingShimmer(ease);
        lastSoundTime = now;
      }

      if (t < 1) {
        reqId = requestAnimationFrame(animateDrawing);
      } else {
        // Drawing complete! Hands meet at top cleft (400, 220)
        setDrawProgress(1);
        if (particleApiRef.current) {
          particleApiRef.current.emitDrawingSparks({ x: 400, y: 220 }, { x: 400, y: 220 }, 25);
          particleApiRef.current.triggerHeartbeatShockwave(400, 220, 0.8);
        }

        // Linger briefly in loving clasp, then gently withdraw hands as vibration begins
        setTimeout(() => {
          setStage('HEART_VIBRATING');
        }, 600 / speed);
      }
    };

    reqId = requestAnimationFrame(animateDrawing);
    return () => cancelAnimationFrame(reqId);
  }, [stage, speed]);

  // STAGE 4: HEART VIBRATING
  useEffect(() => {
    if (stage !== 'HEART_VIBRATING') return;

    // Gently fade and retreat hands into the shadows
    setLeftHand((prev) => ({ ...prev, opacity: 0 }));
    setRightHand((prev) => ({ ...prev, opacity: 0 }));

    const startTime = performance.now();
    const totalDuration = 3400 / speed;

    // Heartbeat cadence timestamps (milliseconds within stage)
    const beats = [200, 360, 950, 1110, 1750, 1910, 2500, 2660, 3050];
    const triggeredBeats = new Set<number>();

    let reqId: number;
    const animateVibration = (now: number) => {
      const elapsed = (now - startTime) * speed;
      const progress = Math.min(1, elapsed / 3400);

      // Vibration envelope: ramps up in intensity, reaches fever pitch
      const intensity = Math.min(1, progress * 1.3);
      setVibrationIntensity(intensity);

      // Screen displacement shake
      const shakeMag = 4.5 * intensity;
      const sx = (Math.random() - 0.5) * shakeMag;
      const sy = (Math.random() - 0.5) * shakeMag;
      const srot = (Math.random() - 0.5) * (intensity * 0.8);
      setScreenOffset({ x: sx, y: sy, rot: srot });

      // Check heartbeat trigger points
      beats.forEach((b) => {
        if (elapsed >= b && !triggeredBeats.has(b)) {
          triggeredBeats.add(b);
          const beatIntensity = 0.6 + progress * 0.5;
          soundEngine.playHeartbeat(beatIntensity);
          if (particleApiRef.current) {
            particleApiRef.current.triggerHeartbeatShockwave(400, 320, beatIntensity);
          }
        }
      });

      if (progress < 1) {
        reqId = requestAnimationFrame(animateVibration);
      } else {
        // Transition to dissolving: the heart shatters and goes away!
        setStage('HEART_DISSOLVING');
      }
    };

    reqId = requestAnimationFrame(animateVibration);
    return () => cancelAnimationFrame(reqId);
  }, [stage, speed]);

  // STAGE 5: HEART DISSOLVING
  useEffect(() => {
    if (stage !== 'HEART_DISSOLVING') return;

    setScreenOffset({ x: 0, y: 0, rot: 0 });
    setVibrationIntensity(0);

    // Trigger celestial stardust explosion and cosmic sound
    soundEngine.playDissolveBurst();
    if (particleApiRef.current) {
      particleApiRef.current.triggerHeartDissolveBurst(400, 320);
    }

    // After heart has dissolved, finalize sequence
    const timer = setTimeout(() => {
      setStage('FINISHED');
    }, 2400 / speed);

    return () => clearTimeout(timer);
  }, [stage, speed]);

  // STAGE 6: FINISHED & AUTO-LOOP
  useEffect(() => {
    if (stage !== 'FINISHED' || !autoLoop) return;

    const timer = setTimeout(() => {
      startSequence();
    }, 2800 / speed);

    return () => clearTimeout(timer);
  }, [stage, autoLoop, speed, startSequence]);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      style={{
        transform: `translate3d(${screenOffset.x}px, ${screenOffset.y}px, 0px) rotate(${screenOffset.rot}deg)`,
        transition: stage === 'HEART_VIBRATING' ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* 1. Deep Cosmic HTML5 Canvas (Particle Physics, Dust, Sparks, Motes, Shockwaves) */}
      <CosmicCanvas
        stage={stage}
        isDrawing={stage === 'DRAWING_HEART'}
        onCanvasReady={(api) => {
          particleApiRef.current = api;
        }}
      />

      {/* Atmospheric Vignette & Deep Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none z-5 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

      {/* 2. Main Centered Visual Stage: Scaled SVG Coordinate Container (800x640) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-4">
        <div className="relative w-full max-w-4xl aspect-[800/640] flex items-center justify-center">
          {/* Kinetic Typography "R O U N A K" */}
          <RounakTypography
            text={nameText}
            stage={stage}
            typedLength={typedLength}
            vibrationIntensity={vibrationIntensity}
            isDissolving={stage === 'HEART_DISSOLVING' || stage === 'FINISHED'}
          />

          {/* Glowing Animated Heart Stroke */}
          <HeartPath
            stage={stage}
            drawProgress={drawProgress}
            vibrationIntensity={vibrationIntensity}
            onHandCoordinates={handleHandCoordinates}
            onEmitSparks={handleEmitSparks}
          />

          {/* Two Hands Expressing Love */}
          <svg
            viewBox="0 0 800 640"
            className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Left Hand */}
            <HandRenderer
              side="left"
              x={leftHand.pos.x}
              y={leftHand.pos.y}
              angle={leftHand.angle}
              opacity={leftHand.opacity}
              scale={0.9}
              isDrawing={stage === 'DRAWING_HEART' || stage === 'HANDS_APPROACH'}
            />

            {/* Right Hand */}
            <HandRenderer
              side="right"
              x={rightHand.pos.x}
              y={rightHand.pos.y}
              angle={rightHand.angle}
              opacity={rightHand.opacity}
              scale={0.9}
              isDrawing={stage === 'DRAWING_HEART' || stage === 'HANDS_APPROACH'}
            />
          </svg>
        </div>
      </div>

      {/* Subtle Cinematic Top Brand Bar (Anti-Slop Clean 3-zone contract) */}
      <header className="fixed top-6 left-6 z-40 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          <span className="font-display font-black tracking-widest text-sm text-white/90 uppercase">
            ROUNAK
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>Kinetic Love Canvas</span>
          <span aria-hidden="true">·</span>
          <span>Dual-Hand Articulation</span>
        </div>
      </header>

      {/* Motion Engine HUD Inspector (Highlights all active types of motions) */}
      <MotionInspector
        stage={stage}
        activeMotions={activeMotions}
        isOpen={showInspector}
        onToggle={() => setShowInspector((prev) => !prev)}
      />

      {/* Floating Minimalist Control Bar */}
      <MotionControls
        stage={stage}
        onPlay={startSequence}
        onReplay={startSequence}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        speed={speed}
        onChangeSpeed={setSpeed}
        autoLoop={autoLoop}
        onToggleLoop={() => setAutoLoop((prev) => !prev)}
        currentName={nameText}
        onUpdateName={setNameText}
      />
    </main>
  );
}
