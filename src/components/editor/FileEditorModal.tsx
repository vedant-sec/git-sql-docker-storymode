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
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Modal Header */}
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-[#F0593F]" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              VIRTUAL WORKSPACE FILE EDITOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#b98f9c] hover:text-white p-1 rounded-lg hover:bg-[#240632] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div className="w-56 bg-[#13011b]/80 border-r border-[#3b0d52] p-3 space-y-1 overflow-y-auto">
            <div className="text-[11px] font-bold text-[#b98f9c] uppercase tracking-wider mb-2 px-2">
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
                      ? 'bg-[#881E3F]/35 text-[#F0593F] border border-[#BF2D42]/60'
                      : 'text-slate-300 hover:bg-[#240632] hover:text-white'
                  }`}
                >
                  <span className="truncate font-medium">{f}</span>
                  {isConflicted && (
                    <span className="text-[#F0593F] text-[10px] font-black px-1.5 py-0.5 rounded bg-[#881E3F]/80 border border-[#BF2D42]">
                      CONFLICT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Code Edit Area */}
          <div className="flex-1 flex flex-col bg-[#1C0228]">
            {/* Status notification bar */}
            {hasConflictMarkers && (
              <div className="bg-[#881E3F]/40 border-b border-[#BF2D42]/60 px-4 py-2.5 flex items-center space-x-2 text-[#F0593F] text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Merge Conflict Detected:</strong> Remove the `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, and `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` markers, keep the resolved code, and click Save.
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="bg-[#881E3F]/30 border-b border-[#F0593F]/60 px-4 py-2.5 flex items-center space-x-2 text-[#fdedea] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#F0593F] flex-shrink-0" />
                <span>File saved to virtual filesystem successfully!</span>
              </div>
            )}

            <div className="flex-1 p-3.5 bg-[#14011e]">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-full bg-[#0e0015] border border-[#3b0d52] rounded-xl p-3.5 text-xs font-mono text-[#fdedea] focus:outline-none focus:border-[#F0593F] resize-none selection:bg-[#881E3F] leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex items-center justify-between">
              <div className="text-[11px] text-[#b98f9c]">
                Editing: <span className="text-[#F0593F] font-semibold">{selectedFile}</span> ({content.split('\n').length} lines)
              </div>
              <div className="flex space-x-2.5">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-[#b98f9c] hover:text-white rounded-lg hover:bg-[#240632] transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg flex items-center space-x-1.5 transition shadow-md shadow-[#F0593F]/25"
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
