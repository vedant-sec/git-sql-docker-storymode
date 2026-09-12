import React from 'react';
import { X, BookOpen, Radio, ShieldCheck } from 'lucide-react';
import { ChapterDefinition } from '../../types/game';
import { CHARACTERS } from '../../data/storyline';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterDefinition;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, chapter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#F0593F]" />
            </div>
            <div>
              <div className="text-[10px] text-[#F0593F] font-bold uppercase tracking-widest">
                MISSION BRIEFING & TUTORIAL
              </div>
              <h3 className="text-sm font-bold text-white">
                {chapter.title} — {chapter.subtitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#b98f9c] hover:text-white p-1 rounded-lg hover:bg-[#240632] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Radio Transmission */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#F0593F] uppercase tracking-wider mb-2.5">
              <Radio className="w-3.5 h-3.5 text-[#F0593F]" />
              <span>FORENSIC COMMS INTERCEPT</span>
            </div>

            <div className="space-y-2.5">
              {chapter.storyIntro.map((msg, idx) => {
                const char =
                  Object.values(CHARACTERS).find(c => c.name.includes(msg.speaker)) ||
                  CHARACTERS.ramos;

                return (
                  <div
                    key={idx}
                    className="bg-[#240632] border border-[#4b1064] rounded-xl p-3.5 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-bold text-[11px]"
                        style={{ color: char.badgeColor || '#F0593F' }}
                      >
                        {msg.speaker}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-[#b98f9c]">{msg.timestamp}</span>
                      )}
                    </div>
                    <p className="text-[#fdedea] leading-relaxed font-sans text-xs">{msg.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detective How-to Tips */}
          <div className="bg-[#190224] border border-[#4b1064] rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#F0593F] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#F0593F]" />
              <span>Detective Field Guide</span>
            </div>
            <ul className="text-xs text-[#fdedea] space-y-2 font-sans">
              <li>• Read the target instruction on the <strong>Objective Card</strong>.</li>
              <li>• Write your query or command in the <strong>Terminal Editor</strong> below.</li>
              <li>• Use the <strong>Seasons menu</strong> on the left to inspect the <strong>Database Schema</strong>, learn the <strong>Concept Used</strong>, or unlock progressive <strong>Hints</strong>.</li>
              <li>• Click <strong>Run</strong> to preview your result, or <strong>Submit</strong> to check if you solved the case evidence!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg transition shadow-md shadow-[#F0593F]/25"
          >
            Ready for Duty
          </button>
        </div>
      </div>
    </div>
  );
};
