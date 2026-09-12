import React, { useState, useEffect } from 'react';
import { X, FileCode, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
      onSaveFile(selectedFile, content);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-200">
              VIRTUAL WORKSPACE FILE EDITOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div className="w-56 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              Workspace Files
            </div>
            {fileNames.map(f => {
              const isConflicted =
                files[f]?.includes('<<<<<<<') || files[f]?.includes('>>>>>>>');
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition ${
                    selectedFile === f
                      ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-800/80'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{f}</span>
                  {isConflicted && (
                    <span className="text-rose-400 text-[10px] font-bold px-1 py-0.5 rounded bg-rose-950/80">
                      CONFLICT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Code Edit Area */}
          <div className="flex-1 flex flex-col bg-slate-900/90">
            {/* Status notification bar */}
            {hasConflictMarkers && (
              <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-2 flex items-center space-x-2 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Merge Conflict Detected:</strong> Remove the `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, and `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` markers, keep the resolved code, and click Save.
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="bg-emerald-950/60 border-b border-emerald-800/60 px-4 py-2 flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>File saved to virtual filesystem successfully!</span>
              </div>
            )}

            <div className="flex-1 p-3">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/80 resize-none selection:bg-cyan-900 leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Editing: <span className="text-cyan-400 font-semibold">{selectedFile}</span> ({content.split('\n').length} lines)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium flex items-center space-x-1.5 transition shadow-lg shadow-cyan-900/30"
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
