import React from 'react';
import { X, Lightbulb, Code2, CheckCircle, BookOpen } from 'lucide-react';
import { ConceptDefinition } from '../../types/game';
import { audioFx } from '../../utils/audioEffects';

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept?: ConceptDefinition;
  seasonTitle?: string;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({
  isOpen,
  onClose,
  concept,
  seasonTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#331111] border border-theme-scarlet/60 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-theme-scarlet" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp text-[9px] px-1.5 py-0.2 tracking-widest text-[#d93e3e] border-[#d93e3e]">
                  STANDARD PROCEDURES
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">
                  {seasonTitle || 'FORENSIC INVESTIGATION PLAYBOOK'}
                </span>
              </div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase font-typewriter mt-0.5">
                {concept?.title || 'Investigative Query Methodology'}
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
          {/* Concept Explanation */}
          <div className="bg-[#140808] border-2 border-[#3d1818] rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 font-typewriter">
              <BookOpen className="w-3.5 h-3.5 text-theme-scarlet" />
              <span>FORENSIC OPERATIONAL PRINCIPLE</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-report">
              {concept?.description || 'Understanding relational queries, filtering clauses, and grouping functions to parse forensic datasets.'}
            </p>
          </div>

          {/* Code Example */}
          {concept?.example && (
            <div className="bg-[#0a0404] border-2 border-[#3d1818] rounded-lg p-4 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 font-typewriter">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>SYNTAX BLUEPRINT // CANONICAL INTERCEPT</span>
                </div>
              </div>
              <pre className="text-xs text-amber-300 font-mono bg-[#140808] p-3.5 rounded border border-[#2e1313] overflow-x-auto whitespace-pre leading-relaxed">
                {concept.example}
              </pre>
            </div>
          )}

          {/* Key Takeaways */}
          {concept?.keyPoints && concept.keyPoints.length > 0 && (
            <div className="bg-[#140808] border-2 border-[#3d1818] rounded-lg p-4">
              <div className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5 font-typewriter">
                TACTICAL FIELD OBSERVATIONS:
              </div>
              <ul className="space-y-2">
                {concept.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-stone-300 font-report">
                    <CheckCircle className="w-3.5 h-3.5 text-theme-scarlet flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            ACKNOWLEDGE DIRECTIVE
          </button>
        </div>
      </div>
    </div>
  );
};
