import React from 'react';
import { X, HelpCircle, ChevronRight, Lock, Unlock } from 'lucide-react';
import { PuzzleDefinition } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

interface HintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleDefinition;
  unlockedTier: number; // 0, 1, 2, 3
  onUnlockNextTier: () => void;
}

export const HintDrawer: React.FC<HintDrawerProps> = ({
  isOpen,
  onClose,
  puzzle,
  unlockedTier,
  onUnlockNextTier
}) => {
  if (!isOpen) return null;

  const tiers: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-xl rounded-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-game-modal shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                TACTICAL GUIDANCE
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Mission Clues & Hints
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

        {/* Hints Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-950/60">
          <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            Hints unlock progressively. Tier 1 gives a gentle nudge, Tier 2 provides technical syntax hints, and Tier 3 gives the direct command solution.
          </div>

          {tiers.map(tierNum => {
            const hint = puzzle.hints?.find(h => h.tier === tierNum);
            const isUnlocked = unlockedTier >= tierNum;

            return (
              <div
                key={tierNum}
                className={`border rounded-xl p-4 transition ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-amber-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      TIER {tierNum}: {hint?.label || 'Intel Tip'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Unlock size={12} /> UNLOCKED
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock size={12} /> LOCKED
                      </span>
                    )}
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="mt-2 text-xs text-amber-200 bg-slate-950 p-3 rounded-lg border border-amber-500/20 whitespace-pre-wrap leading-relaxed font-mono">
                    {hint?.content}
                  </div>
                ) : (
                  <div className="text-xs italic text-slate-600">
                    Unlock Tier {tierNum} to view this clue.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 px-6 py-3.5 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            Close
          </button>

          {unlockedTier < 3 && (
            <button
              onClick={() => {
                audioFx.playClick();
                onUnlockNextTier();
              }}
              className="btn-cyber-primary px-4 py-1.5 text-xs flex items-center space-x-1.5"
            >
              <span>Unlock Tier {unlockedTier + 1} Hint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
