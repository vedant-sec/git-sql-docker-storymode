import React from 'react';
import {
  Radio,
  Terminal as TerminalIcon,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Database,
  FileCode,
  Sparkles
} from 'lucide-react';
import { ChapterDefinition, PuzzleDefinition } from '../../types/game';
import { CHARACTERS } from '../../data/storyline';

interface StoryPanelProps {
  chapter: ChapterDefinition;
  puzzle: PuzzleDefinition;
  puzzleIndex: number;
  totalPuzzles: number;
  isCurrentPuzzleSolved: boolean;
  onPrevPuzzle: () => void;
  onNextPuzzle: () => void;
  onLoadStarterCode: (code: string) => void;
  onOpenSchemaModal?: () => void;
  onOpenFileEditor?: () => void;
}

export const StoryPanel: React.FC<StoryPanelProps> = ({
  chapter,
  puzzle,
  puzzleIndex,
  totalPuzzles,
  isCurrentPuzzleSolved,
  onPrevPuzzle,
  onNextPuzzle,
  onLoadStarterCode,
  onOpenSchemaModal,
  onOpenFileEditor
}) => {
  return (
    <div className="h-full flex flex-col bg-[#0b101c] border-r border-slate-800 text-slate-200 font-mono overflow-hidden">
      {/* Chapter Mission Banner */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              {chapter.title}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-0.5">{chapter.subtitle}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400">
            OBJECTIVE {puzzleIndex + 1}/{totalPuzzles}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Dialogue / Transmission Feed */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>SECURE FORENSIC COMMS FEED</span>
          </div>

          <div className="space-y-2.5">
            {chapter.storyIntro.map((msg, idx) => {
              const char =
                Object.values(CHARACTERS).find(c => c.name.includes(msg.speaker)) ||
                CHARACTERS.ramos;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs shadow-sm hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: char.badgeColor || '#06b6d4' }}
                    >
                      {msg.speaker}
                    </span>
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11.5px]">{msg.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Objective Card */}
        <div
          className={`border rounded-xl p-4 transition-all duration-300 ${
            isCurrentPuzzleSolved
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-950/90 border-cyan-900/60 shadow-lg shadow-cyan-950/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              {puzzle.id.toUpperCase()}
            </span>
            {isCurrentPuzzleSolved && (
              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>RESOLVED</span>
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-100">{puzzle.title}</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{puzzle.description}</p>

          <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              TARGET OBJECTIVE:
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{puzzle.objective}</p>
          </div>

          {/* Quick Helper Actions */}
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
            {puzzle.starterCode && (
              <button
                onClick={() => onLoadStarterCode(puzzle.starterCode!)}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-cyan-200 transition flex items-center space-x-1"
              >
                <TerminalIcon className="w-3 h-3" />
                <span>Paste Starter Command</span>
              </button>
            )}

            {chapter.tool === 'sql' && onOpenSchemaModal && (
              <button
                onClick={onOpenSchemaModal}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
              >
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Database Schema</span>
              </button>
            )}

            {(chapter.tool === 'git' || chapter.tool === 'docker') && onOpenFileEditor && (
              <button
                onClick={onOpenFileEditor}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
              >
                <FileCode className="w-3 h-3 text-amber-400" />
                <span>Open File Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Solved clue banner */}
        {isCurrentPuzzleSolved && puzzle.clueReward && (
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-3 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CLUE UNLOCKED: {puzzle.clueReward.title}</span>
            </div>
            <p className="text-[11px] text-slate-300">{puzzle.clueReward.description}</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onPrevPuzzle}
          disabled={puzzleIndex === 0}
          className="px-3 py-1.5 text-xs rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <div className="flex space-x-1.5">
          {Array.from({ length: totalPuzzles }).map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full transition ${
                idx === puzzleIndex
                  ? 'bg-cyan-400 ring-2 ring-cyan-400/40'
                  : idx < puzzleIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNextPuzzle}
          disabled={puzzleIndex >= totalPuzzles - 1}
          className="px-3 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 shadow-lg shadow-cyan-950"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
