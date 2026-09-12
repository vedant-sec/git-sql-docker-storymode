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
            className="px-1.5 py-0.5 mx-0.5 rounded bg-theme-onyx text-theme-scarlet font-mono text-[12.5px] font-semibold border border-theme-darkBorder"
          >
            {code}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative bg-theme-cardBg border border-theme-cardBorder rounded-2xl p-6 shadow-md hover:border-theme-scarlet/50 transition duration-200">
      {/* Top Objective Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wider text-theme-bloodRed uppercase">
            CASE OBJECTIVE {puzzleIndex + 1} OF {totalPuzzles}
          </span>
          {isSolved && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-theme-bloodRed/15 text-theme-bloodRed border border-theme-bloodRed/40 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-theme-bloodRed" />
              <span>RESOLVED</span>
            </span>
          )}
        </div>

        {/* Scarlet OBJECTIVE Tag */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-theme-scarlet border border-theme-scarletHover text-theme-white font-black text-xs uppercase tracking-wider shadow-md shadow-theme-scarlet/20 select-none">
          <Target className="w-3.5 h-3.5 text-theme-white stroke-[2.5]" />
          <span>OBJECTIVE</span>
        </div>
      </div>

      {/* Main Narrative & Objective Text */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-theme-textDark leading-snug">
          {puzzle.title}
        </h3>
        
        <p className="text-[13.5px] text-theme-textSubtle leading-relaxed font-sans">
          {renderFormattedText(puzzle.description)}
        </p>

        <div className="bg-theme-cardCallout border border-theme-bloodRed/30 rounded-xl p-3.5 text-[13px] text-theme-textDark leading-relaxed font-medium">
          <span className="text-[10px] font-bold tracking-widest text-theme-bloodRed uppercase block mb-1">
            TARGET INSTRUCTION:
          </span>
          {renderFormattedText(puzzle.objective)}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-theme-cardBorder/60">
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: totalPuzzles }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === puzzleIndex
                  ? 'w-6 bg-theme-scarlet'
                  : idx < puzzleIndex
                  ? 'w-2 bg-theme-bloodRed'
                  : 'w-2 bg-theme-cardBorder'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevPuzzle}
            disabled={puzzleIndex === 0}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#f0e8e8] hover:bg-[#e4d8d8] text-theme-textDark disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 border border-theme-cardBorder"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={onNextPuzzle}
            disabled={puzzleIndex >= totalPuzzles - 1}
            className="px-3.5 py-1 text-xs font-bold rounded-lg bg-theme-scarlet hover:bg-theme-scarletHover text-theme-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 shadow-md shadow-theme-scarlet/20"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
