import React from 'react';
import { ChevronLeft, ChevronRight, Paperclip, ShieldAlert } from 'lucide-react';
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
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#e8d7be] text-stone-900 font-mono text-[12.5px] font-bold border border-[#cbbb9c] shadow-xs"
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
    <div className="relative pt-7 select-none font-sans">
      {/* Protruding Manila Folder Tab */}
      <div className="absolute top-0 left-8 z-10 flex items-center space-x-2 px-5 py-2 manila-tab border-t-2 border-l-2 border-r-2 border-[#cfbfa2] text-stone-900 text-xs font-typewriter font-bold shadow-md">
        <span className="w-2 h-2 rounded-full bg-theme-bloodRed animate-ping" />
        <span className="tracking-wider uppercase">DOSSIER FILE #{puzzleIndex + 1} OF {totalPuzzles}</span>
      </div>

      {/* Manila Paper Report Container */}
      <div className="relative manila-paper border-2 border-[#cbbca0] rounded-b-xl rounded-tr-xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Brass Staple Accent in Top Left */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <div className="brass-staple transform -rotate-12" />
        </div>

        {/* Paperclip in Top Right */}
        <div className="absolute top-3 right-8 flex items-center space-x-1.5 text-stone-500 pointer-events-none opacity-80">
          <Paperclip className="w-5 h-5 text-stone-600 rotate-45" />
          <span className="text-[9.5px] font-typewriter tracking-widest uppercase text-stone-500">
            INCIDENT DOCKET #{puzzleIndex + 1}
          </span>
        </div>

        {/* Precinct Official Header & Diagonal Red Ink Stamp */}
        <div className="border-b-2 border-stone-400/80 pb-3 mb-4 mt-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black tracking-widest text-stone-800 font-typewriter uppercase">
                METROPOLITAN POLICE DEPARTMENT // FORENSIC INVESTIGATION SQUAD
              </div>
              <div className="text-[10px] text-stone-600 font-typewriter tracking-wide uppercase">
                CRIME CLASSIFICATION: UNAUTHORIZED EXFILTRATION & INTERNAL FRAUD
              </div>
            </div>

            {/* Stylized Diagonal Red-Ink Stamp */}
            <div className="flex-shrink-0 pt-1 md:pt-0">
              {isSolved ? (
                <div className="rubber-stamp rubber-stamp-green rubber-stamp-diagonal text-xs tracking-widest animate-stamp-slam">
                  ✓ EVIDENCE SECURED // RESOLVED
                </div>
              ) : (
                <div className="rubber-stamp rubber-stamp-diagonal text-[11px] tracking-wider text-red-700 border-red-700 shadow-md">
                  CONFIDENTIAL // URGENT: FORENSIC AUDIT
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Typed Incident Report Body */}
        <div className="space-y-4">
          {/* Incident Title */}
          <div className="flex items-start space-x-2">
            <span className="text-theme-bloodRed font-bold text-lg leading-none mt-0.5 font-typewriter">§</span>
            <h3 className="text-lg font-bold text-stone-950 font-typewriter tracking-tight leading-snug">
              {puzzle.title}
            </h3>
          </div>

          {/* Witness Statement / Forensic Narrative */}
          <div className="text-[13.5px] text-stone-900 font-report leading-relaxed bg-[#fbf6ec]/80 p-4 rounded border border-[#dfd2be] shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5 font-typewriter">
              [WITNESS DEPOSITION & INTERCEPT RECORD]:
            </span>
            {renderFormattedText(puzzle.description)}
          </div>

          {/* Stamped Directive Memorandum Box */}
          <div className="bg-[#ede1c7] border-2 border-dashed border-[#bfae91] rounded-lg p-4 shadow-sm relative">
            <div className="flex items-center space-x-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-theme-bloodRed flex-shrink-0" />
              <span className="text-[11px] font-black tracking-widest text-theme-bloodRed uppercase font-typewriter">
                MANDATORY DIRECTIVE FOR INVESTIGATOR:
              </span>
            </div>
            <div className="text-[13.5px] text-stone-950 font-typewriter font-semibold leading-relaxed pl-6">
              {renderFormattedText(puzzle.objective)}
            </div>
          </div>
        </div>

        {/* Physical Ledger Page-Turn Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t-2 border-stone-300/90 gap-3">
          {/* Evidence Checkpoints with Red String Line */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-stone-500 font-typewriter uppercase tracking-wider mr-1">
              CASE PROGRESS:
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
                  title={`Lead ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Dossier-Flipping Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              disabled={puzzleIndex === 0}
              className="px-3.5 py-1.5 text-xs font-bold font-typewriter rounded bg-[#e8d8bd] hover:bg-[#dac8ab] text-stone-800 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5 border border-[#baaa8d] shadow-sm active:translate-y-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>◀ PRIOR LEAD</span>
            </button>

            <button
              onClick={handleNext}
              disabled={puzzleIndex >= totalPuzzles - 1}
              className="px-4 py-1.5 text-xs font-black font-typewriter rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5 shadow-md shadow-black/20 border border-theme-scarlet active:translate-y-0.5"
            >
              <span>PURSUE LEAD ▶</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
