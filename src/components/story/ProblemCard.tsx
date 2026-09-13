import React from 'react';
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { PuzzleDefinition } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

interface ProblemCardProps {
  puzzle: PuzzleDefinition;
  puzzleIndex: number;
  totalPuzzles: number;
  isSolved: boolean;
  onPrevPuzzle: () => void;
  onNextPuzzle: () => void;
}

// Render inline backtick code with typewriter styling
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#e5d9c0] text-stone-900 font-mono text-[12px] font-bold border border-[#c8b898]"
        >
          {code}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// SVG silver paperclip
function SilverPaperclip() {
  return (
    <svg
      width="26"
      height="54"
      viewBox="0 0 26 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="paperclip-accent"
    >
      <path
        d="M13 2 C6 2 2 7 2 13 L2 40 C2 48 8 52 13 52 C18 52 24 48 24 40 L24 16 C24 10 20 6 15 6 C10 6 7 10 7 15 L7 38 C7 41 9 44 13 44 C17 44 19 41 19 38 L19 18"
        stroke="#9ca3af"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  puzzle,
  puzzleIndex,
  totalPuzzles,
  isSolved,
  onPrevPuzzle,
  onNextPuzzle,
}) => {
  const handlePrev = () => {
    audioFx.playPaper();
    onPrevPuzzle();
  };

  const handleNext = () => {
    audioFx.playPaper();
    onNextPuzzle();
  };

  return (
    <div className="relative pt-8 select-none font-sans stacked-pages">
      {/* Protruding manila folder tab */}
      <div className="absolute top-0 left-8 z-10">
        <div className="manila-tab-label">
          <span className="w-2 h-2 rounded-full bg-[#b91c1c] mr-2 animate-pulse inline-block" />
          INCIDENT FILE #{puzzleIndex + 1} OF {totalPuzzles}
        </div>
      </div>

      {/* Main manila paper */}
      <div className="relative manila-folder border-2 border-[#c5b490] rounded-b-xl rounded-tr-xl p-6 md:p-8 overflow-hidden">

        {/* Brass staple top-left */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="brass-staple -rotate-12" />
        </div>

        {/* Silver paperclip top-right */}
        <div className="absolute top-0 right-8 pointer-events-none flex items-start space-x-1.5">
          <SilverPaperclip />
          <span className="text-[9px] font-typewriter tracking-widest text-stone-500 uppercase mt-2">
            INCIDENT DOCKET #{puzzleIndex + 1}
          </span>
        </div>

        {/* Police letterhead + stamp */}
        <div className="border-b-2 border-stone-400/70 pb-4 mb-5 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black tracking-widest text-stone-800 font-typewriter uppercase leading-tight">
                METROPOLITAN POLICE DEPARTMENT // CYBER CRIMES &amp; FORENSICS SQUAD
              </div>
              <div className="text-[9.5px] text-stone-600 font-typewriter tracking-wide uppercase mt-0.5">
                CRIME CLASSIFICATION: CRIME STAGED SYSTEM EXFILTRATION &amp; FRAUD
              </div>
            </div>

            <div className="flex-shrink-0">
              {isSolved ? (
                <div className="rubber-stamp rubber-stamp-green rubber-stamp-diagonal text-[10px] animate-stamp-slam">
                  ✓ EVIDENCE SECURED
                </div>
              ) : (
                <div className="rubber-stamp rubber-stamp-diagonal text-[10px]">
                  URGENT: FORENSIC AUDIT
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="space-y-4">
          {/* Evidence section title */}
          <div className="flex items-start space-x-2">
            <span className="text-[#b91c1c] font-bold text-xl leading-none mt-0.5 font-typewriter">$</span>
            <h3 className="text-xl font-bold text-stone-950 font-typewriter tracking-tight leading-snug">
              {puzzle.title}
            </h3>
          </div>

          {/* Witness statement */}
          <div className="bg-[#faf4e8]/80 border border-[#ddd0b8] rounded p-4 shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 font-typewriter mb-2">
              (WITNESS STATEMENT &amp; FORENSIC DIRECTION):
            </div>
            <div className="text-[13px] text-stone-900 font-report leading-relaxed">
              {renderFormattedText(puzzle.description)}
            </div>
          </div>

          {/* Directive memorandum */}
          <div className="bg-[#ede4cc] border-2 border-dashed border-[#c0b090] rounded-lg p-4 relative">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[#b91c1c] flex-shrink-0" />
              <span className="text-[10px] font-black tracking-widest text-[#b91c1c] uppercase font-typewriter">
                OFFICIAL DIRECTIVE OF DETECTIVE ON DUTY:
              </span>
            </div>
            <div className="text-[13px] text-stone-950 font-typewriter font-semibold leading-relaxed pl-6">
              {renderFormattedText(puzzle.objective)}
            </div>

            {/* Handwritten annotation */}
            <div className="absolute bottom-3 right-4 text-right">
              <div className="handwritten-note text-[13px]">
                CHECK SENDER-ACCOUNT DATA
              </div>
            </div>
          </div>
        </div>

        {/* Page-turn action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t-2 border-stone-300/80 gap-3">
          {/* Progress dots */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px] font-bold text-stone-500 font-typewriter uppercase tracking-wider mr-1">
              CASE PROGRESS:
            </span>
            {Array.from({ length: totalPuzzles }).map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === puzzleIndex
                    ? 'w-7 bg-[#b91c1c] ring-2 ring-[#8f0e0e]/40'
                    : idx < puzzleIndex
                    ? 'w-2.5 bg-emerald-700'
                    : 'w-2.5 bg-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              disabled={puzzleIndex === 0}
              className="px-3.5 py-1.5 text-xs font-bold font-typewriter rounded bg-[#e5d8bc] hover:bg-[#d9c9a8] text-stone-800 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5 border border-[#bfae8c] shadow-sm active:translate-y-px"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PRIOR LEAD</span>
            </button>

            <button
              onClick={handleNext}
              disabled={puzzleIndex >= totalPuzzles - 1}
              className="px-4 py-1.5 text-xs font-black font-typewriter rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5 shadow-md border border-theme-scarlet active:translate-y-px"
            >
              <span>PURSUE LEAD</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
