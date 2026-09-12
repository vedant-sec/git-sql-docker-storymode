import React from 'react';
import { X, Database, Table } from 'lucide-react';
import { TableSchema } from '../../types/sql';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: TableSchema[];
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose, schemas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
      <div className="bg-theme-onyx border border-theme-darkBorder w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-theme-terminalInner px-5 py-3.5 border-b border-theme-darkBorderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-bloodRed/30 border border-theme-scarlet/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-theme-scarlet" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              SQLITE DATABASE SCHEMA // NEXUS FINANCIAL
            </h3>
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
          {schemas.length === 0 ? (
            <div className="text-center py-8 text-theme-textMuted text-sm">
              Connecting to database schema...
            </div>
          ) : (
            schemas.map(table => (
              <div key={table.name} className="border border-theme-darkBorder rounded-xl overflow-hidden bg-theme-darkSurface/70 shadow-sm">
                <div className="bg-theme-terminalInner px-4 py-2.5 border-b border-theme-darkBorderSubtle flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-theme-scarlet" />
                    <span className="text-xs font-bold text-white uppercase">{table.name}</span>
                  </div>
                  <span className="text-[11px] text-theme-textMuted font-semibold">
                    {table.sampleCount} rows
                  </span>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-theme-textMuted border-b border-theme-darkBorderSubtle text-[11px]">
                        <th className="py-1.5 px-3 font-semibold">COLUMN</th>
                        <th className="py-1.5 px-3 font-semibold">TYPE</th>
                        <th className="py-1.5 px-3 font-semibold">KEY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-darkBorderSubtle/60">
                      {table.columns.map(col => (
                        <tr key={col.name} className="hover:bg-theme-bloodRed/20">
                          <td className="py-1.5 px-3 font-medium text-theme-textLight">{col.name}</td>
                          <td className="py-1.5 px-3 text-theme-scarlet font-mono text-[11px]">{col.type}</td>
                          <td className="py-1.5 px-3 text-[10px] text-theme-scarlet font-bold">
                            {col.primaryKey ? 'PRIMARY KEY' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-theme-terminalInner px-5 py-3 border-t border-theme-darkBorderSubtle flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-theme-scarlet hover:bg-theme-scarletHover text-theme-white font-black rounded-lg transition shadow-md shadow-theme-scarlet/25"
          >
            Close Schema
          </button>
        </div>
      </div>
    </div>
  );
};
