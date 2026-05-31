/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TitleScreen from './components/TitleScreen';
import LevelSelector from './components/LevelSelector';
import GameCanvas from './components/GameCanvas';
import LevelEditor from './components/LevelEditor';
import DialogueOverlay from './components/DialogueOverlay';

import { GameLevel, Skin, Trail } from './types';
import { HANDCRAFTED_LEVELS, generateRandomLevel, STORIES } from './game/levels';
import { SKINS, TRAILS } from './game/skins';
import { sounds } from './game/sound';

export default function App() {
  // Page Navigation layout state
  const [screen, setScreen] = useState<'menu' | 'selector' | 'game' | 'editor'>('menu');

  // Savable local variables (persistent via localStorage)
  const [shardsCount, setShardsCount] = useState<number>(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['default']);
  const [unlockedTrails, setUnlockedTrails] = useState<string[]>(['default_trail']);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('default');
  const [selectedTrailId, setSelectedTrailId] = useState<string>('default_trail');
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [highScores, setHighScores] = useState<{ [key: string]: number }>({});

  // Audio / FX Settings
  const [volumeSfx, setVolumeSfx] = useState<number>(0.5);
  const [screenShake, setScreenShake] = useState<boolean>(true);
  const [trailParticles, setTrailParticles] = useState<boolean>(true);

  // Active level execution contexts
  const [activeLevel, setActiveLevel] = useState<GameLevel | null>(null);
  const [activeMode, setActiveMode] = useState<'story' | 'challenge' | 'endless' | 'speedrun'>('story');
  const [endlessIndex, setEndlessIndex] = useState<number>(0); // Tracing current endless cycle

  // Lore / dialogue sequence overlay
  const [currentDialogue, setCurrentDialogue] = useState<{ title: string; lines: string[] } | null>(null);

  // Load persistence configurations from localStorage
  useEffect(() => {
    try {
      const storedShards = localStorage.getItem('gravity_shift_shards');
      if (storedShards) setShardsCount(parseInt(storedShards));

      const storedSkins = localStorage.getItem('gravity_shift_unlocked_skins');
      if (storedSkins) setUnlockedSkins(JSON.parse(storedSkins));

      const storedTrails = localStorage.getItem('gravity_shift_unlocked_trails');
      if (storedTrails) setUnlockedTrails(JSON.parse(storedTrails));

      const activeSkin = localStorage.getItem('gravity_shift_active_skin');
      if (activeSkin) setSelectedSkinId(activeSkin);

      const activeTrail = localStorage.getItem('gravity_shift_active_trail');
      if (activeTrail) setSelectedTrailId(activeTrail);

      const storedCompletes = localStorage.getItem('gravity_shift_completes');
      if (storedCompletes) setCompletedLevels(JSON.parse(storedCompletes));

      const storedScores = localStorage.getItem('gravity_shift_scores');
      if (storedScores) setHighScores(JSON.parse(storedScores));

      const storedVolume = localStorage.getItem('gravity_shift_volume');
      if (storedVolume) {
        const floatVol = parseFloat(storedVolume);
        setVolumeSfx(floatVol);
        sounds.setVolume(floatVol);
      }

      const storedShake = localStorage.getItem('gravity_shift_shake');
      if (storedShake) setScreenShake(storedShake === 'true');

      const storedParticles = localStorage.getItem('gravity_shift_particles');
      if (storedParticles) setTrailParticles(storedParticles === 'true');

    } catch (e) {
      console.warn('LocalStorage error on load', e);
    }
  }, []);

  // Set Skin
  const handleSetSkin = (id: string) => {
    setSelectedSkinId(id);
    localStorage.setItem('gravity_shift_active_skin', id);
  };

  // Set Trail
  const handleSetTrail = (id: string) => {
    setSelectedTrailId(id);
    localStorage.setItem('gravity_shift_active_trail', id);
  };

  // Unlock Skin
  const handleUnlockSkin = (id: string, cost: number) => {
    const list = [...unlockedSkins, id];
    setUnlockedSkins(list);
    const remaining = shardsCount - cost;
    setShardsCount(remaining);

    localStorage.setItem('gravity_shift_unlocked_skins', JSON.stringify(list));
    localStorage.setItem('gravity_shift_shards', remaining.toString());
  };

  // Unlock Trail
  const handleUnlockTrail = (id: string, cost: number) => {
    const list = [...unlockedTrails, id];
    setUnlockedTrails(list);
    const remaining = shardsCount - cost;
    setShardsCount(remaining);

    localStorage.setItem('gravity_shift_unlocked_trails', JSON.stringify(list));
    localStorage.setItem('gravity_shift_shards', remaining.toString());
  };

  // Set FX configs
  const handleSetVolume = (vol: number) => {
    setVolumeSfx(vol);
    localStorage.setItem('gravity_shift_volume', vol.toString());
  };

  const handleSetScreenShake = (active: boolean) => {
    setScreenShake(active);
    localStorage.setItem('gravity_shift_shake', active.toString());
  };

  const handleSetTrailParticles = (active: boolean) => {
    setTrailParticles(active);
    localStorage.setItem('gravity_shift_particles', active.toString());
  };

  // Reset Progress Complete wiped out
  const handleWipeProgress = () => {
    localStorage.clear();
    setShardsCount(0);
    setUnlockedSkins(['default']);
    setUnlockedTrails(['default_trail']);
    setSelectedSkinId('default');
    setSelectedTrailId('default_trail');
    setCompletedLevels([]);
    setHighScores({});
    setVolumeSfx(0.5);
    setScreenShake(true);
    setTrailParticles(true);
    sounds.setVolume(0.5);
    setScreen('menu');
  };

  // Start direct level
  const handleSelectLevelToPlay = (lvl: GameLevel, mode: 'story' | 'challenge' | 'speedrun') => {
    setActiveLevel(lvl);
    setActiveMode(mode);
    setScreen('game');

    // If level has associated start narrative logs, trigger on load story dialogue overlay!
    if (mode === 'story' && lvl.narrativeText) {
      setCurrentDialogue({
        title: `SECTOR DECIPHER: ${lvl.name.toUpperCase()}`,
        lines: lvl.narrativeText
      });
    }
  };

  // Start Endless procedurally randomized rooms
  const handleSelectEndlessMode = () => {
    const freshLevel = generateRandomLevel('endless_0', 0);
    setActiveLevel(freshLevel);
    setActiveMode('endless');
    setEndlessIndex(0);
    setScreen('game');
  };

  // Clear level completion handler
  const handleLevelClearResult = (scoreTime: number, shardsCollected: number) => {
    if (!activeLevel) return;

    // A. Shards bank increments (only reward on true new completions or flat rate to allow sandbox play)
    const isFirstTimeCompleted = !completedLevels.includes(activeLevel.id);
    const baseReward = isFirstTimeCompleted ? 6 : 2; // bonus completed reward
    const shardsEarned = shardsCollected + baseReward;
    const finalShardsCount = shardsCount + shardsEarned;
    setShardsCount(finalShardsCount);
    localStorage.setItem('gravity_shift_shards', finalShardsCount.toString());

    // B. Save Level cleared tracking list
    if (isFirstTimeCompleted && !activeLevel.id.startsWith('custom') && !activeLevel.id.startsWith('endless')) {
      const nextCompletes = [...completedLevels, activeLevel.id];
      setCompletedLevels(nextCompletes);
      localStorage.setItem('gravity_shift_completes', JSON.stringify(nextCompletes));
    }

    // C. Best scoring time track records
    const bestRecord = highScores[activeLevel.id];
    if (bestRecord === undefined || scoreTime < bestRecord) {
      const copyScores = { ...highScores, [activeLevel.id]: scoreTime };
      setHighScores(copyScores);
      localStorage.setItem('gravity_shift_scores', JSON.stringify(copyScores));
    }

    // D. Navigation triggers depending on Mode
    setTimeout(() => {
      if (activeMode === 'endless') {
        // Automatically proceed to NEXT higher random chamber seamlessly! Great endlessly addictive feel!
        const nextIdx = endlessIndex + 1;
        const nextLvl = generateRandomLevel(`endless_${nextIdx}`, nextIdx);
        setEndlessIndex(nextIdx);
        setActiveLevel(nextLvl);
        setCurrentDialogue({
          title: `NEXT COGNITIVE VECTOR STAGE`,
          lines: [
            `SYSTEM LOG #${nextIdx + 12}: Sector cleared successfully.`,
            `Dilation forces expanding. Commencing translation transfer to Random Chamber #${nextIdx + 1}...`
          ]
        });
      } else {
        // Back to list
        setScreen('selector');
      }
    }, 3800);
  };

  const handleOpenLocalDialogue = (tag: string) => {
    const rawLines = STORIES[tag];
    if (rawLines) {
      setCurrentDialogue({
        title: `DECRYPTED LORE CORE: ${tag.toUpperCase()}`,
        lines: rawLines
      });
    }
  };

  // Find accurate current skin properties
  const activeSkinObj = SKINS.find((s) => s.id === selectedSkinId) || SKINS[0];
  const activeTrailObj = TRAILS.find((t) => t.id === selectedTrailId) || TRAILS[0];

  return (
    <div id="gravity_shift_react_root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
      {/* Visual glowing border particles */}
      <div id="background_outer_glow_ring" className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-black pointer-events-none z-0" />

      {/* Screen Views Wrapper */}
      <div id="app_viewport_root" className="relative z-10 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <motion.div
              id="view_mainframe_menu"
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <TitleScreen
                shardsCount={shardsCount}
                unlockedSkins={unlockedSkins}
                unlockedTrails={unlockedTrails}
                selectedSkinId={selectedSkinId}
                selectedTrailId={selectedTrailId}
                completedIds={completedLevels}
                volumeSfx={volumeSfx}
                screenShake={screenShake}
                trailParticles={trailParticles}
                onSetSkin={handleSetSkin}
                onSetTrail={handleSetTrail}
                onUnlockSkin={handleUnlockSkin}
                onUnlockTrail={handleUnlockTrail}
                onSetVolume={handleSetVolume}
                onSetScreenShake={handleSetScreenShake}
                onSetTrailParticles={handleSetTrailParticles}
                onSelectPlayMode={() => setScreen('selector')}
                onWipeProgress={handleWipeProgress}
              />
            </motion.div>
          )}

          {screen === 'selector' && (
            <motion.div
              id="view_mainframe_selector"
              key="selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LevelSelector
                levels={HANDCRAFTED_LEVELS}
                completedIds={completedLevels}
                highScores={highScores}
                unlockedSkinsCount={unlockedSkins.length}
                totalShards={shardsCount}
                onSelectLevel={handleSelectLevelToPlay}
                onSelectEndless={handleSelectEndlessMode}
                onSelectEditor={() => setScreen('editor')}
                onBackToMenu={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {screen === 'game' && activeLevel && (
            <motion.div
              id="view_mainframe_game"
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameCanvas
                level={activeLevel}
                selectedSkin={activeSkinObj}
                selectedTrail={activeTrailObj}
                settings={{
                  volumeSfx,
                  screenShake,
                  trailParticles,
                  glowEffects: true,
                }}
                mode={activeMode}
                onLevelClear={handleLevelClearResult}
                onExit={() => {
                  sounds.playButtonClick();
                  setScreen('selector');
                }}
                onOpenNarrative={handleOpenLocalDialogue}
              />
            </motion.div>
          )}

          {screen === 'editor' && (
            <motion.div
              id="view_mainframe_editor"
              key="editor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LevelEditor
                onPlayCustomLevel={(customLvl) => {
                  setActiveLevel(customLvl);
                  setActiveMode('story');
                  setScreen('game');
                }}
                onClose={() => setScreen('selector')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narrative Dialog overlays */}
      <AnimatePresence>
        {currentDialogue && (
          <DialogueOverlay
            title={currentDialogue.title}
            lines={currentDialogue.lines}
            onClose={() => setCurrentDialogue(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
