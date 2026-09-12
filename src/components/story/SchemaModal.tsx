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
      <div className="bg-[#1C0228] border border-[#4b1064] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#13011b] px-5 py-3.5 border-b border-[#3b0d52] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#881E3F]/30 border border-[#BF2D42]/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#F0593F]" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              SQLITE DATABASE SCHEMA // NEXUS FINANCIAL
            </h3>
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
          {schemas.length === 0 ? (
            <div className="text-center py-8 text-[#834863] text-sm">
              Connecting to database schema...
            </div>
          ) : (
            schemas.map(table => (
              <div key={table.name} className="border border-[#4b1064] rounded-xl overflow-hidden bg-[#240632]/70 shadow-sm">
                <div className="bg-[#190224] px-4 py-2.5 border-b border-[#3b0d52] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-[#F0593F]" />
                    <span className="text-xs font-bold text-white uppercase">{table.name}</span>
                  </div>
                  <span className="text-[11px] text-[#b98f9c] font-semibold">
                    {table.sampleCount} rows
                  </span>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#b98f9c] border-b border-[#3b0d52] text-[11px]">
                        <th className="py-1.5 px-3 font-semibold">COLUMN</th>
                        <th className="py-1.5 px-3 font-semibold">TYPE</th>
                        <th className="py-1.5 px-3 font-semibold">KEY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3b0d52]/50">
                      {table.columns.map(col => (
                        <tr key={col.name} className="hover:bg-[#881E3F]/20">
                          <td className="py-1.5 px-3 font-medium text-[#fdedea]">{col.name}</td>
                          <td className="py-1.5 px-3 text-[#F0593F] font-mono text-[11px]">{col.type}</td>
                          <td className="py-1.5 px-3 text-[10px] text-[#F0593F] font-bold">
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
        <div className="bg-[#13011b] px-5 py-3 border-t border-[#3b0d52] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs bg-[#F0593F] hover:bg-[#f67059] text-[#1C0228] font-black rounded-lg transition shadow-md shadow-[#F0593F]/25"
          >
            Close Schema
          </button>
        </div>
      </div>
    </div>
  );
};
