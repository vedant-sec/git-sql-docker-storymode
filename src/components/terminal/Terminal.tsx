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
  let currentColor = 'text-amber-200';

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
      currentColor = 'text-amber-200';
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

  const [brightnessRotation, setBrightnessRotation] = useState(45);
  const [contrastRotation, setContrastRotation] = useState(120);

  const handleBrightnessTurn = () => {
    audioFx.playDial();
    setBrightnessRotation(prev => (prev + 30) % 360);
  };

  const handleContrastTurn = () => {
    audioFx.playDial();
    setContrastRotation(prev => (prev + 30) % 360);
  };

  return (
    <div className={`flex flex-col space-y-3 font-mono select-none ${hasGlitch ? 'glitch-active' : ''}`}>
      {/* Heavy Industrial CRT Monitor Chassis Sitting on the Desk */}
      <div className="crt-monitor-chassis p-4 md:p-5 relative">
        {/* Four Corner Industrial Hex Screws */}
        <div className="absolute top-2.5 left-2.5 hex-screw pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 hex-screw pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 hex-screw pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 hex-screw pointer-events-none" />

        {/* Industrial Stenciled Specification Badge & Dual LEDs */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-3 metal-spec-plate border border-[#4a3a34]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="status-led-green animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 font-typewriter uppercase tracking-wider">
                ● LINE CLEAR // READY
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="status-led-amber" />
              <span className="text-[9px] font-bold text-amber-500 font-typewriter uppercase tracking-wider">
                ● PWR
              </span>
            </div>
            <span className="text-[10.5px] font-black tracking-widest text-amber-300 font-typewriter uppercase">
              SERIAL NO. FT-991 // FORENSIC INTERCEPT UNIT
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[9px] text-stone-400 font-typewriter hidden sm:inline uppercase">
              MODEL: CRT-V4.0 // AMBER PHOSPHOR
            </span>
            <button
              onClick={() => {
                audioFx.playClick();
                setShowQueryLog(prev => !prev);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#160c0a] hover:bg-[#2e1515] text-amber-400 text-[10px] font-bold font-typewriter transition border border-[#522b22]"
            >
              <History className="w-3 h-3 text-amber-500" />
              <span>LOG TELEMETRY</span>
              {showQueryLog ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Main CRT Screen and Side Hardware Panel Container */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Left / Center: CRT Monitor Screen with Scanlines & Amber Phosphor */}
          <div className="flex-1 crt-screen rounded-lg border-3 border-[#2b1212] overflow-hidden flex flex-col shadow-2xl">
            {/* Screen Status Subheader */}
            <div className="bg-[#140808] px-4 py-2 border-b border-[#2b1212] flex items-center justify-between text-xs relative z-30">
              <div className="flex items-center space-x-2">
                <TerminalIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-400 font-bold tracking-widest text-[11px] font-typewriter">
                  {consoleHeader}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-typewriter">
                  {isLoading ? 'TRACING SIGNAL...' : 'LINE ARMED // READY'}
                </span>
              </div>
            </div>

            {/* Code Editor Body with Phosphor Amber Glow */}
            <div className="flex min-h-[145px] max-h-[260px] p-2 overflow-y-auto relative z-30 bg-[#070303]">
              {/* Line Numbers Gutter */}
              <div className="w-8 py-1.5 text-right pr-3 select-none text-amber-700/80 text-xs leading-6 font-mono border-r border-[#261010]">
                {lineNumbers.map(num => (
                  <div key={num}>{num}</div>
                ))}
              </div>

              {/* Textarea Input Area with Amber Phosphor Glow & Cursor */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    tool === 'sql'
                      ? '-- Enter forensic SQL intercept query... (Ctrl+E or Ctrl+Enter to dispatch)'
                      : tool === 'git'
                      ? '# Enter Git forensic command... (e.g. git status, git log)'
                      : '# Enter Docker runtime command... (e.g. docker ps, docker run)'
                  }
                  className="w-full h-full bg-transparent px-3 py-1.5 text-xs font-mono amber-phosphor-input placeholder:text-stone-700 focus:outline-none resize-none leading-6 whitespace-pre tracking-wide selection:bg-amber-900 selection:text-white"
                  rows={lineCount}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Industrial Push Button Action Bar */}
            <div className="bg-[#120707] px-4 py-3 border-t-2 border-[#2b1212] flex items-center justify-between relative z-30">
              {/* Left: Informant Tip / Wiretap Hint Button */}
              <div>
                {onOpenHint && (
                  <button
                    onClick={() => {
                      audioFx.playClick();
                      onOpenHint();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1f0f08] hover:bg-[#33180d] text-emerald-400 border border-emerald-600/40 text-xs font-bold font-typewriter transition shadow-sm active:translate-y-0.5"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>INFORMANTS / WIRETAP HINT</span>
                  </button>
                )}
              </div>

              {/* Right: Test Intercept & Execute Warrant */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRun}
                  disabled={isLoading || !inputCode.trim()}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-[#24100a] hover:bg-[#381a10] text-amber-200 disabled:opacity-40 text-xs font-bold font-typewriter transition border border-[#4d2214] active:translate-y-0.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>TEST INTERCEPT</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !inputCode.trim()}
                  className="flex items-center space-x-2 px-5 py-1.5 rounded bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white disabled:opacity-40 text-xs font-black font-typewriter tracking-wider shadow-lg shadow-black/80 transition border border-theme-scarlet active:translate-y-0.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>EXECUTE WARRANT // SUBMIT EVIDENCE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Authentic Hardware Speaker Grille & Dual Rotary Knobs */}
          <div className="w-full md:w-20 bg-[#160f0d] rounded-lg border-2 border-[#2b1a16] p-2.5 flex flex-row md:flex-col justify-between items-center shadow-inner">
            {/* Speaker Grille with Horizontal Slits */}
            <div className="w-full space-y-1 py-1">
              <div className="text-[8px] text-stone-500 font-typewriter text-center uppercase tracking-widest mb-1 hidden md:block">
                AUDIO
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="speaker-grille-slit" />
              ))}
            </div>

            {/* Rotary Dials Section */}
            <div className="flex flex-row md:flex-col items-center gap-3 my-1">
              {/* Brightness Knob */}
              <div className="flex flex-col items-center">
                <div
                  onClick={handleBrightnessTurn}
                  style={{ transform: `rotate(${brightnessRotation}deg)` }}
                  className="rotary-knob"
                  title="Adjust CRT Screen Brightness"
                />
                <span className="text-[8px] text-amber-600/80 font-typewriter uppercase mt-1 font-bold">
                  BRT
                </span>
              </div>

              {/* Contrast Knob */}
              <div className="flex flex-col items-center">
                <div
                  onClick={handleContrastTurn}
                  style={{ transform: `rotate(${contrastRotation}deg)` }}
                  className="rotary-knob"
                  title="Adjust CRT Screen Contrast"
                />
                <span className="text-[8px] text-amber-600/80 font-typewriter uppercase mt-1 font-bold">
                  CONTR
                </span>
              </div>
            </div>

            {/* Hardware Chassis Stamp */}
            <div className="text-[7.5px] text-stone-600 font-typewriter text-center uppercase tracking-widest hidden md:block">
              MK-IV
            </div>
          </div>
        </div>

        {/* Telemetry Output Log Window */}
        {showQueryLog && (
          <div className="crt-screen rounded-lg border-2 border-[#2b1212] overflow-hidden flex flex-col mt-2.5">
            <div className="bg-[#140808] px-4 py-2 border-b border-[#2b1212] flex items-center justify-between text-xs relative z-30">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-typewriter flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>FORENSIC TELEMETRY & DISPATCH RESULTS</span>
              </span>
              <button
                onClick={() => {
                  audioFx.playClick();
                  onClearLogs();
                }}
                className="text-[11px] text-stone-400 hover:text-white flex items-center space-x-1 font-typewriter transition"
                title="Purge Terminal Telemetry Log"
              >
                <Trash2 className="w-3 h-3" />
                <span>PURGE LOG</span>
              </button>
            </div>

            <div className="p-4 max-h-[280px] overflow-y-auto space-y-3 text-xs leading-relaxed bg-[#070303] relative z-30">
              {logs.length === 0 ? (
                <div className="text-stone-600 text-[11px] italic text-center py-6 font-typewriter">
                  -- NO ACTIVE INTERCEPT LOGS REGISTERED. WRITE A QUERY AND DISPATCH --
                </div>
              ) : (
                logs.map(log => {
                  if (log.type === 'input') {
                    return (
                      <div key={log.id} className="flex items-start space-x-2 pt-1 font-semibold">
                        <span className="text-theme-scarlet flex-shrink-0 select-none font-typewriter">
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
    </div>
  );
};
