/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GravityDirection = 'down' | 'up' | 'left' | 'right';

export interface Skin {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  cost: number;
  unlocked: boolean;
  style: 'neon' | 'matrix' | 'gold' | 'cyber' | 'hologram' | 'core';
}

export interface Trail {
  id: string;
  name: string;
  color: string;
  sparkle: boolean;
  cost: number;
  unlocked: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number; // For visual rolling
  isGrounded: boolean;
  doubleJumpAvailable: boolean;
  dashCooldown: number;
  dashDuration: number;
  dashX: number;
  dashY: number;
  gravityResistanceActive: boolean;
  gravityResistanceEnergy: number; // 0 to 100
  isMagneticSticking: boolean;
  magneticCooldown: number;
}

export interface LevelMetadata {
  id: string;
  name: string;
  world: number;
  description: string;
  difficulty: 'Training' | 'Easy' | 'Medium' | 'Hard' | 'Quantum';
  isLocked: boolean;
  completed: boolean;
  highScoreTime?: number; // Speedrunner's time
  shardsCollected: number;
  totalShardsInLevel: number;
}

export type EntityType = 
  | 'wall' 
  | 'ice' 
  | 'bounce' 
  | 'laser_cannon' 
  | 'laser_beam'
  | 'crusher' 
  | 'slow_zone' 
  | 'portal' 
  | 'button' 
  | 'door' 
  | 'shard' 
  | 'ai_log' 
  | 'clone_trigger'
  | 'checkpoint'
  | 'goal'
  | 'arrow_up'
  | 'arrow_down'
  | 'arrow_left'
  | 'arrow_right'
  | 'rotate_cw'
  | 'rotate_ccw';

export interface GameEntity {
  id: string;
  type: EntityType;
  x: number; // grid or canvas coordinates
  y: number;
  width: number;
  height: number;
  // Physics parameters
  isStatic: boolean;
  vx?: number;
  vy?: number;
  elasticity?: number;
  friction?: number;
  // Specific entity parameters
  color?: string;
  idTag?: string; // e.g., portal connection tag "A1", or door ID connected to button "B1"
  propertyValue?: number; // custom values like laser timing frequency or velocity slider
  isActive?: boolean;
  targetX?: number; // for moving objects
  targetY?: number;
  startX?: number;
  startY?: number;
  moveSpeed?: number;
  moveDirection?: number; // 1 or -1
  angle?: number; // for rotating laser/traps
  pulseOn?: number; // timing trigger
  pulseOff?: number;
}

export interface GameLevel {
  id: string;
  name: string;
  world: number;
  worldName: string;
  width: number; // custom canvas units, e.g., 1200x800
  height: number;
  startX: number;
  startY: number;
  goalX: number;
  goalY: number;
  entities: GameEntity[];
  narrativeText?: string[]; // Story texts associated with logs/room
  isCloneLevel?: boolean;
  difficulty: 'Training' | 'Easy' | 'Medium' | 'Hard' | 'Quantum';
}

export interface GameSettings {
  volumeSfx: number; // 0 to 1
  volumeMusic: number; // 0 to 1
  screenShake: boolean;
  trailParticles: boolean;
  glowEffects: boolean;
  bloom: boolean;
}

export interface StoryLog {
  id: string;
  title: string;
  sender: string;
  content: string;
  timestamp: string;
  unlocked: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  glowColor?: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'ring' | 'star';
}
