import React from 'react';
import { X, Database, Table, Key } from 'lucide-react';
import { TableSchema } from '../../types/sql';
import { audioFx } from '../../utils/audioEffects';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: TableSchema[];
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose, schemas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-3xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-game-modal shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                SQLITE SCHEMA EXPLORER
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Database Tables & Fields
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
          {schemas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
              Loading schema structure from in-memory SQLite...
            </div>
          ) : (
            schemas.map(table => (
              <div key={table.name} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 shadow-sm">
                <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">{table.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                    {table.sampleCount} rows
                  </span>
                </div>
                <div className="p-2 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/80 text-[11px]">
                        <th className="py-2 px-3 font-semibold">COLUMN NAME</th>
                        <th className="py-2 px-3 font-semibold">DATA TYPE</th>
                        <th className="py-2 px-3 font-semibold">CONSTRAINT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {table.columns.map(col => (
                        <tr key={col.name} className="hover:bg-slate-800/30 transition">
                          <td className="py-2 px-3 font-semibold text-slate-200">{col.name}</td>
                          <td className="py-2 px-3 text-cyan-400 font-mono">{col.type}</td>
                          <td className="py-2 px-3">
                            {col.primaryKey && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                                <Key size={10} /> PRIMARY KEY
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
