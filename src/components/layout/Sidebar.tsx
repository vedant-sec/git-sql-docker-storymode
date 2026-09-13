import React, { useState } from 'react';
import {
  FolderKanban,
  Archive,
  GraduationCap,
  Award,
  Bot,
  Settings,
  Coins,
  ChevronDown,
  ChevronRight,
  Database,
  Lightbulb,
  FileCode,
  Fingerprint,
  Radio,
  Volume2,
  VolumeX,
  FileSearch,
  ShieldCheck,
  Paperclip
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
  tool
}) => {
  const [expandedSeasonId, setExpandedSeasonId] = useState<string>(currentChapterId);
  const [isMuted, setIsMuted] = useState<boolean>(audioFx.isMuted());

  const toggleSeason = (chId: string) => {
    audioFx.playPaper();
    if (expandedSeasonId === chId) {
      setExpandedSeasonId('');
    } else {
      setExpandedSeasonId(chId);
      onSelectChapter(chId);
    }
  };

  const handleAudioToggle = () => {
    const nextMuted = audioFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioFx.playClick();
    }
  };

  return (
    <aside className="w-72 h-full bg-black text-slate-300 flex flex-col justify-between border-r border-[#241414] font-mono select-none flex-shrink-0 relative shadow-2xl z-30">
      {/* Decorative Binder Rings on Left Edge */}
      <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-around pointer-events-none z-40 opacity-40">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-7 rounded-sm bg-gradient-to-r from-stone-400 via-stone-200 to-stone-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.9)] border border-stone-800"
          />
        ))}
      </div>

      {/* Main Dossier Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pl-4 pr-1">
        {/* Binder Header / Precinct Stamp */}
        <div className="p-4 border-b border-[#241414] bg-gradient-to-b from-[#140808] to-black">
          <div className="flex items-center justify-between mb-2">
            <span className="rubber-stamp text-[9px] px-1.5 py-0.5 tracking-widest text-[#d93e3e] border-[#d93e3e]">
              TOP SECRET // EYES ONLY
            </span>
            <span className="text-[10px] text-stone-500 font-bold font-typewriter">
              ARCHIVE REF #9921-X
            </span>
          </div>

          <div className="flex items-center space-x-2.5 mt-2">
            <div className="w-9 h-9 rounded bg-[#1f0d0d] border border-[#4a1c1c] flex items-center justify-center text-theme-scarlet shadow-inner">
              <Fingerprint className="w-5 h-5 text-theme-scarlet" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-stone-100 font-typewriter uppercase">
                CRIMINAL DOSSIER
              </div>
              <div className="text-[10px] text-theme-scarlet tracking-widest font-bold uppercase flex items-center space-x-1">
                <span>CASE BINDER v4.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detective Credential Badge */}
        <div className="mx-2 mt-3 mb-3 p-3 rounded-lg bg-[#140a0a] border border-[#2e1414] shadow-md relative overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-black border border-[#4a1c1c] flex items-center justify-center relative">
              <span className="text-xs">🕵️‍♂️</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider font-typewriter">
                  FIELD AGENT
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">
                  WARRANT ACTIVE
                </span>
              </div>
              <div className="text-xs font-bold text-stone-200 truncate font-typewriter">
                Dt. Arceus_101
              </div>
            </div>
          </div>
        </div>

        {/* DOSSIER CASE BINDER TABS */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-typewriter flex items-center space-x-1">
              <Paperclip className="w-3 h-3 text-stone-500" />
              <span>ACTIVE CASE DOSSIERS</span>
            </span>
            <span className="text-[9px] text-stone-600 font-mono">
              {chapters.length} FILES
            </span>
          </div>

          <div className="space-y-2">
            {chapters.map((ch, chIdx) => {
              const seasonNum = chIdx + 1;
              const isSelected = ch.id === currentChapterId;
              const isExpanded = expandedSeasonId === ch.id;
              const solvedCount = ch.puzzles.filter(p => completedPuzzleIds.includes(p.id)).length;
              const isChapterComplete = solvedCount === ch.puzzles.length;

              return (
                <div
                  key={ch.id}
                  className={`rounded-lg transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#180c0c] border-[#5a1a1a] shadow-lg shadow-black/60'
                      : 'bg-[#0f0707] border-[#241010] hover:border-[#3d1818]'
                  }`}
                >
                  {/* Physical Manila Tab Header */}
                  <button
                    onClick={() => toggleSeason(ch.id)}
                    className="w-full flex items-center justify-between p-2.5 text-xs text-left group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {/* Manila Tab Badge */}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded font-typewriter tracking-wide uppercase transition ${
                          isSelected
                            ? 'bg-theme-scarlet text-white shadow-sm'
                            : isChapterComplete
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-[#261010] text-stone-400'
                        }`}
                      >
                        CASE_S0{seasonNum}
                      </span>
                      <div className="truncate">
                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                          {ch.title}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate uppercase">
                          [{ch.tool} TOOLKIT]
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isChapterComplete && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-theme-scarlet" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300" />
                      )}
                    </div>
                  </button>

                  {/* Dossier Investigation Branches */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[#291313] bg-black/40">
                      {/* Branch 1: Crime Scene Records (Schema) */}
                      <button
                        onClick={() => {
                          audioFx.playPaper();
                          if (isSelected) {
                            if (tool === 'sql') onOpenSchema();
                            else if (onOpenFileEditor) onOpenFileEditor();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => {
                              if (ch.tool === 'sql') onOpenSchema();
                              else if (onOpenFileEditor) onOpenFileEditor();
                            }, 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#261111] transition group text-left border border-transparent hover:border-[#4d1c1c]"
                      >
                        <Database className="w-3.5 h-3.5 text-theme-scarlet group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold">Crime Scene Records</span>
                          <span className="text-[9px] text-stone-500 block">
                            {ch.tool === 'sql' ? 'Relational Schema & Tables' : 'Workspace Files'}
                          </span>
                        </div>
                      </button>

                      {/* Branch 2: Forensic Methodology (Concept) */}
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
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#261111] transition group text-left border border-transparent hover:border-[#4d1c1c]"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold">Forensic Methodology</span>
                          <span className="text-[9px] text-stone-500 block">
                            Investigative Techniques & Code
                          </span>
                        </div>
                      </button>

                      {/* Branch 3: Wiretap Intel (Hint) */}
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
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#261111] transition group text-left border border-transparent hover:border-[#4d1c1c]"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold">Wiretap Intel</span>
                          <span className="text-[9px] text-stone-500 block">
                            Confidential Informant Intercept
                          </span>
                        </div>
                      </button>

                      {/* Optional Virtual Files if Git/Docker */}
                      {(ch.tool === 'git' || ch.tool === 'docker') && onOpenFileEditor && (
                        <button
                          onClick={() => {
                            audioFx.playPaper();
                            if (!isSelected) onSelectChapter(ch.id);
                            onOpenFileEditor();
                          }}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#261111] transition group text-left border border-transparent hover:border-[#4d1c1c]"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-bold">Exfiltrated Files</span>
                            <span className="text-[9px] text-stone-500 block">
                              Virtual Workspace Editor
                            </span>
                          </div>
                        </button>
                      )}

                      {/* CORKBOARD RED STRING PROGRESS TRACKER */}
                      <div className="pt-2 pb-1 border-t border-[#291313] mt-2">
                        <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 font-typewriter">
                          <span>EVIDENCE CHAIN:</span>
                          <span className="text-theme-scarlet">
                            {solvedCount}/{ch.puzzles.length} SECURED
                          </span>
                        </div>

                        {/* Red String Line with Pinned Evidence Tags */}
                        <div className="relative flex items-center justify-between px-2 py-1.5">
                          {/* Crimson Yarn / Red String */}
                          <div className="absolute left-4 right-4 h-0.5 red-string-line z-0 top-1/2 -translate-y-1/2" />

                          {ch.puzzles.map((puz, pIdx) => {
                            const isPuzActive = isSelected && pIdx === currentPuzzleIndex;
                            const isPuzSolved = completedPuzzleIds.includes(puz.id);

                            return (
                              <button
                                key={puz.id}
                                onClick={() => {
                                  audioFx.playPaper();
                                  if (!isSelected) onSelectChapter(ch.id);
                                  onSelectPuzzleIndex(pIdx);
                                }}
                                className={`relative z-10 w-7 h-7 rounded flex items-center justify-center font-typewriter text-xs font-bold transition-transform duration-200 ${
                                  isPuzActive
                                    ? 'bg-theme-scarlet text-white ring-4 ring-[#8f0e0e]/50 scale-110 shadow-lg'
                                    : isPuzSolved
                                    ? 'bg-[#183a24] text-emerald-300 border border-emerald-500/70 shadow-sm'
                                    : 'bg-[#1e1010] text-stone-400 hover:bg-[#381818] hover:text-white border border-[#3d1919]'
                                }`}
                                title={`Lead ${pIdx + 1}: ${puz.title}`}
                              >
                                {/* Brass Push-Pin in Active Element */}
                                {isPuzActive && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-black shadow" />
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
        </div>

        {/* SECONDARY POLICE ARCHIVE NAVIGATION */}
        <div className="px-2 py-2 border-t border-[#241414] mt-2">
          <div className="text-[10px] font-bold text-stone-500 tracking-wider uppercase px-2 mb-1.5 font-typewriter">
            PRECINCT ARCHIVES
          </div>
          <nav className="space-y-1 text-xs">
            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <FolderKanban className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200">Incident Registry</div>
                <div className="text-[10px] text-stone-500">Historical records</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <Archive className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200">Classified Vault</div>
                <div className="text-[10px] text-stone-500">Sealed exhibits</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <GraduationCap className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200">Forensic Academy</div>
                <div className="text-[10px] text-stone-500">Standard operating guidelines</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <Award className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200">Commendations</div>
                <div className="text-[10px] text-stone-500">Solved case badges</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <Bot className="w-4 h-4 text-theme-scarlet" />
              <div>
                <div className="font-semibold text-stone-200">AI Forensic Profiler</div>
                <div className="text-[10px] text-stone-500">Tactical neural assistant</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#1f0e0e] hover:text-white transition text-left">
              <Settings className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200">Station Settings</div>
                <div className="text-[10px] text-stone-500">System configuration</div>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* FOOTER: Audio FX & Classified Clearance */}
      <div className="p-3 border-t border-[#241414] bg-[#0c0505] text-xs">
        <div className="flex items-center justify-between text-stone-400 px-1 mb-2">
          <div className="flex items-center space-x-1.5 text-theme-scarlet font-bold">
            <Coins className="w-4 h-4" />
            <span className="text-xs">20 CREDITS</span>
          </div>

          {/* Sound FX Toggle Button */}
          <button
            onClick={handleAudioToggle}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition border ${
              isMuted
                ? 'bg-[#1c0d0d] text-stone-500 border-[#331515]'
                : 'bg-[#291010] text-theme-scarlet border-[#591b1b]'
            }`}
            title={isMuted ? 'Unmute Audio Effects' : 'Mute Audio Effects'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3 h-3" />
                <span>MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span>AUDIO FX</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[9px] text-center text-stone-600 font-typewriter pt-1 uppercase">
          SECURE CASE LOG // DEPT OF JUSTICE
        </div>
      </div>
    </aside>
  );
};
