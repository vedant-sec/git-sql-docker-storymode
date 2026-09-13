import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, BookOpen, Shield, RotateCcw } from 'lucide-react';
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

export function App() {
  const {
    progress,
    currentChapter,
    currentPuzzle,
    setChapter,
    setPuzzleIndex,
    markPuzzleCompleted,
    unlockNextHint,
    resetProgress
  } = useGameStore();

  // Modals state
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

  // Engines instances
  const gitEngineRef = useRef<GitEngine | null>(null);
  const dockerEngineRef = useRef<DockerEngine | null>(null);

  // Virtual Files for File Editor
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({});

  // Sync starter code when puzzle changes
  useEffect(() => {
    if (currentPuzzle.starterCode) {
      setInputCode(currentPuzzle.starterCode);
    } else {
      setInputCode('');
    }
  }, [currentPuzzle.id]);

  // Initialize SQL Engine and DB
  useEffect(() => {
    async function initSql() {
      try {
        await globalSqlEngine.init();
        const tables = globalSqlEngine.getSchema();
        setSchemas(tables);
      } catch (err) {
        console.error('Failed to initialize SQL Engine:', err);
      }
    }
    initSql();
  }, []);

  // Initialize or update Git & Docker engines on chapter change
  useEffect(() => {
    if (currentChapter.tool === 'git') {
      const initFiles = currentChapter.initialFiles || {};
      setVirtualFiles({ ...initFiles });

      // Build recovered branch commit for Vance's recovered branch
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
              'config.env': `EXFIL_SERVER="sftp://exfil.darknet-shadow.onion:9922"\nENCRYPTION_SALT="SHADOW_KEY_9921_PROD"\n`
            }
          }
        },
        branches: {
          'forensics/recovered-payload': recoveredHash
        },
        workingDirectory: { ...initFiles }
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
              cmd: ['/bin/sh']
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
              cmd: ['/usr/bin/proxy']
            }
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
              cmd: ['/usr/bin/proxy']
            }
          }
        },
        initFiles
      );
      dockerEngineRef.current = docker;
    }

    // Set greeting / chapter start banner in terminal
    setTerminalLogs([
      {
        id: 'init-banner',
        type: 'system',
        text: `=== CONNECTED TO FORENSIC WORKSTATION // ${currentChapter.title.toUpperCase()} ===\nTool Mode: ${currentChapter.tool.toUpperCase()} | Type queries or commands to analyze evidence.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [currentChapter]);

  // Check if current puzzle is solved
  const isCurrentPuzzleSolved = useMemo(() => {
    return progress.completedPuzzleIds.includes(currentPuzzle.id);
  }, [progress.completedPuzzleIds, currentPuzzle.id]);

  // Handle Command Submission
  const handleExecuteCommand = async (command: string) => {
    const logId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toLocaleTimeString();

    // Add input log
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `input-${logId}`,
        type: 'input',
        command,
        timestamp: now
      }
    ]);

    setIsLoading(true);

    try {
      if (currentChapter.tool === 'sql') {
        if (!globalSqlEngine.isReady()) {
          try {
            await globalSqlEngine.init();
            const tables = globalSqlEngine.getSchema();
            setSchemas(tables);
          } catch (initErr: any) {
            setTerminalLogs(prev => [
              ...prev,
              {
                id: `err-${logId}`,
                type: 'error',
                text: `SQL Error: ${initErr.message || 'Database engine could not be initialized.'}`,
                timestamp: now
              }
            ]);
            setIsLoading(false);
            return;
          }
        }

        const queryResult = globalSqlEngine.executeQuery(command);

        if (queryResult.error) {
          setTerminalLogs(prev => [
            ...prev,
            {
              id: `err-${logId}`,
              type: 'error',
              text: `SQL Error: ${queryResult.error}`,
              timestamp: now
            }
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            {
              id: `res-${logId}`,
              type: 'sql-result',
              sqlResult: queryResult,
              timestamp: now
            }
          ]);

          // Validate puzzle
          if (currentPuzzle.validate) {
            const validation = currentPuzzle.validate({
              query: command,
              result: queryResult
            });

            if (validation.isCorrect) {
              markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
              setTerminalLogs(prev => [
                ...prev,
                {
                  id: `success-${logId}`,
                  type: 'success',
                  text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`,
                  timestamp: now
                }
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
            timestamp: now
          }
        ]);

        if (currentPuzzle.validate) {
          const validation = currentPuzzle.validate({
            command,
            args: command.split(' '),
            result: cmdResult,
            state: gitEngineRef.current.getState()
          });

          if (validation.isCorrect) {
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              {
                id: `success-${logId}`,
                type: 'success',
                text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`,
                timestamp: now
              }
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
            timestamp: now
          }
        ]);

        if (currentPuzzle.validate) {
          const validation = currentPuzzle.validate({
            command,
            args: command.split(' '),
            result: cmdResult,
            state: dockerEngineRef.current.getState()
          });

          if (validation.isCorrect) {
            markPuzzleCompleted(currentPuzzle.id, currentPuzzle.clueReward);
            setTerminalLogs(prev => [
              ...prev,
              {
                id: `success-${logId}`,
                type: 'success',
                text: `[OBJECTIVE COMPLETE] ${validation.message || 'Evidence validated!'}`,
                timestamp: now
              }
            ]);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Virtual file editor save
  const handleSaveFile = (fileName: string, content: string) => {
    setVirtualFiles(prev => ({ ...prev, [fileName]: content }));

    if (currentChapter.tool === 'git' && gitEngineRef.current) {
      gitEngineRef.current.setWorkingFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        {
          id: `edit-${Date.now()}`,
          type: 'system',
          text: `[SYSTEM] Updated '${fileName}' in virtual workspace.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else if (currentChapter.tool === 'docker' && dockerEngineRef.current) {
      dockerEngineRef.current.setVirtualFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        {
          id: `edit-${Date.now()}`,
          type: 'system',
          text: `[SYSTEM] Updated '${fileName}' in Docker build context.`,
          timestamp: new Date().toLocaleTimeString()
        }
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
      const currentChapterIdx = ALL_CHAPTERS.findIndex(c => c.id === currentChapter.id);
      if (currentChapterIdx < ALL_CHAPTERS.length - 1) {
        setChapter(ALL_CHAPTERS[currentChapterIdx + 1].id);
      }
    }
  };

  const currentChapterIndex = ALL_CHAPTERS.findIndex(c => c.id === currentChapter.id);
  const seasonNumberStr = String(currentChapterIndex + 1).padStart(2, '0');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0505] text-slate-100 font-sans">
      {/* Left Menu Panel / Sidebar */}
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

      {/* Main Workspace (Detective Investigation Desk) */}
      <main className="flex-1 h-full overflow-y-auto detective-desk-bg flex flex-col relative">
        {/* Top Police Dispatch Header */}
        <div className="p-4 md:p-6 pb-2 w-full max-w-5xl mx-auto">
          <div className="bg-[#140808]/90 text-stone-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-2xl border-2 border-[#3d1818] backdrop-blur-md">
            {/* Left: Prior file & Case dossier title */}
            <div className="flex items-center space-x-3.5">
              <button
                onClick={handlePrevPuzzle}
                disabled={progress.currentPuzzleIndex === 0}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#240e0e] hover:bg-[#381616] text-stone-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold font-typewriter transition border border-[#4a1c1c]"
                title="Return to Previous Case Objective"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>&lt; PRIOR LEAD</span>
              </button>

              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-[#240e0e] border border-theme-scarlet/60 flex items-center justify-center text-theme-scarlet font-black text-xs shadow-inner">
                  NPD
                </div>
                <div>
                  <div className="text-xs font-black tracking-wider uppercase text-white font-typewriter flex items-center space-x-2">
                    <span>POLICE FORENSIC DESK</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-theme-bloodRed text-white font-mono uppercase">
                      ACTIVE CASE
                    </span>
                  </div>
                  <div className="text-[10px] text-theme-scarlet font-typewriter font-bold tracking-wider uppercase">
                    DOSSIER: S{seasonNumberStr} — {currentChapter.subtitle.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Field Manual, Evidence Vault, Purge */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  audioFx.playPaper();
                  setIsTutorialOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#240e0e] hover:bg-[#381616] text-theme-scarlet text-xs font-bold font-typewriter transition border border-theme-scarlet/40 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-theme-scarlet" />
                <span className="hidden sm:inline">FIELD MANUAL</span>
              </button>

              <button
                onClick={() => {
                  audioFx.playPaper();
                  setIsCluesOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#102418] hover:bg-[#183624] text-emerald-300 text-xs font-bold font-typewriter transition border border-emerald-600/50"
                title="View Collected Evidence Locker"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">EVIDENCE VAULT</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                  {progress.collectedClues.length}
                </span>
              </button>

              <button
                onClick={() => {
                  audioFx.playClick();
                  if (window.confirm('WARNING: Purge all collected evidence, records, and restart forensic investigation from Chapter 1?')) {
                    resetProgress();
                  }
                }}
                className="p-1.5 rounded bg-[#240e0e] hover:bg-rose-950 text-stone-400 hover:text-rose-300 transition border border-[#4a1c1c]"
                title="Purge Case Progress & Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Core Workspace: Strictly Problem & Code Editor */}
        <div className="flex-1 px-4 md:px-6 py-3 w-full max-w-5xl mx-auto space-y-5 pb-8">
          {/* 1. Problem / Objective Card */}
          <ProblemCard
            puzzle={currentPuzzle}
            puzzleIndex={progress.currentPuzzleIndex}
            totalPuzzles={currentChapter.puzzles.length}
            isSolved={isCurrentPuzzleSolved}
            onPrevPuzzle={handlePrevPuzzle}
            onNextPuzzle={handleNextPuzzle}
          />

          {/* 2. Code Editor & Terminal */}
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
        </div>
      </main>

      {/* Modals & Drawers */}
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
