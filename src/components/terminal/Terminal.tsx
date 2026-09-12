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
  let currentColor = 'text-[#fdedea]';

  return parts.map((part, idx) => {
    if (part === '\x1b[31m') {
      currentColor = 'text-[#F0593F]';
      return null;
    } else if (part === '\x1b[32m') {
      currentColor = 'text-emerald-400';
      return null;
    } else if (part === '\x1b[33m') {
      currentColor = 'text-[#F0593F]';
      return null;
    } else if (part === '\x1b[36m') {
      currentColor = 'text-[#fdedea]';
      return null;
    } else if (part === '\x1b[0m') {
      currentColor = 'text-[#fdedea]';
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#F0593F] shadow-sm shadow-[#F0593F]/50 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-[#fdedea] uppercase font-sans">
            {sectionLabel}
          </span>
        </div>

        <button
          onClick={() => setShowQueryLog(prev => !prev)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#240632] hover:bg-[#340948] text-[#fdedea] text-xs font-semibold shadow-sm transition border border-[#4b1064]"
        >
          <History className="w-3.5 h-3.5 text-[#F0593F]" />
          <span>QUERY LOG</span>
          {showQueryLog ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#F0593F]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#F0593F]" />
          )}
        </button>
      </div>

      {/* Editor & Terminal Container */}
      <div className="bg-[#180123] border border-[#4b1064] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Header Bar */}
        <div className="bg-[#13011b] px-4 py-2.5 border-b border-[#3b0d52] flex items-center justify-between text-xs">
          <div className="text-[#b98f9c] font-bold tracking-wider text-[11px]">
            {terminalTitle}
          </div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-[#F0593F] animate-ping' : 'bg-[#F0593F] animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold text-[#F0593F] uppercase tracking-wider">
              {isLoading ? 'EXECUTING...' : 'READY'}
            </span>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="flex min-h-[140px] max-h-[260px] bg-[#13011b] p-2 overflow-y-auto">
          {/* Line Numbers Gutter */}
          <div className="w-8 py-1.5 text-right pr-3 select-none text-[#881E3F] text-xs leading-6 font-mono border-r border-[#3b0d52]">
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
            className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-[#fdedea] placeholder:text-[#834863] focus:outline-none resize-none leading-6 whitespace-pre"
            rows={lineCount}
            spellCheck={false}
          />
        </div>

        {/* Action Toolbar */}
        <div className="bg-[#1a0227] px-4 py-3 border-t border-[#3b0d52] flex items-center justify-between">
          <div>
            {onOpenHint && (
              <button
                onClick={onOpenHint}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#240632] hover:bg-[#340948] text-[#F0593F] border border-[#BF2D42]/40 text-xs font-medium transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#F0593F]" />
                <span>Hint</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRun}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-[#881E3F] hover:bg-[#9e2249] text-white disabled:opacity-30 text-xs font-bold transition border border-[#BF2D42]"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Run</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center space-x-1.5 px-5 py-1.5 rounded-lg bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] disabled:opacity-30 text-xs font-black tracking-wide shadow-lg shadow-[#F0593F]/25 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query Log & Results Section */}
      {showQueryLog && (
        <div className="bg-[#180123] border border-[#4b1064] rounded-2xl shadow-2xl overflow-hidden flex flex-col mt-2">
          <div className="bg-[#13011b] px-4 py-2 border-b border-[#3b0d52] flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#b98f9c]">
              EXECUTION LOGS & RESULTS
            </span>
            <button
              onClick={onClearLogs}
              className="text-[11px] text-[#b98f9c] hover:text-[#fdedea] flex items-center space-x-1 transition"
              title="Clear Log"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="p-4 max-h-[300px] overflow-y-auto space-y-3 text-xs leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-[#834863] text-[11px] italic text-center py-4">
                No queries executed yet. Write a command and press Run or Submit.
              </div>
            ) : (
              logs.map(log => {
                if (log.type === 'input') {
                  return (
                    <div key={log.id} className="flex items-start space-x-2 pt-1 font-semibold">
                      <span className="text-[#F0593F] flex-shrink-0 select-none">nexus&gt;</span>
                      <span className="text-[#fdedea] whitespace-pre-wrap break-all">{log.command}</span>
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
                      className="pl-3 text-[#f67059] whitespace-pre-wrap font-mono bg-[#881E3F]/20 p-2.5 rounded-lg border border-[#BF2D42]/60 text-xs"
                    >
                      {log.text}
                    </div>
                  );
                }

                if (log.type === 'success') {
                  return (
                    <div
                      key={log.id}
                      className="pl-3 text-[#fdedea] whitespace-pre-wrap font-mono bg-[#881E3F]/35 p-3 rounded-lg border border-[#F0593F]/70 flex items-start space-x-2.5 text-xs shadow-inner"
                    >
                      <Sparkles className="w-4 h-4 text-[#F0593F] flex-shrink-0 mt-0.5" />
                      <span>{log.text}</span>
                    </div>
                  );
                }

                if (log.type === 'system') {
                  return (
                    <div key={log.id} className="text-[#b98f9c] italic pl-2 text-[11px]">
                      {log.text}
                    </div>
                  );
                }

                return (
                  <div key={log.id} className="pl-2 whitespace-pre-wrap text-[#fdedea] font-mono">
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
