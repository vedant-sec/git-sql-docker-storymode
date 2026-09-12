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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-theme-onyx border border-theme-darkBorder w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-theme-terminalInner px-5 py-3.5 border-b border-theme-darkBorderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-bloodRed/30 border border-theme-scarlet/60 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-theme-scarlet" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-theme-scarlet tracking-widest">
                {seasonTitle || 'CORE FORENSIC CONCEPT'}
              </div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                {concept?.title || 'SQL Analysis Fundamentals'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-textMuted hover:text-white p-1 rounded-lg hover:bg-theme-darkSurface transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Concept Explanation */}
          <div className="bg-theme-darkSurface border border-theme-darkBorder rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-theme-scarlet uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5 text-theme-scarlet" />
              <span>Concept Overview</span>
            </div>
            <p className="text-xs text-theme-textLight leading-relaxed font-sans">
              {concept?.description || 'Understanding relational queries, filtering clauses, and grouping functions to parse forensic datasets.'}
            </p>
          </div>

          {/* Code Example */}
          {concept?.example && (
            <div className="bg-theme-terminalInner border border-theme-darkBorder rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-theme-textMuted uppercase tracking-wider mb-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-theme-scarlet" />
                  <span className="text-theme-scarlet">Syntax Pattern</span>
                </div>
                <span className="text-[10px] text-theme-textMuted">CANONICAL EXAMPLE</span>
              </div>
              <pre className="text-xs text-theme-textLight font-mono bg-[#0c0505] p-3.5 rounded-lg border border-theme-darkBorderSubtle overflow-x-auto whitespace-pre leading-relaxed">
                {concept.example}
              </pre>
            </div>
          )}

          {/* Key Takeaways */}
          {concept?.keyPoints && concept.keyPoints.length > 0 && (
            <div className="bg-theme-darkSurface border border-theme-darkBorder rounded-xl p-4">
              <div className="text-xs font-semibold text-theme-scarlet uppercase tracking-wider mb-2.5">
                Key Detective Takeaways
              </div>
              <ul className="space-y-2">
                {concept.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-theme-textLight">
                    <CheckCircle className="w-3.5 h-3.5 text-theme-scarlet flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-theme-terminalInner px-5 py-3 border-t border-theme-darkBorderSubtle flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-theme-scarlet hover:bg-theme-scarletHover text-theme-white font-black rounded-lg transition shadow-md shadow-theme-scarlet/25"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
