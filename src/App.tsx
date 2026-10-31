import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  FileCode,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  Layers,
  Award,
  CornerDownLeft,
  Trash2,
  Info
} from 'lucide-react';

import { useGameStore } from './state/useGameStore';
import { globalSqlEngine } from './engine/sql/sqlEngine';
import { GitEngine } from './engine/git/gitEngine';
import { DockerEngine } from './engine/docker/dockerEngine';
import { TableSchema } from './types/sql';
import { ALL_CHAPTERS } from './data/chapters';
import { TerminalLogEntry } from './components/terminal/Terminal';
import { TableOutput } from './components/terminal/TableOutput';
import { SchemaModal } from './components/story/SchemaModal';
import { ConceptModal } from './components/story/ConceptModal';
import { HintDrawer } from './components/story/HintDrawer';
import { ClueDrawer } from './components/story/ClueDrawer';
import { TutorialModal } from './components/story/TutorialModal';
import { FileEditorModal } from './components/editor/FileEditorModal';
import { audioFx } from './utils/audioEffects';

// Parse ANSI colors for terminal output
function parseAnsi(text: string): React.ReactNode[] {
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);
  let currentColor = 'text-slate-200';

  return parts
    .map((part, idx) => {
      if (part === '\x1b[31m') { currentColor = 'text-rose-400'; return null; }
      if (part === '\x1b[32m') { currentColor = 'text-emerald-400'; return null; }
      if (part === '\x1b[33m') { currentColor = 'text-amber-400'; return null; }
      if (part === '\x1b[36m') { currentColor = 'text-cyan-400'; return null; }
      if (part === '\x1b[0m') { currentColor = 'text-slate-200'; return null; }
      return <span key={idx} className={currentColor}>{part}</span>;
    })
    .filter(Boolean) as React.ReactNode[];
}

export function App() {
  const {
    progress,
    currentChapter,
    currentPuzzle,
    setChapter,
    setPuzzleIndex,
    markPuzzleCompleted,
    unlockNextHint,
    resetProgress,
  } = useGameStore();

  // Modals
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isConceptOpen, setIsConceptOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isFileEditorOpen, setIsFileEditorOpen] = useState(false);

  // Audio state
  const [isMuted, setIsMuted] = useState(audioFx.isMuted());

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [inputCode, setInputCode] = useState(currentPuzzle.starterCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Engine state
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const gitEngineRef = useRef<GitEngine | null>(null);
  const dockerEngineRef = useRef<DockerEngine | null>(null);
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({});

  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll terminal on new outputs
  useEffect(() => {
    terminalScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Update input code when puzzle changes
  useEffect(() => {
    setInputCode(currentPuzzle.starterCode || '');
  }, [currentPuzzle.id]);

  // Initialize SQLite engine
  useEffect(() => {
    async function initSql() {
      try {
        await globalSqlEngine.init();
        setSchemas(globalSqlEngine.getSchema());
      } catch (err) {
        console.error('SQL Engine init failed:', err);
      }
    }
    initSql();
  }, []);

  // Initialize Chapter Engines
  useEffect(() => {
    if (currentChapter.tool === 'git') {
      const initFiles = currentChapter.initialFiles || {};
      setVirtualFiles({ ...initFiles });
      const recoveredHash = 'c7f912a';
      const git = new GitEngine({
        initialized: false,
        commits: {
          [recoveredHash]: {
            hash: recoveredHash,
            message: 'feat(exfil): update sftp credentials and routing payload',
            author: 'Marcus Vance <vance@nexus-internal.net>',
            date: '2026-09-11 02:28:14',
            parents: [],
            files: {
              'forensic_tracer.sh': initFiles['forensic_tracer.sh'] || '',
              'config.env': `EXFIL_SERVER="sftp://exfil.darknet-shadow.onion:9922"\nENCRYPTION_SALT="SHADOW_KEY_9921_PROD"\n`,
            },
          },
        },
        branches: { 'forensics/recovered-payload': recoveredHash },
        workingDirectory: { ...initFiles },
      });
      gitEngineRef.current = git;
    } else if (currentChapter.tool === 'docker') {
      const initFiles = currentChapter.initialFiles || {};
      setVirtualFiles({ ...initFiles });
      const docker = new DockerEngine(
        {
          images: {
            'alpine:3.19': {
              id: 'a1b2c3d4e5f6',
              repository: 'alpine',
              tag: '3.19',
              created: '2 weeks ago',
              size: '7.34MB',
              layers: [{ id: 'l1', instruction: 'FROM alpine:3.19', cached: true }],
              exposedPorts: [],
              env: {},
              cmd: ['/bin/sh'],
            },
            'shadow-proxy:v1': {
              id: '99e8d7c6b5a4',
              repository: 'shadow-proxy',
              tag: 'v1',
              created: '3 hours ago',
              size: '88.2MB',
              layers: [{ id: 'l2', instruction: 'FROM alpine:3.19', cached: true }],
              exposedPorts: [8080],
              env: {},
              cmd: ['/usr/bin/proxy'],
            },
          },
        },
        initFiles
      );
      dockerEngineRef.current = docker;
    }

    setTerminalLogs([
      {
        id: 'init-banner',
        type: 'system',
        text: `⚡ SYSTEM ONLINE // MISSION: ${currentChapter.title.toUpperCase()}\nTool Runtime Active: [${currentChapter.tool.toUpperCase()}]`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [currentChapter]);

  // Gamification Metrics
  const totalPuzzles = useMemo(
    () => ALL_CHAPTERS.reduce((sum, ch) => sum + ch.puzzles.length, 0),
    []
  );
  const solvedCount = progress.completedPuzzleIds.length;
  const xp = solvedCount * 250;
  const playerLevel = Math.min(3, Math.floor(solvedCount / 3) + 1);
  const levelNames = ['Novice Operator', 'Cyber Infiltrator', 'Master Sentinel'];
  const levelProgress = ((solvedCount % 4) / 4) * 100;

  const isCurrentPuzzleSolved = useMemo(
    () => progress.completedPuzzleIds.includes(currentPuzzle.id),
    [progress.completedPuzzleIds, currentPuzzle.id]
  );

  // Command Execution Handler
  const handleExecuteCommand = async (commandToRun: string) => {
    const trimmed = commandToRun.trim();
    if (!trimmed || isLoading) return;

    if (trimmed === 'clear') {
      setTerminalLogs([]);
      setInputCode('');
      return;
    }

    audioFx.playClick();
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const logId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toLocaleTimeString();

    setTerminalLogs(prev => [
      ...prev,
      { id: `input-${logId}`, type: 'input', command: trimmed, timestamp: now },
    ]);
    setIsLoading(true);

    try {
      if (currentChapter.tool === 'sql') {
        if (!globalSqlEngine.isReady()) {
          try {
            await globalSqlEngine.init();
            setSchemas(globalSqlEngine.getSchema());
          } catch (initErr: any) {
            audioFx.playGlitch();
            setTerminalLogs(prev => [
              ...prev,
              { id: `err-${logId}`, type: 'error', text: `SQL Init Error: ${initErr.message}`, timestamp: now },
            ]);
            setIsLoading(false);
            return;
          }
        }

        const queryResult = globalSqlEngine.executeQuery(trimmed);
        if (queryResult.error) {
          audioFx.playGlitch();
          setTerminalLogs(prev => [
            ...prev,
            { id: `err-${logId}`, type: 'error', text: queryResult.error || 'SQL Syntax Error', timestamp: now },
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            { id: `res-${logId}`, type: 'sql-result', sqlResult: queryResult, timestamp: now },
          ]);

          if (currentPuzzle.validate) {
            const validation = currentPuzzle.validate({ query: trimmed, result: queryResult });
            if (validation.isCorrect) {
              audioFx.playStamp();
              markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
              setTerminalLogs(prev => [
                ...prev,
                { id: `success-${logId}`, type: 'success', text: `🏆 [OBJECTIVE ACCOMPLISHED] +250 XP! ${validation.message || 'Evidence captured.'}`, timestamp: now },
              ]);
            }
          }
        }
      } else if (currentChapter.tool === 'git') {
        if (!gitEngineRef.current) return;
        const cmdResult = gitEngineRef.current.execute(trimmed);
        setVirtualFiles(gitEngineRef.current.getState().workingDirectory);

        if (cmdResult.error) {
          audioFx.playGlitch();
        }

        setTerminalLogs(prev => [
          ...prev,
          {
            id: `git-${logId}`,
            type: cmdResult.error ? 'error' : 'output',
            text: cmdResult.output || (cmdResult.error ? 'Error executing git command' : ''),
            timestamp: now,
          },
        ]);

        if (currentPuzzle.validate) {
          const validation = currentPuzzle.validate({
            command: trimmed,
            args: trimmed.split(' '),
            result: cmdResult,
            state: gitEngineRef.current.getState(),
          });
          if (validation.isCorrect) {
            audioFx.playStamp();
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              { id: `success-${logId}`, type: 'success', text: `🏆 [OBJECTIVE ACCOMPLISHED] +250 XP! ${validation.message || 'Git state verified.'}`, timestamp: now },
            ]);
          }
        }
      } else if (currentChapter.tool === 'docker') {
        if (!dockerEngineRef.current) return;
        const cmdResult = dockerEngineRef.current.execute(trimmed);

        if (cmdResult.error) {
          audioFx.playGlitch();
        }

        setTerminalLogs(prev => [
          ...prev,
          {
            id: `docker-${logId}`,
            type: cmdResult.error ? 'error' : 'output',
            text: cmdResult.output || (cmdResult.error ? 'Error executing docker command' : ''),
            timestamp: now,
          },
        ]);

        if (currentPuzzle.validate) {
          const validation = currentPuzzle.validate({
            command: trimmed,
            args: trimmed.split(' '),
            result: cmdResult,
            state: dockerEngineRef.current.getState(),
          });
          if (validation.isCorrect) {
            audioFx.playStamp();
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              { id: `success-${logId}`, type: 'success', text: `🏆 [OBJECTIVE ACCOMPLISHED] +250 XP! ${validation.message || 'Docker containers verified.'}`, timestamp: now },
            ]);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteCommand(inputCode);
      return;
    }

    if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      e.preventDefault();
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputCode(history[nextIdx] || '');
      return;
    }

    if (e.key === 'ArrowDown') {
      if (historyIdx === -1) return;
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputCode(history[nextIdx] || '');
      } else {
        setHistoryIdx(-1);
        setInputCode('');
      }
      return;
    }
  };

  const handleSaveFile = (fileName: string, content: string) => {
    setVirtualFiles(prev => ({ ...prev, [fileName]: content }));
    if (currentChapter.tool === 'git' && gitEngineRef.current) {
      gitEngineRef.current.setWorkingFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        { id: `edit-${Date.now()}`, type: 'system', text: `[FILE SYSTEM] Updated '${fileName}' in repo.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    } else if (currentChapter.tool === 'docker' && dockerEngineRef.current) {
      dockerEngineRef.current.setVirtualFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        { id: `edit-${Date.now()}`, type: 'system', text: `[BUILD CONTEXT] Updated '${fileName}'.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const toggleAudio = () => {
    const muted = audioFx.toggleMute();
    setIsMuted(muted);
    if (!muted) audioFx.playClick();
  };

  const currentChapterIndex = ALL_CHAPTERS.findIndex(c => c.id === currentChapter.id);

  return (
    <div className="cyber-grid-bg w-screen h-screen flex flex-col text-slate-100 overflow-hidden font-sans select-none">
      {/* ============================================================
          TOP GAME HUD HEADER
         ============================================================ */}
      <header className="h-16 px-6 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0 z-20">
        {/* Game Title & Stage Pills */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Zap size={20} className="fill-current" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-cyan-400">
                ROOT_ACCESS
              </div>
              <div className="text-sm font-black text-white tracking-wide">
                OPERATION CYBER OPS
              </div>
            </div>
          </div>

          {/* Stage Selector Tabs */}
          <div className="hidden lg:flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 gap-1">
            {ALL_CHAPTERS.map((ch, idx) => {
              const isActive = currentChapter.id === ch.id;
              const chSolvedCount = ch.puzzles.filter(p => progress.completedPuzzleIds.includes(p.id)).length;
              const isAllSolved = chSolvedCount === ch.puzzles.length;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    audioFx.playClick();
                    setChapter(ch.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>STAGE {idx + 1}: {ch.tool.toUpperCase()}</span>
                  {isAllSolved && <CheckCircle2 size={13} className="text-emerald-400 fill-emerald-950" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Stats & Controls */}
        <div className="flex items-center gap-4">
          {/* Level & XP Bar */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">RANK:</span>
              <span className="text-cyan-300 font-bold">LVL {playerLevel} {levelNames[playerLevel - 1]}</span>
              <span className="text-amber-400 font-bold ml-1">⭐ {xp} XP</span>
            </div>
            <div className="w-36 h-2 xp-bar-track">
              <div className="h-full xp-bar-fill" style={{ width: `${Math.max(10, levelProgress)}%` }} />
            </div>
          </div>

          {/* Inventory Clues Button */}
          <button
            onClick={() => {
              audioFx.playClick();
              setIsCluesOpen(true);
            }}
            className="btn-cyber-ghost px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            title="Collected Forensic Loot"
          >
            <Award size={15} className="text-purple-400" />
            <span>INTEL ({progress.collectedClues.length})</span>
          </button>

          {/* Database Schema Button (SQL) */}
          {currentChapter.tool === 'sql' && (
            <button
              onClick={() => {
                audioFx.playClick();
                setIsSchemaOpen(true);
              }}
              className="btn-cyber-ghost px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              title="Database Tables"
            >
              <Database size={15} className="text-cyan-400" />
              <span>SCHEMA</span>
            </button>
          )}

          {/* Workspace Files Button (Git/Docker) */}
          {(currentChapter.tool === 'git' || currentChapter.tool === 'docker') && (
            <button
              onClick={() => {
                audioFx.playClick();
                setIsFileEditorOpen(true);
              }}
              className="btn-cyber-ghost px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              title="Virtual Files"
            >
              <FileCode size={15} className="text-amber-400" />
              <span>FILES</span>
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className="p-2 text-slate-400 hover:text-cyan-400 transition"
            title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Reset Progress */}
          <button
            onClick={() => {
              if (window.confirm('Reset all mission progress, collected clues, and restart?')) {
                resetProgress();
              }
            }}
            className="p-2 text-slate-500 hover:text-rose-400 transition"
            title="Reset Game Progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* ============================================================
          MISSION NODE PROGRESS TRACK (Level Sub-Path)
         ============================================================ */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-cyan-400" />
            <span>MISSIONS:</span>
          </span>

          <div className="flex items-center gap-2">
            {currentChapter.puzzles.map((p, idx) => {
              const isSelected = progress.currentPuzzleIndex === idx;
              const isSolved = progress.completedPuzzleIds.includes(p.id);

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    audioFx.playClick();
                    setPuzzleIndex(idx);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : isSolved
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <span>{currentChapter.number}.{idx + 1}</span>
                  {isSolved ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : isSelected ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>COMPLETION:</span>
          <span className="text-cyan-300 font-bold">{solvedCount} / {totalPuzzles}</span>
        </div>
      </div>

      {/* ============================================================
          MAIN COCKPIT: 2-COLUMN SIMPLIFIED GAME LAYOUT
         ============================================================ */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* ============================================================
            LEFT COLUMN: MISSION CONTROL & BRIEFING
           ============================================================ */}
        <section className="w-full md:w-[42%] flex flex-col gap-3 overflow-hidden">
          <div className="cyber-card rounded-2xl p-5 flex-1 flex flex-col overflow-y-auto space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  {currentChapter.subtitle}
                </span>
                <h2 className="text-base font-black text-white mt-1.5">
                  {currentPuzzle.title}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  isCurrentPuzzleSolved
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {isCurrentPuzzleSolved ? 'SOLVED ✓' : 'ACTIVE OBJECTIVE'}
                </span>
                <span className="text-[10px] text-amber-400 font-mono mt-1 font-bold">+250 XP REWARD</span>
              </div>
            </div>

            {/* Narrative Story Dialogue Bubble */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Shield size={13} className="text-cyan-400" />
                  <span>COMM CHANNEL // CHIEF ELENA RAMOS</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentPuzzle.description}
              </p>
            </div>

            {/* Mission Objective Box */}
            <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-3.5 space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} />
                <span>MISSION DIRECTIVE:</span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {currentPuzzle.objective}
              </p>
            </div>

            {/* Code Suggestion & Fast Action Deck */}
            {currentPuzzle.starterCode && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    Suggested Command:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playClick();
                        setInputCode(currentPuzzle.starterCode || '');
                        terminalInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition"
                    >
                      ⚡ Auto-Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteCommand(currentPuzzle.starterCode || '')}
                      disabled={isLoading}
                      className="btn-cyber-primary px-3 py-1 text-xs font-bold flex items-center gap-1"
                    >
                      <Play size={11} className="fill-current" />
                      <span>Run Direct</span>
                    </button>
                  </div>
                </div>

                <pre className="bg-slate-900/90 text-cyan-300 p-2.5 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800 selection:bg-cyan-800">
                  {currentPuzzle.starterCode}
                </pre>
              </div>
            )}

            {/* Helper Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 mt-auto">
              <button
                onClick={() => {
                  audioFx.playClick();
                  setIsHintsOpen(true);
                }}
                className="btn-cyber-ghost p-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <HelpCircle size={14} className="text-amber-400" />
                <span>Intel Hints</span>
              </button>

              <button
                onClick={() => {
                  audioFx.playClick();
                  setIsConceptOpen(true);
                }}
                className="btn-cyber-ghost p-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <BookOpen size={14} className="text-cyan-400" />
                <span>Concept Guide</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            RIGHT COLUMN: CYBER TERMINAL CONSOLE
           ============================================================ */}
        <section className="w-full md:w-[58%] flex flex-col gap-3 overflow-hidden">
          <div className="cyber-terminal rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="h-11 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <TerminalIcon size={16} className="text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  TERMINAL CONSOLE // {currentChapter.tool.toUpperCase()} RUNTIME
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTerminalLogs([])}
                  className="text-slate-400 hover:text-cyan-400 text-xs font-mono flex items-center gap-1 transition"
                  title="Clear Screen"
                >
                  <Trash2 size={12} /> CLEAR
                </button>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-mono text-emerald-400 font-bold">READY</span>
              </div>
            </div>

            {/* Output Screen */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 leading-relaxed">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-500 py-6 text-center">
                  <div>&gt; TERMINAL READY FOR INPUT</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Execute SQLite queries, Git actions, or Docker commands below.
                  </div>
                </div>
              ) : (
                terminalLogs.map(log => (
                  <div key={log.id} className="text-xs">
                    {log.type === 'input' && (
                      <div className="text-cyan-300 font-bold flex items-center gap-1.5 my-1">
                        <span className="text-cyan-500">&gt;</span>
                        <span>{log.command}</span>
                      </div>
                    )}
                    {log.type === 'output' && (
                      <div className="whitespace-pre-wrap text-slate-300 py-0.5">
                        {parseAnsi(log.text || '')}
                      </div>
                    )}
                    {log.type === 'error' && (
                      <div className="text-rose-400 font-bold bg-rose-950/30 border border-rose-900/50 p-2 rounded-lg my-1">
                        ERROR: {log.text}
                      </div>
                    )}
                    {log.type === 'success' && (
                      <div className="text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-xl my-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                        <span>{log.text}</span>
                      </div>
                    )}
                    {log.type === 'system' && (
                      <div className="text-slate-500 text-[11px]">
                        [{log.timestamp}] {log.text}
                      </div>
                    )}
                    {log.type === 'sql-result' && log.sqlResult && (
                      <div className="my-2">
                        <TableOutput
                          columns={log.sqlResult.columns}
                          values={log.sqlResult.values}
                          executionTimeMs={log.sqlResult.executionTimeMs}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={terminalScrollRef} />
            </div>

            {/* Input Cockpit */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
              <div className="flex items-start gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 focus-within:border-cyan-500/60 transition">
                <span className="text-cyan-400 font-mono text-xs pt-0.5 font-bold">&gt;</span>
                <textarea
                  ref={terminalInputRef}
                  rows={2}
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Enter ${currentChapter.tool.toUpperCase()} command... (Press Enter to execute, Shift+Enter for newline)`}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-100 placeholder-slate-600 resize-none leading-relaxed"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => handleExecuteCommand(inputCode)}
                  disabled={isLoading || !inputCode.trim()}
                  className="btn-cyber-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 self-end disabled:opacity-40"
                >
                  <span>EXECUTE</span>
                  <CornerDownLeft size={13} />
                </button>
              </div>

              {/* Navigation & Controls Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>History: <kbd className="px-1 py-0.5 bg-slate-800 rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded">↓</kbd></span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (progress.currentPuzzleIndex > 0) {
                        audioFx.playClick();
                        setPuzzleIndex(progress.currentPuzzleIndex - 1);
                      }
                    }}
                    disabled={progress.currentPuzzleIndex === 0}
                    className="hover:text-cyan-400 disabled:opacity-30 flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> Prev Lead
                  </button>
                  <button
                    onClick={() => {
                      if (progress.currentPuzzleIndex < currentChapter.puzzles.length - 1) {
                        audioFx.playClick();
                        setPuzzleIndex(progress.currentPuzzleIndex + 1);
                      } else if (currentChapterIndex < ALL_CHAPTERS.length - 1) {
                        audioFx.playClick();
                        setChapter(ALL_CHAPTERS[currentChapterIndex + 1].id);
                      }
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    Next Lead <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          GAME MODALS
         ============================================================ */}
      <SchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
        schemas={schemas}
      />

      <ConceptModal
        isOpen={isConceptOpen}
        onClose={() => setIsConceptOpen(false)}
        concept={currentPuzzle.concept}
        seasonTitle={`${currentChapter.title} CONCEPT`}
      />

      <HintDrawer
        isOpen={isHintsOpen}
        onClose={() => setIsHintsOpen(false)}
        puzzle={currentPuzzle}
        unlockedTier={progress.unlockedHintTiers[currentPuzzle.id] || 0}
        onUnlockNextTier={() => unlockNextHint(currentPuzzle.id)}
      />

      <ClueDrawer
        isOpen={isCluesOpen}
        onClose={() => setIsCluesOpen(false)}
        clues={progress.collectedClues}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        chapter={currentChapter}
      />

      <FileEditorModal
        isOpen={isFileEditorOpen}
        onClose={() => setIsFileEditorOpen(false)}
        files={virtualFiles}
        onSaveFile={handleSaveFile}
      />
    </div>
  );
}

export default App;
