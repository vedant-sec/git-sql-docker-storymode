import React from 'react';
import { X, Lightbulb, Code2, CheckCircle, BookOpen } from 'lucide-react';
import { ConceptDefinition } from '../../types/game';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#12151d] border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0b0e14] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/90 tracking-widest">
                {seasonTitle || 'CORE FORENSIC CONCEPT'}
              </div>
              <h3 className="text-sm font-bold tracking-wide text-slate-100">
                {concept?.title || 'SQL Analysis Fundamentals'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Concept Explanation */}
          <div className="bg-[#181c26] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Concept Overview</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {concept?.description || 'Understanding relational queries, filtering clauses, and grouping functions to parse forensic datasets.'}
            </p>
          </div>

          {/* Code Example */}
          {concept?.example && (
            <div className="bg-[#0e1118] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Syntax Pattern</span>
                </div>
                <span className="text-[10px] text-slate-500">CANONICAL EXAMPLE</span>
              </div>
              <pre className="text-xs text-emerald-300 font-mono bg-[#07090e] p-3.5 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre leading-relaxed">
                {concept.example}
              </pre>
            </div>
          )}

          {/* Key Takeaways */}
          {concept?.keyPoints && concept.keyPoints.length > 0 && (
            <div className="bg-[#181c26] border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Key Detective Takeaways
              </div>
              <ul className="space-y-2">
                {concept.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0b0e14] px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition shadow-md shadow-amber-950"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

