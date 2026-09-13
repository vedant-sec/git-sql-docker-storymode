import React from 'react';
import { X, BookOpen, Radio, ShieldCheck } from 'lucide-react';
import { ChapterDefinition } from '../../types/game';
import { CHARACTERS } from '../../data/storyline';
import { audioFx } from '../../utils/audioEffects';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterDefinition;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, chapter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#331111] border border-theme-scarlet/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-theme-scarlet" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp text-[9px] px-1.5 py-0.2 tracking-widest text-[#d93e3e] border-[#d93e3e]">
                  FIELD MANUAL
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">STANDARD OPERATING PROTOCOL</span>
              </div>
              <h3 className="text-sm font-black text-white uppercase font-typewriter mt-0.5">
                {chapter.title} — {chapter.subtitle}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#0d0505]">
          {/* Radio Transmission */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5 font-typewriter">
              <Radio className="w-3.5 h-3.5 text-theme-scarlet animate-pulse" />
              <span>FORENSIC COMMS INTERCEPT TRANSCRIPT</span>
            </div>

            <div className="space-y-2.5">
              {chapter.storyIntro.map((msg, idx) => {
                const char =
                  Object.values(CHARACTERS).find(c => c.name.includes(msg.speaker)) ||
                  CHARACTERS.ramos;

                return (
                  <div
                    key={idx}
                    className="bg-[#140808] border border-[#381616] rounded-lg p-3.5 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-bold text-[11px] font-typewriter"
                        style={{ color: char.badgeColor || '#d93e3e' }}
                      >
                        [CALLSIGN]: {msg.speaker}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-stone-500 font-mono">{msg.timestamp}</span>
                      )}
                    </div>
                    <p className="text-stone-200 leading-relaxed font-report text-xs">{msg.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detective Field Guidelines */}
          <div className="bg-[#140808] border-2 border-[#3d1818] rounded-lg p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-theme-scarlet uppercase tracking-wider mb-2 font-typewriter">
              <ShieldCheck className="w-4 h-4 text-theme-scarlet" />
              <span>DETECTIVE INVESTIGATION PROTOCOL</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-2.5 font-report">
              <li>• Inspect the <strong>Incident Memorandum</strong> on the desk above for your specific target instruction.</li>
              <li>• Dispatch queries or commands directly into the <strong>Forensic Mainframe</strong> below.</li>
              <li>• Click <strong>TEST INTERCEPT</strong> to preview output, or <strong>EXECUTE WARRANT</strong> to officially file and validate the evidence.</li>
              <li>• Open the left <strong>Criminal Dossier</strong> to consult <strong>Crime Scene Records</strong>, review <strong>Forensic Methodology</strong>, or tap <strong>Wiretap Intel</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#140808] px-5 py-3 border-t-2 border-[#4a1c1c] flex justify-end">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-5 py-1.5 text-xs bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white font-bold rounded font-typewriter transition border border-theme-scarlet"
          >
            REPORT FOR DUTY
          </button>
        </div>
      </div>
    </div>
  );
};
