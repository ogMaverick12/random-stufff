import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveMotionTypes, AnimationStage } from '../types';
import { Activity, Sparkles, Move, Zap, Waves, Radio, Eye } from 'lucide-react';

interface MotionInspectorProps {
  stage: AnimationStage;
  activeMotions: ActiveMotionTypes;
  isOpen: boolean;
  onToggle: () => void;
}

export const MotionInspector: React.FC<MotionInspectorProps> = ({
  stage,
  activeMotions,
  isOpen,
  onToggle,
}) => {
  const motionItems = [
    {
      id: 'kineticTypography',
      name: 'Kinetic Typography',
      desc: 'Letter spring bounce, staggered ink strike & glow',
      active: activeMotions.kineticTypography,
      icon: Activity,
      color: 'text-amber-400',
      badge: 'Spring Physics',
    },
    {
      id: 'pathTracing',
      name: 'Dual Path Tracing',
      desc: 'Symmetrical SVG Bezier stroke-dash interpolation',
      active: activeMotions.pathTracing,
      icon: Waves,
      color: 'text-rose-400',
      badge: 'Parametric',
    },
    {
      id: 'skeletalKinematics',
      name: 'Hand Kinematics',
      desc: 'Tangential curvature tracking, wrist tilt & fingertip orbs',
      active: activeMotions.skeletalKinematics,
      icon: Move,
      color: 'text-pink-400',
      badge: 'Transform Math',
    },
    {
      id: 'harmonicVibration',
      name: 'Harmonic Vibration',
      desc: 'Multi-harmonic jitter, screen shake & sympathy resonance',
      active: activeMotions.harmonicVibration,
      icon: Zap,
      color: 'text-red-500',
      badge: 'Resonance',
    },
    {
      id: 'particlePhysics',
      name: 'Particle Physics Engine',
      desc: 'Sparks, buoyant vortex hearts & cosmic dust motes',
      active: activeMotions.particlePhysics,
      icon: Sparkles,
      color: 'text-purple-400',
      badge: '60fps Canvas',
    },
    {
      id: 'radialShockwave',
      name: 'Radial Shockwaves',
      desc: 'Acoustic wave propagation synced with Web Audio bass',
      active: activeMotions.radialShockwave,
      icon: Radio,
      color: 'text-cyan-400',
      badge: 'Wavefront',
    },
  ];

  return (
    <div className="fixed top-6 right-6 z-40 select-none">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:text-white backdrop-blur-md transition-all shadow-lg hover:shadow-rose-950/20"
        title="Toggle motion engine inspector"
      >
        <Activity className={`w-3.5 h-3.5 ${stage === 'HEART_VIBRATING' ? 'animate-spin text-rose-500' : 'text-rose-400'}`} />
        <span>Motions Active ({motionItems.filter((m) => m.active).length}/6)</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl shadow-2xl text-left"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                Kinetic Motion Matrix
              </span>
              <span className="text-[11px] font-mono text-rose-400/80 uppercase tracking-wider">
                Stage: {stage}
              </span>
            </div>

            <div className="space-y-2">
              {motionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      item.active
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(255,64,129,0.15)]'
                        : 'bg-zinc-900/40 border-zinc-800/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.active ? item.color : 'text-zinc-500'}`} />
                        <span className={`text-xs font-medium ${item.active ? 'text-white' : 'text-zinc-400'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{item.badge}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400 leading-tight">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
