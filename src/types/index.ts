export type AnimationStage =
  | 'IDLE'
  | 'TYPING'
  | 'HANDS_APPROACH'
  | 'DRAWING_HEART'
  | 'HEART_VIBRATING'
  | 'HEART_DISSOLVING'
  | 'FINISHED';

export interface Point {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  type: 'spark' | 'heart' | 'mote' | 'shockwave';
  rotation?: number;
  vRot?: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface AnimationConfig {
  name: string;
  speed: number; // 0.5 to 2.0
  autoLoop: boolean;
  soundEnabled: boolean;
  glowIntensity: number; // 1 to 3
}

export interface ActiveMotionTypes {
  kineticTypography: boolean;
  pathTracing: boolean;
  skeletalKinematics: boolean;
  harmonicVibration: boolean;
  particlePhysics: boolean;
  radialShockwave: boolean;
  viewportDisplacement: boolean;
}
