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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#331111] border border-theme-scarlet/60 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-theme-scarlet" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp text-[9px] px-1.5 py-0.2 tracking-widest text-[#d93e3e] border-[#d93e3e]">
                  CONFIDENTIAL FILES
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">VIRTUAL FILE SYSTEM DISK</span>
              </div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase font-typewriter mt-0.5">
                EXFILTRATED WORKSPACE ARTIFACTS
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="text-stone-400 hover:text-white p-1 rounded bg-[#2a0e0e] hover:bg-[#3d1515] transition border border-[#4a1c1c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div className="w-60 bg-[#0d0505] border-r-2 border-[#3d1818] p-3 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 px-2 font-typewriter">
              INTERCEPTED ARTIFACTS
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
                  className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between transition border ${
                    selectedFile === f
                      ? 'bg-[#291010] text-theme-scarlet border-[#541c1c] font-bold'
                      : 'text-stone-400 hover:bg-[#1f0c0c] hover:text-white border-transparent'
                  }`}
                >
                  <span className="truncate font-mono">{f}</span>
                  {isConflicted && (
                    <span className="text-rose-400 text-[9px] font-black px-1 py-0.2 rounded bg-rose-950/80 border border-rose-800">
                      CONFLICT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Code Edit Area */}
          <div className="flex-1 flex flex-col bg-[#090404]">
            {/* Status notification bar */}
            {hasConflictMarkers && (
              <div className="bg-[#2e1010] border-b-2 border-rose-900 px-4 py-2 flex items-center space-x-2 text-rose-300 text-xs font-typewriter">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>
                  <strong>MERGE CONFLICT ACTIVE:</strong> Remove the `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, and `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` conflict markers, keep the verified code, and click Save.
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="bg-[#0f2918] border-b-2 border-emerald-700 px-4 py-2 flex items-center space-x-2 text-emerald-300 text-xs font-typewriter animate-stamp-slam">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Artifact saved into virtual repository filesystem successfully!</span>
              </div>
            )}

            <div className="flex-1 p-3">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-full bg-[#0d0505] border-2 border-[#2b1010] rounded-lg p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-theme-scarlet/80 resize-none selection:bg-theme-bloodRed selection:text-white leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-[#140808] px-5 py-3 border-t-2 border-[#3d1818] flex items-center justify-between">
              <div className="text-[11px] text-stone-500 font-typewriter">
                EXHIBIT: <span className="text-theme-scarlet font-bold font-mono">{selectedFile}</span> ({content.split('\n').length} LINES)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    audioFx.playClick();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-white rounded bg-[#210d0d] hover:bg-[#331414] font-typewriter transition border border-[#3d1515]"
                >
                  DISMISS
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white rounded font-bold font-typewriter flex items-center space-x-1.5 transition shadow-lg shadow-black/50 border border-theme-scarlet"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>COMMIT FILE CHANGES</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
