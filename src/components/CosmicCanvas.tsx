import React, { useEffect, useRef } from 'react';
import { Particle, Shockwave, Point } from '../types';

interface CosmicCanvasProps {
  stage: string;
  isDrawing: boolean;
  onCanvasReady?: (api: CanvasParticleAPI) => void;
}

export interface CanvasParticleAPI {
  emitDrawingSparks: (pLeft: Point, pRight: Point, count?: number) => void;
  triggerHeartbeatShockwave: (x?: number, y?: number, intensity?: number) => void;
  triggerHeartDissolveBurst: (centerX?: number, centerY?: number) => void;
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  stage,
  isDrawing,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const nextParticleId = useRef(0);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  // Expose API to parent via ref callback
  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady({
        emitDrawingSparks: (pLeft, pRight, count = 3) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          // Convert 800x640 coordinate space to actual canvas pixel coords
          const scaleX = rect.width / 800;
          const scaleY = rect.height / 640;

          const realL = { x: pLeft.x * scaleX, y: pLeft.y * scaleY };
          const realR = { x: pRight.x * scaleX, y: pRight.y * scaleY };

          [realL, realR].forEach((pos) => {
            for (let i = 0; i < count; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.5 + Math.random() * 2.5;
              const colors = ['#ffffff', '#ff80ab', '#ff4081', '#ffd54f', '#ff1744'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              particlesRef.current.push({
                id: nextParticleId.current++,
                x: pos.x + (Math.random() - 0.5) * 8,
                y: pos.y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.4, // Slight buoyant lift
                size: 1.5 + Math.random() * 2.5,
                alpha: 0.95,
                maxLife: 30 + Math.random() * 25,
                life: 0,
                color,
                type: 'spark',
              });
            }
          });
        },

        triggerHeartbeatShockwave: (x = 400, y = 320, intensity = 1.0) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const realX = (x / 800) * rect.width;
          const realY = (y / 640) * rect.height;

          // Double shockwave ring for depth
          shockwavesRef.current.push({
            x: realX,
            y: realY,
            radius: 40,
            maxRadius: Math.max(rect.width, rect.height) * 0.75 * intensity,
            alpha: 0.7 * intensity,
            color: 'rgba(255, 64, 129,',
          });
          shockwavesRef.current.push({
            x: realX,
            y: realY,
            radius: 20,
            maxRadius: Math.max(rect.width, rect.height) * 0.6 * intensity,
            alpha: 0.5 * intensity,
            color: 'rgba(255, 255, 255,',
          });
        },

        triggerHeartDissolveBurst: (centerX = 400, centerY = 320) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const cx = (centerX / 800) * rect.width;
          const cy = (centerY / 640) * rect.height;

          // 1. Burst of mini glowing hearts drifting upwards in swirl vortex
          const heartColors = ['#ff4081', '#ff1744', '#ff80ab', '#ffffff', '#ffd54f'];
          for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 160;
            const speed = 1.2 + Math.random() * 4.5;
            particlesRef.current.push({
              id: nextParticleId.current++,
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist * 0.8,
              vx: Math.cos(angle) * speed * 0.8,
              vy: Math.sin(angle) * speed * 0.6 - (1.5 + Math.random() * 2.5), // buoyant floating up
              size: 6 + Math.random() * 14,
              alpha: 0.95,
              maxLife: 90 + Math.random() * 70,
              life: 0,
              color: heartColors[Math.floor(Math.random() * heartColors.length)],
              type: 'heart',
              rotation: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 0.08,
            });
          }

          // 2. High velocity radiant stardust explosion
          for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 9;
            const colors = ['#ffffff', '#ff80ab', '#ff4081', '#ffe082', '#ff5252'];
            particlesRef.current.push({
              id: nextParticleId.current++,
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 1.5 + Math.random() * 3.5,
              alpha: 1,
              maxLife: 60 + Math.random() * 60,
              life: 0,
              color: colors[Math.floor(Math.random() * colors.length)],
              type: 'spark',
            });
          }

          // 3. Huge explosive luminous shockwaves
          shockwavesRef.current.push({
            x: cx,
            y: cy,
            radius: 20,
            maxRadius: Math.max(rect.width, rect.height) * 1.2,
            alpha: 0.85,
            color: 'rgba(255, 64, 129,',
          });
          shockwavesRef.current.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: Math.max(rect.width, rect.height) * 0.9,
            alpha: 0.95,
            color: 'rgba(255, 255, 255,',
          });
        },
      });
    }
  }, [onCanvasReady]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Seed ambient drifting starlight background particles
    const ambientMotes: Particle[] = [];
    for (let i = 0; i < 65; i++) {
      ambientMotes.push({
        id: nextParticleId.current++,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.15,
        size: 0.8 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.5,
        maxLife: 999999,
        life: 0,
        color: Math.random() > 0.3 ? '#ffffff' : '#ff80ab',
        type: 'mote',
      });
    }

    // Helper to draw a delicate vector heart on canvas
    const drawHeartShape = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.4, 0, size);
      c.bezierCurveTo(0, (size + topCurveHeight) / 1.4, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Starlight Motes (gentle cosmic drifting)
      ambientMotes.forEach((mote) => {
        mote.x += mote.vx;
        mote.y += mote.vy;
        if (mote.x < 0) mote.x = width;
        if (mote.x > width) mote.x = 0;
        if (mote.y < 0) mote.y = height;
        if (mote.y > height) mote.y = 0;

        // Subtle twinkling alpha
        const twinkle = 0.5 + Math.sin(time * 2 + mote.id) * 0.4;
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = mote.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Render Shockwaves
      shockwavesRef.current = shockwavesRef.current.filter((sw) => {
        sw.radius += (sw.maxRadius - sw.radius) * 0.08 + 2.5;
        sw.alpha *= 0.94;

        if (sw.alpha > 0.01 && sw.radius < sw.maxRadius) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `${sw.color} ${sw.alpha})`;
          ctx.lineWidth = Math.max(1, 8 * (sw.alpha));
          ctx.shadowColor = '#ff4081';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();
          return true;
        }
        return false;
      });

      // 3. Render Dynamic Particles (Sparks, Floating Hearts, Stardust)
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Physical properties
        if (p.type === 'spark') {
          p.vx *= 0.96; // Air drag
          p.vy *= 0.96;
          p.vy += 0.04; // Gentle gravity
        } else if (p.type === 'heart') {
          // Turbulent buoyant swirl
          p.vx += Math.sin(time * 3 + p.id) * 0.08;
          p.vy -= 0.02; // Buoyancy upwards
          if (p.rotation !== undefined && p.vRot !== undefined) {
            p.rotation += p.vRot;
          }
        }

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        if (progress < 1 && currentAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = p.color;

          if (p.type === 'heart') {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            drawHeartShape(ctx, p.x, p.y, p.size, p.rotation || 0);
          } else {
            // Sparkle with starlight cross glow
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Star diamond glimmer for larger sparks
            if (p.size > 2.2) {
              ctx.lineWidth = 0.8;
              ctx.strokeStyle = '#ffffff';
              ctx.beginPath();
              ctx.moveTo(p.x - p.size * 2, p.y);
              ctx.lineTo(p.x + p.size * 2, p.y);
              ctx.moveTo(p.x, p.y - p.size * 2);
              ctx.lineTo(p.x, p.y + p.size * 2);
              ctx.stroke();
            }
          }

          ctx.restore();
          return true;
        }
        return false;
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle interactive mouse sparkle trails on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    if (Math.random() > 0.3) {
      const colors = ['#ffffff', '#ff80ab', '#ff4081', '#ffd54f'];
      particlesRef.current.push({
        id: nextParticleId.current++,
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.7,
        maxLife: 25 + Math.random() * 20,
        life: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'spark',
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
    />
  );
};
