/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skin, Trail } from '../types';

export const SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Neo AI Core',
    color: '#00f0ff', // cyan
    glowColor: 'rgba(0, 240, 255, 0.6)',
    cost: 0,
    unlocked: true,
    style: 'neon'
  },
  {
    id: 'matrix',
    name: 'Digital Overlord',
    color: '#39ff14', // neon green
    glowColor: 'rgba(57, 255, 20, 0.6)',
    cost: 15,
    unlocked: false,
    style: 'matrix'
  },
  {
    id: 'gold',
    name: 'Solid Quantum Gold',
    color: '#ffd700', // gold
    glowColor: 'rgba(255, 215, 0, 0.6)',
    cost: 30,
    unlocked: false,
    style: 'gold'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Synth',
    color: '#ff007f', // pink
    glowColor: 'rgba(255, 0, 127, 0.6)',
    cost: 45,
    unlocked: false,
    style: 'cyber'
  },
  {
    id: 'hologram',
    name: 'Aether Hologram',
    color: '#9d00ff', // purple
    glowColor: 'rgba(157, 0, 255, 0.6)',
    cost: 60,
    unlocked: false,
    style: 'hologram'
  },
  {
    id: 'core',
    name: 'Chronos Singular Node',
    color: '#ff4500', // orange-red
    glowColor: 'rgba(255, 69, 0, 0.6)',
    cost: 80,
    unlocked: false,
    style: 'core'
  }
];

export const TRAILS: Trail[] = [
  {
    id: 'default_trail',
    name: 'Electro Sparkle',
    color: '#00f0ff',
    sparkle: false,
    cost: 0,
    unlocked: true
  },
  {
    id: 'laser_trail',
    name: 'Acid Plasma Stream',
    color: '#39ff14',
    sparkle: true,
    cost: 10,
    unlocked: false
  },
  {
    id: 'gold_trail',
    name: 'Golden Dust Sparkle',
    color: '#ffd700',
    sparkle: true,
    cost: 25,
    unlocked: false
  },
  {
    id: 'purple_trail',
    name: 'Holographic Nebula',
    color: '#9d00ff',
    sparkle: true,
    cost: 40,
    unlocked: false
  },
  {
    id: 'fire_trail',
    name: 'Supernova Burst',
    color: '#ff4500',
    sparkle: true,
    cost: 55,
    unlocked: false
  }
];
