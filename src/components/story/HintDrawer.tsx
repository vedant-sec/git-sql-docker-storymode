import React from 'react';
import { X, HelpCircle, Key, Cpu, Sparkles, ChevronRight } from 'lucide-react';
import { PuzzleDefinition } from '../../types/game';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
              TACTICAL INTEL // HINT SYSTEM
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints Container */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="text-[11px] text-slate-400 mb-2">
            Hints are tiered progressively. Unlock tier 1 first for a directional nudge without spoiling the challenge.
          </div>

          {tiers.map(tierNum => {
            const hint = puzzle.hints.find(h => h.tier === tierNum);
            const isUnlocked = unlockedTier >= tierNum;

            return (
              <div
                key={tierNum}
                className={`border rounded-lg p-3 transition ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800/40 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {tierNum === 1 && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                    {tierNum === 2 && <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
                    {tierNum === 3 && <Key className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Tier {tierNum}: {hint?.label || 'Clue'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-semibold">DECRYPTED</span>
                    ) : (
                      <span className="text-slate-600">LOCKED</span>
                    )}
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="mt-2 text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {hint?.content}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-slate-600">
                    Unlock Tier {tierNum} to decrypt this hint.
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Hint Integration Callout */}
          <div className="mt-4 border border-cyan-950/80 bg-cyan-950/20 rounded-lg p-3 text-cyan-400 text-xs">
            <div className="flex items-center space-x-2 font-semibold text-cyan-300 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Copilot Hint Hook Ready</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              `src/data/hintService.ts` contains the active `AIHintProvider` interface. Plug in your API key or model backend to stream real-time interactive hints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            Close
          </button>

          {unlockedTier < 3 && (
            <button
              onClick={onUnlockNextTier}
              className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded font-medium flex items-center space-x-1.5 transition shadow-lg shadow-amber-900/30"
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
