import React, { useState, useRef, useEffect } from 'react';
import { Play, Check, Lightbulb, History, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { TableOutput } from './TableOutput';
import { QueryResult } from '../../types/sql';
import { ToolType } from '../../types/game';

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
  let currentColor = 'text-slate-300';

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
      currentColor = 'text-slate-300';
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
  const logEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showQueryLog) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showQueryLog]);

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
    onExecuteCommand(trimmed);
  };

  const handleSubmit = () => {
    const trimmed = inputCode.trim();
    if (!trimmed || isLoading) return;
    onExecuteCommand(trimmed);
  };

  // Compute line count for gutter
  const lineCount = Math.max(inputCode.split('\n').length, 3);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const terminalTitle =
    tool === 'sql'
      ? 'SQL_ANALYSIS_TERMINAL'
      : tool === 'git'
      ? 'GIT_FORENSIC_SHELL'
      : 'DOCKER_RUNTIME_SHELL';

  const sectionLabel =
    tool === 'sql'
      ? 'SQL TERMINAL'
      : tool === 'git'
      ? 'GIT TERMINAL'
      : 'DOCKER TERMINAL';

  return (
    <div className="flex flex-col space-y-3 font-mono">
      {/* Outer Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-xs font-bold tracking-wider text-stone-800 uppercase font-sans">
            {sectionLabel}
          </span>
        </div>

        <button
          onClick={() => setShowQueryLog(prev => !prev)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold shadow-sm transition"
        >
          <History className="w-3.5 h-3.5 text-stone-400" />
          <span>QUERY LOG</span>
          {showQueryLog ? (
            <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>
      </div>

      {/* Editor & Terminal Container */}
      <div className="bg-theme-onyx border border-theme-darkBorder rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Terminal Header Bar */}
        <div className="bg-theme-terminalInner px-4 py-2.5 border-b border-theme-darkBorder flex items-center justify-between text-xs">
          <div className="text-slate-400 font-bold tracking-wider text-[11px]">
            {terminalTitle}
          </div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-theme-scarlet animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isLoading ? 'EXECUTING...' : 'READY'}
            </span>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="flex min-h-[140px] max-h-[260px] bg-theme-terminalInner p-2 overflow-y-auto">
          {/* Line Numbers Gutter */}
          <div className="w-8 py-1.5 text-right pr-3 select-none text-slate-600 text-xs leading-6 font-mono border-r border-theme-darkBorderSubtle">
            {lineNumbers.map(num => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              tool === 'sql'
                ? '-- Detective, enter your SQL query here... (Ctrl+E or Ctrl+Enter to run)'
                : tool === 'git'
                ? '# Enter Git command here... (e.g. git status, git log)'
                : '# Enter Docker command here... (e.g. docker ps, docker run)'
            }
            className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none resize-none leading-6 whitespace-pre"
            rows={lineCount}
            spellCheck={false}
          />
        </div>

        {/* Action Toolbar */}
        <div className="bg-theme-terminalToolbar px-4 py-3 border-t border-theme-darkBorder flex items-center justify-between">
          <div>
            {onOpenHint && (
              <button
                onClick={onOpenHint}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-theme-darkSurface hover:bg-theme-darkSurfaceHover text-theme-scarlet border border-theme-scarlet/30 text-xs font-medium transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-theme-scarlet" />
                <span>Hint</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRun}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-theme-darkSurface hover:bg-theme-darkSurfaceHover text-slate-200 disabled:opacity-40 text-xs font-bold transition border border-theme-darkBorderSubtle"
            >
              <Play className="w-3.5 h-3.5 fill-current text-slate-300" />
              <span>Run</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-1.5 px-5 py-1.5 rounded-lg bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 text-xs font-black tracking-wide shadow-md shadow-black/40 transition border border-theme-scarlet/40"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query Log & Results Section */}
      {showQueryLog && (
        <div className="bg-theme-onyx border border-theme-darkBorder rounded-2xl shadow-xl overflow-hidden flex flex-col mt-2">
          <div className="bg-theme-terminalInner px-4 py-2 border-b border-theme-darkBorder flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              EXECUTION LOGS & RESULTS
            </span>
            <button
              onClick={onClearLogs}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition"
              title="Clear Log"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="p-4 max-h-[300px] overflow-y-auto space-y-3 text-xs leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-[11px] italic text-center py-4">
                No queries executed yet. Write a command and press Run or Submit.
              </div>
            ) : (
              logs.map(log => {
                if (log.type === 'input') {
                  return (
                    <div key={log.id} className="flex items-start space-x-2 pt-1 font-semibold">
                      <span className="text-cyan-400 flex-shrink-0 select-none">nexus&gt;</span>
                      <span className="text-slate-100 whitespace-pre-wrap break-all">{log.command}</span>
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
                      className="pl-3 text-rose-400 whitespace-pre-wrap font-mono bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 text-xs"
                    >
                      {log.text}
                    </div>
                  );
                }

                if (log.type === 'success') {
                  return (
                    <div
                      key={log.id}
                      className="pl-3 text-emerald-300 whitespace-pre-wrap font-mono bg-emerald-950/25 p-3 rounded-lg border border-emerald-800/40 flex items-start space-x-2.5 text-xs shadow-inner"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{log.text}</span>
                    </div>
                  );
                }

                if (log.type === 'system') {
                  return (
                    <div key={log.id} className="text-slate-500 italic pl-2 text-[11px]">
                      {log.text}
                    </div>
                  );
                }

                return (
                  <div key={log.id} className="pl-2 whitespace-pre-wrap text-slate-300 font-mono">
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
