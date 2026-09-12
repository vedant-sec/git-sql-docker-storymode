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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
              SQLITE DATABASE SCHEMA // NEXUS FINANCIAL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {schemas.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Connecting to database schema...
            </div>
          ) : (
            schemas.map(table => (
            <div key={table.name} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70">
              <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase">{table.name}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {table.sampleCount} rows
                </span>
              </div>
              <div className="p-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800/80 text-[11px]">
                      <th className="py-1 px-2 font-semibold">COLUMN</th>
                      <th className="py-1 px-2 font-semibold">TYPE</th>
                      <th className="py-1 px-2 font-semibold">KEY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {table.columns.map(col => (
                      <tr key={col.name} className="hover:bg-slate-900/30">
                        <td className="py-1 px-2 font-medium text-slate-300">{col.name}</td>
                        <td className="py-1 px-2 text-cyan-400 font-mono text-[11px]">{col.type}</td>
                        <td className="py-1 px-2 text-[10px] text-amber-400">
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
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition"
          >
            Close Schema
          </button>
        </div>
      </div>
    </div>
  );
};
