/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, 
  HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Magnet
} from 'lucide-react';
import { GameLevel, PlayerState, GameEntity, GravityDirection, Particle, Skin, Trail } from '../types';
import { sounds } from '../game/sound';
import { STORIES } from '../game/levels';

interface GameCanvasProps {
  level: GameLevel;
  selectedSkin: Skin;
  selectedTrail: Trail;
  settings: {
    volumeSfx: number;
    screenShake: boolean;
    trailParticles: boolean;
    glowEffects: boolean;
  };
  mode: 'story' | 'challenge' | 'endless' | 'speedrun';
  onLevelClear: (scoreTime: number, shardsCount: number) => void;
  onExit: () => void;
  onOpenNarrative: (tag: string) => void;
}

export default function GameCanvas({
  level,
  selectedSkin,
  selectedTrail,
  settings,
  mode,
  onLevelClear,
  onExit,
  onOpenNarrative,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game state toggles
  const [isPaused, setIsPaused] = useState(false);
  const [deathCount, setDeathCount] = useState(0);
  const [levelTimer, setLevelTimer] = useState(0);
  const [shardsCollected, setShardsCollected] = useState(0);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [victoryState, setVictoryState] = useState(false);

  // Keyboard state representation
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Physics states kept in refs for synchronous canvas ticks
  const playerRef = useRef<PlayerState>({
    x: level.startX,
    y: level.startY,
    vx: 0,
    vy: 0,
    radius: 16,
    angle: 0,
    isGrounded: false,
    doubleJumpAvailable: true,
    dashCooldown: 0,
    dashDuration: 0,
    dashX: 0,
    dashY: 0,
    gravityResistanceActive: false,
    gravityResistanceEnergy: 100,
    isMagneticSticking: false,
    magneticCooldown: 0,
  });

  // Dynamic entities copies to handle state changes within a level (e.g., buttons, crushers, lasers)
  const [activeEntities, setActiveEntities] = useState<GameEntity[]>([]);
  const entitiesRef = useRef<GameEntity[]>([]);

  // Clone state
  const hasClone = useRef<boolean>(false);
  const cloneRef = useRef<PlayerState | null>(null);

  // Gravity vectors
  const gravityDir = useRef<GravityDirection>('down');
  const targetCameraAngle = useRef<number>(0);
  const currentCameraAngle = useRef<number>(0);

  // FX: Shake, Particles
  const cameraShake = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const backgroundStars = useRef<{ x: number; y: number; speed: number; alpha: number }[]>([]);

  // Teleportation portals cooldown logic
  const portalCooldown = useRef<{ [key: string]: number }>({});

  // Achievements tracking in-level
  const doubleJumpsDone = useRef<number>(0);
  const consecutiveShards = useRef<number>(0);
  const lastShardTime = useRef<number>(0);

  // Initialize background stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
        stars.push({
          x: Math.random() * level.width,
          y: Math.random() * level.height,
          speed: 0.1 + Math.random() * 0.4,
          alpha: 0.2 + Math.random() * 0.6,
        });
    }
    backgroundStars.current = stars;
  }, [level]);

  // Handle active entities reset/cloning on level mount
  useEffect(() => {
    // Deep copy entities to manage states of switches, doors, etc.
    const copied = JSON.parse(JSON.stringify(level.entities)) as GameEntity[];
    entitiesRef.current = copied;
    setActiveEntities(copied);

    // Reset player position
    playerRef.current = {
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
      radius: 16,
      angle: 0,
      isGrounded: false,
      doubleJumpAvailable: true,
      dashCooldown: 0,
      dashDuration: 0,
      dashX: 0,
      dashY: 0,
      gravityResistanceActive: false,
      gravityResistanceEnergy: 100,
      isMagneticSticking: false,
      magneticCooldown: 0,
    };

    hasClone.current = false;
    cloneRef.current = null;
    gravityDir.current = 'down';
    targetCameraAngle.current = 0;
    currentCameraAngle.current = 0;
    setLevelTimer(0);
    setShardsCollected(0);
    setVictoryState(false);
    particles.current = [];

    // Play start chime
    setTimeout(() => {
      sounds.playPortal();
    }, 100);
  }, [level]);

  // Shards count synchronizer
  useEffect(() => {
    const coll = activeEntities.filter(e => e.type === 'shard' && e.isActive === false).length;
    setShardsCollected(coll);
  }, [activeEntities]);

  // Keys listener setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keysPressed.current[code] = true;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        sounds.playButtonClick();
        setIsPaused((prev) => !prev);
      }

      // Quick hotkey dash listener
      if (code === 'Shift') {
        triggerDash();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Increment timer
  useEffect(() => {
    if (isPaused || victoryState) return;
    const interval = setInterval(() => {
      setLevelTimer((t) => t + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused, victoryState]);

  // Add gravity impact shockwave
  const spawnShifterShockwave = (x: number, y: number, color: string) => {
    if (!settings.trailParticles) return;
    for (let i = 0; i < 24; i++) {
      const theta = (i / 24) * Math.PI * 2;
      const spd = 3 + Math.random() * 4;
      particles.current.push({
        x,
        y,
        vx: Math.cos(theta) * spd,
        vy: Math.sin(theta) * spd,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        shape: 'ring'
      });
    }
  };

  // Switch gravity safely
  const setGravity = (direction: GravityDirection) => {
    if (gravityDir.current === direction) return;
    gravityDir.current = direction;
    sounds.playGravityShift(direction);

    // Shake camera briefly
    if (settings.screenShake) {
      cameraShake.current = 10;
    }

    // Set target angle for visual camera rotation
    switch (direction) {
      case 'down': targetCameraAngle.current = 0; break;
      case 'up': targetCameraAngle.current = Math.PI; break;
      case 'left': targetCameraAngle.current = Math.PI / 2; break;
      case 'right': targetCameraAngle.current = -Math.PI / 2; break;
    }

    spawnShifterShockwave(playerRef.current.x, playerRef.current.y, selectedSkin.color);
  };

  // Perform dash
  const triggerDash = () => {
    const p = playerRef.current;
    if (p.dashCooldown > 0) return;

    // Check desired vector based on current keys inputs
    let dx = 0;
    let dy = 0;

    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx = -1;
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx = 1;
    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy = -1;
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy = 1;

    // Fallback: dash forward based on current motion vector or default direction
    if (dx === 0 && dy === 0) {
      if (gravityDir.current === 'down' || gravityDir.current === 'up') {
        dx = p.vx >= 0 ? 1 : -1;
      } else {
        dy = p.vy >= 0 ? 1 : -1;
      }
    }

    // Normalize
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    } else {
      dx = 1;
    }

    sounds.playDash();
    p.dashDuration = 12; // lasts 12 ticks
    p.dashCooldown = 45; // cooldown 45 ticks (~0.75s)
    p.dashX = dx * 16;
    p.dashY = dy * 16;

    // Trigger trail particles
    for (let i = 0; i < 15; i++) {
      particles.current.push({
        x: p.x,
        y: p.y,
        vx: -dx * (2 + Math.random() * 3),
        vy: -dy * (2 + Math.random() * 3),
        color: selectedTrail.color,
        size: 4 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        shape: 'star',
      });
    }

    if (hasClone.current && cloneRef.current) {
      const c = cloneRef.current;
      c.dashDuration = 12;
      c.dashCooldown = 45;
      c.dashX = -dx * 16; // Mirror dash coordinate!
      c.dashY = dy * 16;
    }
  };

  const resetAfterDeath = () => {
    sounds.playDeath();
    setDeathCount((c) => c + 1);

    // spawn big particle burst!
    const p = playerRef.current;
    if (settings.trailParticles) {
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 8;
        particles.current.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color: selectedSkin.color,
          size: 3 + Math.random() * 5,
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          shape: 'square'
        });
      }
    }

    // Reset parameters
    playerRef.current = {
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
      radius: 16,
      angle: 0,
      isGrounded: false,
      doubleJumpAvailable: true,
      dashCooldown: 0,
      dashDuration: 0,
      dashX: 0,
      dashY: 0,
      gravityResistanceActive: false,
      gravityResistanceEnergy: 100,
      isMagneticSticking: false,
      magneticCooldown: 0,
    };

    // Reset clone if active
    if (level.isCloneLevel) {
      hasClone.current = false;
      cloneRef.current = null;
    }

    gravityDir.current = 'down';
    targetCameraAngle.current = 0;
    currentCameraAngle.current = 0;

    // Reset elements (all inactive shards, doors, buttons remain parsed, except they return to default active modes if designed)
    const resetEntities = entitiesRef.current.map((e) => {
      if (e.type === 'button') e.isActive = false;
      if (e.type === 'door') e.isActive = false;
      return e;
    });
    setActiveEntities(resetEntities);
  };

  // Physics updates loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPaused || victoryState) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const p = playerRef.current;
      const entities = entitiesRef.current;

      // 1. Dilation Factor check - Slow down time inside bubbles
      let timeDilation = 1.0;
      entities.forEach((ent) => {
        if (ent.type === 'slow_zone') {
          const dx = p.x - (ent.x + ent.width / 2);
          const dy = p.y - (ent.y + ent.height / 2);
          // Check rectangle bounding or distance
          if (
            p.x + p.radius > ent.x &&
            p.x - p.radius < ent.x + ent.width &&
            p.y + p.radius > ent.y &&
            p.y - p.radius < ent.y + ent.height
          ) {
            timeDilation = 0.35; // slows physics by ~65%
          }
        }
      });

      // 2. Cooldown timer reductions
      if (p.dashCooldown > 0) p.dashCooldown -= timeDilation;
      if (p.magneticCooldown > 0) p.magneticCooldown -= timeDilation;

      // Interpolate camera angle slowly for beautiful cinematically rotating world
      const angleDiff = targetCameraAngle.current - currentCameraAngle.current;
      if (Math.abs(angleDiff) > 0.001) {
        currentCameraAngle.current += angleDiff * 0.08 * timeDilation;
      } else {
        currentCameraAngle.current = targetCameraAngle.current;
      }

      // Handle custom camera shake decay
      if (cameraShake.current > 0) {
        cameraShake.current -= 0.5 * timeDilation;
      }

      // 3. Main Player Input Movement mapping depending on local Gravity orientation
      let walkForce = 0;
      const isLeftPress = keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'];
      const isRightPress = keysPressed.current['KeyD'] || keysPressed.current['ArrowRight'];
      
      if (isLeftPress) walkForce = -1.0;
      if (isRightPress) walkForce = 1.0;

      // Check Magnetic Field modifier sticking toggle
      const isMagnetPress = keysPressed.current['KeyC'] || keysPressed.current['ControlLeft'];
      if (isMagnetPress && p.magneticCooldown === 0) {
        p.isMagneticSticking = true;
      } else {
        p.isMagneticSticking = false;
      }

      // Apply Gravity Resistance (energy drains)
      const isResistancePress = keysPressed.current['KeyS'] || keysPressed.current['ArrowDown'];
      if (isResistancePress && p.gravityResistanceEnergy > 2) {
        p.gravityResistanceActive = true;
        p.gravityResistanceEnergy -= 1.5 * timeDilation;
      } else {
        p.gravityResistanceActive = false;
        if (p.gravityResistanceEnergy < 100) {
          p.gravityResistanceEnergy += 0.4 * timeDilation;
        }
      }

      // Apply primary physics simulation to player
      updateSpherePhysics(p, walkForce, timeDilation, 'player');

      // Sync and update secondary Clone sphere if valid
      if (hasClone.current && cloneRef.current) {
        // Mirrored inputs to create intelligent puzzle synergy
        // clone rolls in response to mirrored walk parameter, holds mirrored keys
        const cloneWalkForce = -walkForce; // opposite direction
        updateSpherePhysics(cloneRef.current, cloneWalkForce, timeDilation, 'clone');
      }

      // 4. Update and animate Hazards (crushers, rotating lasers, etc.)
      updateEntitiesVisuals(timeDilation);

      // 5. Update Particle arrays
      updateParticlesSystem(timeDilation);

      animId = requestAnimationFrame(tick);
    };

    const updateSpherePhysics = (p: PlayerState, walkForce: number, dt: number, sphereType: 'player' | 'clone') => {
      const gConstant = p.gravityResistanceActive ? 0.15 : 0.42; // Low gravity bubble
      let gx = 0;
      let gy = 0;

      // Determine gravity vector directions
      switch (gravityDir.current) {
        case 'down': gy = gConstant; break;
        case 'up': gy = -gConstant; break;
        case 'left': gx = -gConstant; break;
        case 'right': gx = gConstant; break;
      }

      if (p.dashDuration > 0) {
        // Under active dash acceleration: cancel gravity entirely
        p.vx = p.dashX;
        p.vy = p.dashY;
        p.dashDuration -= dt;
      } else {
        // standard rolling physics apply
        // Apply appropriate walk force relative to the current gravity matrix
        const rollSpeed = 0.45;
        if (gravityDir.current === 'down' || gravityDir.current === 'up') {
          const friction = p.isGrounded ? (getCurrentFrictionAt(p.x, p.y + (gravityDir.current === 'down' ? p.radius + 2 : -p.radius - 2))) : 0.98;
          p.vx += walkForce * rollSpeed * dt;
          p.vx *= Math.pow(friction, dt);
          p.vy += gy * dt;
          p.vy *= Math.pow(0.99, dt); // terminal velocity damping
        } else {
          const friction = p.isGrounded ? (getCurrentFrictionAt(p.x + (gravityDir.current === 'right' ? p.radius + 2 : -p.radius - 2), p.y)) : 0.98;
          p.vy += walkForce * rollSpeed * dt;
          p.vy *= Math.pow(friction, dt);
          p.vx += gx * dt;
          p.vx *= Math.pow(0.99, dt);
        }

        // Apply roll angle visual calculation
        p.angle += (gravityDir.current === 'down' || gravityDir.current === 'up' ? p.vx : p.vy) * 0.05 * dt;
      }

      // Cap horizontal velocity to prevent clipping
      const maxSpd = 14;
      p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));
      p.vy = Math.max(-maxSpd, Math.min(maxSpd, p.vy));

      // Coordinate updates
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Jump Action mappings
      const jumpKey = keysPressed.current['Space'] || keysPressed.current['KeyW'] || keysPressed.current['ArrowUp'] || keysPressed.current['KeyK'];
      
      if (jumpKey) {
        // Ensure continuous key holding doesn't trigger continuous jumps unless double-jump is desired
        if (p.isGrounded) {
          performJump(p);
        } else if (p.doubleJumpAvailable && !keysPressed.current['wasJumpHeld']) {
          performDoubleJump(p);
        }
        keysPressed.current['wasJumpHeld'] = true;
      } else {
        keysPressed.current['wasJumpHeld'] = false;
      }

      // Check constraints/boundaries to keep sphere in screen
      if (p.x < p.radius) { p.x = p.radius; p.vx = 0; }
      if (p.x > level.width - p.radius) { p.x = level.width - p.radius; p.vx = 0; }
      if (p.y < p.radius) { p.y = p.radius; p.vy = 0; }
      if (p.y > level.height - p.radius) { p.y = level.height - p.radius; p.vy = 0; }

      // 6. COLLISION STAGE: Resolve wall tiles and check game triggers
      p.isGrounded = false;
      const entities = entitiesRef.current;

      entities.forEach((ent) => {
        resolveCollisionWithEntity(p, ent, sphereType);
      });

      // Spawn movement trails if user enabled
      if (settings.trailParticles && Math.abs(p.vx) + Math.abs(p.vy) > 0.5) {
        if (Math.random() < 0.4) {
          particles.current.push({
            x: p.x + (Math.random() - 0.5) * 8,
            y: p.y + (Math.random() - 0.5) * 8,
            vx: -p.vx * 0.15,
            vy: -p.vy * 0.15,
            color: selectedTrail.color,
            glowColor: selectedSkin.glowColor,
            size: selectedTrail.sparkle ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2,
            alpha: 0.8,
            life: 0,
            maxLife: 25 + Math.random() * 15,
            shape: selectedTrail.sparkle ? 'star' : 'circle'
          });
        }
      }
    };

    const getCurrentFrictionAt = (x: number, y: number): number => {
      // Return 0.98 if touching slippery ice block, 0.85 default normal wall friction
      let onIce = false;
      entitiesRef.current.forEach((ent) => {
        if (ent.type === 'ice' && 
            x >= ent.x && x <= ent.x + ent.width &&
            y >= ent.y && y <= ent.y + ent.height) {
          onIce = true;
        }
      });
      return onIce ? 0.99 : 0.85;
    };

    const performJump = (p: PlayerState) => {
      sounds.playJump();
      const jumpImpulse = -10.5;

      switch (gravityDir.current) {
        case 'down': p.vy = jumpImpulse; break;
        case 'up': p.vy = -jumpImpulse; break;
        case 'left': p.vx = -jumpImpulse; break;
        case 'right': p.vx = jumpImpulse; break;
      }
      p.isGrounded = false;
      
      // spawn tiny lift sparkles
      for (let i = 0; i < 6; i++) {
        particles.current.push({
          x: p.x,
          y: p.y + (gravityDir.current === 'down' ? p.radius : -p.radius),
          vx: (Math.random() - 0.5) * 4,
          vy: gravityDir.current === 'down' ? 1 : -1,
          color: selectedSkin.color,
          size: 2 + Math.random() * 2,
          alpha: 1,
          life: 0,
          maxLife: 15,
        });
      }
    };

    const performDoubleJump = (p: PlayerState) => {
      sounds.playJump();
      doubleJumpsDone.current += 1;
      const jumpImpulse = -9.0;

      switch (gravityDir.current) {
        case 'down': p.vy = jumpImpulse; break;
        case 'up': p.vy = -jumpImpulse; break;
        case 'left': p.vx = -jumpImpulse; break;
        case 'right': p.vx = jumpImpulse; break;
      }
      p.doubleJumpAvailable = false;

      // spawn cool circular shockwave ring around the ball
      for (let i = 0; i < 16; i++) {
        const rad = (i / 16) * Math.PI * 2;
        particles.current.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(rad) * 4,
          vy: Math.sin(rad) * 4,
          color: '#ffffff',
          size: 3,
          alpha: 0.9,
          life: 0,
          maxLife: 20,
          shape: 'ring'
        });
      }
    };

    const resolveCollisionWithEntity = (p: PlayerState, ent: GameEntity, sphereType: 'player' | 'clone') => {
      // 1. Core items triggers checklist: Shards, Portals, AI logs
      if (ent.type === 'shard' && ent.isActive !== false) {
        // Distance check
        const distSq = Math.pow(p.x - ent.x, 2) + Math.pow(p.y - ent.y, 2);
        if (distSq < Math.pow(p.radius + 14, 2)) {
          ent.isActive = false; // deactivate shard (collected!)
          
          // Speedrun multiplier sound
          const now = Date.now();
          if (now - lastShardTime.current < 2500) {
            consecutiveShards.current += 1;
          } else {
            consecutiveShards.current = 1;
          }
          lastShardTime.current = now;
          sounds.playShard(consecutiveShards.current);

          // sparkles
          for (let i = 0; i < 8; i++) {
            particles.current.push({
              x: ent.x,
              y: ent.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#ffd700',
              size: 2 + Math.random() * 2,
              alpha: 1,
              life: 0,
              maxLife: 20
            });
          }
        }
        return;
      }

      if (ent.type === 'clone_trigger') {
        const distSq = Math.pow(p.x - ent.x, 2) + Math.pow(p.y - ent.y, 2);
        if (distSq < Math.pow(p.radius + 15, 2)) {
          if (!hasClone.current && sphereType === 'player') {
            hasClone.current = true;
            // Spawn clone on top corridor mirrored
            cloneRef.current = {
              x: p.x,
              y: p.y - 350, // Mirror offset
              vx: -p.vx,
              vy: p.vy,
              radius: 16,
              angle: -p.angle,
              isGrounded: false,
              doubleJumpAvailable: true,
              dashCooldown: 0,
              dashDuration: 0,
              dashX: 0,
              dashY: 0,
              gravityResistanceActive: false,
              gravityResistanceEnergy: 100,
              isMagneticSticking: false,
              magneticCooldown: 0,
            };
            sounds.playPortal();
            spawnShifterShockwave(p.x, p.y - 350, '#38bdf8');
          }
        }
        return;
      }

      if (ent.type === 'ai_log' && ent.isActive !== false) {
        const distSq = Math.pow(p.x - ent.x, 2) + Math.pow(p.y - ent.y, 2);
        if (distSq < Math.pow(p.radius + 15, 2)) {
          ent.isActive = false; // collected
          sounds.playLogUnlock();
          if (ent.idTag) {
            onOpenNarrative(ent.idTag);
          }
        }
        return;
      }

      if (ent.type === 'portal') {
        const cooldownKey = `${sphereType}_${ent.id}`;
        if (portalCooldown.current[cooldownKey] && portalCooldown.current[cooldownKey] > 0) {
          portalCooldown.current[cooldownKey]--;
          return;
        }

        // Distance check portal
        const distSq = Math.pow(p.x - ent.x, 2) + Math.pow(p.y - ent.y, 2);
        if (distSq < Math.pow(p.radius + 20, 2)) {
          // find paired portal in entities
          const pair = entitiesRef.current.find(e => e.type === 'portal' && e.idTag === ent.idTag && e.id !== ent.id);
          if (pair) {
            sounds.playPortal();
            
            // Teleport player preserving momentum velocity
            p.x = pair.x + pair.width / 2;
            p.y = pair.y + pair.height / 2;

            // Set visual portal bursts
            spawnShifterShockwave(ent.x, ent.y, ent.color || '#ff007f');
            spawnShifterShockwave(pair.x, pair.y, pair.color || '#ff007f');

            // Apply portal cooldown to avoid infinite loop bounce
            portalCooldown.current[`${sphereType}_${pair.id}`] = 40; // cool down ticks
          }
        }
        return;
      }

      // Check Goal Portal
      if (ent.type === 'goal' || (ent.id === 'border_bottom' && level.goalX > 1000 && Math.abs(p.x - level.goalX) < 40 && Math.abs(p.y - level.goalY) < 60)) {
        // goal coordinates matching
        const distSq = Math.pow(p.x - level.goalX, 2) + Math.pow(p.y - level.goalY, 2);
        if (distSq < Math.pow(p.radius + 30, 2)) {
          if (!victoryState) {
            setVictoryState(true);
            sounds.playLevelClear();
            onLevelClear(levelTimer, shardsCollected);
          }
        }
        return;
      }

      // 2. Traps checklists: lasers, crushers
      if (ent.type === 'laser_beam' || (ent.type === 'laser_cannon' && ent.isActive !== false)) {
        // laser beam line intersections or box intersections
        // We evaluate laser beams directly drawn in frame. Check overlap of player bounding against laser bounding
        if (ent.type === 'laser_cannon') {
          // If active, it shoots laser.
          // Let's assume laser beam spans vertically or horizontally based on parameters
          // Simple laser collision box check
          const isLasing = ent.pulseOn === undefined || (ent.isActive);
          if (isLasing) {
            // Evaluated as active laser beam projecting downward or rotating
            let beamHit = false;
            if (ent.angle !== undefined) {
              // rotating laser intersection. check distance from line segment
              // Line starts at laser center, points in ent.angle direction up to 800 width
              const beamLength = 900;
              const beamEndX = ent.x + ent.width/2 + Math.cos(ent.angle) * beamLength;
              const beamEndY = ent.y + ent.height/2 + Math.sin(ent.angle) * beamLength;
              
              // distance from player center to segment
              const dist = distToSegment({ x: p.x, y: p.y }, { x: ent.x + ent.width/2, y: ent.y + ent.height/2 }, { x: beamEndX, y: beamEndY });
              if (dist < p.radius) beamHit = true;
            } else {
              // Default downward projecting linear beam
              const beamL = ent.x + 5;
              const beamR = ent.x + ent.width - 5;
              const beamTop = ent.y + ent.height;
              const beamBottom = level.height - 40; // until bottom floor
              
              if (p.x + p.radius > beamL && p.x - p.radius < beamR && 
                  p.y + p.radius > beamTop && p.y - p.radius < beamBottom) {
                beamHit = true;
              }
            }

            if (beamHit) {
              resetAfterDeath();
            }
          }
        }
      }

      // Check Arrow direction switchers
      if (ent.type === 'arrow_up' || ent.type === 'arrow_down' || ent.type === 'arrow_left' || ent.type === 'arrow_right' || ent.type === 'rotate_cw' || ent.type === 'rotate_ccw') {
        const distSq = Math.pow(p.x - (ent.x + ent.width/2), 2) + Math.pow(p.y - (ent.y + ent.height/2), 2);
        if (distSq < Math.pow(p.radius + 18, 2)) {
          if (ent.type === 'arrow_up') setGravity('up');
          if (ent.type === 'arrow_down') setGravity('down');
          if (ent.type === 'arrow_left') setGravity('left');
          if (ent.type === 'arrow_right') setGravity('right');
          if (sphereType === 'player') {
            if (ent.type === 'rotate_cw') {
              // twist gravity clockwise
              let nextArr: GravityDirection = 'right';
              if (gravityDir.current === 'right') nextArr = 'down';
              else if (gravityDir.current === 'down') nextArr = 'left';
              else if (gravityDir.current === 'left') nextArr = 'up';
              setGravity(nextArr);
            }
            if (ent.type === 'rotate_ccw') {
              // twist gravity counterclockwise
              let nextArr: GravityDirection = 'left';
              if (gravityDir.current === 'left') nextArr = 'down';
              else if (gravityDir.current === 'down') nextArr = 'right';
              else if (gravityDir.current === 'right') nextArr = 'up';
              setGravity(nextArr);
            }
          }
        }
        return;
      }

      // Button toggles doors/gates
      if (ent.type === 'button') {
        const distSq = Math.pow(p.x - (ent.x + ent.width/2), 2) + Math.pow(p.y - (ent.y + ent.height/2), 2);
        if (distSq < Math.pow(p.radius + 15, 2)) {
          if (!ent.isActive) {
            ent.isActive = true;
            sounds.playButtonClick();

            // Toggle door with matching tag
            const pairedDoor = entitiesRef.current.find(e => e.type === 'door' && e.idTag === ent.idTag);
            if (pairedDoor) {
              pairedDoor.isActive = true; // unlocks door/gate!
              // Sparkles!
              for (let i = 0; i < 12; i++) {
                particles.current.push({
                  x: pairedDoor.x + pairedDoor.width/2,
                  y: pairedDoor.y + pairedDoor.height/2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#34d399',
                  size: 3 + Math.random() * 2,
                  alpha: 1,
                  life: 0,
                  maxLife: 25
                });
              }
            }
          }
        }
        return;
      }

      // 3. HARD COLLISION SOLID BLOCKS: Wall, Ice, Bounce pad, Timed closed Doors
      const isDoorClosed = ent.type === 'door' && !ent.isActive;
      const isSolid = ent.type === 'wall' || ent.type === 'ice' || ent.type === 'crusher' || isDoorClosed;

      if (isSolid) {
        // AABB AABB Collision Resolve between Sphere (p.x, p.y) and Rect (ent.x, ent.y, ent.width, ent.height)
        const closestX = Math.max(ent.x, Math.min(p.x, ent.x + ent.width));
        const closestY = Math.max(ent.y, Math.min(p.y, ent.y + ent.height));

        const distanceX = p.x - closestX;
        const distanceY = p.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < (p.radius * p.radius)) {
          // Collision occurred! Calculate overlap and push back
          const dist = Math.sqrt(distanceSquared);
          const overlap = p.radius - dist;

          // Check if crusher squashed player completely
          if (ent.type === 'crusher' && ent.moveDirection === 1) { // dropping down
            // If squashed on floor, user dies
            if (p.y > level.height - 60) {
              resetAfterDeath();
              return;
            }
          }

          let px = 0;
          let py = 0;

          if (dist > 0.01) {
            px = (distanceX / dist) * overlap;
            py = (distanceY / dist) * overlap;
          } else {
            // Edge edge cases
            py = -overlap;
          }

          // Push back player out of obstacle
          p.x += px;
          p.y += py;

          // Check landing ground indicators based on direction of normal force
          const absoluteAngle = Math.atan2(distanceY, distanceX); // direction towards player

          // Evaluate Ground logic relative to current gravity
          if (gravityDir.current === 'down' && py < 0) p.isGrounded = true;
          if (gravityDir.current === 'up' && py > 0) p.isGrounded = true;
          if (gravityDir.current === 'left' && px > 0) p.isGrounded = true;
          if (gravityDir.current === 'right' && px < 0) p.isGrounded = true;

          // Extra generic grounded backup
          if (Math.abs(px) > Math.abs(py)) {
            // Wall slide physics
            p.vx = 0;
            if (!p.isGrounded) p.doubleJumpAvailable = true; // reset slide flip jump
          } else {
            // normal ground collision bounce
            p.vy = 0;
            p.doubleJumpAvailable = true;
          }
        }
      }

      // Bounce pad mechanics
      if (ent.type === 'bounce') {
        const closestX = Math.max(ent.x, Math.min(p.x, ent.x + ent.width));
        const closestY = Math.max(ent.y, Math.min(p.y, ent.y + ent.height));

        const distSq = Math.pow(p.x - closestX, 2) + Math.pow(p.y - closestY, 2);
        if (distSq < p.radius * p.radius) {
          sounds.playBounce();
          
          // Propel player in direction perpendicular to pad!
          p.vy = -16.5; // Catapult jump vector sky high!
          p.doubleJumpAvailable = true;

          // spring effect particles
          for (let i = 0; i < 10; i++) {
            particles.current.push({
              x: p.x,
              y: ent.y,
              vx: (Math.random() - 0.5) * 6,
              vy: -6 - Math.random() * 5,
              color: '#10b981',
              size: 3 + Math.random() * 3,
              alpha: 1,
              life: 0,
              maxLife: 20
            });
          }
        }
      }
    };

    const distToSegment = (p: {x:number, y:number}, v: {x:number, y:number}, w: {x:number, y:number}) => {
      const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
      if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
    };

    const updateEntitiesVisuals = (dt: number) => {
      const entities = entitiesRef.current;
      entities.forEach((ent) => {
        // Animate lasers pulses based on timing
        if (ent.type === 'laser_cannon') {
          if (ent.pulseOn !== undefined && ent.pulseOff !== undefined) {
            const cycle = ent.pulseOn + ent.pulseOff;
            const marker = (levelTimer * 1000) % cycle;
            if (marker < ent.pulseOn) {
              ent.isActive = true;
            } else {
              ent.isActive = false;
            }
          } else {
            // continuously active laser
            ent.isActive = ent.isActive !== false;
          }

          // Rotating laser updates: speed up or slow down
          if (ent.angle !== undefined && ent.propertyValue) {
            ent.angle += ent.propertyValue * 0.012 * dt;
          }
        }

        // Drop sliding crusher pistons
        if (ent.type === 'crusher') {
          if (ent.pulseOn !== undefined) {
             // Delay sliding start
             if (levelTimer * 1000 < ent.pulseOn) return;
          }

          const spd = (ent.moveSpeed || 2) * dt;
          if (ent.moveDirection === 1) { // sliding down
            ent.y += spd;
            if (ent.y >= (ent.targetY || 400)) {
              ent.moveDirection = -1; // reverse to raise
              sounds.playBounce(); // thud feedback
              if (settings.screenShake) cameraShake.current = 4;
            }
          } else { // lifting up
            ent.y -= spd * 0.4; // raise slower for puzzle timing
            if (ent.y <= (ent.startY || 40)) {
              ent.moveDirection = 1;
            }
          }
        }
      });
    };

    const updateParticlesSystem = (dt: number) => {
      const pArr = particles.current;
      for (let i = pArr.length - 1; i >= 0; i--) {
        const prt = pArr[i];
        prt.x += prt.vx * dt;
        prt.y += prt.vy * dt;
        prt.life += dt;
        prt.alpha = Math.max(0, 1 - prt.life / prt.maxLife);

        if (prt.life >= prt.maxLife) {
          pArr.splice(i, 1);
        }
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [level, isPaused, victoryState, levelTimer, selectedSkin, selectedTrail]);

  // Main Canvas Rendering ticks setup
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear layout
      ctx.fillStyle = '#030712'; // Slate dark grey canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save canvas state for camera transitions and shakes
      ctx.save();

      // Screen shakes and distortions implementation
      if (settings.screenShake && cameraShake.current > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake.current;
        const shakeY = (Math.random() - 0.5) * cameraShake.current;
        ctx.translate(shakeX, shakeY);
      }

      // CAMERA ROTATION TRANSITION: rotate world camera matrix gracefully around screen center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(-currentCameraAngle.current);
      ctx.translate(-centerX, -centerY);

      // Render glowing background particle starfield
      backgroundStars.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.4})`;
        ctx.fillRect(star.x, star.y, 2, 2);
      });

      // Render handmade entities
      const entities = entitiesRef.current;
      entities.forEach((ent) => {
        drawEntity(ctx, ent);
      });

      // Render exit Goal Portal
      drawGoalPortal(ctx);

      // Draw active dynamic particles
      particles.current.forEach((prt) => {
        ctx.save();
        ctx.globalAlpha = prt.alpha;
        ctx.fillStyle = prt.color;
        
        if (settings.glowEffects && prt.glowColor) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = prt.glowColor;
        }

        ctx.beginPath();
        if (prt.shape === 'square') {
          ctx.fillRect(prt.x - prt.size/2, prt.y - prt.size/2, prt.size, prt.size);
        } else if (prt.shape === 'ring') {
          ctx.arc(prt.x, prt.y, prt.size, 0, Math.PI * 2);
          ctx.strokeStyle = prt.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (prt.shape === 'star') {
          // Sparkle star vector
          const rot = Math.PI / 2 * 3;
          let cx = prt.x;
          let cy = prt.y;
          let spikes = 5;
          let outerRadius = prt.size;
          let innerRadius = prt.size / 2;
          let rotStep = Math.PI / spikes;
          let x = cx;
          let y = cy;

          ctx.moveTo(cx, cy - outerRadius);
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot + i * rotStep * 2) * outerRadius;
            y = cy + Math.sin(rot + i * rotStep * 2) * outerRadius;
            ctx.lineTo(x, y);
            x = cx + Math.cos(rot + (i + 0.5) * rotStep * 2) * innerRadius;
            y = cy + Math.sin(rot + (i + 0.5) * rotStep * 2) * innerRadius;
            ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // Circle is default
          ctx.arc(prt.x, prt.y, prt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw secondary Clone sphere if summoned
      if (hasClone.current && cloneRef.current) {
        drawPlayerSphere(ctx, cloneRef.current, '#38bdf8', 'rgba(56, 189, 248, 0.4)', 'quantum_clone');
      }

      // Draw primary Player robot ball
      drawPlayerSphere(ctx, playerRef.current, selectedSkin.color, selectedSkin.glowColor, 'player');

      // Restore camera translations
      ctx.restore();

      // UI OVERLAYS rendered screen-space static (NOT inside camera rotation!)
      drawHUD(ctx);

      animId = requestAnimationFrame(render);
    };

    const drawEntity = (ctx: CanvasRenderingContext2D, ent: GameEntity) => {
      ctx.save();

      // Skip inactive shards visually
      if (ent.type === 'shard' && ent.isActive === false) return;
      if (ent.type === 'ai_log' && ent.isActive === false) return;

      if (settings.glowEffects) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
      }

      // Choose beautiful colors matched to core cyberpunk worlds theme
      switch (ent.type) {
        case 'wall':
          ctx.fillStyle = ent.color || '#334155'; // Dark slate grey walls
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          // Highlight neon rim border
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
          break;

        case 'ice':
          ctx.fillStyle = 'rgba(147, 197, 253, 0.65)'; // Slippery light blue ice
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
          // Shine ice lines
          ctx.beginPath();
          ctx.moveTo(ent.x + 10, ent.y + 5);
          ctx.lineTo(ent.x + ent.width - 10, ent.y + ent.height - 5);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.stroke();
          break;

        case 'bounce':
          ctx.fillStyle = '#10b981'; // Emerald Green Bounce pads
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          // Draw curved springboard on top
          ctx.beginPath();
          ctx.arc(ent.x + ent.width/2, ent.y + ent.height, ent.width/2, Math.PI, 0);
          ctx.fillStyle = '#34d399';
          ctx.fill();
          break;

        case 'laser_cannon':
          // Cannon chassis launcher
          ctx.fillStyle = '#e11d48'; // red
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);

          // Draw laser beam line if actively firing
          if (ent.isActive) {
            ctx.restore();
            ctx.save();
            // Match main rotating camera translations if applicable
            const centerX = canvasRef.current!.width / 2;
            const centerY = canvasRef.current!.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(-currentCameraAngle.current);
            ctx.translate(-centerX, -centerY);

            ctx.beginPath();
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3.5;
            if (settings.glowEffects) {
              ctx.shadowBlur = 15;
              ctx.shadowColor = '#f43f5e';
            }

            if (ent.angle !== undefined) {
              // rotating beam line
              const bx = ent.x + ent.width / 2;
              const by = ent.y + ent.height / 2;
              ctx.moveTo(bx, by);
              ctx.lineTo(bx + Math.cos(ent.angle) * 900, by + Math.sin(ent.angle) * 900);
            } else {
              // default vertical beam line
              ctx.moveTo(ent.x + ent.width / 2, ent.y + ent.height);
              ctx.lineTo(ent.x + ent.width / 2, level.height - 40);
            }
            ctx.stroke();
          }
          break;

        case 'crusher':
          // dangerous drop mechanics
          ctx.fillStyle = '#d97706'; // amber hazards colors
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          // Highlight industrial hazard lines overlay
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);

          // Render hazard stripe lines on top of crusher
          ctx.beginPath();
          for (let dy = 0; dy < ent.height; dy += 30) {
            ctx.moveTo(ent.x, ent.y + dy);
            ctx.lineTo(ent.x + ent.width, ent.y + dy + 15);
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.stroke();
          break;

        case 'slow_zone':
          // Render glowing bubble circles
          ctx.fillStyle = ent.color || 'rgba(124, 58, 237, 0.1)';
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
          ctx.setLineDash([]); // Reset
          break;

        case 'portal':
          // Render awesome spatial warp spirals
          const fill = ent.color || '#ff7700';
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.ellipse(ent.x + ent.width/2, ent.y + ent.height/2, ent.width/2, ent.height/2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Outer neon pulse ring
          if (settings.glowEffects) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = fill;
          }
          ctx.beginPath();
          ctx.ellipse(ent.x + ent.width/2, ent.y + ent.height/2, ent.width/2 + 4, ent.height/2 + 4, 0, 0, Math.PI * 2);
          ctx.strokeStyle = fill;
          ctx.stroke();
          break;

        case 'button':
          // Mechanical panel
          ctx.fillStyle = ent.isActive ? '#10b981' : '#ef4444'; // Green if on, red if off
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
          break;

        case 'door':
          // Gate barriers blocking paths
          if (!ent.isActive) {
            // Closed (dangerous red solid barrier block)
            ctx.fillStyle = ent.color || '#dc2626';
            ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
          }
          break;

        case 'shard':
          // Beautiful spinning neon diamonds
          const spinAngle = (levelTimer * 4.5);
          ctx.translate(ent.x + ent.width/2, ent.y + ent.height/2);
          ctx.rotate(spinAngle);
          
          ctx.fillStyle = '#ffd700'; // GOLD
          if (settings.glowEffects) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
          }
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-8, 0);
          ctx.closePath();
          ctx.fill();
          break;

        case 'ai_log':
          // Floating green server disk matrix look
          const floatOffset = Math.sin(levelTimer * 3) * 6;
          ctx.translate(ent.x, ent.y + floatOffset);
          ctx.fillStyle = '#10b981'; // Green Matrix lore
          if (settings.glowEffects) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#34d399';
          }
          ctx.fillRect(-10, -10, 20, 20);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-10, -10, 20, 20);
          // floppy drive disk highlight lines
          ctx.fillStyle = '#065f46';
          ctx.fillRect(-6, 2, 12, 6);
          break;

        case 'clone_trigger':
          // Swirling blue portal node
          const swirlAngle = levelTimer * 5;
          ctx.translate(ent.x + ent.width/2, ent.y + ent.height/2);
          ctx.rotate(swirlAngle);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Inner core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    const drawGoalPortal = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      const gx = level.goalX;
      const gy = level.goalY;

      // Glow pulse loop
      const scale = 1 + Math.sin(levelTimer * 3.5) * 0.12;
      
      ctx.translate(gx, gy);
      if (settings.glowEffects) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      }

      // Draw futuristic metallic platform base rings
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-35, 20, 70, 12);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, 20, 70, 12);

      // Rotating portal core bubble
      ctx.beginPath();
      ctx.arc(0, -5, 20 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      // Inside vortex details
      ctx.beginPath();
      ctx.arc(0, -5, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      ctx.restore();
    };

    const drawPlayerSphere = (
      ctx: CanvasRenderingContext2D,
      p: PlayerState,
      color: string,
      glowColor: string,
      type: 'player' | 'quantum_clone'
    ) => {
      ctx.save();
      
      // Outer glow styling
      if (settings.glowEffects) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = glowColor;
      }

      // Main core ball structure
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Outer rim circle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Robot eye / indicator line that matches angle rotation beautifully
      ctx.fillStyle = '#0f172a'; // dark dark pupillary frame
      ctx.beginPath();
      ctx.rect(-10, -4, 20, 8);
      ctx.fill();

      // Glowing lens pupillary iris
      ctx.fillStyle = type === 'player' ? selectedSkin.color : '#38bdf8';
      ctx.beginPath();
      ctx.arc(3, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Visual helper indicator if player is under magnetic sticking
      if (p.isMagneticSticking) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawHUD = (ctx: CanvasRenderingContext2D) => {
      // Draw static heads up display in screen coordinates (Top border corner blocks)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(40, 48, 1120, 45);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(40, 48, 1120, 45);

      // 1. Core Levels details info
      ctx.font = 'bold 13px Courier New, monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`${level.name}`, 60, 75);

      // World location name
      ctx.font = '11px Courier New, monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`ZONE: ${level.worldName.toUpperCase()}`, 60, 61);

      // 2. Clock timer representation
      ctx.font = 'bold 15px Courier New, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`TIME: ${levelTimer.toFixed(1)}s`, 420, 75);

      // 3. Shards collect stats count text
      ctx.font = 'bold 15px Courier New, monospace';
      ctx.fillStyle = '#ffd700';
      const totalLevelShards = level.entities.filter(e => e.type === 'shard').length;
      ctx.fillText(`SHARDS: ${shardsCollected} / ${totalLevelShards}`, 650, 75);

      // 4. Energy Bar for Gravity Resistance
      const p = playerRef.current;
      const energyWidth = 140;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fillRect(920, 63, energyWidth, 10);
      
      const chargeRatio = p.gravityResistanceEnergy / 100;
      ctx.fillStyle = chargeRatio > 0.3 ? '#a855f7' : '#ef4444'; // Purple if secure, red alerts
      ctx.fillRect(920, 63, energyWidth * chargeRatio, 10);

      ctx.font = '9px Courier New, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`GRAV-REST ENERGETICS`, 920, 57);

      // Pause Hint label corner bottom right
      ctx.font = '11px Courier New, monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(`[ESC / P] FOR SETTINGS  •  [SHIFT] DASH  •  [CTRL / C] MAGNET`, 420, 785);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [level, selectedSkin, selectedTrail, levelTimer, shardsCollected, settings]);

  const toggleSoundMute = () => {
    sounds.playButtonClick();
    if (sfxMuted) {
      sounds.setVolume(settings.volumeSfx);
    } else {
      sounds.setVolume(0);
    }
    setSfxMuted(!sfxMuted);
  };

  // Onscreen layout d-pad controllers for direct touch layouts on mobile
  const handleTouchDpad = (dirKey: string, isDown: boolean) => {
    keysPressed.current[dirKey] = isDown;
  };

  const handleTouchDash = () => {
    triggerDash();
  };

  const handleTouchJump = () => {
    keysPressed.current['Space'] = true;
    setTimeout(() => {
      keysPressed.current['Space'] = false;
    }, 100);
  };

  const activeLevelShardsTotal = level.entities.filter((e) => e.type === 'shard').length;

  return (
    <div id="game_arena_canvas_wrapper" className="relative flex flex-col items-center justify-center p-2 select-none w-full max-w-7xl">
      {/* HUD Header details for Game stats */}
      <div id="hud_header_buttons" className="w-full flex items-center justify-between border border-cyan-500/10 bg-gray-950/60 p-3 rounded-lg mb-2 text-cyan-400 font-mono text-xs">
        <div className="flex items-center gap-4">
          <button
            id="btn_exit_to_selector"
            onClick={onExit}
            className="px-3 py-1.5 rounded border border-cyan-500/30 hover:bg-cyan-500/25 font-bold transition text-cyan-300"
          >
            ← Exit Chamber
          </button>
          <span>MODE: <b className="text-cyan-100 uppercase">{mode}</b></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-red-400 font-bold">DEATH LOGS: {deathCount}</span>
          <button
            id="btn_respawn_manual"
            onClick={resetAfterDeath}
            className="flex items-center gap-1 bg-red-950/40 text-red-300 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-950/65"
            title="Instant Respawn"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Manual Reset
          </button>
          
          <button
            id="btn_mute_toggle"
            onClick={toggleSoundMute}
            className="p-1 px-2 border border-cyan-500/20 rounded hover:bg-cyan-500/10 text-cyan-300"
          >
            {sfxMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Box viewport */}
      <div id="canvas_viewport_frame" className="relative border-2 border-cyan-500/40 shadow-2xl rounded-xl overflow-hidden bg-gray-950 w-full aspect-[3/2]">
        <canvas
          id="gravity_shift_game_canvas"
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full h-auto block"
        />

        {/* Dynamic pause modal overlay state */}
        {isPaused && (
          <div id="pause_overlay" className="absolute inset-0 bg-black/75 z-40 flex items-center justify-center font-mono text-cyan-300 backdrop-blur-sm">
            <div id="pause_dialog_frame" className="border border-cyan-500 bg-gray-900/90 p-8 rounded-lg max-w-sm text-center shadow-2xl">
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">Systems Paused</h3>
              <p className="text-xs text-gray-400 mb-6">GS-10 AI stabilization module standby...</p>
              
              <div className="flex flex-col gap-3">
                <button
                  id="btn_resume_stay"
                  onClick={() => setIsPaused(false)}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold rounded hover:brightness-110 active:scale-95 transition"
                >
                  Confirm Resume
                </button>
                <button
                  id="btn_manual_restart_level"
                  onClick={() => {
                    setIsPaused(false);
                    resetAfterDeath();
                  }}
                  className="w-full py-2 border border-cyan-500/40 hover:bg-cyan-500/10 rounded"
                >
                  Restart Chamber
                </button>
                <button
                  id="btn_abort_chamber"
                  onClick={onExit}
                  className="w-full py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded text-xs"
                >
                  Abort Escape
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Touch Controls mobile emulator triggers (Active on smartphone viewport) */}
      <div id="mobile_touch_controller_bar" className="w-full grid grid-cols-2 mt-4 md:hidden gap-6 bg-gray-950/80 p-4 border border-cyan-500/20 rounded-xl">
        {/* Directional Pad */}
        <div id="touch_dpad" className="flex items-center justify-center gap-2">
          <button
            id="touch_left_trigger"
            onTouchStart={() => handleTouchDpad('KeyA', true)}
            onTouchEnd={() => handleTouchDpad('KeyA', false)}
            className="w-14 h-14 bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-500/30 active:scale-90 text-cyan-300 flex items-center justify-center rounded-lg"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex flex-col gap-2">
            <button
              id="touch_up_trigger"
              onTouchStart={() => handleTouchDpad('KeyW', true)}
              onTouchEnd={() => handleTouchDpad('KeyW', false)}
              className="w-14 h-14 bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-500/30 active:scale-90 text-cyan-300 flex items-center justify-center rounded-lg"
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <button
              id="touch_down_trigger"
              onTouchStart={() => handleTouchDpad('KeyS', true)}
              onTouchEnd={() => handleTouchDpad('KeyS', false)}
              className="w-14 h-14 bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-500/30 active:scale-90 text-cyan-300 flex items-center justify-center rounded-lg"
            >
              <ArrowDown className="h-6 w-6" />
            </button>
          </div>

          <button
            id="touch_right_trigger"
            onTouchStart={() => handleTouchDpad('KeyD', true)}
            onTouchEnd={() => handleTouchDpad('KeyD', false)}
            className="w-14 h-14 bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-500/30 active:scale-90 text-cyan-300 flex items-center justify-center rounded-lg"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Action jump, dash triggers */}
        <div id="touch_action_buttons" className="flex flex-col gap-3 items-center justify-center">
          <div className="flex gap-3">
            <button
              id="touch_dash_trigger"
              onTouchStart={handleTouchDash}
              className="w-16 h-12 bg-purple-950/40 border border-purple-500/30 active:scale-90 text-purple-300 flex items-center justify-center rounded-lg text-xs font-bold"
            >
              DASH
            </button>
            <button
              id="touch_mag_trigger"
              onTouchStart={() => handleTouchDpad('KeyC', true)}
              onTouchEnd={() => handleTouchDpad('KeyC', false)}
              className="w-16 h-12 bg-blue-950/40 border border-blue-500/30 active:scale-90 text-blue-300 flex items-center justify-center rounded-lg"
            >
              <Magnet className="h-4 w-4" />
            </button>
          </div>
          <button
            id="touch_jump_trigger"
            onTouchStart={handleTouchJump}
            className="w-32 h-14 bg-cyan-500/20 border border-cyan-500 text-cyan-300 active:scale-90 flex items-center justify-center rounded-lg text-sm font-bold tracking-widest"
          >
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
}
