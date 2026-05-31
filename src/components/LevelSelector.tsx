/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Lock, Star, ChevronRight, Award, Flame, 
  Sparkles, ShieldCheck, Compass, CodeXml 
} from 'lucide-react';
import { motion } from 'motion/react';
import { GameLevel } from '../types';
import { HANDCRAFTED_LEVELS } from '../game/levels';
import { sounds } from '../game/sound';

interface LevelSelectorProps {
  levels: GameLevel[];
  completedIds: string[];
  highScores: { [key: string]: number }; // id -> record float seconds
  unlockedSkinsCount: number;
  totalShards: number;
  onSelectLevel: (level: GameLevel, mode: 'story' | 'challenge' | 'speedrun') => void;
  onSelectEndless: () => void;
  onSelectEditor: () => void;
  onBackToMenu: () => void;
}

const WORLDS_INFO = [
  { id: 1, name: 'World 1: Training Facility', desc: 'Basic gravity vectors, bounce triggers, and kinetic booster trials.', bg: 'from-cyan-950/40 to-blue-900/30', border: 'border-cyan-500/30' },
  { id: 2, name: 'World 2: Magnetic Core', desc: 'Sticky iron-shells, continuous camera-torques, and pulsing reactor laser guards.', bg: 'from-indigo-950/40 to-violet-900/30', border: 'border-indigo-500/30' },
  { id: 3, name: 'World 3: Frozen Reactor', desc: 'Zero-friction liquid helium slides, heavy crushing pistons, and momentum leaps.', bg: 'from-sky-950/40 to-blue-950/30', border: 'border-sky-400/30' },
  { id: 4, name: 'World 4: Time Collapse', desc: 'Chrono-dilation slow speed zones and high-altitude gravity storms.', bg: 'from-purple-950/40 to-fuchsia-950/30', border: 'border-purple-500/30' },
  { id: 5, name: 'World 5: Quantum Dimension', desc: 'Tangible binary duplicate gravity clones and spatial teleport portals.', bg: 'from-pink-950/40 to-rose-950/30', border: 'border-pink-500/30' }
];

export default function LevelSelector({
  levels,
  completedIds,
  highScores,
  unlockedSkinsCount,
  totalShards,
  onSelectLevel,
  onSelectEndless,
  onSelectEditor,
  onBackToMenu
}: LevelSelectorProps) {
  const [activeWorld, setActiveWorld] = useState<number>(1);
  const [selectedPlayMode, setSelectedPlayMode] = useState<'story' | 'challenge' | 'speedrun'>('story');

  const handleSelectLevel = (lvl: GameLevel) => {
    sounds.playButtonClick();
    onSelectLevel(lvl, selectedPlayMode);
  };

  const handleSelectWorldTab = (worldId: number) => {
    sounds.playButtonClick();
    setActiveWorld(worldId);
  };

  // Check if level is unlocked
  const isLevelUnlocked = (lvl: GameLevel) => {
    if (lvl.world === 1) return true;
    
    // Find previous level in chronological index
    const worldLevels = levels.filter(l => l.world === lvl.world);
    const idx = worldLevels.findIndex(l => l.id === lvl.id);
    if (idx === 0) {
      // Unlocked if all previous world completed, or just unlock world 2/3/4 directly for easier sandbox!
      // To satisfy premium feel but avoid frustration, let's unlock entire world 1 & 2 by default, and lock 3+ until preceding levels completed
      const prevWorldId = lvl.world - 1;
      const prevWorldLevels = levels.filter(l => l.world === prevWorldId);
      const isPrevWorldDone = prevWorldLevels.every(l => completedIds.includes(l.id));
      return isPrevWorldDone;
    }
    
    // Within same world: needs preceding level done
    const precedingLvl = worldLevels[idx - 1];
    return completedIds.includes(precedenceId(lvl));
  };

  // Helper preceding finder
  const precedenceId = (current: GameLevel): string => {
    const idx = HANDCRAFTED_LEVELS.findIndex(l => l.id === current.id);
    if (idx <= 0) return '';
    return HANDCRAFTED_LEVELS[idx - 1].id;
  };

  const isLevelCompletedBefore = (lvlId: string) => completedIds.includes(lvlId);

  // Time stamp gold targets in seconds
  const getSpeedrunMedal = (lvlId: string, time?: number): 'Gold' | 'Silver' | 'Bronze' | null => {
    if (!time) return null;
    if (time < 12) return 'Gold';
    if (time < 22) return 'Silver';
    return 'Bronze';
  };

  return (
    <div id="level_selector_screen" className="w-full max-w-5xl rounded-2xl border border-cyan-500/20 bg-gray-950/70 p-6 shadow-2xl backdrop-blur-md font-mono text-cyan-200">
      
      {/* Header Stat row widgets */}
      <div id="selector_header_stats" className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b border-cyan-500/10 pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-100">Escape Chambers</h2>
          <p className="text-xs text-gray-400">Select stabilizing sectors to reconnect node memory banks</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-gray-900 border border-yellow-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="text-xs text-yellow-300 font-bold">SHARDS: {totalShards}</span>
          </div>
          <div className="bg-gray-900 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-bold">COMPLETED: {completedIds.length} / {levels.length}</span>
          </div>
          <button
            id="btn_back_to_title"
            onClick={onBackToMenu}
            className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:text-white hover:border-gray-500 cursor-pointer"
          >
            ← Menu
          </button>
        </div>
      </div>

      {/* Mode settings toggle switch */}
      <div id="mode_selection_tabs" className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-900/60 p-2 rounded-lg border border-cyan-500/10">
        <button
          id="btn_mode_story"
          onClick={() => { sounds.playButtonClick(); setSelectedPlayMode('story'); }}
          className={`px-4 py-3 rounded-md flex items-center justify-center gap-1.5 font-bold text-xs tracking-widest uppercase transition ${selectedPlayMode === 'story' ? 'bg-cyan-600/35 border border-cyan-400 text-cyan-100' : 'text-gray-400 hover:text-cyan-300'}`}
        >
          <Compass className="h-4 w-4" /> Story Mode
        </button>
        <button
          id="btn_mode_challenge"
          onClick={() => { sounds.playButtonClick(); setSelectedPlayMode('challenge'); }}
          className={`px-4 py-3 rounded-md flex items-center justify-center gap-1.5 font-bold text-xs tracking-widest uppercase transition ${selectedPlayMode === 'challenge' ? 'bg-purple-600/35 border border-purple-400 text-purple-100' : 'text-gray-400 hover:text-purple-300'}`}
        >
          <Award className="h-4 w-4" /> Challenge Mode
        </button>
        <button
          id="btn_mode_speedrun"
          onClick={() => { sounds.playButtonClick(); setSelectedPlayMode('speedrun'); }}
          className={`px-4 py-3 rounded-md flex items-center justify-center gap-1.5 font-bold text-xs tracking-widest uppercase transition ${selectedPlayMode === 'speedrun' ? 'bg-yellow-600/35 border border-yellow-400 text-yellow-100' : 'text-gray-400 hover:text-yellow-300'}`}
        >
          <Flame className="h-4 w-4" /> Speedrun Mode
        </button>
      </div>

      {/* World Tabs buttons */}
      <div id="world_tabs_scroller" className="mb-6 flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {WORLDS_INFO.map((world) => {
          const isWorldActive = activeWorld === world.id;
          return (
            <button
              id={`tab_world_${world.id}`}
              key={world.id}
              onClick={() => handleSelectWorldTab(world.id)}
              className={`flex-none px-4 py-2 text-xs uppercase font-bold rounded-lg border tracking-wider transition ${isWorldActive ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/15' : 'bg-gray-900 border-gray-800 text-slate-400 hover:text-cyan-300'}`}
            >
              World {world.id}
            </button>
          );
        })}
      </div>

      {/* Selected World Overview detail box */}
      <div id="world_description_panel" className={`p-4 rounded-xl border mb-6 bg-gradient-to-r ${WORLDS_INFO[activeWorld-1].bg} ${WORLDS_INFO[activeWorld-1].border}`}>
        <h4 className="text-sm font-bold uppercase text-white mb-1">{WORLDS_INFO[activeWorld-1].name}</h4>
        <p className="text-xs text-cyan-200/70 leading-relaxed">{WORLDS_INFO[activeWorld-1].desc}</p>
      </div>

      {/* Levels list blocks */}
      <div id="levels_grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {levels
          .filter((l) => l.world === activeWorld)
          .map((lvl) => {
            const unlocked = isLevelUnlocked(lvl);
            const done = isLevelCompletedBefore(lvl.id);
            const scoreTime = highScores[lvl.id];
            const medal = getSpeedrunMedal(lvl.id, scoreTime);

            return (
              <div
                id={`level_card_${lvl.id}`}
                key={lvl.id}
                className={`relative border rounded-xl p-4 transition-all duration-300 ${unlocked ? 'bg-gray-900/40 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-gray-900/70' : 'bg-gray-950/90 border-gray-900 text-gray-500 opacity-60'}`}
              >
                <div id="level_header" className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cyan-400 font-semibold uppercase">{lvl.difficulty} Vector</span>
                  <div className="flex gap-1">
                    {done && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    {medal === 'Gold' && <Award className="h-4 w-4 text-yellow-400" title="Gold Speed Medal" />}
                    {medal === 'Silver' && <Award className="h-4 w-4 text-slate-300" title="Silver Speed Medal" />}
                    {medal === 'Bronze' && <Award className="h-4 w-4 text-amber-600" title="Bronze Speed Medal" />}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">{lvl.name}</h3>

                {/* Sub status details */}
                <div className="text-2xs text-gray-400 mt-2 min-h-[30px]">
                  {scoreTime ? (
                    <span className="text-green-400">BEST CAPTURE: {scoreTime.toFixed(1)}s</span>
                  ) : (
                    <span>No system clearance data...</span>
                  )}
                </div>

                {/* Enter play chamber button */}
                <div className="mt-4 flex items-center justify-between">
                  {unlocked ? (
                    <button
                      id={`btn_play_level_${lvl.id}`}
                      onClick={() => handleSelectLevel(lvl)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-700/20 hover:bg-cyan-700/40 border border-cyan-500/30 font-bold rounded-lg text-xs tracking-wider transition text-cyan-200"
                    >
                      Initialize <Play className="h-3 w-3 fill-cyan-400 text-cyan-400" />
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-1 py-1.5 bg-gray-950 border border-gray-900/40 rounded-lg text-xs font-semibold">
                      <Lock className="h-3.5 w-3.5 text-gray-600" /> Security Locked
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Alternative Procedural Endless mode card block layout */}
      <div id="alternative_modes_grid" className="mt-8 border-t border-cyan-500/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Endless lab */}
        <div id="endless_selector_card" className="border border-purple-500/20 bg-purple-950/15 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase mb-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" /> Endless Gravity Lab
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed max-w-sm">Procedurally generated infinite chamber variations to push reflex limits.</p>
          </div>
          <button
            id="btn_enter_endless"
            onClick={() => { sounds.playButtonClick(); onSelectEndless(); }}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white"
          >
            Enter Lab
          </button>
        </div>

        {/* Level Sandbox Editor */}
        <div id="editor_selector_card" className="border border-yellow-500/20 bg-yellow-950/15 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-xs uppercase mb-1">
              <CodeXml className="h-3.5 w-3.5 text-yellow-400" /> Core Level Sandbox
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed max-w-sm">Place switches, gravity ports, and laser grids. Design, trace, and test custom levels!</p>
          </div>
          <button
            id="btn_enter_editor"
            onClick={() => { sounds.playButtonClick(); onSelectEditor(); }}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 font-bold text-xs text-white"
          >
            Open Editor
          </button>
        </div>
      </div>
    </div>
  );
}
