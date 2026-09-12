import React from 'react';
import { Terminal, Shield, HelpCircle, RotateCcw, Database, GitBranch, Box } from 'lucide-react';
import { ALL_CHAPTERS } from '../../data/chapters';

interface HeaderProps {
  currentChapterId: string;
  onSelectChapter: (id: string) => void;
  cluesCount: number;
  onOpenClues: () => void;
  onOpenHints: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChapterId,
  onSelectChapter,
  cluesCount,
  onOpenClues,
  onOpenHints,
  onResetGame
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 font-mono px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand / Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-950">
          <Terminal className="w-4 h-4 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-black tracking-widest text-slate-100">
              ROOT<span className="text-cyan-400">ACCESS</span>
            </h1>
            <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
              v0.1.0-DEMO
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Operation Broken Cipher // Digital Forensics</p>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
        {ALL_CHAPTERS.map(ch => {
          const isActive = ch.id === currentChapterId;
          const Icon = ch.tool === 'sql' ? Database : ch.tool === 'git' ? GitBranch : Box;

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center space-x-1.5 transition ${
                isActive
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>Ch.{ch.number}: {ch.tool.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Clues, Hints, Reset */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenClues}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center space-x-1.5"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evidence</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            {cluesCount}
          </span>
        </button>

        <button
          onClick={onOpenHints}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center space-x-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Intel / Hints</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Reset all progress, collected clues, and restart from Chapter 1?')) {
              onResetGame();
            }
          }}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-800 text-slate-500 transition"
          title="Reset Investigation Progress"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
