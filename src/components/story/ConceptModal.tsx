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
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-[#F0593F]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#F0593F] tracking-widest">
                {seasonTitle || 'CORE FORENSIC CONCEPT'}
              </div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                {concept?.title || 'SQL Analysis Fundamentals'}
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
          {/* Concept Explanation */}
          <div className="bg-[#240632] border border-[#4b1064] rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#F0593F] uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#F0593F]" />
              <span>Concept Overview</span>
            </div>
            <p className="text-xs text-[#fdedea] leading-relaxed font-sans">
              {concept?.description || 'Understanding relational queries, filtering clauses, and grouping functions to parse forensic datasets.'}
            </p>
          </div>

          {/* Code Example */}
          {concept?.example && (
            <div className="bg-[#190224] border border-[#4b1064] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#b98f9c] uppercase tracking-wider mb-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-[#F0593F]" />
                  <span className="text-[#F0593F]">Syntax Pattern</span>
                </div>
                <span className="text-[10px] text-[#b98f9c]">CANONICAL EXAMPLE</span>
              </div>
              <pre className="text-xs text-[#fdedea] font-mono bg-[#13011b] p-3.5 rounded-lg border border-[#3b0d52] overflow-x-auto whitespace-pre leading-relaxed">
                {concept.example}
              </pre>
            </div>
          )}

          {/* Key Takeaways */}
          {concept?.keyPoints && concept.keyPoints.length > 0 && (
            <div className="bg-[#240632] border border-[#4b1064] rounded-xl p-4">
              <div className="text-xs font-semibold text-[#F0593F] uppercase tracking-wider mb-2.5">
                Key Detective Takeaways
              </div>
              <ul className="space-y-2">
                {concept.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-[#fdedea]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#F0593F] flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg transition shadow-md shadow-[#F0593F]/25"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
