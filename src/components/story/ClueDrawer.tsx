import React from 'react';
import { X, ShieldCheck, FolderSearch } from 'lucide-react';
import { Clue } from '../../types/game';

interface ClueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clues: Clue[];
}

export const ClueDrawer: React.FC<ClueDrawerProps> = ({ isOpen, onClose, clues }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#F0593F]" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              EVIDENCE LOCKER ({clues.length} CLUES ACQUIRED)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#b98f9c] hover:text-white p-1 rounded-lg hover:bg-[#240632] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {clues.length === 0 ? (
            <div className="text-center py-12 text-[#834863] flex flex-col items-center">
              <FolderSearch className="w-10 h-10 mb-2 stroke-[1.5]" />
              <p className="text-xs text-[#b98f9c]">No forensic clues collected yet.</p>
              <p className="text-[11px] text-[#834863] mt-1">
                Execute queries and commands in the terminal to reveal case artifacts.
              </p>
            </div>
          ) : (
            clues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                className="bg-[#240632] border border-[#4b1064] rounded-xl p-3.5 hover:border-[#881E3F] transition relative overflow-hidden group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#881E3F]/40 text-[#F0593F] border border-[#BF2D42]">
                    {clue.category}
                  </span>
                  {clue.discoveredAt && (
                    <span className="text-[10px] text-[#b98f9c]">{clue.discoveredAt}</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#F0593F] transition">
                  {clue.title}
                </h4>
                <p className="text-[11px] text-[#fdedea] mt-1 leading-relaxed">
                  {clue.description}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg transition shadow-md shadow-[#F0593F]/25"
          >
            Close Locker
          </button>
        </div>
      </div>
    </div>
  );
};
