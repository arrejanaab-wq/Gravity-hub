/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Trash2, Code, Download, PlusCircle, Wrench, 
  HelpCircle, CheckCircle, ChevronDown 
} from 'lucide-react';
import { GameLevel, GameEntity, EntityType } from '../types';
import { sounds } from '../game/sound';

interface LevelEditorProps {
  onPlayCustomLevel: (lvl: GameLevel) => void;
  onClose: () => void;
}

const PALETTE_ITEMS: { type: EntityType; label: string; color: string; desc: string }[] = [
  { type: 'wall', label: 'Slate Block', color: 'bg-slate-700 border-slate-500', desc: 'Solid wall obstacle.' },
  { type: 'ice', label: 'Ice Panel', color: 'bg-blue-400 border-blue-300', desc: 'Low-friction slide.' },
  { type: 'bounce', label: 'Bounce Pad', color: 'bg-emerald-500 border-emerald-400', desc: 'Sling-jumps core upwards.' },
  { type: 'laser_cannon', label: 'Laser Turret', color: 'bg-rose-600 border-rose-500', desc: 'Deadly instant beams.' },
  { type: 'arrow_up', label: 'Arrow UP', color: 'bg-amber-500 border-amber-400 text-black font-extrabold flex items-center justify-center', desc: 'Inverts gravity ceilingwards.' },
  { type: 'arrow_down', label: 'Arrow DOWN', color: 'bg-amber-600 border-amber-500 text-black font-extrabold flex items-center justify-center', desc: 'Reverts gravity floorwards.' },
  { type: 'shard', label: 'Quantum Shard', color: 'bg-yellow-400 border-yellow-300 rounded-full', desc: 'Collectible currency.' },
  { type: 'button', label: 'Plate', color: 'bg-cyan-500 border-cyan-400', desc: 'Triggers connected doors.' },
  { type: 'door', label: 'Laser Gate', color: 'bg-purple-600 border-purple-500', desc: 'Door blocking path.' },
];

export default function LevelEditor({ onPlayCustomLevel, onClose }: LevelEditorProps) {
  const [levelName, setLevelName] = useState('My Custom Chamber');
  const [selectedType, setSelectedType] = useState<EntityType>('wall');
  const [placedEntities, setPlacedEntities] = useState<GameEntity[]>([]);
  const [editorMessage, setEditorMessage] = useState('Grid snaped to 40x40. Select a tile tool above and stamp onto grid!');

  const GRID_SIZE = 40;
  const CANVAS_W = 1200;
  const CANVAS_H = 800;

  // Render a visual miniature grid
  const cols = CANVAS_W / GRID_SIZE; // 30 columns
  const rows = CANVAS_H / GRID_SIZE; // 20 rows

  const handleTileClick = (colIdx: number, rowIdx: number) => {
    sounds.playButtonClick();
    const x = colIdx * GRID_SIZE;
    const y = rowIdx * GRID_SIZE;

    // Check if cell already has an item
    const existingIdx = placedEntities.findIndex(e => e.x === x && e.y === y);
    
    if (existingIdx !== -1) {
      // If stamp matches, remove/erase. Otherwise replace!
      const existing = placedEntities[existingIdx];
      if (existing.type === selectedType) {
        setPlacedEntities(prev => prev.filter((_, idx) => idx !== existingIdx));
        setEditorMessage('Erased asset from cell.');
      } else {
        setPlacedEntities(prev => {
          const arr = [...prev];
          arr[existingIdx] = createNewEntityInstance(selectedType, x, y);
          return arr;
        });
        setEditorMessage(`Updated cell to ${selectedType}.`);
      }
    } else {
      setPlacedEntities(prev => [...prev, createNewEntityInstance(selectedType, x, y)]);
      setEditorMessage(`Created ${selectedType} at grid coordinates [X:${x} Y:${y}].`);
    }
  };

  const createNewEntityInstance = (type: EntityType, x: number, y: number): GameEntity => {
    let width = GRID_SIZE;
    let height = GRID_SIZE;
    let color = '#475569';
    let idTag = undefined;

    if (type === 'laser_cannon') {
       color = '#f43f5e';
    } else if (type === 'bounce') {
       color = '#10b981';
    } else if (type === 'ice') {
       color = '#60a5fa';
    } else if (type === 'arrow_up' || type === 'arrow_down') {
       color = '#f59e0b';
    } else if (type === 'button') {
       color = '#ef4444';
       idTag = 'sandbox_tag';
    } else if (type === 'door') {
       color = '#a855f7';
       idTag = 'sandbox_tag';
    }

    return {
      id: `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      x,
      y,
      width,
      height,
      isStatic: true,
      color,
      idTag,
      isActive: false
    };
  };

  const clearGrid = () => {
    sounds.playButtonClick();
    setPlacedEntities([]);
    setEditorMessage('Sandbox grid restored.');
  };

  const addOuterBorderWalls = () => {
    sounds.playButtonClick();
    // Generate basic walls around borders
    const borderList: GameEntity[] = [];
    
    // Horizontal row
    for (let c = 0; c < cols; c++) {
      const x = c * GRID_SIZE;
      borderList.push(createNewEntityInstance('wall', x, 0));
      borderList.push(createNewEntityInstance('wall', x, CANVAS_H - GRID_SIZE));
    }
    // Vertical cols
    for (let r = 1; r < rows - 1; r++) {
      const y = r * GRID_SIZE;
      borderList.push(createNewEntityInstance('wall', 0, y));
      borderList.push(createNewEntityInstance('wall', CANVAS_W - GRID_SIZE, y));
    }

    setPlacedEntities(borderList);
    setEditorMessage('Injected automated outer perimeter bounds.');
  };

  const handleTestLevelPlay = () => {
    sounds.playButtonClick();
    
    // Construct standard level layout objects
    const customLevel: GameLevel = {
      id: 'custom_sandbox_level',
      name: levelName,
      world: 5,
      worldName: 'Custom Sandbox Sector',
      width: CANVAS_W,
      height: CANVAS_H,
      startX: GRID_SIZE + 40,
      startY: CANVAS_H - GRID_SIZE - 60,
      goalX: CANVAS_W - GRID_SIZE - 60,
      goalY: CANVAS_H - GRID_SIZE - 60,
      entities: [
        // Ensure some outer walls or safety so player doesn't fly into abyss if empty
        ...placedEntities
      ],
      difficulty: 'Quantum'
    };

    onPlayCustomLevel(customLevel);
  };

  return (
    <div id="sandbox_editor_panel" className="w-full max-w-5xl rounded-2xl border border-yellow-500/35 bg-gray-950/80 p-6 shadow-2xl backdrop-blur-md font-mono text-yellow-100 flex flex-col gap-6">
      
      {/* Editorial headers */}
      <div id="editor_header_row" className="flex flex-wrap items-center justify-between border-b border-yellow-500/10 pb-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-yellow-300">Gravity Sandbox Engine</h2>
          <p className="text-2xs text-gray-400">Architect custom sectors, set gravity streams, laser hazards, and execute physics test tracks</p>
        </div>
        <div className="flex gap-2">
          <button
            id="btn_editor_border"
            onClick={addOuterBorderWalls}
            className="px-3 py-1.5 rounded bg-gray-900 border border-yellow-500/20 text-xs hover:border-yellow-500/50"
          >
            + Auto Borders
          </button>
          <button
            id="btn_editor_reset"
            onClick={clearGrid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/40 text-red-300 text-xs hover:bg-red-950/70 border border-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" /> Wipe Cells
          </button>
          <button
            id="btn_close_editor"
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:text-white hover:border-gray-500 cursor-pointer text-xs"
          >
            ← Selector Tab
          </button>
        </div>
      </div>

      {/* Grid customization label and details inputs */}
      <div id="level_customizer_fields_row" className="flex items-center gap-4 bg-gray-900/40 p-3 rounded-lg border border-yellow-500/10">
        <div className="flex-1">
          <label className="block text-2xs text-gray-400 uppercase mb-1">Chamber Sector Label</label>
          <input
            id="input_custom_level_name"
            type="text"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            className="w-full bg-gray-950 border border-yellow-500/20 rounded px-3 py-1.5 text-xs text-yellow-200 outline-none focus:border-yellow-400"
            maxLength={26}
          />
        </div>
        <div id="test_execution_btn_col">
          <button
            id="btn_play_custom_test"
            onClick={handleTestLevelPlay}
            className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-black font-extrabold rounded-lg text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-yellow-500/10 active:scale-95 transition"
          >
            <Play className="h-4 w-4 fill-black text-black" /> Test Layout
          </button>
        </div>
      </div>

      {/* Asset Tool Palette menu */}
      <div id="assets_palette_container">
        <span className="block text-2xs text-gray-400 uppercase mb-2">Architect's Palette (Click to active stencil tool)</span>
        <div id="palette_grid_row" className="flex flex-wrap gap-2">
          {PALETTE_ITEMS.map((item) => {
            const isActive = selectedType === item.type;
            return (
              <button
                id={`btn_palette_tool_${item.type}`}
                key={item.type}
                onClick={() => { sounds.playButtonClick(); setSelectedType(item.type); }}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs cursor-pointer transition ${isActive ? 'bg-yellow-500 text-black border-yellow-300 font-bold' : 'bg-gray-900/60 border-yellow-500/10 hover:border-yellow-500/35'}`}
                title={item.desc}
              >
                <span className={`w-3 h-3 ${item.color} rounded border inline-block`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive snapping Grid Canvas Mockup */}
      <div id="editor_interactive_grid_wrapper" className="relative border border-yellow-500/30 rounded-xl overflow-hidden bg-gray-950 p-2">
        <div id="grid_outer_viewport" className="w-full aspect-[3/2] grid grid-cols-30 grid-rows-20 relative select-none">
          {/* Loop and draw mock columns to act as clickable click triggers */}
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div id={`grid_row_${rIdx}`} key={rIdx} className="flex h-[5%] w-full">
              {Array.from({ length: cols }).map((_, cIdx) => {
                // Find if an item exists inside this cell
                const xCoord = cIdx * GRID_SIZE;
                const yCoord = rIdx * GRID_SIZE;
                const ent = placedEntities.find(p => p.x === xCoord && p.y === yCoord);

                // Highlight player/goal landmarks by default dynamically
                const isStartPlace = cIdx === 2 && rIdx === rows - 3;
                const isGoalPlace = cIdx === cols - 3 && rIdx === rows - 3;

                return (
                  <div
                    id={`cell_${cIdx}_${rIdx}`}
                    key={cIdx}
                    onClick={() => handleTileClick(cIdx, rIdx)}
                    className="flex-1 aspect-square border-[0.5px] border-yellow-500/5 hover:bg-yellow-500/10 relative flex items-center justify-center transition"
                  >
                    {/* Render actual item color representation if stamped */}
                    {ent && (
                      <div className={`absolute inset-1 border rounded shadow-sm flex items-center justify-center text-3xs ${PALETTE_ITEMS.find(p=>p.type===ent.type)?.color || 'bg-slate-700 border-slate-500'}`}>
                        {ent.type === 'arrow_up' && '↑'}
                        {ent.type === 'arrow_down' && '↓'}
                        {ent.type === 'button' && '●'}
                        {ent.type === 'door' && '✖'}
                      </div>
                    )}

                    {/* Landmarks outlines values if free */}
                    {!ent && isStartPlace && (
                      <span className="text-4xs text-cyan-400 font-bold uppercase select-none pointer-events-none scale-75">START</span>
                    )}
                    {!ent && isGoalPlace && (
                      <span className="text-4xs text-emerald-400 font-bold uppercase select-none pointer-events-none scale-75">PORTAL</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Editor diagnostics logs footer line */}
      <div id="editor_diagnostics_line" className="mt-2 text-2xs text-gray-500 flex justify-between border-t border-yellow-500/10 pt-3">
        <span>ENGINE FEEDBACK: {editorMessage}</span>
        <span>PLANNED ASSETS COUNT: {placedEntities.length} / 120 MAX</span>
      </div>
    </div>
  );
}
