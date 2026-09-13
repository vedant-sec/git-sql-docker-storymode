import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Check,
  Radio,
  History,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
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
  let currentColor = 'text-amber-200';

  return parts
    .map((part, idx) => {
      if (part === '\x1b[31m') { currentColor = 'text-rose-400'; return null; }
      if (part === '\x1b[32m') { currentColor = 'text-emerald-400'; return null; }
      if (part === '\x1b[33m') { currentColor = 'text-amber-400'; return null; }
      if (part === '\x1b[36m') { currentColor = 'text-cyan-400'; return null; }
      if (part === '\x1b[0m') { currentColor = 'text-amber-200'; return null; }
      return <span key={idx} className={currentColor}>{part}</span>;
    })
    .filter(Boolean) as React.ReactNode[];
}

export const Terminal: React.FC<TerminalProps> = ({
  tool,
  logs,
  onExecuteCommand,
  onClearLogs,
  inputCode,
  setInputCode,
  isLoading,
  onOpenHint,
}) => {
  const [showLog, setShowLog] = useState(true);
  const [hasGlitch, setHasGlitch] = useState(false);
  const [knobAngle, setKnobAngle] = useState({ brightness: 45, contrast: -30 });
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLog) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLog]);

  useEffect(() => {
    if (logs.length > 0) {
      const last = logs[logs.length - 1];
      if (last.type === 'error') {
        audioFx.playGlitch();
        setHasGlitch(true);
        const t = setTimeout(() => setHasGlitch(false), 500);
        return () => clearTimeout(t);
      } else if (last.type === 'success') {
        audioFx.playStamp();
      }
    }
  }, [logs]);

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

  const handleKnobClick = (knob: 'brightness' | 'contrast') => {
    audioFx.playClick();
    setKnobAngle(prev => ({ ...prev, [knob]: prev[knob] + 45 }));
  };

  const lineCount = Math.max(inputCode.split('\n').length, 4);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const consoleHeader =
    tool === 'sql'
      ? 'DATA INTERCEPT TOOL // FORENSIC QUERY LINE'
      : tool === 'git'
      ? 'FORENSIC CODE SHELL // GIT COMMIT AUDITOR'
      : 'RUNTIME CONTAINER AUDITOR // DOCKER DAEMON';

  return (
    <div className={`font-mono select-none ${hasGlitch ? 'glitch-active' : ''}`}>
      {/* === CRT MONITOR CHASSIS === */}
      <div className="crt-chassis p-3 relative">

        {/* Four corner hex screws */}
        <div className="absolute top-2.5 left-2.5 hex-screw" />
        <div className="absolute top-2.5 right-2.5 hex-screw" />
        <div className="absolute bottom-2.5 left-2.5 hex-screw" />
        <div className="absolute bottom-2.5 right-2.5 hex-screw" />

        {/* Metal spec badge row */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 border-b border-[#3a2020]/60">
          <div className="flex items-center space-x-2">
            <div className="status-led-green animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-amber-500/80 font-typewriter uppercase">
              SIGNAL NO. FT-991 / FORENSIC INTERCEPT UNIT
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Log toggle */}
            <button
              onClick={() => {
                audioFx.playClick();
                setShowLog(prev => !prev);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#190d0d] hover:bg-[#2c1515] text-amber-400 text-[10px] font-bold font-typewriter transition border border-[#4a2020]"
            >
              <History className="w-3 h-3 text-amber-500" />
              <span>LOG TELEMETRY</span>
              {showLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* === CRT SCREEN AREA === */}
        <div className="flex gap-3">
          {/* Main screen column */}
          <div className="flex-1 min-w-0">
            <div className="crt-screen rounded-lg border-2 border-[#2b1010] flex flex-col">

              {/* Screen status header */}
              <div className="bg-[#120606] px-4 py-2 border-b border-[#261010] flex items-center justify-between text-xs relative z-30">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black tracking-widest text-amber-500/80 font-typewriter">
                    {consoleHeader}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="text-[9px] font-bold text-amber-500/70 font-typewriter uppercase tracking-widest">
                    {isLoading ? 'TRACING...' : '● LINE CLEAR // READY'}
                  </span>
                </div>
              </div>

              {/* Code editor input */}
              <div className="flex min-h-[130px] max-h-[240px] overflow-y-auto relative z-30 bg-[#060202]">
                {/* Line numbers */}
                <div className="w-9 py-2 pr-3 text-right select-none text-amber-800/70 text-xs leading-6 font-mono border-r border-[#1e0c0c] flex-shrink-0">
                  {lineNumbers.map(n => (
                    <div key={n}>{n}</div>
                  ))}
                </div>

                {/* Textarea */}
                <div className="flex-1 relative min-w-0">
                  <textarea
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      tool === 'sql'
                        ? '-- Forensic SQL intercept query... (Ctrl+E to dispatch)'
                        : tool === 'git'
                        ? '# Git forensic command... (e.g. git status, git log)'
                        : '# Docker runtime command... (e.g. docker ps, docker run)'
                    }
                    className="w-full h-full bg-transparent px-3 py-2 text-xs font-mono amber-phosphor-input placeholder:text-stone-700 focus:outline-none resize-none leading-6 whitespace-pre tracking-wide selection:bg-amber-900 selection:text-white"
                    rows={lineCount}
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Action toolbar */}
              <div className="bg-[#100505] px-4 py-2.5 border-t-2 border-[#231010] flex items-center justify-between relative z-30">
                <div>
                  {onOpenHint && (
                    <button
                      onClick={() => {
                        audioFx.playClick();
                        onOpenHint();
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1a0e07] hover:bg-[#2e1a0d] text-emerald-400 border border-emerald-700/40 text-[11px] font-bold font-typewriter transition"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>WIRETAP HINT</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleRun}
                    disabled={isLoading || !inputCode.trim()}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#220f08] hover:bg-[#361710] text-amber-200 disabled:opacity-40 text-[11px] font-bold font-typewriter transition border border-[#4a2010] active:translate-y-px"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>TEST INTERCEPT</span>
                  </button>

                  <button
                    onClick={handleRun}
                    disabled={isLoading || !inputCode.trim()}
                    className="flex items-center space-x-2 px-5 py-1.5 rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 text-[11px] font-black font-typewriter tracking-wider shadow-lg border border-theme-scarlet active:translate-y-px"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>EXECUTE WARRANT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side panel — speaker grilles + rotary knobs */}
          <div className="flex flex-col items-center justify-between w-10 flex-shrink-0 py-2">
            {/* Speaker grille top */}
            <div className="speaker-grille w-full">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="speaker-slit w-full" />
              ))}
            </div>

            {/* Rotary knobs */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex flex-col items-center space-y-1">
                <div
                  className="rotary-knob"
                  style={{ transform: `rotate(${knobAngle.brightness}deg)` }}
                  onClick={() => handleKnobClick('brightness')}
                  title="Brightness"
                />
                <span className="text-[7px] text-stone-600 font-typewriter uppercase tracking-wider">BRITE</span>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div
                  className="rotary-knob"
                  style={{ transform: `rotate(${knobAngle.contrast}deg)` }}
                  onClick={() => handleKnobClick('contrast')}
                  title="Contrast"
                />
                <span className="text-[7px] text-stone-600 font-typewriter uppercase tracking-wider">CONTR</span>
              </div>
            </div>

            {/* Speaker grille bottom */}
            <div className="speaker-grille w-full">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="speaker-slit w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 mt-1 border-t border-[#2a1010]/60">
          <span className="text-[8px] font-black tracking-widest text-stone-600 font-typewriter uppercase">
            SIGNAL NO. FT-981 // FORENSIC INTERCEPT UNIT
          </span>
          <div className="flex items-center space-x-2">
            <div className="status-led-green" />
            <span className="text-[8px] text-stone-500 font-typewriter tracking-widest uppercase">
              LINE CLEAR // READY
            </span>
          </div>
        </div>

        {/* === TELEMETRY LOG === */}
        {showLog && (
          <div className="crt-screen rounded-lg border-2 border-[#2b1010] mt-3 flex flex-col">
            <div className="bg-[#120606] px-4 py-1.5 border-b border-[#221010] flex items-center justify-between relative z-30">
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 font-typewriter flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>FORENSIC TELEMETRY &amp; DISPATCH RESULTS</span>
              </span>
              <button
                onClick={() => {
                  audioFx.playClick();
                  onClearLogs();
                }}
                className="text-[10px] text-stone-500 hover:text-white flex items-center space-x-1 font-typewriter transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>PURGE LOG</span>
              </button>
            </div>

            <div className="p-4 max-h-[260px] overflow-y-auto space-y-2.5 text-xs leading-relaxed bg-[#060202] relative z-30">
              {logs.length === 0 ? (
                <div className="text-stone-600 text-[11px] italic text-center py-6 font-typewriter">
                  -- NO ACTIVE INTERCEPT LOGS. WRITE A QUERY AND DISPATCH --
                </div>
              ) : (
                logs.map(log => {
                  if (log.type === 'input') {
                    return (
                      <div key={log.id} className="flex items-start space-x-2 pt-0.5 font-semibold">
                        <span className="text-theme-scarlet flex-shrink-0 font-typewriter select-none">
                          [DISPATCH]&gt;
                        </span>
                        <span className="text-amber-100 whitespace-pre-wrap break-all font-mono">
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
                        className="pl-3 text-rose-300 whitespace-pre-wrap font-mono bg-[#280c0c] p-3 rounded border-2 border-rose-900/80 flex items-start space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 block font-typewriter mb-0.5">
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
                        className="pl-3 text-emerald-200 whitespace-pre-wrap font-mono bg-[#0d2418] p-3 rounded border-2 border-emerald-600/60 flex items-start space-x-2.5 animate-stamp-slam"
                      >
                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="rubber-stamp rubber-stamp-green text-[9px] mb-1">
                            ★ MATCH FOUND // WARRANT EXECUTED ★
                          </div>
                          <span className="font-semibold">{log.text}</span>
                        </div>
                      </div>
                    );
                  }

                  if (log.type === 'system') {
                    return (
                      <div key={log.id} className="text-stone-500 italic pl-2 text-[10px] font-typewriter">
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
    </div>
  );
};
