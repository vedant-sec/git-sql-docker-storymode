import React from 'react';
import { X, Lightbulb, Code2, CheckCircle2, BookOpen } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="cyber-card w-full max-w-2xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-game-modal shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {seasonTitle || 'MISSION KNOWLEDGE BASE'}
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                {concept?.title || 'Core Command Concepts'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-950/60">
          {/* Concept Explanation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>THEORY & PURPOSE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {concept?.description || 'Understanding relational queries, filtering clauses, and grouping functions to parse forensic datasets.'}
            </p>
          </div>

          {/* Code Example */}
          {concept?.example && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Code2 className="w-4 h-4" />
                <span>COMMAND SYNTAX EXAMPLE</span>
              </div>
              <pre className="text-xs text-amber-300 font-mono bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre leading-relaxed">
                {concept.example}
              </pre>
            </div>
          )}

          {/* Key Takeaways */}
          {concept?.keyPoints && concept.keyPoints.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                KEY TAKEAWAYS:
              </div>
              <ul className="space-y-2">
                {concept.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="btn-cyber-primary px-5 py-1.5 text-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
