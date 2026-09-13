import { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Shield, RotateCcw, ArrowLeft } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { ProblemCard } from './components/story/ProblemCard';
import { Terminal, TerminalLogEntry } from './components/terminal/Terminal';
import { ClueDrawer } from './components/story/ClueDrawer';
import { HintDrawer } from './components/story/HintDrawer';
import { SchemaModal } from './components/story/SchemaModal';
import { ConceptModal } from './components/story/ConceptModal';
import { TutorialModal } from './components/story/TutorialModal';
import { FileEditorModal } from './components/editor/FileEditorModal';
import { useGameStore } from './state/useGameStore';
import { globalSqlEngine } from './engine/sql/sqlEngine';
import { GitEngine } from './engine/git/gitEngine';
import { DockerEngine } from './engine/docker/dockerEngine';
import { TableSchema } from './types/sql';
import { ALL_CHAPTERS } from './data/chapters';
import { audioFx } from './utils/audioEffects';

// ---- Desk Prop SVGs ---- //

function BrassLamp() {
  return (
    <svg
      viewBox="0 0 80 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-70"
    >
      <rect x="32" y="120" width="16" height="20" rx="3" fill="#5a4010" />
      <rect x="28" y="115" width="24" height="8" rx="2" fill="#6b4c18" />
      <rect x="34" y="70" width="6" height="50" rx="2" fill="#8a6422" />
      <ellipse cx="37" cy="68" rx="6" ry="4" fill="#7a5818" />
      <rect x="30" y="40" width="8" height="32" rx="3" fill="#9a7228" transform="rotate(-20 34 40)" />
      <ellipse cx="28" cy="35" rx="22" ry="10" fill="#d4a030" />
      <ellipse cx="28" cy="33" rx="18" ry="8" fill="#f0c060" opacity="0.8" />
      <ellipse cx="28" cy="32" rx="12" ry="5" fill="#fff5d0" opacity="0.9" />
    </svg>
  );
}

function CoffeeRing() {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-60"
    >
      <circle cx="30" cy="30" r="26" stroke="rgba(120,70,20,0.4)" strokeWidth="3" fill="none" />
      <circle cx="30" cy="30" r="22" stroke="rgba(100,55,15,0.25)" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="30" r="18" fill="rgba(80,45,10,0.1)" />
    </svg>
  );
}

function SpectaclesProp() {
  return (
    <svg
      viewBox="0 0 90 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-65"
    >
      <ellipse cx="22" cy="22" rx="18" ry="15" stroke="#555" strokeWidth="2.5" fill="rgba(200,220,240,0.12)" />
      <ellipse cx="68" cy="22" rx="18" ry="15" stroke="#555" strokeWidth="2.5" fill="rgba(200,220,240,0.12)" />
      <path d="M40 22 Q45 18 50 22" stroke="#555" strokeWidth="2" fill="none" />
      <line x1="4" y1="18" x2="4" y2="10" stroke="#555" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="18" x2="86" y2="10" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BrassKeys() {
  return (
    <svg
      viewBox="0 0 50 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-60"
    >
      <circle cx="25" cy="12" r="10" stroke="#b8860b" strokeWidth="2" fill="none" />
      <circle cx="25" cy="12" r="5" stroke="#b8860b" strokeWidth="1.5" fill="none" />
      <rect x="23" y="22" width="4" height="35" rx="1" fill="#b8860b" />
      <rect x="23" y="42" width="10" height="3" rx="1" fill="#b8860b" />
      <rect x="23" y="50" width="8" height="3" rx="1" fill="#b8860b" />
    </svg>
  );
}

// ---- Main App ---- //

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

  // Modal state
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isConceptOpen, setIsConceptOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isFileEditorOpen, setIsFileEditorOpen] = useState(false);

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [inputCode, setInputCode] = useState(currentPuzzle.starterCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<TableSchema[]>([]);

  // Engine refs
  const gitEngineRef = useRef<GitEngine | null>(null);
  const dockerEngineRef = useRef<DockerEngine | null>(null);
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({});

  // Sync starter code on puzzle change
  useEffect(() => {
    setInputCode(currentPuzzle.starterCode || '');
  }, [currentPuzzle.id]);

  // Init SQL engine
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

  // Init Git / Docker engines on chapter change
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
          containers: {
            'rogue-proxy': {
              id: 'f72a901c3e44',
              name: 'rogue-proxy',
              imageId: '99e8d7c6b5a4',
              imageName: 'shadow-proxy:v1',
              created: '3 hours ago',
              status: 'running',
              ports: [{ hostPort: 8080, containerPort: 8080 }],
              volumes: [],
              env: {},
              logs: ['[+] Stealth reverse proxy listening on 0.0.0.0:8080'],
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
        text: `=== CONNECTED TO FORENSIC WORKSTATION // ${currentChapter.title.toUpperCase()} ===\nTool Mode: ${currentChapter.tool.toUpperCase()} | Type queries or commands to analyze evidence.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [currentChapter]);

  const isCurrentPuzzleSolved = useMemo(
    () => progress.completedPuzzleIds.includes(currentPuzzle.id),
    [progress.completedPuzzleIds, currentPuzzle.id]
  );

  const handleExecuteCommand = async (command: string) => {
    const logId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toLocaleTimeString();

    setTerminalLogs(prev => [
      ...prev,
      { id: `input-${logId}`, type: 'input', command, timestamp: now },
    ]);
    setIsLoading(true);

    try {
      if (currentChapter.tool === 'sql') {
        if (!globalSqlEngine.isReady()) {
          try {
            await globalSqlEngine.init();
            setSchemas(globalSqlEngine.getSchema());
          } catch (initErr: any) {
            setTerminalLogs(prev => [
              ...prev,
              { id: `err-${logId}`, type: 'error', text: `SQL Error: ${initErr.message}`, timestamp: now },
            ]);
            setIsLoading(false);
            return;
          }
        }

        const queryResult = globalSqlEngine.executeQuery(command);
        if (queryResult.error) {
          setTerminalLogs(prev => [
            ...prev,
            { id: `err-${logId}`, type: 'error', text: `SQL Error: ${queryResult.error}`, timestamp: now },
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            { id: `res-${logId}`, type: 'sql-result', sqlResult: queryResult, timestamp: now },
          ]);

          if (currentPuzzle.validate) {
            const validation = currentPuzzle.validate({ query: command, result: queryResult });
            if (validation.isCorrect) {
              markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
              setTerminalLogs(prev => [
                ...prev,
                { id: `success-${logId}`, type: 'success', text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`, timestamp: now },
              ]);
            }
          }
        }
      } else if (currentChapter.tool === 'git') {
        if (!gitEngineRef.current) return;
        const cmdResult = gitEngineRef.current.execute(command);
        setVirtualFiles(gitEngineRef.current.getState().workingDirectory);

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
            command,
            args: command.split(' '),
            result: cmdResult,
            state: gitEngineRef.current.getState(),
          });
          if (validation.isCorrect) {
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              { id: `success-${logId}`, type: 'success', text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`, timestamp: now },
            ]);
          }
        }
      } else if (currentChapter.tool === 'docker') {
        if (!dockerEngineRef.current) return;
        const cmdResult = dockerEngineRef.current.execute(command);

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
            command,
            args: command.split(' '),
            result: cmdResult,
            state: dockerEngineRef.current.getState(),
          });
          if (validation.isCorrect) {
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              { id: `success-${logId}`, type: 'success', text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`, timestamp: now },
            ]);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = (fileName: string, content: string) => {
    setVirtualFiles(prev => ({ ...prev, [fileName]: content }));

    if (currentChapter.tool === 'git' && gitEngineRef.current) {
      gitEngineRef.current.setWorkingFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        { id: `edit-${Date.now()}`, type: 'system', text: `[SYSTEM] Updated '${fileName}' in virtual workspace.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    } else if (currentChapter.tool === 'docker' && dockerEngineRef.current) {
      dockerEngineRef.current.setVirtualFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        { id: `edit-${Date.now()}`, type: 'system', text: `[SYSTEM] Updated '${fileName}' in Docker build context.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const handlePrevPuzzle = () => {
    if (progress.currentPuzzleIndex > 0) {
      audioFx.playPaper();
      setPuzzleIndex(progress.currentPuzzleIndex - 1);
    }
  };

  const handleNextPuzzle = () => {
    audioFx.playPaper();
    if (progress.currentPuzzleIndex < currentChapter.puzzles.length - 1) {
      setPuzzleIndex(progress.currentPuzzleIndex + 1);
    } else {
      const chIdx = ALL_CHAPTERS.findIndex(c => c.id === currentChapter.id);
      if (chIdx < ALL_CHAPTERS.length - 1) {
        setChapter(ALL_CHAPTERS[chIdx + 1].id);
      }
    }
  };

  const currentChapterIndex = ALL_CHAPTERS.findIndex(c => c.id === currentChapter.id);
  const seasonStr = String(currentChapterIndex + 1).padStart(2, '0');

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ============================================================
          LEATHER CASE BINDER SIDEBAR
         ============================================================ */}
      <Sidebar
        chapters={ALL_CHAPTERS}
        currentChapterId={currentChapter.id}
        currentPuzzleIndex={progress.currentPuzzleIndex}
        completedPuzzleIds={progress.completedPuzzleIds}
        onSelectChapter={setChapter}
        onSelectPuzzleIndex={setPuzzleIndex}
        onOpenSchema={() => setIsSchemaOpen(true)}
        onOpenConcept={() => setIsConceptOpen(true)}
        onOpenHint={() => setIsHintsOpen(true)}
        onOpenFileEditor={() => setIsFileEditorOpen(true)}
        tool={currentChapter.tool}
      />

      {/* ============================================================
          DETECTIVE'S DESK WORKSPACE
         ============================================================ */}
      <main className="flex-1 h-full overflow-y-auto desk-workspace relative">
        {/* Lamp light pool overlay */}
        <div className="lamp-pool absolute inset-0 pointer-events-none z-0" />

        {/* Desk prop: Brass desk lamp (top-right) */}
        <div className="absolute top-0 right-6 w-20 h-36 pointer-events-none z-10 hidden lg:block">
          <BrassLamp />
        </div>

        {/* Desk prop: Coffee mug ring stain (bottom-right area) */}
        <div className="absolute bottom-24 right-12 w-14 h-14 pointer-events-none z-10 hidden xl:block">
          <CoffeeRing />
        </div>

        {/* Desk prop: Spectacles on notepad (bottom-left) */}
        <div className="absolute bottom-28 left-2 w-24 h-10 pointer-events-none z-10 hidden xl:block">
          <SpectaclesProp />
        </div>

        {/* Desk prop: Brass keys (bottom-right) */}
        <div className="absolute bottom-16 right-36 w-10 h-16 pointer-events-none z-10 hidden xl:block">
          <BrassKeys />
        </div>

        {/* Desk prop: Spiral notepad text (bottom-left) */}
        <div className="absolute bottom-16 left-4 hidden xl:block pointer-events-none z-10">
          <div className="spiral-notepad w-32 p-2.5 transform rotate-2">
            <div className="text-[7.5px] font-typewriter text-stone-600 leading-relaxed space-y-0.5">
              <div>- cross ref Vance acct</div>
              <div>- flagged = 1 filter</div>
              <div>- NOT IN clause key!</div>
              <div>- check tx timestamps</div>
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN INVESTIGATION WORK SURFACE
           ============================================================ */}
        <div className="relative z-10 flex flex-col w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5">

          {/* === DESK HEADER BAR (Police nameplate) === */}
          <div className="flex items-center justify-between bg-[#140808]/92 border-2 border-[#3d1818] rounded-xl px-5 py-3 shadow-2xl backdrop-blur-sm">
            {/* Left: Prior lead + case title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevPuzzle}
                disabled={progress.currentPuzzleIndex === 0}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#220d0d] hover:bg-[#351515] text-stone-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold font-typewriter transition border border-[#4a1c1c]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PRIOR LEAD</span>
              </button>

              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-[#220d0d] border border-theme-scarlet/50 flex items-center justify-center text-theme-scarlet font-black text-[10px] shadow-inner">
                  NPD
                </div>
                <div>
                  <div className="text-xs font-black tracking-wider uppercase text-white font-typewriter flex items-center space-x-2">
                    <span>POLICE FORENSIC DESK</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-theme-bloodRed text-white font-mono">
                      ACTIVE CASE
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-typewriter font-bold tracking-wider uppercase">
                    DOSSIER: S{seasonStr} — {currentChapter.subtitle.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  audioFx.playPaper();
                  setIsTutorialOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#220d0d] hover:bg-[#351515] text-amber-300 text-xs font-bold font-typewriter transition border border-amber-700/40"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">FIELD MANUAL</span>
              </button>

              <button
                onClick={() => {
                  audioFx.playPaper();
                  setIsCluesOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#0e2016] hover:bg-[#173022] text-emerald-300 text-xs font-bold font-typewriter transition border border-emerald-700/50"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">EVIDENCE VAULT</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                  {progress.collectedClues.length}
                </span>
              </button>

              <button
                onClick={() => {
                  audioFx.playClick();
                  if (window.confirm('WARNING: Purge all evidence and restart investigation from Chapter 1?')) {
                    resetProgress();
                  }
                }}
                className="p-1.5 rounded bg-[#220d0d] hover:bg-rose-950 text-stone-400 hover:text-rose-300 transition border border-[#4a1c1c]"
                title="Purge Case Progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* === MANILA EVIDENCE FOLDER (ProblemCard) === */}
          <ProblemCard
            puzzle={currentPuzzle}
            puzzleIndex={progress.currentPuzzleIndex}
            totalPuzzles={currentChapter.puzzles.length}
            isSolved={isCurrentPuzzleSolved}
            onPrevPuzzle={handlePrevPuzzle}
            onNextPuzzle={handleNextPuzzle}
          />

          {/* === RETRO CRT FORENSIC TERMINAL === */}
          <Terminal
            tool={currentChapter.tool}
            logs={terminalLogs}
            onExecuteCommand={handleExecuteCommand}
            onClearLogs={() => setTerminalLogs([])}
            inputCode={inputCode}
            setInputCode={setInputCode}
            isLoading={isLoading}
            onOpenHint={() => setIsHintsOpen(true)}
          />

          {/* Desk bottom spacer */}
          <div className="h-8" />
        </div>
      </main>

      {/* ============================================================
          MODALS & DRAWERS
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
