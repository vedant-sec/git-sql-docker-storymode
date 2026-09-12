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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#F0593F]" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              TACTICAL INTEL // HINT SYSTEM
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#b98f9c] hover:text-white p-1 rounded-lg hover:bg-[#240632] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints Container */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="text-[11px] text-[#b98f9c] mb-2">
            Hints are tiered progressively. Unlock tier 1 first for a directional nudge without spoiling the challenge.
          </div>

          {tiers.map(tierNum => {
            const hint = puzzle.hints.find(h => h.tier === tierNum);
            const isUnlocked = unlockedTier >= tierNum;

            return (
              <div
                key={tierNum}
                className={`border rounded-xl p-3.5 transition ${
                  isUnlocked
                    ? 'bg-[#240632] border-[#881E3F]/70 text-[#fdedea]'
                    : 'bg-[#190224]/50 border-[#3b0d52]/40 text-[#834863] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {tierNum === 1 && <Cpu className="w-3.5 h-3.5 text-[#F0593F]" />}
                    {tierNum === 2 && <HelpCircle className="w-3.5 h-3.5 text-[#F0593F]" />}
                    {tierNum === 3 && <Key className="w-3.5 h-3.5 text-[#BF2D42]" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Tier {tierNum}: {hint?.label || 'Clue'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">
                    {isUnlocked ? (
                      <span className="text-[#F0593F] font-bold">DECRYPTED</span>
                    ) : (
                      <span className="text-[#834863]">LOCKED</span>
                    )}
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="mt-2 text-xs text-[#fdedea] font-mono bg-[#13011b] p-3 rounded-lg border border-[#3b0d52] whitespace-pre-wrap leading-relaxed">
                    {hint?.content}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-[#834863]">
                    Unlock Tier {tierNum} to decrypt this hint.
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Hint Integration Callout */}
          <div className="mt-4 border border-[#881E3F]/50 bg-[#240632]/50 rounded-xl p-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-[#F0593F] mb-1">
              <Sparkles className="w-4 h-4 text-[#F0593F]" />
              <span>AI Copilot Hint Hook Ready</span>
            </div>
            <p className="text-[11px] text-[#b98f9c] leading-relaxed">
              `src/data/hintService.ts` contains the active `AIHintProvider` interface. Plug in your API key or model backend to stream real-time interactive hints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-[#b98f9c] hover:text-white rounded-lg hover:bg-[#240632] transition"
          >
            Close
          </button>

          {unlockedTier < 3 && (
            <button
              onClick={onUnlockNextTier}
              className="px-4 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg flex items-center space-x-1.5 transition shadow-md shadow-[#F0593F]/25"
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
