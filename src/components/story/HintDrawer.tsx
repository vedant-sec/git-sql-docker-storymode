import React from 'react';
import { X, Radio, Key, Sparkles, ChevronRight, ShieldAlert } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#331111] border border-theme-scarlet/60 flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp text-[9px] px-1.5 py-0.2 tracking-widest text-emerald-400 border-emerald-500">
                  WIRETAP INTERCEPT
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">FREQ: 142.85 MHz</span>
              </div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase font-typewriter mt-0.5">
                INFORMANT TIP // WIRETAP HINT
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="text-stone-400 hover:text-white p-1 rounded bg-[#2a0e0e] hover:bg-[#3d1515] transition border border-[#4a1c1c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints Container */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#0d0505]">
          <div className="text-[11px] text-stone-400 font-report leading-relaxed bg-[#170909] p-2.5 rounded border border-[#2e1212]">
            Informant transmissions are encrypted progressively. Unlock Tier 1 first for an investigative nudge without blowing suspect cover.
          </div>

          {tiers.map(tierNum => {
            const hint = puzzle.hints.find(h => h.tier === tierNum);
            const isUnlocked = unlockedTier >= tierNum;

            return (
              <div
                key={tierNum}
                className={`border-2 rounded-lg p-3.5 transition ${
                  isUnlocked
                    ? 'bg-[#180b0b] border-[#4a1c1c] text-stone-200'
                    : 'bg-[#100707] border-[#240e0e] text-stone-600 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-theme-scarlet" />
                    <span className="text-xs font-bold uppercase tracking-wider font-typewriter">
                      INTERCEPT TIER {tierNum}: {hint?.label || 'Informant Lead'}
                    </span>
                  </div>
                  <span className="text-[10px] font-typewriter tracking-widest uppercase">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold">● DECRYPTED AUDIO</span>
                    ) : (
                      <span className="text-stone-600">ENCRYPTED STREAM</span>
                    )}
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="mt-2 text-xs text-stone-200 font-typewriter bg-[#090404] p-3 rounded border border-[#2e1212] whitespace-pre-wrap leading-relaxed shadow-inner">
                    "{hint?.content}"
                  </div>
                ) : (
                  <div className="text-[11px] italic text-stone-500 font-typewriter">
                    -- Decrypt Tier {tierNum} transcript to intercept wiretap audio --
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#140808] px-5 py-3 border-t-2 border-[#4a1c1c] flex justify-between items-center">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-white rounded bg-[#210d0d] hover:bg-[#331414] font-typewriter transition border border-[#3d1515]"
          >
            DISCONNECT WIRE
          </button>

          {unlockedTier < 3 && (
            <button
              onClick={() => {
                audioFx.playClick();
                onUnlockNextTier();
              }}
              className="px-4 py-1.5 text-xs bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white rounded font-bold font-typewriter flex items-center space-x-1.5 transition shadow-lg shadow-black/60 border border-theme-scarlet"
            >
              <span>DECRYPT TIER {unlockedTier + 1} INTEL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
