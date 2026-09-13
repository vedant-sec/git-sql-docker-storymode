import { ReactNode } from 'react';
import { Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';

interface ManilaEvidenceFolderProps {
  title: string;
  caseNumber: number;
  totalCases: number;
  stamp?: string;
  stampColor?: 'red' | 'green';
  onPrevious?: () => void;
  onNext?: () => void;
  children: ReactNode;
}

export function ManilaEvidenceFolder({
  title,
  caseNumber,
  totalCases,
  stamp,
  stampColor = 'red',
  onPrevious,
  onNext,
  children,
}: ManilaEvidenceFolderProps) {
  return (
    <div className="manila-folder rounded-lg p-8 flex flex-col h-full">
      {/* Folder tab */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-yellow-900">
        <div className="manila-tab-label">
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {stamp && (
            <div className={`rubber-stamp ${stampColor === 'green' ? 'rubber-stamp-green' : ''} rubber-stamp-diagonal`}>
              {stamp}
            </div>
          )}
          <Paperclip className="paperclip-accent w-6 h-6" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto font-mono text-sm text-gray-900 mb-6">
        {children}
      </div>

      {/* Navigation buttons - styled as dog-eared corners */}
      <div className="flex justify-between items-center gap-4 pt-4 border-t border-yellow-900">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-800 hover:bg-yellow-700 text-white font-mono text-xs rounded transition-colors"
        >
          <ChevronLeft size={16} />
          PRIOR LEAD
        </button>

        <span className="text-xs text-gray-700 font-mono">
          Case {caseNumber} / {totalCases}
        </span>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-800 hover:bg-yellow-700 text-white font-mono text-xs rounded transition-colors"
        >
          PURSUE LEAD
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
