import React, { useState, useEffect } from 'react';
import { X, FileCode, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { audioFx } from '../../utils/audioEffects';

interface FileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, string>;
  onSaveFile: (fileName: string, content: string) => void;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({
  isOpen,
  onClose,
  files,
  onSaveFile
}) => {
  const fileNames = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState<string>(fileNames[0] || '');
  const [content, setContent] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (fileNames.length > 0 && (!selectedFile || !files[selectedFile])) {
      setSelectedFile(fileNames[0]);
    }
  }, [files, selectedFile, fileNames]);

  useEffect(() => {
    if (selectedFile && files[selectedFile] !== undefined) {
      setContent(files[selectedFile]);
      setSavedSuccess(false);
    }
  }, [selectedFile, files]);

  if (!isOpen) return null;

  const hasConflictMarkers =
    content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>');

  const handleSave = () => {
    if (selectedFile) {
      audioFx.playClick();
      onSaveFile(selectedFile, content);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-4xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col h-[82vh] animate-game-modal shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {/* Modal Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                VIRTUAL WORKSPACE FILES
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Workspace Code Editor
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div className="w-64 bg-slate-950/80 border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">
              WORKSPACE FILES
            </div>
            {fileNames.map(f => {
              const isConflicted =
                files[f]?.includes('<<<<<<<') || files[f]?.includes('>>>>>>>');
              return (
                <button
                  key={f}
                  onClick={() => {
                    audioFx.playPaper();
                    setSelectedFile(f);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition border ${
                    selectedFile === f
                      ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white border-transparent'
                  }`}
                >
                  <span className="truncate font-mono">{f}</span>
                  {isConflicted && (
                    <span className="text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800 animate-pulse">
                      CONFLICT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Code Edit Area */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {/* Status notification bar */}
            {hasConflictMarkers && (
              <div className="bg-rose-950/40 border-b border-rose-900/60 px-4 py-2.5 flex items-center space-x-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>
                  <strong>MERGE CONFLICT ACTIVE:</strong> Remove the `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, and `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` conflict markers, keep the verified code, and click Save.
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="bg-emerald-950/40 border-b border-emerald-800/60 px-4 py-2.5 flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>File saved into virtual repository filesystem successfully!</span>
              </div>
            )}

            <div className="flex-1 p-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/60 resize-none selection:bg-cyan-900 selection:text-cyan-100 leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-slate-900/90 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                FILE: <span className="text-cyan-400 font-bold">{selectedFile}</span> ({content.split('\n').length} lines)
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    audioFx.playClick();
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="btn-cyber-primary px-4 py-1.5 text-xs flex items-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
