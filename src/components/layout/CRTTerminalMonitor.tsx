import { ReactNode, useState } from 'react';

interface CRTTerminalProps {
  title?: string;
  onSubmit?: (input: string) => void;
  onHint?: () => void;
  outputContent?: ReactNode;
  isLoading?: boolean;
}

export function CRTTerminalMonitor({
  title = 'FORENSIC ANALYSIS TERMINAL',
  onSubmit,
  onHint,
  outputContent,
  isLoading = false,
}: CRTTerminalProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (onSubmit && input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="crt-chassis p-4 flex flex-col gap-3 h-72 w-full">
      {/* CRT bezel top panel */}
      <div className="flex justify-between items-center px-3 py-2 bg-gray-900 rounded-t">
        <span className="text-xs font-mono text-gray-400">{title}</span>
        <div className="flex gap-2 items-center">
          <div className="status-led-green" />
          <span className="text-xs font-mono text-green-400">LINE CLEAR // READY</span>
        </div>
      </div>

      {/* CRT screen */}
      <div className="crt-screen flex flex-col gap-2 rounded p-4 flex-1 overflow-y-auto">
        <div className="amber-phosphor text-xs leading-relaxed font-mono">
          {outputContent ? (
            outputContent
          ) : (
            <>
              <div>&gt; FORENSIC DATABASE v2.4 INITIALIZED</div>
              <div>&gt; ACCESS LEVEL: INVESTIGATION</div>
              <div>&gt; AWAITING QUERY...</div>
            </>
          )}
        </div>
      </div>

      {/* Input area with industrial styling */}
      <div className="bg-gray-950 rounded p-3 border border-gray-800">
        <div className="flex gap-2 mb-2">
          <span className="amber-phosphor text-xs font-mono">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter SQL query or git command..."
            className="amber-phosphor-input flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder-gray-600"
            disabled={isLoading}
          />
        </div>

        {/* Action buttons styled as metal plates */}
        <div className="flex gap-2 justify-end">
          {onHint && (
            <button
              onClick={onHint}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-amber-400 text-xs font-mono rounded transition-colors"
            >
              [INFORMANT TIP]
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="px-4 py-1 bg-red-900 hover:bg-red-800 disabled:bg-gray-700 disabled:cursor-not-allowed border border-red-700 text-amber-300 text-xs font-mono font-bold rounded transition-colors"
          >
            [SUBMIT EVIDENCE]
          </button>
        </div>
      </div>

      {/* CRT bezel controls */}
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex gap-2">
          <div className="hex-screw" />
          <div className="rotary-knob" />
          <div className="hex-screw" />
        </div>
        <span className="text-xs font-mono text-gray-500">SIGNAL: {isLoading ? 'PROCESSING' : 'IDLE'}</span>
      </div>
    </div>
  );
}
