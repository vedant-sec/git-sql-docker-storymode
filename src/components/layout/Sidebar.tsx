import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Database,
  Lightbulb,
  FileCode,
  Radio,
  Volume2,
  VolumeX,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { ChapterDefinition } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

interface SidebarProps {
  chapters: ChapterDefinition[];
  currentChapterId: string;
  currentPuzzleIndex: number;
  completedPuzzleIds: string[];
  onSelectChapter: (chapterId: string) => void;
  onSelectPuzzleIndex: (index: number) => void;
  onOpenSchema: () => void;
  onOpenConcept: () => void;
  onOpenHint: () => void;
  onOpenFileEditor?: () => void;
  tool: 'sql' | 'git' | 'docker';
}

const TOOL_LABEL: Record<string, string> = {
  sql: 'AUDIT',
  git: 'TRANSACTION',
  docker: 'INFRASTRUCTURE',
};

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  currentChapterId,
  currentPuzzleIndex,
  completedPuzzleIds,
  onSelectChapter,
  onSelectPuzzleIndex,
  onOpenSchema,
  onOpenConcept,
  onOpenHint,
  onOpenFileEditor,
  tool,
}) => {
  const [expandedId, setExpandedId] = useState<string>(currentChapterId);
  const [isMuted, setIsMuted] = useState<boolean>(audioFx.isMuted());

  const toggleChapter = (chId: string) => {
    audioFx.playPaper();
    if (expandedId === chId) {
      setExpandedId('');
    } else {
      setExpandedId(chId);
      onSelectChapter(chId);
    }
  };

  const handleAudioToggle = () => {
    const next = audioFx.toggleMute();
    setIsMuted(next);
    if (!next) audioFx.playClick();
  };

  return (
    <aside className="w-72 h-full leather-binder flex flex-col font-mono select-none flex-shrink-0 relative z-30">
      {/* Binder spine rivets strip */}
      <div className="binder-spine">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="binder-rivet" />
        ))}
      </div>

      {/* Main binder content sits next to spine */}
      <div className="absolute left-[14px] top-0 bottom-0 right-0 flex flex-col overflow-hidden">

        {/* === BINDER HEADER === */}
        <div className="p-4 border-b border-[#3d1f10] bg-gradient-to-b from-[#2a1208] to-[#180a04] flex-shrink-0">
          {/* Confidential stamp */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="rubber-stamp text-[8px] px-1.5 py-0.5 tracking-widest">
              CONFIDENTIAL
            </span>
            <span className="text-[9px] text-amber-600/60 font-typewriter font-bold tracking-widest">
              REG #409-X
            </span>
          </div>

          {/* Binder title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-[#0e0502] border border-[#5a2a14] flex items-center justify-center shadow-inner flex-shrink-0">
              <Fingerprint className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] font-black text-stone-100 font-typewriter uppercase tracking-wide leading-tight">
                CRIMINAL DOSSIER
              </div>
              <div className="text-[11px] font-black text-amber-400 font-typewriter uppercase tracking-wide">
                Case Binder V4.1
              </div>
              <div className="text-[9px] text-stone-400 font-typewriter tracking-widest uppercase mt-0.5">
                Dt. Arceus_101
              </div>
            </div>
          </div>
        </div>

        {/* === INVESTIGATOR ID CARD === */}
        <div className="mx-3 mt-3 mb-2 p-2.5 rounded-lg bg-[#100502] border border-[#3d1c10] shadow-md flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#0a0301] border border-[#5a2a14] flex items-center justify-center relative flex-shrink-0">
              <span className="text-sm">🕵️</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold text-stone-500 uppercase tracking-wider font-typewriter">
                ACTIVE INVESTIGATOR
              </div>
              <div className="text-[11px] font-bold text-stone-100 font-typewriter truncate">
                Dt. Arceus_101
              </div>
              <div className="text-[9px] text-emerald-400 font-bold font-typewriter">
                ● ACTIVE WARRANT
              </div>
            </div>
          </div>
        </div>

        {/* === SCROLLABLE CASE TABS === */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">
          {/* Case index label */}
          <div className="px-2 mb-2.5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-amber-500/80 tracking-widest uppercase font-typewriter">
              CASE INDEX TABS
            </span>
            <span className="text-[9px] text-stone-600 font-mono">
              {chapters.length} SEASONS
            </span>
          </div>

          <div className="space-y-2">
            {chapters.map((ch, chIdx) => {
              const seasonNum = String(chIdx + 1).padStart(2, '0');
              const toolTag = TOOL_LABEL[ch.tool] || ch.tool.toUpperCase();
              const isSelected = ch.id === currentChapterId;
              const isExpanded = expandedId === ch.id;
              const solvedCount = ch.puzzles.filter(p => completedPuzzleIds.includes(p.id)).length;
              const isComplete = solvedCount === ch.puzzles.length;

              return (
                <div
                  key={ch.id}
                  className={`rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#1c0d06] border-[#703018] shadow-xl shadow-black/80'
                      : 'bg-[#120703] border-[#2e1308] hover:border-[#4d2010]'
                  }`}
                >
                  {/* Chapter Tab Header */}
                  <button
                    onClick={() => toggleChapter(ch.id)}
                    className="w-full flex items-center justify-between p-2 text-left group"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {/* Index tab */}
                      <span className={`index-tab flex-shrink-0 ${isSelected ? 'index-tab-active' : ''}`}>
                        CASE S{seasonNum}: {toolTag}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className={`text-[11px] font-bold font-typewriter truncate leading-tight ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          {ch.title}
                        </div>
                        <div className="text-[9px] text-stone-600 font-typewriter uppercase">
                          [{ch.tool}]
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isComplete && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-amber-500" />
                        : <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-400" />
                      }
                    </div>
                  </button>

                  {/* Expanded chapter content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#331508] space-y-1 bg-black/40">
                      {/* Schema / Files */}
                      <button
                        onClick={() => {
                          audioFx.playPaper();
                          if (isSelected) {
                            if (ch.tool === 'sql') onOpenSchema();
                            else if (onOpenFileEditor) onOpenFileEditor();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => {
                              if (ch.tool === 'sql') onOpenSchema();
                              else if (onOpenFileEditor) onOpenFileEditor();
                            }, 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-400 hover:text-white hover:bg-[#2e1208] transition text-left border border-transparent hover:border-[#542010]"
                      >
                        <Database className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold font-typewriter block truncate">Suspect Records / DB</span>
                          <span className="text-[9px] text-stone-600">
                            {ch.tool === 'sql' ? 'Relational Schema' : 'Workspace Files'}
                          </span>
                        </div>
                      </button>

                      {/* Concept */}
                      <button
                        onClick={() => {
                          audioFx.playPaper();
                          if (isSelected) {
                            onOpenConcept();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => onOpenConcept(), 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-400 hover:text-white hover:bg-[#2e1208] transition text-left border border-transparent hover:border-[#542010]"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold font-typewriter block truncate">Investigative Method</span>
                          <span className="text-[9px] text-stone-600">Techniques &amp; Syntax</span>
                        </div>
                      </button>

                      {/* Hint */}
                      <button
                        onClick={() => {
                          audioFx.playClick();
                          if (isSelected) {
                            onOpenHint();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => onOpenHint(), 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-400 hover:text-white hover:bg-[#2e1208] transition text-left border border-transparent hover:border-[#542010]"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold font-typewriter block truncate">Informant Tip</span>
                          <span className="text-[9px] text-stone-600">Wiretap Hints</span>
                        </div>
                      </button>

                      {/* File Editor for git/docker */}
                      {(ch.tool === 'git' || ch.tool === 'docker') && onOpenFileEditor && (
                        <button
                          onClick={() => {
                            audioFx.playPaper();
                            if (!isSelected) onSelectChapter(ch.id);
                            onOpenFileEditor();
                          }}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-400 hover:text-white hover:bg-[#2e1208] transition text-left border border-transparent hover:border-[#542010]"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold font-typewriter block truncate">Workspace Files</span>
                            <span className="text-[9px] text-stone-600">Virtual File Editor</span>
                          </div>
                        </button>
                      )}

                      {/* Red string progress tracker */}
                      <div className="pt-2 border-t border-[#331508] mt-1">
                        <div className="flex items-center justify-between text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-2 font-typewriter">
                          <span>LEADS ON CASE:</span>
                          <span className="text-amber-500">{solvedCount}/{ch.puzzles.length} PURSUED</span>
                        </div>

                        <div className="relative flex items-center justify-between px-2 py-1.5">
                          {/* Red string line */}
                          <div className="absolute left-4 right-4 h-0.5 red-string z-0 top-1/2 -translate-y-1/2" />

                          {ch.puzzles.map((puz, pIdx) => {
                            const isActive = isSelected && pIdx === currentPuzzleIndex;
                            const isSolved = completedPuzzleIds.includes(puz.id);
                            return (
                              <button
                                key={puz.id}
                                onClick={() => {
                                  audioFx.playPaper();
                                  if (!isSelected) onSelectChapter(ch.id);
                                  onSelectPuzzleIndex(pIdx);
                                }}
                                className={`relative z-10 w-7 h-7 rounded font-typewriter text-xs font-bold transition-transform ${
                                  isActive
                                    ? 'bg-theme-scarlet text-white ring-4 ring-[#8f0e0e]/50 scale-110 shadow-lg'
                                    : isSolved
                                    ? 'bg-[#183a24] text-emerald-300 border border-emerald-600/70'
                                    : 'bg-[#1a0a05] text-stone-400 hover:bg-[#33150b] border border-[#42180e]'
                                }`}
                                title={`Lead ${pIdx + 1}: ${puz.title}`}
                              >
                                {isActive && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-black" />
                                )}
                                {pIdx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Handwritten note pinned in binder */}
          <div className="mx-2 mt-4 p-3 bg-[#fef9e7] border border-[#e8d88a] rounded shadow-md transform -rotate-1 relative">
            <div className="text-[8px] font-bold text-amber-700 font-typewriter uppercase tracking-widest mb-1.5">
              ★ INVESTIGATOR NOTES
            </div>
            <div className="handwritten-note text-[12px]">
              Check sender-account data — Vance connection!
            </div>
            <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#dc2626] shadow" />
          </div>
        </div>

        {/* === FOOTER: Audio toggle === */}
        <div className="p-3 border-t border-[#3d1f10] bg-[#110602] flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-stone-500 font-typewriter uppercase tracking-widest">
              PRECINCT 101
            </span>
            <button
              onClick={handleAudioToggle}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase font-typewriter transition border ${
                isMuted
                  ? 'bg-[#1e0a05] text-stone-600 border-[#3a1508]'
                  : 'bg-[#331508] text-amber-400 border-[#62280e]'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>AUDIO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
