import React from 'react';
import { Target, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PuzzleDefinition } from '../../types/game';

interface ProblemCardProps {
  puzzle: PuzzleDefinition;
  puzzleIndex: number;
  totalPuzzles: number;
  isSolved: boolean;
  onPrevPuzzle: () => void;
  onNextPuzzle: () => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  puzzle,
  puzzleIndex,
  totalPuzzles,
  isSolved,
  onPrevPuzzle,
  onNextPuzzle
}) => {
  // Helper to format backtick code highlights nicely in description & objective
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-200/80 text-stone-900 font-mono text-[13px] font-semibold border border-stone-300"
          >
            {code}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative bg-theme-card border border-theme-cardBorder rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
      {/* Top Objective Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wider text-theme-textSubtle uppercase">
            CASE OBJECTIVE {puzzleIndex + 1} OF {totalPuzzles}
          </span>
          {isSolved && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RESOLVED</span>
            </span>
          )}
        </div>

        {/* Objective Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-theme-bloodRed text-white font-black text-xs uppercase tracking-wider shadow-sm select-none border border-theme-scarlet/40">
          <Target className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>OBJECTIVE</span>
        </div>
      </div>

      {/* Main Narrative & Objective Text */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-theme-textDark leading-snug">
          {puzzle.title}
        </h3>
        
        <p className="text-[13.5px] text-theme-textDark/80 leading-relaxed font-sans">
          {renderFormattedText(puzzle.description)}
        </p>

        <div className="bg-theme-cardCallout border border-theme-cardBorder rounded-xl p-3.5 text-[13px] text-theme-textDark leading-relaxed font-medium">
          <span className="text-[10px] font-bold tracking-widest text-theme-bloodRed uppercase block mb-1">
            TARGET INSTRUCTION:
          </span>
          {renderFormattedText(puzzle.objective)}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-theme-cardBorder">
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: totalPuzzles }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === puzzleIndex
                  ? 'w-6 bg-theme-scarlet'
                  : idx < puzzleIndex
                  ? 'w-2 bg-theme-bloodRed'
                  : 'w-2 bg-stone-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevPuzzle}
            disabled={puzzleIndex === 0}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1 border border-stone-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={onNextPuzzle}
            disabled={puzzleIndex >= totalPuzzles - 1}
            className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1 shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

