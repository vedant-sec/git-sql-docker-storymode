import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-slate-500 italic py-1">Query completed with 0 rows returned.</div>;
  }

  return (
    <div className="my-2 border border-slate-700/80 rounded-md overflow-hidden bg-slate-950/70 shadow-lg text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 border-b border-slate-700/90 text-cyan-400 font-semibold uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-slate-800 last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-cyan-950/20 transition-colors odd:bg-slate-900/40 even:bg-slate-950/40"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-slate-800/60 last:border-r-0 text-slate-300 whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-slate-600 italic">NULL</span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-emerald-400 font-medium">{cell}</span>
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
        <span>
          Showing <strong className="text-cyan-400">{values.length}</strong> row{values.length === 1 ? '' : 's'}
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-slate-500">Query latency: {executionTimeMs} ms</span>
        )}
      </div>
    </div>
  );
};
