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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-theme-onyx border border-theme-darkBorder w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Modal Header */}
        <div className="bg-theme-terminalInner px-5 py-3.5 border-b border-theme-darkBorderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-bloodRed/30 border border-theme-scarlet/60 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-theme-scarlet" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              VIRTUAL WORKSPACE FILE EDITOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-theme-textMuted hover:text-white p-1 rounded-lg hover:bg-theme-darkSurface transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div className="w-56 bg-theme-terminalInner/80 border-r border-theme-darkBorderSubtle p-3 space-y-1 overflow-y-auto">
            <div className="text-[11px] font-bold text-theme-textMuted uppercase tracking-wider mb-2 px-2">
              Workspace Files
            </div>
            {fileNames.map(f => {
              const isConflicted =
                files[f]?.includes('<<<<<<<') || files[f]?.includes('>>>>>>>');
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedFile === f
                      ? 'bg-theme-bloodRed/35 text-theme-scarlet border border-theme-scarlet/60'
                      : 'text-slate-300 hover:bg-theme-darkSurface hover:text-white'
                  }`}
                >
                  <span className="truncate font-medium">{f}</span>
                  {isConflicted && (
                    <span className="text-white text-[10px] font-black px-1.5 py-0.5 rounded bg-theme-bloodRed border border-theme-scarlet">
                      CONFLICT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Code Edit Area */}
          <div className="flex-1 flex flex-col bg-theme-onyx">
            {/* Status notification bar */}
            {hasConflictMarkers && (
              <div className="bg-theme-bloodRed/40 border-b border-theme-scarlet/60 px-4 py-2.5 flex items-center space-x-2 text-theme-scarlet text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Merge Conflict Detected:</strong> Remove the `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, and `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` markers, keep the resolved code, and click Save.
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="bg-theme-bloodRed/30 border-b border-theme-scarlet/60 px-4 py-2.5 flex items-center space-x-2 text-theme-textLight text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-theme-scarlet flex-shrink-0" />
                <span>File saved to virtual filesystem successfully!</span>
              </div>
            )}

            <div className="flex-1 p-3.5 bg-theme-terminalInner">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-full bg-[#0c0505] border border-theme-darkBorderSubtle rounded-xl p-3.5 text-xs font-mono text-theme-textLight focus:outline-none focus:border-theme-scarlet resize-none selection:bg-theme-bloodRed leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-theme-terminalInner px-5 py-3 border-t border-theme-darkBorderSubtle flex items-center justify-between">
              <div className="text-[11px] text-theme-textMuted">
                Editing: <span className="text-theme-scarlet font-semibold">{selectedFile}</span> ({content.split('\n').length} lines)
              </div>
              <div className="flex space-x-2.5">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-theme-textMuted hover:text-white rounded-lg hover:bg-theme-darkSurface transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs bg-theme-scarlet hover:bg-theme-scarletHover text-theme-white font-black rounded-lg flex items-center space-x-1.5 transition shadow-md shadow-theme-scarlet/25"
                >
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
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
