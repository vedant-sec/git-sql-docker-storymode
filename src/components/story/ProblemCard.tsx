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
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#1C0228] text-[#F0593F] font-mono text-[12.5px] font-semibold border border-[#4b1064]"
          >
            {code}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative bg-[#240632] border border-[#4b1064] rounded-2xl p-6 shadow-xl hover:border-[#881E3F] transition duration-200">
      {/* Top Objective Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wider text-[#b98f9c] uppercase">
            CASE OBJECTIVE {puzzleIndex + 1} OF {totalPuzzles}
          </span>
          {isSolved && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#881E3F]/40 text-[#F0593F] border border-[#BF2D42] text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F0593F]" />
              <span>RESOLVED</span>
            </span>
          )}
        </div>

        {/* Coral/Flame OBJECTIVE Tag matching user palette */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F0593F] border border-[#f67059] text-[#1C0228] font-black text-xs uppercase tracking-wider shadow-md shadow-[#F0593F]/20 select-none">
          <Target className="w-3.5 h-3.5 text-[#1C0228] stroke-[2.5]" />
          <span>OBJECTIVE</span>
        </div>
      </div>

      {/* Main Narrative & Objective Text */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white leading-snug">
          {puzzle.title}
        </h3>
        
        <p className="text-[13.5px] text-[#fdedea] leading-relaxed font-sans">
          {renderFormattedText(puzzle.description)}
        </p>

        <div className="bg-[#190224] border border-[#881E3F]/70 rounded-xl p-3.5 text-[13px] text-[#fdedea] leading-relaxed font-medium">
          <span className="text-[10px] font-bold tracking-widest text-[#F0593F] uppercase block mb-1">
            TARGET INSTRUCTION:
          </span>
          {renderFormattedText(puzzle.objective)}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3b0d52]">
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: totalPuzzles }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === puzzleIndex
                  ? 'w-6 bg-[#F0593F]'
                  : idx < puzzleIndex
                  ? 'w-2 bg-[#881E3F]'
                  : 'w-2 bg-[#3b0d52]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevPuzzle}
            disabled={puzzleIndex === 0}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#1C0228] hover:bg-[#340948] text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 border border-[#4b1064]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={onNextPuzzle}
            disabled={puzzleIndex >= totalPuzzles - 1}
            className="px-3.5 py-1 text-xs font-bold rounded-lg bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 shadow-md shadow-[#F0593F]/20"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
