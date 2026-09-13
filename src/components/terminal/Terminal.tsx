import React, { useState, useRef, useEffect } from 'react';
import { Play, Check, Radio, History, Trash2, ShieldCheck, ChevronDown, ChevronUp, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';
import { TableOutput } from './TableOutput';
import { QueryResult } from '../../types/sql';
import { ToolType } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

export interface TerminalLogEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'sql-result';
  command?: string;
  text?: string;
  sqlResult?: QueryResult;
  timestamp: string;
}

interface TerminalProps {
  tool: ToolType;
  logs: TerminalLogEntry[];
  onExecuteCommand: (command: string) => void;
  onClearLogs: () => void;
  inputCode: string;
  setInputCode: (val: string) => void;
  isLoading?: boolean;
  onOpenHint?: () => void;
}

function parseAnsi(text: string): React.ReactNode[] {
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);
  let currentColor = 'text-stone-300';

  return parts.map((part, idx) => {
    if (part === '\x1b[31m') {
      currentColor = 'text-rose-400';
      return null;
    } else if (part === '\x1b[32m') {
      currentColor = 'text-emerald-400';
      return null;
    } else if (part === '\x1b[33m') {
      currentColor = 'text-amber-400';
      return null;
    } else if (part === '\x1b[36m') {
      currentColor = 'text-cyan-400';
      return null;
    } else if (part === '\x1b[0m') {
      currentColor = 'text-stone-300';
      return null;
    }
    return (
      <span key={idx} className={currentColor}>
        {part}
      </span>
    );
  }).filter(Boolean);
}

export const Terminal: React.FC<TerminalProps> = ({
  tool,
  logs,
  onExecuteCommand,
  onClearLogs,
  inputCode,
  setInputCode,
  isLoading,
  onOpenHint
}) => {
  const [showQueryLog, setShowQueryLog] = useState(true);
  const [hasGlitch, setHasGlitch] = useState(false);
  const [showStampSuccess, setShowStampSuccess] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showQueryLog) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showQueryLog]);

  // Monitor logs for error or success to trigger tactile audio & animations
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.type === 'error') {
        audioFx.playGlitch();
        setHasGlitch(true);
        const timer = setTimeout(() => setHasGlitch(false), 500);
        return () => clearTimeout(timer);
      } else if (lastLog.type === 'success') {
        audioFx.playStamp();
        setShowStampSuccess(true);
        const timer = setTimeout(() => setShowStampSuccess(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [logs]);

  // Handle Ctrl+Enter or Ctrl+E to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      handleRun();
    }
  };

  const handleRun = () => {
    const trimmed = inputCode.trim();
    if (!trimmed || isLoading) return;
    audioFx.playClick();
    onExecuteCommand(trimmed);
  };

  const handleSubmit = () => {
    const trimmed = inputCode.trim();
    if (!trimmed || isLoading) return;
    audioFx.playClick();
    onExecuteCommand(trimmed);
  };

  // Compute line count for gutter
  const lineCount = Math.max(inputCode.split('\n').length, 4);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const consoleHeader =
    tool === 'sql'
      ? 'DATA INTERCEPT TOOL // FORENSIC QUERY LINE'
      : tool === 'git'
      ? 'FORENSIC CODE SHELL // GIT COMMIT AUDITOR'
      : 'RUNTIME CONTAINER AUDITOR // DOCKER DAEMON';

  const sectionLabel =
    tool === 'sql'
      ? 'FORENSIC SQL INTERCEPT TERMINAL'
      : tool === 'git'
      ? 'GIT REPOSITORY INTERCEPT CONSOLE'
      : 'DOCKER RUNTIME FORENSIC MAINFRAME';

  return (
    <div className={`flex flex-col space-y-3 font-mono select-none ${hasGlitch ? 'glitch-active' : ''}`}>
      {/* Outer Section Header with Tactical Police Motif */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-theme-scarlet animate-pulse shadow-[0_0_8px_rgba(217,62,62,0.8)]" />
          <span className="text-xs font-black tracking-widest text-stone-200 uppercase font-typewriter">
            {sectionLabel}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e0e0e] text-theme-scarlet border border-[#4a1818] hidden sm:inline font-typewriter">
            CLASSIFIED LEVEL 4
          </span>
        </div>

        <button
          onClick={() => {
            audioFx.playClick();
            setShowQueryLog(prev => !prev);
          }}
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#1f0e0e] hover:bg-[#331414] text-stone-300 text-xs font-bold font-typewriter shadow-sm transition border border-[#421717]"
        >
          <History className="w-3.5 h-3.5 text-stone-400" />
          <span>DISPATCH LOG</span>
          {showQueryLog ? (
            <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>
      </div>

      {/* Retro CRT Mainframe Container */}
      <div className="bg-[#0e0707] border-2 border-[#3d1818] rounded-xl shadow-2xl overflow-hidden flex flex-col relative crt-screen">
        {/* Hardware Bezel Header */}
        <div className="bg-gradient-to-r from-[#170909] via-[#240e0e] to-[#170909] px-4 py-2.5 border-b-2 border-[#3d1818] flex items-center justify-between text-xs relative z-30">
          {/* Left: Screws & Hardware Label */}
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-stone-500 border border-stone-800 shadow-inner" />
            <TerminalIcon className="w-3.5 h-3.5 text-theme-scarlet" />
            <span className="text-stone-300 font-bold tracking-widest text-[11px] font-typewriter">
              {consoleHeader}
            </span>
          </div>

          {/* Right: CRT Signal Status */}
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-typewriter">
              {isLoading ? 'TRACING SIGNAL...' : 'LINE CLEAR // READY'}
            </span>
          </div>
        </div>

        {/* Code Editor Body / CRT Screen */}
        <div className="flex min-h-[140px] max-h-[260px] bg-[#080404] p-2 overflow-y-auto relative z-30">
          {/* Line Numbers Gutter */}
          <div className="w-8 py-1.5 text-right pr-3 select-none text-stone-600 text-xs leading-6 font-mono border-r border-[#261010]">
            {lineNumbers.map(num => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Textarea Query Input */}
          <textarea
            ref={textareaRef}
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              tool === 'sql'
                ? '-- Detective, enter forensic SQL query... (Ctrl+E to dispatch)'
                : tool === 'git'
                ? '# Enter Git forensic command... (e.g. git status, git log)'
                : '# Enter Docker runtime command... (e.g. docker ps, docker run)'
            }
            className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none resize-none leading-6 whitespace-pre tracking-wide selection:bg-theme-bloodRed selection:text-white"
            rows={lineCount}
            spellCheck={false}
          />
        </div>

        {/* Tactical Action Toolbar */}
        <div className="bg-[#120707] px-4 py-3 border-t-2 border-[#3d1818] flex items-center justify-between relative z-30">
          {/* Left: Wiretap Intel / Informant Button */}
          <div>
            {onOpenHint && (
              <button
                onClick={() => {
                  audioFx.playClick();
                  onOpenHint();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#210d0d] hover:bg-[#331414] text-emerald-400 border border-emerald-600/40 text-xs font-bold font-typewriter transition shadow-sm active:translate-y-0.5"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>WIRETAP INTEL</span>
              </button>
            )}
          </div>

          {/* Right: Dispatch Query & Execute Warrant */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRun}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-[#240e0e] hover:bg-[#381616] text-stone-200 disabled:opacity-40 text-xs font-bold font-typewriter transition border border-[#4a1c1c] active:translate-y-0.5"
            >
              <Play className="w-3.5 h-3.5 fill-current text-stone-400" />
              <span>TEST INTERCEPT</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-2 px-5 py-1.5 rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 text-xs font-black font-typewriter tracking-wider shadow-lg shadow-black/60 transition border border-theme-scarlet active:translate-y-0.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>EXECUTE WARRANT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query Log & Results Section */}
      {showQueryLog && (
        <div className="bg-[#0e0707] border-2 border-[#3d1818] rounded-xl shadow-xl overflow-hidden flex flex-col mt-2 relative crt-screen">
          <div className="bg-[#170909] px-4 py-2 border-b-2 border-[#3d1818] flex items-center justify-between text-xs relative z-30">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-typewriter flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>FORENSIC TELEMETRY & EXECUTION RESULTS</span>
            </span>
            <button
              onClick={() => {
                audioFx.playClick();
                onClearLogs();
              }}
              className="text-[11px] text-stone-400 hover:text-white flex items-center space-x-1 font-typewriter transition"
              title="Purge Terminal Log"
            >
              <Trash2 className="w-3 h-3" />
              <span>PURGE LOG</span>
            </button>
          </div>

          <div className="p-4 max-h-[300px] overflow-y-auto space-y-3 text-xs leading-relaxed bg-[#0a0505] relative z-30">
            {logs.length === 0 ? (
              <div className="text-stone-500 text-[11px] italic text-center py-6 font-typewriter">
                -- NO INTERCEPT LOGS REGISTERED. DISPATCH A QUERY TO RUN FORENSIC TELEMETRY --
              </div>
            ) : (
              logs.map(log => {
                if (log.type === 'input') {
                  return (
                    <div key={log.id} className="flex items-start space-x-2 pt-1 font-semibold">
                      <span className="text-theme-scarlet flex-shrink-0 select-none font-typewriter">
                        [DISPATCH]&gt;
                      </span>
                      <span className="text-stone-100 whitespace-pre-wrap break-all font-mono">
                        {log.command}
                      </span>
                    </div>
                  );
                }

                if (log.type === 'sql-result' && log.sqlResult) {
                  return (
                    <div key={log.id} className="pl-2 overflow-x-auto">
                      <TableOutput
                        columns={log.sqlResult.columns}
                        values={log.sqlResult.values}
                        executionTimeMs={log.sqlResult.executionTimeMs}
                      />
                    </div>
                  );
                }

                if (log.type === 'error') {
                  return (
                    <div
                      key={log.id}
                      className="pl-3 text-rose-300 whitespace-pre-wrap font-mono bg-[#2a0e0e] p-3 rounded-lg border-2 border-rose-900/80 text-xs shadow-inner flex items-start space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block font-typewriter">
                          [DATA CORRUPTED // TRACE FAILED]:
                        </span>
                        <span>{log.text}</span>
                      </div>
                    </div>
                  );
                }

                if (log.type === 'success') {
                  return (
                    <div
                      key={log.id}
                      className="pl-3 text-emerald-200 whitespace-pre-wrap font-mono bg-[#0f2918] p-3 rounded-lg border-2 border-emerald-600/60 flex items-start space-x-2.5 text-xs shadow-lg animate-stamp-slam"
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="rubber-stamp rubber-stamp-green text-[10px] mb-1">
                          ★ MATCH FOUND // WARRANT EXECUTED ★
                        </div>
                        <span className="font-semibold">{log.text}</span>
                      </div>
                    </div>
                  );
                }

                if (log.type === 'system') {
                  return (
                    <div key={log.id} className="text-stone-500 italic pl-2 text-[11px] font-typewriter">
                      {log.text}
                    </div>
                  );
                }

                return (
                  <div key={log.id} className="pl-2 whitespace-pre-wrap text-stone-300 font-mono">
                    {parseAnsi(log.text || '')}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
