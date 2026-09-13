import React from 'react';
import { X, ShieldCheck, FolderSearch, Tag } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#152e1c] border border-emerald-500/50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp rubber-stamp-green text-[9px] px-1.5 py-0.2 tracking-widest">
                  EVIDENCE VAULT
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">CHAIN OF CUSTODY LOG</span>
              </div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase font-typewriter mt-0.5">
                SECURED EXHIBITS ({clues.length} ARTIFACTS CONFIRMED)
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

        {/* Clues Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#0d0505]">
          {clues.length === 0 ? (
            <div className="text-center py-12 text-stone-500 flex flex-col items-center font-typewriter">
              <FolderSearch className="w-12 h-12 mb-3 text-stone-600 stroke-[1.5]" />
              <p className="text-xs font-bold text-stone-400">NO FORENSIC EVIDENCE FILED YET.</p>
              <p className="text-[11px] text-stone-600 mt-1 max-w-sm">
                Execute queries and commands in the forensic terminal to uncover financial records, git commits, and runtime artifacts.
              </p>
            </div>
          ) : (
            clues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                className="bg-[#140808] border-2 border-[#3d1818] rounded-lg p-3.5 hover:border-emerald-500/60 transition relative overflow-hidden group shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#102919] text-emerald-300 border border-emerald-700/50 font-typewriter flex items-center space-x-1">
                    <Tag className="w-2.5 h-2.5" />
                    <span>EXHIBIT #{idx + 1} // {clue.category}</span>
                  </span>
                  {clue.discoveredAt && (
                    <span className="text-[10px] text-stone-500 font-mono">{clue.discoveredAt}</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition font-typewriter">
                  {clue.title}
                </h4>
                <p className="text-[12px] text-stone-300 mt-1.5 leading-relaxed font-report">
                  {clue.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#140808] px-5 py-3 border-t-2 border-[#4a1c1c] flex justify-between items-center text-xs">
          <span className="text-[10px] text-stone-500 font-typewriter">
            SEALED EVIDENCE // METROPOLITAN CRIME LAB
          </span>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 text-xs bg-[#240e0e] hover:bg-[#381616] text-stone-300 hover:text-white rounded font-bold font-typewriter transition border border-[#4a1c1c]"
          >
            LOCK VAULT
          </button>
        </div>
      </div>
    </div>
  );
};
