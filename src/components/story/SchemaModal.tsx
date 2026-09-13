import React from 'react';
import { X, Database, Table, Fingerprint } from 'lucide-react';
import { TableSchema } from '../../types/sql';
import { audioFx } from '../../utils/audioEffects';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: TableSchema[];
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose, schemas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#120808] border-2 border-[#4a1c1c] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c0a0a] via-[#2a0e0e] to-[#1c0a0a] px-5 py-3.5 border-b-2 border-[#4a1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#331111] border border-theme-scarlet/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-theme-scarlet" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rubber-stamp text-[9px] px-1.5 py-0.2 tracking-widest text-[#d93e3e] border-[#d93e3e]">
                  CONFIDENTIAL
                </span>
                <span className="text-[10px] text-stone-400 font-typewriter">POLICE EVIDENCE ARCHIVE #901</span>
              </div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase font-typewriter mt-0.5">
                CRIME SCENE RECORDS // SUSPECT DATABASE
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
          {schemas.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs font-typewriter">
              -- INTERCEPTING RELATIONAL DATABASE SCHEMA TELEMETRY... --
            </div>
          ) : (
            schemas.map(table => (
              <div key={table.name} className="border-2 border-[#3d1818] rounded-lg overflow-hidden bg-[#140808] shadow-md">
                <div className="bg-[#1c0a0a] px-4 py-2.5 border-b border-[#3d1818] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-theme-scarlet" />
                    <span className="text-xs font-bold text-white uppercase font-typewriter">{table.name}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-typewriter">
                    {table.sampleCount} RECORDS ARCHIVED
                  </span>
                </div>
                <div className="p-2 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-stone-400 border-b border-[#2d1212] text-[11px] font-typewriter">
                        <th className="py-1.5 px-3 font-semibold">COLUMN ATTR</th>
                        <th className="py-1.5 px-3 font-semibold">DATA TYPE</th>
                        <th className="py-1.5 px-3 font-semibold">INDEX / KEY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#240e0e]">
                      {table.columns.map(col => (
                        <tr key={col.name} className="hover:bg-[#220d0d] transition">
                          <td className="py-1.5 px-3 font-medium text-stone-200">{col.name}</td>
                          <td className="py-1.5 px-3 text-theme-scarlet font-mono text-[11px]">{col.type}</td>
                          <td className="py-1.5 px-3 text-[10px] text-amber-400 font-typewriter">
                            {col.primaryKey ? '★ PRIMARY KEY' : ''}
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
        <div className="bg-[#140808] px-5 py-3 border-t-2 border-[#4a1c1c] flex justify-between items-center text-xs">
          <span className="text-[10px] text-stone-500 font-typewriter">
            RESTRICTED ACCESS // INTERNAL POLICE INQUIRY
          </span>
          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 text-xs bg-theme-bloodRed hover:bg-theme-bloodRedHover text-white rounded font-bold font-typewriter transition border border-theme-scarlet"
          >
            DISMISS RECORDS
          </button>
        </div>
      </div>
    </div>
  );
};
