import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-slate-500 italic py-1 font-mono">-- 0 RECORDS MATCHED CRITERIA --</div>;
  }

  return (
    <div className="my-2 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/90 shadow-xl text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/90 border-b border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-slate-800 last:border-r-0 whitespace-nowrap text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-cyan-950/20 transition-colors odd:bg-slate-950/40 even:bg-slate-900/30"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-slate-800/60 last:border-r-0 text-slate-200 whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-slate-600 italic">NULL</span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-amber-400 font-bold">{cell}</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-900/80 px-3 py-1.5 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>QUERY ROWS: <strong className="text-cyan-300 font-bold">{values.length}</strong></span>
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-slate-500">LATENCY: {executionTimeMs} MS</span>
        )}
      </div>
    </div>
  );
};
