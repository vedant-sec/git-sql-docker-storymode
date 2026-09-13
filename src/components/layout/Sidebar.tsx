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
  ShieldCheck,
  Paperclip,
  Bookmark
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

const TAB_ROTATIONS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];

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
    <aside className="w-76 h-full leather-binder text-stone-300 flex flex-col justify-between font-mono select-none flex-shrink-0 relative shadow-2xl z-30">
      {/* Decorative Brass Spine Eyelets on Left Edge */}
      <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-around pointer-events-none z-40 opacity-50">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-8 rounded-sm bg-gradient-to-r from-stone-600 via-amber-200 to-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.9)] border border-stone-900"
          />
        ))}
      </div>

      {/* Main Leather Binder Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pl-4 pr-1">
        {/* Leather Binder Header / Foil Stamped Emblem */}
        <div className="p-4 border-b border-[#3d1f14] bg-gradient-to-b from-[#2a130a] to-[#1a0c06]">
          <div className="flex items-center justify-between mb-2">
            <span className="rubber-stamp text-[8.5px] px-1.5 py-0.2 tracking-widest text-[#d93e3e] border-[#d93e3e]">
              CONFIDENTIAL DOSSIER
            </span>
            <span className="text-[9px] text-amber-500/70 font-bold font-typewriter">
              REGISTRY #409-X
            </span>
          </div>

          <div className="flex items-center space-x-2.5 mt-2">
            <div className="w-9 h-9 rounded-md bg-[#160904] border border-[#522514] flex items-center justify-center text-amber-500 shadow-inner">
              <Fingerprint className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-stone-100 font-typewriter uppercase">
                CASE INVESTIGATION BINDER
              </div>
              <div className="text-[9.5px] text-amber-400 tracking-widest font-bold uppercase flex items-center space-x-1">
                <span>METROPOLITAN CRIME ARCHIVES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investigator ID Card Pinned in Binder */}
        <div className="mx-2 mt-3 mb-3 p-3 rounded-lg bg-[#140804] border border-[#3d1c10] shadow-md relative overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#0a0402] border border-[#522514] flex items-center justify-center relative">
              <span className="text-xs">🕵️‍♂️</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-typewriter">
                  ACTIVE INVESTIGATOR
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">
                  ACTIVE WARRANT
                </span>
              </div>
              <div className="text-xs font-bold text-stone-100 truncate font-typewriter">
                Dt. Arceus_101
              </div>
            </div>
          </div>
        </div>

        {/* CASE DOSSIERS WITH PROTRUDING PAPER INDEX TABS */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between px-2 mb-2.5">
            <span className="text-[9.5px] font-bold text-amber-400/90 tracking-widest uppercase font-typewriter flex items-center space-x-1">
              <Bookmark className="w-3 h-3 text-amber-500" />
              <span>CASE INDEX TABS</span>
            </span>
            <span className="text-[9px] text-stone-500 font-mono">
              {chapters.length} SEASONS
            </span>
          </div>

          <div className="space-y-2.5">
            {chapters.map((ch, chIdx) => {
              const seasonNum = chIdx + 1;
              const isSelected = ch.id === currentChapterId;
              const isExpanded = expandedSeasonId === ch.id;
              const solvedCount = ch.puzzles.filter(p => completedPuzzleIds.includes(p.id)).length;
              const isChapterComplete = solvedCount === ch.puzzles.length;
              const rotationClass = TAB_ROTATIONS[chIdx % TAB_ROTATIONS.length];

              return (
                <div
                  key={ch.id}
                  className={`rounded-lg transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#1b0c06] border-[#6b2e16] shadow-xl shadow-black/80'
                      : 'bg-[#120703] border-[#2e140b] hover:border-[#4d2212]'
                  }`}
                >
                  {/* Protruding Paper Index Tab Header */}
                  <button
                    onClick={() => toggleSeason(ch.id)}
                    className="w-full flex items-center justify-between p-2 text-xs text-left group relative"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {/* Protruding Physical Paper Tab with Hand-Placed Rotation Angle */}
                      <div
                        className={`text-[10px] font-black px-2 py-0.5 font-typewriter tracking-wider uppercase transition-transform transform shadow-md ${rotationClass} ${
                          isSelected
                            ? 'index-tab-active scale-105'
                            : isChapterComplete
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'index-tab-paper'
                        }`}
                      >
                        CASE_S0{seasonNum}
                      </div>
                      <div className="truncate">
                        <div className={`text-xs font-bold truncate font-typewriter ${isSelected ? 'text-amber-200' : 'text-stone-300'}`}>
                          {ch.title}
                        </div>
                        <div className="text-[9px] text-stone-500 truncate uppercase">
                          [{ch.tool} TOOLKIT]
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isChapterComplete && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300" />
                      )}
                    </div>
                  </button>

                  {/* Case Docket Investigation Branches */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[#33150b] bg-black/40">
                      {/* Branch 1: Suspect Records / Crime Scene Database */}
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
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#2e150c] transition group text-left border border-transparent hover:border-[#542514]"
                      >
                        <Database className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold font-typewriter">Suspect Records / Crime Scene DB</span>
                          <span className="text-[9px] text-stone-500 block">
                            {ch.tool === 'sql' ? 'Relational Schema & Tables' : 'Workspace Files'}
                          </span>
                        </div>
                      </button>

                      {/* Branch 2: Investigative Methodology */}
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
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#2e150c] transition group text-left border border-transparent hover:border-[#542514]"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold font-typewriter">Investigative Methodology</span>
                          <span className="text-[9px] text-stone-500 block">
                            Techniques & Syntax Rules
                          </span>
                        </div>
                      </button>

                      {/* Branch 3: Informant Tip / Wiretap Hint */}
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
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#2e150c] transition group text-left border border-transparent hover:border-[#542514]"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-bold font-typewriter">Informant Tip / Wiretap Hint</span>
                          <span className="text-[9px] text-stone-500 block">
                            Decrypted Informant Transcripts
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
                          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-[11px] text-stone-300 hover:text-white hover:bg-[#2e150c] transition group text-left border border-transparent hover:border-[#542514]"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-bold font-typewriter">Exfiltrated Workspace Files</span>
                            <span className="text-[9px] text-stone-500 block">
                              Virtual Workspace Editor
                            </span>
                          </div>
                        </button>
                      )}

                      {/* CORKBOARD RED STRING EVIDENCE PROGRESS TRACKER */}
                      <div className="pt-2 pb-1 border-t border-[#33150b] mt-2">
                        <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 font-typewriter">
                          <span>LEADS ON CASE:</span>
                          <span className="text-amber-400">
                            {solvedCount}/{ch.puzzles.length} PURSUED
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
                                    : 'bg-[#1a0a05] text-stone-400 hover:bg-[#33150b] hover:text-white border border-[#421b0e]'
                                }`}
                                title={`Pursue Lead ${pIdx + 1}: ${puz.title}`}
                              >
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
        <div className="px-2 py-2 border-t border-[#3d1f14] mt-2">
          <div className="text-[9.5px] font-bold text-amber-500/80 tracking-wider uppercase px-2 mb-1.5 font-typewriter">
            PRECINCT ARCHIVES
          </div>
          <nav className="space-y-1 text-xs">
            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <FolderKanban className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">Incident Registry</div>
                <div className="text-[9.5px] text-stone-500">Historical case records</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <Archive className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">Classified Vault</div>
                <div className="text-[9.5px] text-stone-500">Sealed evidence exhibits</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <GraduationCap className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">Forensic Academy</div>
                <div className="text-[9.5px] text-stone-500">Standard operating manuals</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <Award className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">Commendations</div>
                <div className="text-[9.5px] text-stone-500">Solved case badges</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <Bot className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">AI Forensic Profiler</div>
                <div className="text-[9.5px] text-stone-500">Investigative neural engine</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-stone-300 hover:bg-[#2b140b] hover:text-white transition text-left">
              <Settings className="w-4 h-4 text-stone-400" />
              <div>
                <div className="font-semibold text-stone-200 font-typewriter">Desk Settings</div>
                <div className="text-[9.5px] text-stone-500">Station configuration</div>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* FOOTER: Audio Effects Toggle */}
      <div className="p-3 border-t border-[#3d1f14] bg-[#120703] text-xs">
        <div className="flex items-center justify-between text-stone-400 px-1 mb-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold font-typewriter">
            <Coins className="w-4 h-4" />
            <span className="text-xs">20 CREDITS</span>
          </div>

          {/* Sound FX Toggle Button */}
          <button
            onClick={handleAudioToggle}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition border ${
              isMuted
                ? 'bg-[#200d07] text-stone-500 border-[#3d1a0e]'
                : 'bg-[#33150b] text-amber-400 border-[#662c17]'
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

        <div className="text-[8.5px] text-center text-stone-500 font-typewriter pt-1 uppercase">
          LEATHER CASE BINDER // PRECINCT 101
        </div>
      </div>
    </aside>
  );
};
