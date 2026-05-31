/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Settings, ShoppingBag, Terminal, Database, ShieldAlert,
  Flame, Volume2, Sparkles, Check, Lock, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skin, Trail, StoryLog } from '../types';
import { SKINS, TRAILS } from '../game/skins';
import { STORIES } from '../game/levels';
import { sounds } from '../game/sound';

interface TitleScreenProps {
  shardsCount: number;
  unlockedSkins: string[];
  unlockedTrails: string[];
  selectedSkinId: string;
  selectedTrailId: string;
  completedIds: string[];
  volumeSfx: number;
  screenShake: boolean;
  trailParticles: boolean;
  onSetSkin: (id: string) => void;
  onSetTrail: (id: string) => void;
  onUnlockSkin: (id: string, cost: number) => void;
  onUnlockTrail: (id: string, cost: number) => void;
  onSetVolume: (vol: number) => void;
  onSetScreenShake: (active: boolean) => void;
  onSetTrailParticles: (active: boolean) => void;
  onSelectPlayMode: () => void;
  onWipeProgress: () => void;
}

export default function TitleScreen({
  shardsCount,
  unlockedSkins,
  unlockedTrails,
  selectedSkinId,
  selectedTrailId,
  completedIds,
  volumeSfx,
  screenShake,
  trailParticles,
  onSetSkin,
  onSetTrail,
  onUnlockSkin,
  onUnlockTrail,
  onSetVolume,
  onSetScreenShake,
  onSetTrailParticles,
  onSelectPlayMode,
  onWipeProgress
}: TitleScreenProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'laboratory' | 'lore' | 'settings'>('main');
  const [selectedStoryTag, setSelectedStoryTag] = useState<string | null>(null);

  const handleMenuClick = (tab: 'main' | 'laboratory' | 'lore' | 'settings') => {
    sounds.playButtonClick();
    setActiveTab(tab);
  };

  const handleBuySkin = (skin: Skin) => {
    sounds.playButtonClick();
    if (shardsCount >= skin.cost) {
      onUnlockSkin(skin.id, skin.cost);
    }
  };

  const handleBuyTrail = (trail: Trail) => {
    sounds.playButtonClick();
    if (shardsCount >= trail.cost) {
      onUnlockTrail(trail.id, trail.cost);
    }
  };

  const selectSkin = (id: string) => {
    sounds.playButtonClick();
    onSetSkin(id);
  };

  const selectTrail = (id: string) => {
    sounds.playButtonClick();
    onSetTrail(id);
  };

  const playLaunchSound = () => {
    sounds.playPortal();
    onSelectPlayMode();
  };

  return (
    <div id="title_master_container" className="w-full max-w-4xl rounded-3xl border border-cyan-500/20 bg-gray-950/85 p-8 shadow-2xl backdrop-blur-xl relative font-mono overflow-hidden text-cyan-200">
      
      {/* Decorative background grid matrix */}
      <div id="grid_ambient_bg" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.07),transparent_70%)] pointer-events-none" />

      {/* Title logo column */}
      {activeTab === 'main' && (
        <div id="main_logo_panel" className="flex flex-col items-center justify-center py-10 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 flex items-center gap-2 border border-cyan-400/35 bg-cyan-950/40 px-3 py-1.5 rounded-full text-2xs uppercase tracking-widest text-cyan-300 shadow-lg shadow-cyan-500/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" /> QUANTUM KINETIC VECTOR v2.6.4
          </motion.div>

          {/* Epic game title */}
          <motion.h1
            initial={{ tracking: '-0.05em', opacity: 0 }}
            animate={{ tracking: '0.05em', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-indigo-400 mb-4"
          >
            GRAVITY SHIFT
          </motion.h1>

          <p className="text-xs text-slate-400 tracking-wide max-w-md max-h-[40px] mb-12">
            Escape the collapsing Chronos research core. Tilt physical laws, slide zero-friction reactors, and escape gravity pits.
          </p>

          {/* Action column buttons */}
          <div id="action_menu_stack" className="flex flex-col gap-3.5 w-full max-w-xs">
            <button
              id="btn_play_trigger"
              onClick={playLaunchSound}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-widest rounded-xl cursor-pointer shadow-lg shadow-cyan-500/15 active:scale-98 transition transform hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-white text-white animate-pulse" /> START CHAMBERS
            </button>
            
            <button
              id="btn_skins_lab"
              onClick={() => handleMenuClick('laboratory')}
              className="w-full flex items-center justify-center gap-2 py-3 border border-cyan-500/30 hover:bg-cyan-500/10 font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> SKINS LAB
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn_story_log"
                onClick={() => handleMenuClick('lore')}
                className="flex items-center justify-center gap-1.5 py-3 border border-cyan-500/10 hover:bg-cyan-500/5 text-slate-400 hover:text-slate-200 text-xs rounded-xl font-bold transition"
              >
                <Database className="h-3.5 w-3.5" /> Lore Log
              </button>
              <button
                id="btn_settings_tab"
                onClick={() => handleMenuClick('settings')}
                className="flex items-center justify-center gap-1.5 py-3 border border-cyan-500/10 hover:bg-cyan-500/5 text-slate-400 hover:text-slate-200 text-xs rounded-xl font-bold transition"
              >
                <Settings className="h-3.5 w-3.5" /> Systems
              </button>
            </div>
          </div>

          <div className="mt-14 text-3xs text-gray-600">
            CONTROLS: A/D/Arrows to Roll • SPACE/W to Jump • SHIFT to Dash • CTRL to Magnetize
          </div>
        </div>
      )}

      {/* Customize Skins Lab Shop panel */}
      {activeTab === 'laboratory' && (
        <div id="laboratory_shop_panel" className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-4">
            <div>
              <h2 className="text-xl font-black uppercase text-cyan-100">Kinetics Skins Lab</h2>
              <p className="text-2xs text-gray-400">Repurpose AI core alloys & energy emitters collected</p>
            </div>
            
            {/* Currency counter display */}
            <div className="bg-cyan-950/50 border border-cyan-500/35 px-4 py-2 rounded-xl text-yellow-300 font-bold text-sm tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin font-extrabold text-yellow-300" /> SHARDS: {shardsCount}
            </div>
          </div>

          {/* Skins List selection */}
          <div>
            <h3 className="text-xs uppercase font-extrabold text-cyan-400 mb-3 tracking-widest">1. AI Chassis Alloy</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SKINS.map((skin) => {
                const unlocked = unlockedSkins.includes(skin.id);
                const selected = selectedSkinId === skin.id;

                return (
                  <div
                    id={`shop_item_skin_${skin.id}`}
                    key={skin.id}
                    className={`border p-3.5 rounded-xl text-center transition flex flex-col justify-between ${selected ? 'border-cyan-400 bg-cyan-950/20' : unlocked ? 'border-gray-800 bg-gray-900/40 hover:border-gray-700' : 'border-gray-950 bg-gray-950/40'}`}
                  >
                    <div className="mx-auto w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center mb-2" style={{ backgroundColor: skin.color, boxShadow: `0 0 14px ${skin.color}` }}>
                      <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-slate-100 block">{skin.name}</span>
                    
                    <div className="mt-4">
                      {selected ? (
                        <div className="text-green-400 font-bold text-xs flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Equipped
                        </div>
                      ) : unlocked ? (
                        <button
                          id={`btn_equip_skin_${skin.id}`}
                          onClick={() => selectSkin(skin.id)}
                          className="w-full py-1 border border-cyan-500/30 hover:bg-cyan-500/20 font-bold text-2xs rounded-lg uppercase cursor-pointer"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          id={`btn_buy_skin_${skin.id}`}
                          onClick={() => handleBuySkin(skin)}
                          disabled={shardsCount < skin.cost}
                          className={`w-full py-1 text-2xs font-black rounded-lg uppercase border transition ${shardsCount >= skin.cost ? 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-300' : 'bg-gray-900 border-gray-800 text-slate-500'}`}
                        >
                          Unlock • {skin.cost} Sh
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trail items list */}
          <div>
            <h3 className="text-xs uppercase font-extrabold text-cyan-400 mb-3 tracking-widest">2. Emitter Trails Spark</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TRAILS.map((trail) => {
                const unlocked = unlockedTrails.includes(trail.id);
                const selected = selectedTrailId === trail.id;

                return (
                  <div
                    id={`shop_item_trail_${trail.id}`}
                    key={trail.id}
                    className={`border p-3.5 rounded-xl text-center transition flex flex-col justify-between ${selected ? 'border-cyan-400 bg-cyan-950/20' : unlocked ? 'border-gray-800 bg-gray-900/40 hover:border-gray-700' : 'border-gray-950 bg-gray-950/40'}`}
                  >
                    <div className="mx-auto w-8 h-2 rounded mb-3" style={{ backgroundColor: trail.color }} />
                    <span className="text-xs font-semibold text-slate-100 block">{trail.name}</span>

                    <div className="mt-4">
                      {selected ? (
                        <div className="text-green-400 font-bold text-xs flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Operating
                        </div>
                      ) : unlocked ? (
                        <button
                          id={`btn_equip_trail_${trail.id}`}
                          onClick={() => selectTrail(trail.id)}
                          className="w-full py-1 border border-cyan-500/30 hover:bg-cyan-500/20 font-bold text-2xs rounded-lg uppercase cursor-pointer"
                        >
                          Attach
                        </button>
                      ) : (
                        <button
                          id={`btn_buy_trail_${trail.id}`}
                          onClick={() => handleBuyTrail(trail)}
                          disabled={shardsCount < trail.cost}
                          className={`w-full py-1 text-2xs font-black rounded-lg uppercase border transition ${shardsCount >= trail.cost ? 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-300' : 'bg-gray-900 border-gray-800 text-slate-500'}`}
                        >
                          Unlock • {trail.cost} Sh
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-cyan-500/15 pt-4 flex justify-end">
            <button
              id="btn_back_from_lab"
              onClick={() => handleMenuClick('main')}
              className="px-6 py-2 border border-gray-700 hover:text-white rounded-xl text-xs uppercase cursor-pointer font-bold"
            >
              Back to mainframe
            </button>
          </div>
        </div>
      )}

      {/* Lore Log database reader */}
      {activeTab === 'lore' && (
        <div id="lore_logs_panel" className="relative z-10 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-black uppercase text-cyan-100">Chronos Core Log Archive</h2>
            <p className="text-2xs text-gray-400">Examine decoded signals recovered from inside the chambers</p>
          </div>

          <div id="story_keys_grid" className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.keys(STORIES).map((tag, idx) => {
              // Lock logs if user completed less levels
              const isLoreUnlocked = completedIds.length >= idx * 2; // Every 2 levels locks a log
              return (
                <button
                  id={`btn_lore_log_${tag}`}
                  key={tag}
                  onClick={() => { sounds.playButtonClick(); isLoreUnlocked && setSelectedStoryTag(tag); }}
                  className={`border rounded-xl p-4 text-left transition flex flex-col h-full justify-between ${selectedStoryTag === tag ? 'border-cyan-400 bg-cyan-950/20' : isLoreUnlocked ? 'border-gray-800 bg-gray-900/30 hover:border-cyan-500/30' : 'border-gray-950 bg-gray-950'}`}
                >
                  <div>
                    <span className="block text-3xs text-cyan-400">INDEX ARCH {idx + 1}</span>
                    <h3 className="text-xs font-bold text-slate-200 mt-1 uppercase">
                      {isLoreUnlocked ? STORIES[tag][0].replace('SUBJECT: ', '') : 'Corrupted Signals'}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-2xs text-gray-500 h-[20px]">
                    {isLoreUnlocked ? (
                      <span className="text-green-500">DECRYPTED LEVEL CLEAR</span>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Lock (Needs {idx * 2} Clears)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected lore content display */}
          {selectedStoryTag && (
            <div id="story_content_box" className="mt-4 p-4 border border-cyan-500/35 bg-gray-900/60 rounded-xl max-h-[220px] overflow-y-auto leading-relaxed text-xs">
              <h4 className="font-extrabold text-cyan-300 uppercase mb-3 text-sm">
                {STORIES[selectedStoryTag][0]}
              </h4>
              <p className="whitespace-pre-wrap text-cyan-100">
                {STORIES[selectedStoryTag].slice(2).join('\n')}
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-cyan-500/15 pt-4 flex justify-end">
            <button
              id="btn_back_from_lore"
              onClick={() => handleMenuClick('main')}
              className="px-6 py-2 border border-gray-700 hover:text-white rounded-xl text-xs uppercase cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Settings Options panel */}
      {activeTab === 'settings' && (
        <div id="systems_settings_panel" className="relative z-10 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-black uppercase text-cyan-100">Chamber Systems Stabilization</h2>
            <p className="text-2xs text-gray-400">Manage audio synthesizers and physics visual rendering</p>
          </div>

          <div id="settings_controls_grid" className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-xs uppercase text-cyan-400 font-extrabold mb-1">Synthesizer Master Volume ({Math.round(volumeSfx * 100)}%)</label>
              <input
                id="volume_slider_input"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumeSfx}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onSetVolume(val);
                  sounds.setVolume(val);
                  sounds.playButtonClick();
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
              <div>
                <span className="block text-xs font-bold text-slate-200">Kinetics Camera Shakes</span>
                <span className="text-3xs text-gray-500">Screen vibrates with impact momentum or storms</span>
              </div>
              <input
                id="checkbox_screen_shake"
                type="checkbox"
                checked={screenShake}
                onChange={(e) => { sounds.playButtonClick(); onSetScreenShake(e.target.checked); }}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cyan-500/10">
              <div>
                <span className="block text-xs font-bold text-slate-200">Emit Particle Emitters</span>
                <span className="text-3xs text-gray-500">Enable trails and explosive landing shockwaves</span>
              </div>
              <input
                id="checkbox_particles_emit"
                type="checkbox"
                checked={trailParticles}
                onChange={(e) => { sounds.playButtonClick(); onSetTrailParticles(e.target.checked); }}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="pt-6 border-t border-cyan-500/10 mt-6 flex flex-col gap-3">
              <span className="block text-3xs text-red-500 uppercase font-black tracking-widest flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-red-500" /> Caution Room: Factory Clean
              </span>
              <button
                id="btn_wipe_diagnostics"
                onClick={() => {
                  const conf = window.confirm('Are you sure you want to delete all core log achievements and shard savings?');
                  if (conf) {
                    onWipeProgress();
                    sounds.playDeath();
                    alert('Systems cleaned.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/20 text-red-400 border border-red-500/35 hover:bg-red-950/80 rounded-xl text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Wipe Core Progress
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-cyan-500/15 pt-4 flex justify-end">
            <button
              id="btn_back_from_systems"
              onClick={() => handleMenuClick('main')}
              className="px-6 py-2 border border-gray-700 hover:text-white rounded-xl text-xs uppercase cursor-pointer"
            >
              Close Systems
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
