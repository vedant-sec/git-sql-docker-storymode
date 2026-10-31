import { ReactNode, useState, useEffect, useRef } from 'react';
import { Trash2, CornerDownLeft } from 'lucide-react';

interface CRTTerminalProps {
  title?: string;
  onSubmit?: (input: string) => void;
  onHint?: () => void;
  onClear?: () => void;
  outputContent?: ReactNode;
  isLoading?: boolean;
  value?: string;
  onChangeValue?: (val: string) => void;
}

export function CRTTerminalMonitor({
  title = 'FORENSIC ANALYSIS TERMINAL',
  onSubmit,
  onHint,
  onClear,
  outputContent,
  isLoading = false,
  value,
  onChangeValue,
}: CRTTerminalProps) {
  const [internalInput, setInternalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const screenEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentInput = value !== undefined ? value : internalInput;

  const setInput = (val: string) => {
    if (onChangeValue) {
      onChangeValue(val);
    } else {
      setInternalInput(val);
    }
  };

  useEffect(() => {
    screenEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputContent]);

  const handleSubmit = () => {
    const trimmed = currentInput.trim();
    if (!trimmed || isLoading) return;

    if (trimmed === 'clear') {
      if (onClear) onClear();
      setInput('');
      return;
    }

    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    if (onSubmit) {
      onSubmit(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      e.preventDefault();
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] || '');
      return;
    }

    if (e.key === 'ArrowDown') {
      if (historyIdx === -1) return;
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] || '');
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
      return;
    }
  };

  return (
    <div className="crt-chassis p-4 flex flex-col gap-3 h-80 w-full shadow-2xl">
      {/* CRT bezel top panel */}
      <div className="flex justify-between items-center px-3 py-1.5 bg-gray-900 border-b border-gray-800 rounded-t">
        <div className="flex items-center gap-2">
          <div className="status-led-green" />
          <span className="text-xs font-mono text-gray-300 font-bold tracking-wider">{title}</span>
        </div>
        <div className="flex gap-3 items-center">
          {onClear && (
            <button
              onClick={onClear}
              title="Clear Terminal Screen"
              className="text-gray-400 hover:text-amber-400 text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> CLEAR
            </button>
          )}
          <span className="text-[11px] font-mono text-green-400">
            {isLoading ? 'EXECUTING...' : 'ONLINE // READY'}
          </span>
        </div>
      </div>

      {/* CRT screen */}
      <div className="crt-screen flex flex-col gap-2 rounded p-4 flex-1 overflow-y-auto">
        <div className="amber-phosphor text-xs leading-relaxed font-mono">
          {outputContent ? (
            outputContent
          ) : (
            <>
              <div>&gt; FORENSIC DATABASE & CONTAINER RUNTIME INITIALIZED</div>
              <div>&gt; ACCESS LEVEL: AGENT // CASE IN PROGRESS</div>
              <div>&gt; ENTER QUERY OR COMMAND BELOW...</div>
            </>
          )}
          <div ref={screenEndRef} />
        </div>
      </div>

      {/* Input area with industrial styling */}
      <div className="bg-gray-950 rounded p-2.5 border border-gray-800">
        <div className="flex gap-2 items-start mb-2">
          <span className="amber-phosphor text-xs font-mono pt-1">&gt;</span>
          <textarea
            ref={textareaRef}
            rows={1}
            value={currentInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter SQL query, git command, or docker instruction... (Press Enter to execute, Up/Down for history)"
            className="amber-phosphor-input flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder-gray-600 resize-none leading-relaxed"
            disabled={isLoading}
          />
        </div>

        {/* Action buttons styled as metal plates */}
        <div className="flex gap-2 justify-between items-center pt-1 border-t border-gray-900">
          <div className="text-[10px] text-gray-500 font-mono hidden sm:block">
            Tip: Press <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">Enter</kbd> to run, <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">Shift+Enter</kbd> for newline
          </div>
          <div className="flex gap-2 ml-auto">
            {onHint && (
              <button
                onClick={onHint}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-amber-400 text-xs font-mono rounded transition-colors"
              >
                [INFORMANT TIP]
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !currentInput.trim()}
              className="px-4 py-1 bg-red-900 hover:bg-red-800 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed border border-red-700 text-amber-300 text-xs font-mono font-bold rounded transition-colors flex items-center gap-1.5"
            >
              <span>[EXECUTE]</span>
              <CornerDownLeft size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* CRT bezel controls */}
      <div className="flex justify-between items-center px-2 py-0.5">
        <div className="flex gap-2 items-center">
          <div className="hex-screw" />
          <div className="rotary-knob" />
          <div className="hex-screw" />
        </div>
        <span className="text-[10px] font-mono text-gray-600">SIGNAL BUS: {isLoading ? 'BUSY' : 'IDLE'}</span>
      </div>
    </div>
  );
}
