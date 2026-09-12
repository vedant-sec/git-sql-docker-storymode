import React, { useState } from 'react';
import {
  FolderKanban,
  Archive,
  GraduationCap,
  Award,
  Bot,
  Settings,
  Coins,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Database,
  Lightbulb,
  HelpCircle,
  Folder,
  CheckCircle2,
  FileCode,
  Layers
} from 'lucide-react';
import { ChapterDefinition } from '../../types/game';

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
  // Track which season accordion is open (defaults to current chapter)
  const [expandedSeasonId, setExpandedSeasonId] = useState<string>(currentChapterId);

  const toggleSeason = (chId: string) => {
    if (expandedSeasonId === chId) {
      // already open, allow toggle or keep selected
      setExpandedSeasonId('');
    } else {
      setExpandedSeasonId(chId);
      onSelectChapter(chId);
    }
  };

  return (
    <aside className="w-64 h-full bg-[#14171f] text-slate-300 flex flex-col justify-between border-r border-[#222736] font-mono select-none flex-shrink-0">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#222736] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#242938] border border-slate-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-inner">
              SQL
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-slate-100 flex items-center space-x-1">
                <span>SQL Cases</span>
              </div>
              <div className="text-[10px] text-cyan-400 tracking-widest font-semibold uppercase">
                DETECTIVE
              </div>
            </div>
          </div>
          <button
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title="Toggle Sidebar"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Detective Profile Card */}
        <div className="mx-3 mt-3.5 mb-2.5 p-2.5 rounded-xl bg-[#1b202c] border border-[#272e3f] flex items-center space-x-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-amber-500 p-[1.5px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#14171f] flex items-center justify-center text-xs text-cyan-300 font-bold">
              👤
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-200 truncate">
              Dt. Arceus_101
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>2 active cases</span>
            </div>
          </div>
        </div>

        {/* SEASONS SECTION */}
        <div className="px-3 py-2">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1.5">
            SEASONS & CASES
          </div>

          <div className="space-y-1.5">
            {chapters.map((ch, chIdx) => {
              const seasonNum = chIdx + 1;
              const isSelected = ch.id === currentChapterId;
              const isExpanded = expandedSeasonId === ch.id;

              return (
                <div key={ch.id} className="rounded-xl overflow-hidden transition-colors">
                  {/* Season Button */}
                  <button
                    onClick={() => toggleSeason(ch.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-[#1b202c] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">Season {seasonNum}</span>
                      <span className="text-[10px] text-slate-500 font-normal truncate uppercase">
                        ({ch.tool})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {/* Branches: Schema, Concept Used, Hint */}
                  {isExpanded && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-700/60 ml-4 my-1">
                      {/* Branch 1: Schema */}
                      <button
                        onClick={() => {
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
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-[#1e2433] transition group text-left"
                      >
                        <Database className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition flex-shrink-0" />
                        <span className="truncate">Database Schema</span>
                      </button>

                      {/* Branch 2: Concept Used */}
                      <button
                        onClick={() => {
                          if (isSelected) {
                            onOpenConcept();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => onOpenConcept(), 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[11px] text-slate-300 hover:text-amber-300 hover:bg-[#1e2433] transition group text-left"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition flex-shrink-0" />
                        <span className="truncate">Concept Used</span>
                      </button>

                      {/* Branch 3: Hint */}
                      <button
                        onClick={() => {
                          if (isSelected) {
                            onOpenHint();
                          } else {
                            onSelectChapter(ch.id);
                            setTimeout(() => onOpenHint(), 100);
                          }
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[11px] text-slate-300 hover:text-emerald-300 hover:bg-[#1e2433] transition group text-left"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition flex-shrink-0" />
                        <span className="truncate">Forensic Hint</span>
                      </button>

                      {/* Optional Virtual Files if Git or Docker */}
                      {(ch.tool === 'git' || ch.tool === 'docker') && onOpenFileEditor && (
                        <button
                          onClick={() => {
                            if (!isSelected) onSelectChapter(ch.id);
                            onOpenFileEditor();
                          }}
                          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[11px] text-slate-300 hover:text-rose-300 hover:bg-[#1e2433] transition group text-left"
                        >
                          <FileCode className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition flex-shrink-0" />
                          <span className="truncate">Workspace Files</span>
                        </button>
                      )}

                      {/* Level Quick-Selector within Season */}
                      <div className="pt-1.5 pb-0.5 border-t border-slate-800/80 mt-1">
                        <div className="text-[9px] text-slate-500 font-bold uppercase px-2 mb-1">
                          Objectives:
                        </div>
                        <div className="flex flex-wrap gap-1 px-1">
                          {ch.puzzles.map((puz, pIdx) => {
                            const isPuzActive = isSelected && pIdx === currentPuzzleIndex;
                            const isPuzSolved = completedPuzzleIds.includes(puz.id);

                            return (
                              <button
                                key={puz.id}
                                onClick={() => {
                                  if (!isSelected) onSelectChapter(ch.id);
                                  onSelectPuzzleIndex(pIdx);
                                }}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition ${
                                  isPuzActive
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : isPuzSolved
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                                    : 'bg-[#1b202c] text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                                title={puz.title}
                              >
                                {isPuzSolved && !isPuzActive ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  pIdx + 1
                                )}
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

        {/* Secondary Detective Navigation Links from Screenshot */}
        <div className="px-3 py-2 border-t border-[#222736]/70 mt-1">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1.5">
            NAVIGATE
          </div>
          <nav className="space-y-1 text-xs">
            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Cases</div>
                <div className="text-[10px] text-slate-500 font-normal">Browse case files</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <Archive className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Case Vault</div>
                <div className="text-[10px] text-slate-500 font-normal">Classified Archives</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Academy</div>
                <div className="text-[10px] text-slate-500 font-normal">Training Manuals</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <Award className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Badges</div>
                <div className="text-[10px] text-slate-500 font-normal">View achievements</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <Bot className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">SQL Detective</div>
                <div className="text-[10px] text-slate-500 font-normal">AI Detective Assistant</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1b202c] hover:text-white transition text-left">
              <Settings className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Settings</div>
                <div className="text-[10px] text-slate-500 font-normal">Game settings</div>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Footer Section from Screenshot */}
      <div className="p-3 border-t border-[#222736] bg-[#0e1118]/80 text-xs">
        <div className="flex items-center justify-between text-slate-400 px-1 mb-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Coins className="w-4 h-4" />
            <span className="text-xs">20</span>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold tracking-wider">v2.0</span>
        </div>

        <button className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1b202c] transition text-xs font-semibold">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};

