import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Edit3,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { AnimationStage } from '../types';

interface MotionControlsProps {
  stage: AnimationStage;
  onPlay: () => void;
  onReplay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  autoLoop: boolean;
  onToggleLoop: () => void;
  currentName: string;
  onUpdateName: (newName: string) => void;
}

export const MotionControls: React.FC<MotionControlsProps> = ({
  stage,
  onPlay,
  onReplay,
  soundEnabled,
  onToggleSound,
  speed,
  onChangeSpeed,
  autoLoop,
  onToggleLoop,
  currentName,
  onUpdateName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(currentName);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim().length > 0) {
      onUpdateName(tempName.trim());
      setIsEditing(false);
      onReplay();
    }
  };

  const isFinished = stage === 'FINISHED';
  const isIdle = stage === 'IDLE';

  return (
    <>
      {/* Floating Bottom Minimalist Control Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-xl shadow-2xl text-zinc-300">
        {/* Primary Action Button (Play / Replay) */}
        {isIdle ? (
          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs sm:text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Canvas</span>
          </button>
        ) : (
          <button
            onClick={onReplay}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer hover:shadow-md"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        )}

        <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

        {/* Speed Segmented Controller */}
        <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-800/60">
          {[0.75, 1.0, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-1 text-[11px] font-mono rounded-md transition-colors ${
                speed === s
                  ? 'bg-rose-600/90 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl transition-all ${
            soundEnabled
              ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title={soundEnabled ? 'Mute cinematic audio' : 'Enable audio synthesizer'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Auto Loop Toggle */}
        <button
          onClick={onToggleLoop}
          className={`p-2 rounded-xl transition-all ${
            autoLoop
              ? 'text-rose-400 bg-rose-950/30 shadow-[0_0_10px_rgba(255,64,129,0.2)]'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title={autoLoop ? 'Auto-looping active' : 'Click to enable auto-loop'}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Edit Name Button */}
        <button
          onClick={() => {
            setTempName(currentName);
            setIsEditing(true);
          }}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          title="Customize text"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all hidden sm:block"
          title="Toggle fullscreen canvas"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Name Customization Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Customize Canvas Name</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveName}>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Target Name or Expression
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value.toUpperCase())}
                maxLength={18}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono tracking-widest text-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="R O U N A K"
                autoFocus
              />

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Default: R O U N A K</span>
                <button
                  type="button"
                  onClick={() => setTempName('R O U N A K')}
                  className="text-rose-400 hover:underline"
                >
                  Reset Default
                </button>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-950/40"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply & Replay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
