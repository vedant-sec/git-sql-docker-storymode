import React from 'react';
import { Target, CheckCircle2, ChevronLeft, ChevronRight, Paperclip, AlertOctagon, ShieldAlert } from 'lucide-react';
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

export const ProblemCard: React.FC<ProblemCardProps> = ({
  puzzle,
  puzzleIndex,
  totalPuzzles,
  isSolved,
  onPrevPuzzle,
  onNextPuzzle
}) => {
  // Helper to format backtick code highlights nicely in typewriter style
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#ebdcc2] text-stone-900 font-mono text-[12.5px] font-bold border border-[#cbbb9c] shadow-xs"
          >
            {code}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handlePrev = () => {
    audioFx.playPaper();
    onPrevPuzzle();
  };

  const handleNext = () => {
    audioFx.playPaper();
    onNextPuzzle();
  };

  return (
    <div className="relative pt-6 select-none font-sans">
      {/* Top Manila Folder Tab */}
      <div className="absolute top-0 left-6 z-10 flex items-center space-x-2 px-4 py-1.5 manila-tab border-t-2 border-l-2 border-r-2 border-[#d2c2a4] text-stone-800 text-xs font-typewriter font-bold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-theme-bloodRed animate-ping" />
        <span className="tracking-wider uppercase">INCIDENT FILE #{puzzleIndex + 1} OF {totalPuzzles}</span>
      </div>

      {/* Manila Paper Report Container */}
      <div className="relative manila-paper border-2 border-[#cbbca0] rounded-b-xl rounded-tr-xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Trompe l'oeil Brass Paperclip in Corner */}
        <div className="absolute top-3 right-6 flex items-center space-x-1.5 text-stone-500 pointer-events-none opacity-80">
          <Paperclip className="w-5 h-5 text-stone-600 rotate-45" />
          <span className="text-[10px] font-typewriter tracking-widest uppercase text-stone-500">EXHIBIT A-101</span>
        </div>

        {/* Precinct Official Letterhead */}
        <div className="border-b-2 border-stone-400/80 pb-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-black tracking-widest text-stone-700 font-typewriter uppercase">
                METROPOLITAN POLICE DEPARTMENT // CYBER CRIMES & FORENSICS SQUAD
              </div>
              <div className="text-[10px] text-stone-500 font-typewriter tracking-wide uppercase">
                CRIME CLASSIFICATION: UNAUTHORIZED SYSTEM EXFILTRATION & FRAUD
              </div>
            </div>

            {/* Distressed Classification Rubber Stamp */}
            <div className="flex-shrink-0">
              {isSolved ? (
                <div className="rubber-stamp rubber-stamp-green text-xs tracking-widest animate-stamp-slam">
                  ✓ EVIDENCE SECURED // RESOLVED
                </div>
              ) : (
                <div className="rubber-stamp text-xs tracking-widest">
                  ★ TOP SECRET // ACTIVE LEAD
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Typed Case Report Content */}
        <div className="space-y-4">
          {/* Incident Headline */}
          <div className="flex items-start space-x-2">
            <span className="text-theme-bloodRed font-bold text-lg leading-none mt-0.5 font-typewriter">§</span>
            <h3 className="text-lg font-bold text-stone-900 font-typewriter tracking-tight leading-snug">
              {puzzle.title}
            </h3>
          </div>

          {/* Report Narrative */}
          <div className="text-[13.5px] text-stone-800 font-report leading-relaxed bg-[#fbf7ee]/60 p-3.5 rounded border border-[#dfd2be]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1 font-typewriter">
              [WITNESS STATEMENT & FORENSIC DISPATCH]:
            </span>
            {renderFormattedText(puzzle.description)}
          </div>

          {/* Pinned Directive / Objective Box */}
          <div className="bg-[#ede2cb] border-2 border-dashed border-[#bfae91] rounded-lg p-4 shadow-inner relative">
            <div className="flex items-center space-x-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-theme-bloodRed flex-shrink-0" />
              <span className="text-[11px] font-black tracking-widest text-theme-bloodRed uppercase font-typewriter">
                OFFICIAL DIRECTIVE FOR DETECTIVE ON DUTY:
              </span>
            </div>
            <div className="text-[13.5px] text-stone-900 font-typewriter font-semibold leading-relaxed pl-6">
              {renderFormattedText(puzzle.objective)}
            </div>
          </div>
        </div>

        {/* Red String Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t-2 border-stone-300/80 gap-3">
          {/* Evidence Checkpoints with Red String Line */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-stone-500 font-typewriter uppercase tracking-wider mr-1">
              LEAD PROGRESS:
            </span>
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: totalPuzzles }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === puzzleIndex
                      ? 'w-7 bg-theme-scarlet shadow-xs ring-2 ring-[#8f0e0e]/40'
                      : idx < puzzleIndex
                      ? 'w-2.5 bg-emerald-700'
                      : 'w-2.5 bg-stone-300'
                  }`}
                  title={`Objective ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Flip Page / Pursue Lead Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handlePrev}
              disabled={puzzleIndex === 0}
              className="px-3 py-1.5 text-xs font-bold font-typewriter rounded bg-[#e8dac0] hover:bg-[#d8c8ab] text-stone-800 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1 border border-[#baaa8d] shadow-sm active:translate-y-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>&lt; PREVIOUS LEAD</span>
            </button>

            <button
              onClick={handleNext}
              disabled={puzzleIndex >= totalPuzzles - 1}
              className="px-4 py-1.5 text-xs font-black font-typewriter rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5 shadow-md shadow-black/20 border border-theme-scarlet active:translate-y-0.5"
            >
              <span>FLIP PAGE &gt;</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
