/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameLevel, GameEntity, EntityType } from '../types';

// Helper to create basic border walls for standard rooms (1200 x 800)
function createBorderWalls(): GameEntity[] {
  return [
    // Bottom wall
    { id: 'border_bottom', type: 'wall', x: 0, y: 760, width: 1200, height: 40, isStatic: true, color: '#111827' },
    // Top wall
    { id: 'border_top', type: 'wall', x: 0, y: 0, width: 1200, height: 40, isStatic: true, color: '#111827' },
    // Left wall
    { id: 'border_left', type: 'wall', x: 0, y: 40, width: 40, height: 720, isStatic: true, color: '#111827' },
    // Right wall
    { id: 'border_right', type: 'wall', x: 1160, y: 40, width: 40, height: 720, isStatic: true, color: '#111827' },
  ];
}

export const HANDCRAFTED_LEVELS: GameLevel[] = [
  // ================= WORLD 1 — TRAINING FACILITY =================
  {
    id: 'w1_l1',
    name: '1. Gravity Orientation',
    world: 1,
    worldName: 'Training Facility',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1080,
    goalY: 700,
    narrativeText: [
      'SYSTEM LOG #01: Chronos Facility online.',
      'Alert: Core stabilizer failure detected. Gravity fields fluctuating.',
      'Core AI Instruction: Roll with A/D or Arrow keys. Jump with W or Space.',
      'Collect Glowing Quantum Shards to unlock upgrades in the database!'
    ],
    difficulty: 'Training',
    entities: [
      ...createBorderWalls(),
      // Platforms
      { id: 'p1', type: 'wall', x: 300, y: 620, width: 180, height: 140, isStatic: true, color: '#4b5563' },
      { id: 'p2', type: 'wall', x: 550, y: 520, width: 180, height: 240, isStatic: true, color: '#4b5563' },
      { id: 'p3', type: 'wall', x: 800, y: 620, width: 180, height: 140, isStatic: true, color: '#4b5563' },
      // Shards
      { id: 's1', type: 'shard', x: 390, y: 550, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 640, y: 450, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 890, y: 550, width: 20, height: 20, isStatic: true },
      // AI Log
      { id: 'log1', type: 'ai_log', x: 640, y: 320, width: 25, height: 25, isStatic: true, idTag: 'first_log' }
    ]
  },
  {
    id: 'w1_l2',
    name: '2. The Ceiling Floor',
    world: 1,
    worldName: 'Training Facility',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1050,
    goalY: 100, // High up, on the ceiling platform
    narrativeText: [
      'LOG #02: Ambient Shift Module activated.',
      'Gravity arrow blocks force a reversal of the grav-vector.',
      'When upside down, controls adapt: JUMP pulls you downward back to ceiling!',
      'Press UP on Arrow symbols to trigger gravity flip manually.'
    ],
    difficulty: 'Easy',
    entities: [
      ...createBorderWalls(),
      // Big dividing wall in the middle
      { id: 'mid_wall', type: 'wall', x: 400, y: 220, width: 80, height: 540, isStatic: true },
      // Platform on top right
      { id: 'top_platform', type: 'wall', x: 850, y: 150, width: 310, height: 40, isStatic: true },
      // Gravity arrow blocks on bottom-left, triggers UP gravity when touched
      { id: 'grav_trigger_up', type: 'arrow_up', x: 300, y: 700, width: 45, height: 45, isStatic: true },
      // Gravity arrow blocks on top-right, triggers DOWN gravity
      { id: 'grav_trigger_down', type: 'arrow_down', x: 750, y: 100, width: 45, height: 45, isStatic: true },
      // Shards on the ceiling
      { id: 's1', type: 'shard', x: 500, y: 100, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 650, y: 100, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 920, y: 100, width: 20, height: 20, isStatic: true },
      // AI Log
      { id: 'log2', type: 'ai_log', x: 600, y: 150, width: 25, height: 25, isStatic: true, idTag: 'ceiling_log' }
    ]
  },
  {
    id: 'w1_l3',
    name: '3. Momentum Wall Leap',
    world: 1,
    worldName: 'Training Facility',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 700,
    narrativeText: [
      'LOG #03: Advanced Kinetic vectors.',
      'You can stick to walls and perform continuous Wall Jumps!',
      'Press JUMP while sliding against vertical walls to climb high-velocity shafts.'
    ],
    difficulty: 'Easy',
    entities: [
      ...createBorderWalls(),
      // Middle vertical columns creating a split shaft
      { id: 'col1', type: 'wall', x: 450, y: 300, width: 60, height: 460, isStatic: true },
      { id: 'col2', type: 'wall', x: 650, y: 40, width: 60, height: 460, isStatic: true },
      // Bounce pad on top of col1
      { id: 'bounce1', type: 'bounce', x: 450, y: 260, width: 60, height: 40, isStatic: true },
      // Arrow triggers
      { id: 'arrow_right', type: 'arrow_right', x: 250, y: 700, width: 45, height: 45, isStatic: true },
      { id: 'arrow_left', type: 'arrow_left', x: 800, y: 200, width: 45, height: 45, isStatic: true },
      // Shards
      { id: 'shard1', type: 'shard', x: 550, y: 400, width: 20, height: 20, isStatic: true },
      { id: 'shard2', type: 'shard', x: 550, y: 250, width: 20, height: 20, isStatic: true },
      { id: 'shard3', type: 'shard', x: 1000, y: 650, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w1_l4',
    name: '4. Kinetic Dashing',
    world: 1,
    worldName: 'Training Facility',
    width: 1200,
    height: 800,
    startX: 100,
    startY: 700,
    goalX: 1100,
    goalY: 700,
    narrativeText: [
      'LOG #04: Dash Booster initialized.',
      'Press SHIFT or Double Tap a direction to dash forward!',
      'Dashing resets when you touch any grounded surface or flip gravity.',
      'Evasion is critical: slide through narrow gaps rapidly.'
    ],
    difficulty: 'Medium',
    entities: [
      ...createBorderWalls(),
      // Narrow passages requiring dash
      { id: 'block_high', type: 'wall', x: 400, y: 40, width: 100, height: 600, isStatic: true },
      { id: 'block_low', type: 'wall', x: 750, y: 200, width: 100, height: 560, isStatic: true },
      // Hazard - moving laser (we will make lasers active in canvas loop)
      { id: 'laser1', type: 'laser_cannon', x: 600, y: 40, width: 40, height: 40, isStatic: true, propertyValue: 0, pulseOn: 1500, pulseOff: 1500 },
      // Shards
      { id: 's1', type: 'shard', x: 450, y: 690, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 600, y: 450, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 800, y: 100, width: 20, height: 20, isStatic: true },
    ]
  },

  // ================= WORLD 2 — MAGNETIC CORE =================
  {
    id: 'w2_l1',
    name: '5. Sticky Magnetics',
    world: 2,
    worldName: 'Magnetic Core',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 150,
    narrativeText: [
      'LOG #05: Electromagnetic Core reached.',
      'Skins with magnetic iron shells cling directly to metal frames.',
      'Double tap JUMP or hold down MAGNET-MODE [Ctrl / C] to activate gravity grip.'
    ],
    difficulty: 'Medium',
    entities: [
      ...createBorderWalls(),
      // Magnetic vertical wall
      { id: 'mag_wall', type: 'wall', x: 500, y: 150, width: 60, height: 500, isStatic: true, color: '#312e81' }, // Deep indigo indicating magnetism
      { id: 'mag_trigger', type: 'rotate_cw', x: 250, y: 700, width: 45, height: 45, isStatic: true },
      // Moving platform blocking top-right goal
      { id: 'mov_p', type: 'door', x: 950, y: 40, width: 40, height: 300, isStatic: true, color: '#991b1b', idTag: 'b1' },
      // Button on magnetic wall
      { id: 'btn_mag', type: 'button', x: 470, y: 350, width: 30, height: 40, isStatic: true, idTag: 'b1' },
      // Shards
      { id: 's1', type: 'shard', x: 470, y: 250, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 570, y: 250, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 800, y: 600, width: 20, height: 20, isStatic: true },
      // Lore log
      { id: 'log3', type: 'ai_log', x: 800, y: 350, width: 25, height: 25, isStatic: true, idTag: 'magnetic_log' }
    ]
  },
  {
    id: 'w2_l2',
    name: '6. The Rotating Turbine',
    world: 2,
    worldName: 'Magnetic Core',
    width: 1200,
    height: 800,
    startX: 150,
    startY: 700,
    goalX: 1050,
    goalY: 700,
    narrativeText: [
      'LOG #06: Gravity Torque Induction.',
      'Arrow triggers with rotation symbols (↺, ↻) twist the world camera!',
      'Prepare for disorientation. Up becomes left, floor becomes wall.'
    ],
    difficulty: 'Medium',
    entities: [
      ...createBorderWalls(),
      // Rotating world arrows
      { id: 'rot_ccw_trig', type: 'rotate_ccw', x: 300, y: 700, width: 45, height: 45, isStatic: true },
      { id: 'rot_cw_trig', type: 'rotate_cw', x: 600, y: 200, width: 45, height: 45, isStatic: true },
      // Inner walls
      { id: 'in_wall1', type: 'wall', x: 450, y: 400, width: 300, height: 50, isStatic: true },
      { id: 'in_wall2', type: 'wall', x: 800, y: 200, width: 50, height: 400, isStatic: true },
      // Shards (floating)
      { id: 's1', type: 'shard', x: 600, y: 350, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 850, y: 150, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1000, y: 400, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w2_l3',
    name: '7. Laser Reactor Grid',
    world: 2,
    worldName: 'Magnetic Core',
    width: 1200,
    height: 800,
    startX: 100,
    startY: 700,
    goalX: 1100,
    goalY: 200,
    narrativeText: [
      'LOG #07: Laser Containment systems fail.',
      'Deadly orange light beams vaporize quantum structures instantly.',
      'Deactivate them with buttons or time your leaps around pulses.'
    ],
    difficulty: 'Hard',
    entities: [
      ...createBorderWalls(),
      // Obstacle walls
      { id: 'ov1', type: 'wall', x: 250, y: 450, width: 60, height: 310, isStatic: true },
      { id: 'ov2', type: 'wall', x: 550, y: 40, width: 60, height: 500, isStatic: true },
      { id: 'ov3', type: 'wall', x: 850, y: 350, width: 60, height: 410, isStatic: true },
      // Timed Laser emitter: triggers beam downward
      { id: 'las1', type: 'laser_cannon', x: 400, y: 40, width: 50, height: 40, isStatic: true, propertyValue: 0 },
      // Rotating laser emitter: rotates continuously
      { id: 'las2', type: 'laser_cannon', x: 700, y: 300, width: 50, height: 50, isStatic: true, propertyValue: 1.5, angle: 0 }, // angle incremented in physics loop
      // Button to toggle las1 off permanently
      { id: 'btn_las', type: 'button', x: 150, y: 400, width: 40, height: 20, isStatic: true, idTag: 'las1' },
      // Shards
      { id: 's1', type: 'shard', x: 425, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 700, y: 150, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1000, y: 650, width: 20, height: 20, isStatic: true },
    ]
  },

  // ================= WORLD 3 — FROZEN REACTOR =================
  {
    id: 'w3_l1',
    name: '8. Thermal Friction Zero',
    world: 3,
    worldName: 'Frozen Reactor',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 700,
    narrativeText: [
      'LOG #08: Superconducting Liquid Helium leaks.',
      'Slippery blue-tinted ICE panels have near-zero friction!',
      'Gain high sliding speed, but watch your brakes near pits.'
    ],
    difficulty: 'Medium',
    entities: [
      ...createBorderWalls(),
      // Long ice segment in center bottom
      { id: 'ice_floor1', type: 'ice', x: 300, y: 720, width: 600, height: 40, isStatic: true, color: '#93c5fd' },
      // Pit behind ice
      { id: 'pit_cover', type: 'wall', x: 900, y: 740, width: 100, height: 20, isStatic: true, color: '#ef4444' }, // dangerous pit
      // Platforms
      { id: 'p1', type: 'wall', x: 200, y: 550, width: 150, height: 40, isStatic: true },
      { id: 'p2', type: 'wall', x: 950, y: 550, width: 150, height: 40, isStatic: true },
      // Bounce pad
      { id: 'ice_bp', type: 'bounce', x: 550, y: 680, width: 60, height: 40, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 350, y: 450, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 580, y: 350, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 800, y: 450, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w3_l2',
    name: '9. Crush Cylinder Engine',
    world: 3,
    worldName: 'Frozen Reactor',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 200,
    narrativeText: [
      'LOG #09: Piston pressure limits exceeded.',
      'Spike crushers drop down rapidly, vaporizing anything they squash.',
      'Slide underneath them while they lift back up!'
    ],
    difficulty: 'Hard',
    entities: [
      ...createBorderWalls(),
      // Crusher pistons
      { id: 'crush1', type: 'crusher', x: 400, y: 40, width: 80, height: 350, isStatic: false, startY: 40, targetY: 450, moveSpeed: 4, propertyValue: 1, moveDirection: 1 },
      { id: 'crush2', type: 'crusher', x: 650, y: 40, width: 80, height: 350, isStatic: false, startY: 40, targetY: 450, moveSpeed: 6, propertyValue: 1, moveDirection: 1, pulseOn: 1000 },
      // Intermediate safe platform
      { id: 'safe_mid', type: 'wall', x: 520, y: 600, width: 100, height: 160, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 440, y: 650, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 690, y: 650, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 950, y: 450, width: 20, height: 20, isStatic: true },
      // Lore log
      { id: 'log4', type: 'ai_log', x: 570, y: 520, width: 25, height: 25, isStatic: true, idTag: 'crush_log' }
    ]
  },
  {
    id: 'w3_l3',
    name: '10. Frozen Reactor Escape',
    world: 3,
    worldName: 'Frozen Reactor',
    width: 1200,
    height: 800,
    startX: 100,
    startY: 700,
    goalX: 1100,
    goalY: 200,
    narrativeText: [
      'LOG #10: Reactor Core breached.',
      'Evacuate immediately! Combine sliding momentum, bounce pads, and flipping gravity.'
    ],
    difficulty: 'Hard',
    entities: [
      ...createBorderWalls(),
      // Platforms and sliding ice
      { id: 'ice1', type: 'ice', x: 300, y: 600, width: 200, height: 40, isStatic: true, color: '#93c5fd' },
      { id: 'ice2', type: 'ice', x: 700, y: 450, width: 200, height: 40, isStatic: true, color: '#93c5fd' },
      // Hazard lasers
      { id: 'lc1', type: 'laser_cannon', x: 550, y: 40, width: 40, height: 40, isStatic: true, pulseOn: 1200, pulseOff: 1200 },
      // Vertical ice walls
      { id: 'vii', type: 'ice', x: 950, y: 200, width: 40, height: 400, isStatic: true, color: '#93c5fd' },
      // Jump spring
      { id: 'bp2', type: 'bounce', x: 400, y: 720, width: 60, height: 40, isStatic: true },
      { id: 'gr_u', type: 'arrow_up', x: 800, y: 700, width: 45, height: 45, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 350, y: 550, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 750, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1050, y: 500, width: 20, height: 20, isStatic: true },
    ]
  },

  // ================= WORLD 4 — TIME COLLAPSE =================
  {
    id: 'w4_l1',
    name: '11. Slow-Dilation Void',
    world: 4,
    worldName: 'Time Collapse',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 150,
    narrativeText: [
      'LOG #11: Quantum Singularity Event. Chrono-bubbles detected.',
      'Glow rings indicate temporal expansion zones.',
      'Inside them, speed is reduced to 0.3x, granting precision to dodge high-speed lasers!'
    ],
    difficulty: 'Medium',
    entities: [
      ...createBorderWalls(),
      // Temporal bubble zone (slow zone)
      { id: 'chrono_bubble', type: 'slow_zone', x: 450, y: 200, width: 300, height: 400, isStatic: true, color: 'rgba(107, 33, 168, 0.15)' }, // Purple glowing zone
      // Rapid projectile / laser hazard slicing the bubble
      { id: 'las_speedy', type: 'laser_cannon', x: 600, y: 40, width: 40, height: 40, isStatic: true, pulseOn: 500, pulseOff: 500 }, // pulses incredibly fast
      // High floating platforms
      { id: 'fp1', type: 'wall', x: 250, y: 500, width: 100, height: 40, isStatic: true },
      { id: 'fp2', type: 'wall', x: 850, y: 350, width: 150, height: 40, isStatic: true },
      // Gravity arrow
      { id: 'g_right', type: 'arrow_right', x: 120, y: 550, width: 45, height: 45, isStatic: true },
      { id: 'g_down', type: 'arrow_down', x: 900, y: 250, width: 45, height: 45, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 600, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 600, y: 300, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 920, y: 300, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w4_l2',
    name: '12. Gravity Storm Surge',
    world: 4,
    worldName: 'Time Collapse',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 700,
    narrativeText: [
      'LOG #12: Storm surge protocols active.',
      'Multiple gravity toggles line this tunnel. Plan your kinetic trajectories in mid-air!'
    ],
    difficulty: 'Hard',
    entities: [
      ...createBorderWalls(),
      { id: 'obs1', type: 'wall', x: 300, y: 300, width: 80, height: 460, isStatic: true },
      { id: 'obs2', type: 'wall', x: 600, y: 40, width: 80, height: 460, isStatic: true },
      { id: 'obs3', type: 'wall', x: 900, y: 300, width: 80, height: 460, isStatic: true },
      // Flip gravity triggers in channels
      { id: 'f1', type: 'arrow_up', x: 220, y: 700, width: 45, height: 45, isStatic: true },
      { id: 'f2', type: 'arrow_down', x: 450, y: 100, width: 45, height: 45, isStatic: true },
      { id: 'f3', type: 'arrow_up', x: 500, y: 700, width: 45, height: 45, isStatic: true },
      { id: 'f4', type: 'arrow_down', x: 750, y: 100, width: 45, height: 45, isStatic: true },
      // Double jump shards
      { id: 's1', type: 'shard', x: 450, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 750, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1000, y: 300, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w4_l3',
    name: '13. Chrono Timing Synchronizer',
    world: 4,
    worldName: 'Time Collapse',
    width: 1200,
    height: 800,
    startX: 100,
    startY: 700,
    goalX: 1100,
    goalY: 200,
    narrativeText: [
      'LOG #13: Paradox stabilizer code: Synchronized action.',
      'Activate all pressure switches within 5 seconds to bypass the chronological gate!'
    ],
    difficulty: 'Hard',
    entities: [
      ...createBorderWalls(),
      // Barrier Blocking goal
      { id: 'gate_exit', type: 'door', x: 1000, y: 40, width: 40, height: 400, isStatic: true, color: '#f59e0b', idTag: 'gate_lock' },
      // Heavy dividing platform structures
      { id: 'st1', type: 'wall', x: 300, y: 400, width: 500, height: 60, isStatic: true },
      // Two buttons that must both be on to unlock
      { id: 'b_top', type: 'button', x: 500, y: 360, width: 40, height: 40, isStatic: true, idTag: 'gate_lock' },
      { id: 'b_bot', type: 'button', x: 500, y: 720, width: 40, height: 40, isStatic: true, idTag: 'gate_lock' },
      // Bounce pad
      { id: 'bp_t', type: 'bounce', x: 200, y: 720, width: 60, height: 40, isStatic: true },
      // Gravity arrow blocks
      { id: 'arr_u', type: 'arrow_up', x: 850, y: 700, width: 45, height: 45, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 400, y: 250, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 600, y: 250, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1050, y: 650, width: 20, height: 20, isStatic: true },
      // Lore log
      { id: 'log5', type: 'ai_log', x: 1050, y: 550, width: 25, height: 25, isStatic: true, idTag: 'chrono_log' }
    ]
  },

  // ================= WORLD 5 — QUANTUM DIMENSION =================
  {
    id: 'w5_l1',
    name: '14. Duo Paradox Clone',
    world: 5,
    worldName: 'Quantum Dimension',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 700,
    narrativeText: [
      'LOG #14: Entanglement threshold exceeded.',
      'Touch the glowing turquoise Quantum Node to summon your GRAVITY CLONE!',
      'The clone replicates mirror physics. Work in tandem to depress separate plates!'
    ],
    isCloneLevel: true, // Tells game code to generate clone when trigger is touched
    difficulty: 'Quantum',
    entities: [
      ...createBorderWalls(),
      // Split layout (two identical corridors separated by central barrier)
      { id: 'split_b', type: 'wall', x: 40, y: 400, width: 1120, height: 40, isStatic: true, color: '#312e81' },
      // Clone Spawner node
      { id: 'clone_trigger', type: 'clone_trigger', x: 250, y: 700, width: 40, height: 40, isStatic: true },
      // Button on top wall Corridor
      { id: 'b_top_ch', type: 'button', x: 600, y: 360, width: 40, height: 40, isStatic: true, idTag: 'clone_door' },
      // Button on bottom wall Corridor
      { id: 'b_bot_ch', type: 'button', x: 600, y: 720, width: 40, height: 40, isStatic: true, idTag: 'clone_door' },
      // Door blocking the path in both chambers
      { id: 'door_top', type: 'door', x: 800, y: 40, width: 40, height: 360, isStatic: true, color: '#3b82f6', idTag: 'clone_door' },
      { id: 'door_bot', type: 'door', x: 800, y: 440, width: 40, height: 320, isStatic: true, color: '#3b82f6', idTag: 'clone_door' },
      // Shards
      { id: 's1', type: 'shard', x: 450, y: 650, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 450, y: 250, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1000, y: 550, width: 20, height: 20, isStatic: true },
    ]
  },
  {
    id: 'w5_l2',
    name: '15. Quantum Portal Fold',
    world: 5,
    worldName: 'Quantum Dimension',
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1100,
    goalY: 150,
    narrativeText: [
      'LOG #15: Spatial portals activated. Teleportation online.',
      'Pass through Portal A (Orange) to instantly arrive at Portal B (Cyan).',
      'Portals preserve your kinetic momentum perfectly!'
    ],
    difficulty: 'Quantum',
    entities: [
      ...createBorderWalls(),
      // Divider walls creating unreachable blocks
      { id: 'bl_left', type: 'wall', x: 400, y: 500, width: 400, height: 260, isStatic: true },
      { id: 'bl_right', type: 'wall', x: 400, y: 40, width: 400, height: 260, isStatic: true },
      // Portals
      { id: 'portalA', type: 'portal', x: 250, y: 550, width: 50, height: 80, isStatic: true, idTag: 'p1_link', color: '#ff7700' }, // Orange Portal
      { id: 'portalB', type: 'portal', x: 950, y: 550, width: 50, height: 80, isStatic: true, idTag: 'p1_link', color: '#00ccff' }, // Blue Portal
      // Another secondary pair for vertical ceiling traversal
      { id: 'portalC', type: 'portal', x: 950, y: 150, width: 50, height: 80, isStatic: true, idTag: 'p2_link', color: '#a855f7' }, // Purple Portal
      { id: 'portalD', type: 'portal', x: 250, y: 150, width: 50, height: 80, isStatic: true, idTag: 'p2_link', color: '#eab308' }, // Yellow Portal
      // Bounce pad underneath C
      { id: 'bp_p', type: 'bounce', x: 940, y: 720, width: 70, height: 40, isStatic: true },
      // Shards
      { id: 's1', type: 'shard', x: 600, y: 400, width: 20, height: 20, isStatic: true },
      { id: 's2', type: 'shard', x: 300, y: 150, width: 20, height: 20, isStatic: true },
      { id: 's3', type: 'shard', x: 1050, y: 150, width: 20, height: 20, isStatic: true },
      // Final Lore log
      { id: 'log6', type: 'ai_log', x: 600, y: 340, width: 25, height: 25, isStatic: true, idTag: 'quantum_final_log' }
    ]
  }
];

export const STORIES: { [key: string]: string[] } = {
  first_log: [
    'SUBJECT: PROJECT ANOMALY — LOG #01',
    'TIME: ERROR // SHIFT_DETECTED',
    '',
    'If anyone receives this signal—the stabilizer broke. We were testing high-velocity gravity pulses inside Sector 1. The main frame rotated 90 degrees in a fraction of a millisecond. Everything loose simply slid into the plasma vents.',
    'I managed to dispatch a remote AI unit, model "GS-10", to bypass the physical interlocks. If you are reading this, the GS-10 unit is rolling successfully. Proceed to the Core Elevator.'
  ],
  ceiling_log: [
    'SUBJECT: CEILING CONDUITS — LOG #02',
    'TIME: 2.1 HOURS POST-RUPTURE',
    '',
    'The gravitational pull has inverted in the upper conduit. It seems the gravity generator is projecting negative mass metrics onto the roofing panels.',
    'Be careful: stepping on an upward Arrow vector completely switches your visual horizontal alignment. We found that the GS-10 model can adapt perfectly to upside-down maneuvering. Stay focused.'
  ],
  magnetic_log: [
    'SUBJECT: ELECTROMAGNETIC ENVELOPE — LOG #03',
    'TIME: 4.8 HOURS POST-RUPTURE',
    '',
    'We reinforced the inner halls with high-permeability iron-alloy hulls. By emitting a short-duration magnetic pulse [HOLD CTRL / C], the AI core can lock itself to magnetic plates, resisting standard gravitational falls.',
    'Use this static cling to activate the physical elevator buttons mounted on walls. The security doors will retract.'
  ],
  crush_log: [
    'SUBJECT: MECHANICAL CRUSHERS — LOG #04',
    'TIME: 9.2 HOURS POST-RUPTURE',
    '',
    'The cooling system entered an emergency state, cycling large pneumatic pistons to depressurize liquid helium pipes. They operate on precise frequencies.',
    'You must slide beneath them [DASH / Shift] right as they begin retracting. One bad calc and the GS-10 shell will be compressed to scrap iron.'
  ],
  chrono_log: [
    'SUBJECT: TIME DILATION DEVIATION — LOG #05',
    'TIME: 15.6 HOURS POST-RUPTURE',
    '',
    'We broke time. Literally. Tiny pockets of reverse chronons are expanding in Sector 4. Touching these fields slows mechanical physics substantially. Use this temporal slowdown to complete highly complex traversal orbits.',
    'Remember: some doors require multiple security keys activated simultaneously. We are looking into quantum entanglement state solutions...'
  ],
  quantum_final_log: [
    'SUBJECT: COGNITIVE ENTANGLEMENT ESCAPE — LOG #06',
    'TIME: HORIZON THRESHOLD REACHED',
    '',
    'The portal folds are fully saturated. We created an entangled clone state! The secondary GS-10 AI unit mimics your physical actions across dimensional boundaries, allowing one to stand on a button while the other navigates the exit chute.',
    'If you escape Sector 5, you will exit into the main power grid. Reconnect my consciousness to the external net. Best of luck, little machine.'
  ]
};

// Procedural level generator for "Endless Gravity Lab"
export function generateRandomLevel(id: string, index: number): GameLevel {
  const seed = index * 1234.56;
  const randNum = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const name = `Lab Chamber #${index + 1}`;
  const worlds = ['Training Lab', 'Magnetic Core', 'Frozen Reactor', 'Chrono Collapse', 'Quantum Space'];
  const worldIdx = Math.floor(randNum(1) * 5);
  const worldName = worlds[worldIdx];

  const entities: GameEntity[] = [...createBorderWalls()];

  // Place some platforms
  const platformCount = 4 + Math.floor(randNum(2) * 5);
  for (let i = 0; i < platformCount; i++) {
    const px = 200 + Math.floor(randNum(3 + i) * 700);
    const py = 150 + Math.floor(randNum(4 + i) * 450);
    const pWidth = 120 + Math.floor(randNum(5 + i) * 200);
    const pHeight = 30 + Math.floor(randNum(6 + i) * 60);
    entities.push({
      id: `rand_p_${i}`,
      type: 'wall',
      x: px,
      y: py,
      width: pWidth,
      height: pHeight,
      isStatic: true,
      color: worldIdx === 2 ? '#60a5fa' : '#4b5563' // Blue ice color on frozen reactor
    });
  }

  // Put 1 or 2 hazard cannons
  const hazardCount = 1 + Math.floor(randNum(7) * 2);
  for (let i = 0; i < hazardCount; i++) {
    const lx = 300 + Math.floor(randNum(8 + i) * 600);
    const ly = 100 + Math.floor(randNum(9 + i) * 300);
    entities.push({
      id: `rand_las_${i}`,
      type: 'laser_cannon',
      x: lx,
      y: ly,
      width: 40,
      height: 40,
      isStatic: true,
      pulseOn: 1000 + Math.floor(randNum(10 + i) * 1500),
      pulseOff: 1000 + Math.floor(randNum(11 + i) * 1500)
    });
  }

  // Put a bounce pad or ice slide
  if (randNum(12) > 0.4) {
    const bx = 300 + Math.floor(randNum(13) * 600);
    entities.push({
      id: 'rand_bounce',
      type: 'bounce',
      x: bx,
      y: 720,
      width: 60,
      height: 40,
      isStatic: true
    });
  }

  // Put gravity triggers
  const arrowTypes: EntityType[] = ['arrow_up', 'arrow_down', 'arrow_left', 'arrow_right'];
  const arrowCount = 2 + Math.floor(randNum(14) * 3);
  for (let i = 0; i < arrowCount; i++) {
    const ax = 150 + Math.floor(randNum(15 + i) * 900);
    const ay = 150 + Math.floor(randNum(16 + i) * 500);
    const arrowType = arrowTypes[Math.floor(randNum(17 + i) * 4)];
    entities.push({
      id: `rand_arrow_${i}`,
      type: arrowType,
      x: ax,
      y: ay,
      width: 40,
      height: 40,
      isStatic: true
    });
  }

  // Shards
  const shardCount = 3 + Math.floor(randNum(18) * 4);
  for (let i = 0; i < shardCount; i++) {
    const sx = 200 + Math.floor(randNum(19 + i) * 800);
    const sy = 150 + Math.floor(randNum(20 + i) * 500);
    entities.push({
      id: `rand_sh_${i}`,
      type: 'shard',
      x: sx,
      y: sy,
      width: 20,
      height: 20,
      isStatic: true
    });
  }

  return {
    id,
    name,
    world: worldIdx + 1,
    worldName,
    width: 1200,
    height: 800,
    startX: 120,
    startY: 700,
    goalX: 1080,
    goalY: 700,
    entities,
    difficulty: ['Training', 'Easy', 'Medium', 'Hard', 'Quantum'][worldIdx] as any,
    isCloneLevel: worldIdx === 4 && randNum(21) > 0.6
  };
}
