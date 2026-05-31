/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Terminal, X, ChevronRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { sounds } from '../game/sound';

interface DialogueOverlayProps {
  title: string;
  lines: string[];
  onClose: () => void;
}

export default function DialogueOverlay({ title, lines, onClose }: DialogueOverlayProps) {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const fullText = lines[currentLineIdx] || '';

  useEffect(() => {
    setTypedText('');
    setIsTyping(true);
    let i = 0;
    sounds.playLogUnlock();

    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15); // Fast, satisfying typing effect

    return () => clearInterval(interval);
  }, [currentLineIdx, fullText]);

  const handleNext = () => {
    sounds.playButtonClick();
    if (isTyping) {
      setTypedText(fullText);
      setIsTyping(false);
    } else if (currentLineIdx < lines.length - 1) {
      setCurrentLineIdx((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const skipAll = () => {
    sounds.playButtonClick();
    onClose();
  };

  return (
    <div id="dialogue_overlay_container" className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <motion.div
        id="dialogue_overlay_panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl border border-cyan-500/30 bg-gray-950/95 p-6 shadow-2xl shadow-cyan-500/10 rounded-xl font-mono text-gray-100"
      >
        {/* Header */}
        <div id="dialogue_header" className="mb-4 flex items-center justify-between border-b border-cyan-500/20 pb-2 text-cyan-400">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 animate-pulse" />
            <span className="text-xs uppercase tracking-widest">{title}</span>
          </div>
          <button
            id="btn_dialog_close"
            onClick={skipAll}
            className="rounded p-1 hover:bg-gray-900 hover:text-cyan-300"
            title="Skip Lore"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Box */}
        <div id="dialogue_content_box" className="min-h-[160px] text-sm leading-relaxed text-cyan-100/90 py-2">
          {fullText ? (
            <p className="whitespace-pre-wrap">
              {typedText}
              {isTyping && <span className="animate-pulse bg-cyan-400 text-transparent select-none px-0.5">|</span>}
            </p>
          ) : (
            <span className="text-gray-500 italic">No entry logs...</span>
          )}
        </div>

        {/* Footer controls */}
        <div id="dialogue_footer" className="mt-6 flex items-center justify-between border-t border-cyan-500/10 pt-4 text-xs">
          <div className="text-gray-500">
            Log {currentLineIdx + 1} of {lines.length}
          </div>
          <div className="flex gap-2">
            <button
              id="btn_dialog_skip"
              onClick={skipAll}
              className="px-3 py-1.5 border border-transparent text-gray-400 hover:text-gray-200"
            >
              Skip
            </button>
            <button
              id="btn_dialog_next"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded bg-cyan-600/30 px-4 py-2 font-medium text-cyan-300 hover:bg-cyan-600/45 border border-cyan-500/50"
            >
              {currentLineIdx < lines.length - 1 ? (
                <>
                  Next <ChevronRight className="h-3 w-3" />
                </>
              ) : (
                <>
                  Execute <Play className="h-3 w-3 fill-cyan-400 text-cyan-300" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
