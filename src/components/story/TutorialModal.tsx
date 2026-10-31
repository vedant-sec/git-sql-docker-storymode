import React from 'react';
import { X, BookOpen, MessageSquare, Terminal } from 'lucide-react';
import { ChapterDefinition } from '../../types/game';
import { CHARACTERS } from '../../data/storyline';
import { audioFx } from '../../utils/audioEffects';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterDefinition;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, chapter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-2xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-game-modal shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                MISSION BRIEFING MANUAL
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                {chapter.title} — {chapter.subtitle}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-950/60">
          {/* Comms Intercept */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <MessageSquare className="w-4 h-4" />
              <span>INCOMING STORY TRANSMISSION</span>
            </div>

            <div className="space-y-3">
              {chapter.storyIntro.map((msg, idx) => {
                const char =
                  Object.values(CHARACTERS).find(c => c.name.includes(msg.speaker)) ||
                  CHARACTERS.ramos;

                return (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="font-bold text-xs"
                        style={{ color: char.badgeColor || '#00f0ff' }}
                      >
                        {msg.speaker} ({msg.role || 'Operative'})
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">{msg.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gameplay Instructions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>GAMEPLAY RULES & CONTROLS</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>• Read the current <strong>Mission Objective</strong> on the left panel.</li>
              <li>• Use <strong>Auto-Fill</strong> to paste the template query or write your own commands directly in the terminal.</li>
              <li>• Click <strong>[EXECUTE]</strong> or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono">Enter</kbd> to run your command against SQLite, Git, or Docker.</li>
              <li>• Complete objectives to level up, earn XP, and collect forensic clues in your inventory.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="btn-cyber-primary px-5 py-1.5 text-xs"
          >
            Start Mission
          </button>
        </div>
      </div>
    </div>
  );
};
