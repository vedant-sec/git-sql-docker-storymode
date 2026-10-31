import React from 'react';
import { X, Award, Sparkles, FolderSearch } from 'lucide-react';
import { Clue } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

interface ClueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clues: Clue[];
}

export const ClueDrawer: React.FC<ClueDrawerProps> = ({ isOpen, onClose, clues }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-2xl rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-game-modal shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
                PLAYER INVENTORY
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Collected Mission Intel ({clues.length} Items)
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

        {/* Clues Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-950/60">
          {clues.length === 0 ? (
            <div className="text-center py-14 text-slate-500 flex flex-col items-center">
              <FolderSearch className="w-12 h-12 mb-3 text-slate-700 stroke-[1.5]" />
              <p className="text-sm font-bold text-slate-400">NO INTEL COLLECTED YET</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Complete mission objectives across SQL, Git, and Docker to unlock encrypted forensic evidence and collect rewards.
              </p>
            </div>
          ) : (
            clues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/60 transition group shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>LOOT #{idx + 1} // {clue.category}</span>
                  </span>
                  {clue.discoveredAt && (
                    <span className="text-[10px] text-slate-500 font-mono">{clue.discoveredAt}</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition">
                  {clue.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {clue.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition"
          >
            Close Inventory
          </button>
        </div>
      </div>
    </div>
  );
};
