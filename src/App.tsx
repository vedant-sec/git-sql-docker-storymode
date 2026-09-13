import { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Shield, RotateCcw, Menu, X } from 'lucide-react';
import { LeatherBinderNav } from './components/layout/LeatherBinderNav';
import { ManilaEvidenceFolder } from './components/layout/ManilaEvidenceFolder';
import { CRTTerminalMonitor } from './components/layout/CRTTerminalMonitor';
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
import { TerminalLogEntry } from './components/terminal/Terminal';

// Terminal log helpers for new design
function formatTerminalOutput(logs: TerminalLogEntry[]): React.ReactNode {
  return (
    <div className="space-y-1">
      {logs.map(log => (
        <div key={log.id} className="text-xs leading-relaxed">
          {log.type === 'input' && <div className="text-yellow-400">&gt; {log.command}</div>}
          {log.type === 'output' && <div>{log.text}</div>}
          {log.type === 'error' && <div className="text-red-400">ERROR: {log.text}</div>}
          {log.type === 'success' && <div className="text-green-400">✓ {log.text}</div>}
          {log.type === 'system' && <div className="text-gray-400">[{log.timestamp}] {log.text}</div>}
          {log.type === 'sql-result' && log.sqlResult && (
            <div className="text-green-300">
              <div>ROWS: {(log.sqlResult as any).rows?.length || 0}</div>
              {(log.sqlResult as any).rows?.slice(0, 3).map((row: any, idx: number) => (
                <div key={idx} className="ml-2">
                  {JSON.stringify(row).substring(0, 60)}...
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
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

  // Modal states
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isConceptOpen, setIsConceptOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isFileEditorOpen, setIsFileEditorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [inputCode, setInputCode] = useState(currentPuzzle.starterCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<TableSchema[]>([]);

  // Engine refs
  const gitEngineRef = useRef<GitEngine | null>(null);
  const dockerEngineRef = useRef<DockerEngine | null>(null);
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    setInputCode(currentPuzzle.starterCode || '');
  }, [currentPuzzle.id]);

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
        text: `=== FORENSIC DESK TERMINAL ONLINE ===\nTool: ${currentChapter.tool.toUpperCase()} | Case: ${currentChapter.title}`,
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
        { id: `edit-${Date.now()}`, type: 'system', text: `Updated '${fileName}' in workspace.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    } else if (currentChapter.tool === 'docker' && dockerEngineRef.current) {
      dockerEngineRef.current.setVirtualFile(fileName, content);
      setTerminalLogs(prev => [
        ...prev,
        { id: `edit-${Date.now()}`, type: 'system', text: `Updated '${fileName}' in build context.`, timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const handlePrevPuzzle = () => {
    if (progress.currentPuzzleIndex > 0) {
      setPuzzleIndex(progress.currentPuzzleIndex - 1);
    }
  };

  const handleNextPuzzle = () => {
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

  // Create chapter navigation tabs for sidebar
  const chapterTabs = ALL_CHAPTERS.map(ch => ({
    id: ch.id,
    label: `S${ALL_CHAPTERS.indexOf(ch) + 1}`,
  }));

  return (
    <div className="desk-workspace w-screen h-screen flex flex-col overflow-hidden">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-yellow-900 text-white rounded hover:bg-yellow-800"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content grid */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left Sidebar - Leather Binder */}
        {sidebarOpen && (
          <div className="w-56 flex flex-col gap-4">
            <div className="leather-binder rounded-lg p-3 flex-1 flex flex-col overflow-y-auto">
              <div className="binder-spine mb-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="binder-rivet" />
                ))}
              </div>
              
              {/* Chapter navigation */}
              <div className="space-y-1.5">
                {chapterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setChapter(tab.id)}
                    className={`index-tab w-full text-left ${currentChapter.id === tab.id ? 'index-tab-active' : ''}`}
                  >
                    {tab.label} — CASE FILE
                  </button>
                ))}
              </div>

              <div className="border-t border-yellow-900 mt-4 pt-3 flex flex-col gap-2">
                {/* Tool buttons */}
                <button
                  onClick={() => setIsSchemaOpen(true)}
                  className="px-2 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-mono rounded border border-blue-700"
                >
                  [DATABASE]
                </button>
                <button
                  onClick={() => setIsConceptOpen(true)}
                  className="px-2 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-mono rounded border border-purple-700"
                >
                  [CONCEPT]
                </button>
                <button
                  onClick={() => setIsCluesOpen(true)}
                  className="px-2 py-1.5 bg-green-900 hover:bg-green-800 text-white text-xs font-mono rounded border border-green-700 flex items-center justify-between"
                >
                  <span>[EVIDENCE]</span>
                  <span className="font-bold">{progress.collectedClues.length}</span>
                </button>
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="px-2 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-mono rounded border border-amber-700"
                >
                  [MANUAL]
                </button>
                <button
                  onClick={() => setIsFileEditorOpen(true)}
                  className="px-2 py-1.5 bg-red-900 hover:bg-red-800 text-white text-xs font-mono rounded border border-red-700"
                >
                  [FILES]
                </button>
              </div>

              <div className="border-t border-yellow-900 mt-4 pt-3">
                <button
                  onClick={() => {
                    if (window.confirm('PURGE ALL EVIDENCE AND RESTART?')) {
                      resetProgress();
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-mono rounded border border-red-700 flex items-center justify-center gap-1"
                >
                  <RotateCcw size={12} /> RESET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right content - Main workspace */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Case header bar */}
          <div className="bg-gray-900 border border-gray-700 rounded p-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-amber-400 font-bold">
                CASE S{seasonStr} — {currentChapter.subtitle.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Puzzle {progress.currentPuzzleIndex + 1} / {currentChapter.puzzles.length}
            </div>
          </div>

          {/* Manila Evidence Folder */}
          <div className="flex-1 overflow-hidden">
            <ManilaEvidenceFolder
              title={`INCIDENT: ${currentPuzzle.title}`}
              caseNumber={currentChapterIndex + 1}
              totalCases={ALL_CHAPTERS.length}
              stamp={isCurrentPuzzleSolved ? 'SOLVED' : 'PENDING'}
              stampColor={isCurrentPuzzleSolved ? 'green' : 'red'}
              onPrevious={handlePrevPuzzle}
              onNext={handleNextPuzzle}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm mb-2">{currentPuzzle.title}</h3>
                  <p className="text-xs whitespace-pre-wrap">{currentPuzzle.description}</p>
                </div>
                {currentPuzzle.objective && (
                  <div>
                    <h4 className="font-bold text-xs mb-1">OBJECTIVE:</h4>
                    <p className="text-xs">{currentPuzzle.objective}</p>
                  </div>
                )}
                {currentPuzzle.hints && currentPuzzle.hints.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs mb-1">HINTS:</h4>
                    <ul className="text-xs space-y-1">
                      {currentPuzzle.hints.slice(0, 2).map((hint: any, i: number) => (
                        <li key={i}>💡 {typeof hint === 'string' ? hint : hint.text || JSON.stringify(hint)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ManilaEvidenceFolder>
          </div>

          {/* CRT Terminal */}
          <div className="flex-shrink-0">
            <CRTTerminalMonitor
              onSubmit={handleExecuteCommand}
              onHint={() => setIsHintsOpen(true)}
              outputContent={formatTerminalOutput(terminalLogs)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

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
