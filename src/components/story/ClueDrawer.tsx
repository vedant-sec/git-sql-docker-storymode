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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
              EVIDENCE LOCKER ({clues.length} CLUES ACQUIRED)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {clues.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <FolderSearch className="w-10 h-10 mb-2 stroke-[1.5]" />
              <p className="text-xs">No forensic clues collected yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Execute queries and commands in the terminal to reveal case artifacts.
              </p>
            </div>
          ) : (
            clues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 hover:border-emerald-500/50 transition relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    {clue.category}
                  </span>
                  {clue.discoveredAt && (
                    <span className="text-[10px] text-slate-500">{clue.discoveredAt}</span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                  {clue.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {clue.description}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition"
          >
            Close Locker
          </button>
        </div>
      </div>
    </div>
  );
};
