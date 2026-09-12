import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-theme-textMuted italic py-1">Query completed with 0 rows returned.</div>;
  }

  return (
    <div className="my-2 border border-theme-darkBorder rounded-lg overflow-hidden bg-theme-onyx shadow-lg text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-theme-bloodRed border-b border-theme-scarlet text-white font-semibold uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-theme-darkBorder last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-darkBorderSubtle">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-theme-bloodRed/20 transition-colors odd:bg-[#1c1111] even:bg-[#140b0b]"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-theme-darkBorderSubtle/70 last:border-r-0 text-theme-textLight whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-theme-textPlaceholder italic">NULL</span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-theme-scarlet font-medium">{cell}</span>
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
      <div className="bg-theme-terminalInner px-3 py-1.5 border-t border-theme-darkBorderSubtle flex justify-between items-center text-[11px] text-theme-textMuted">
        <span>
          Showing <strong className="text-theme-scarlet">{values.length}</strong> row{values.length === 1 ? '' : 's'}
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-theme-textPlaceholder">Query latency: {executionTimeMs} ms</span>
        )}
      </div>
    </div>
  );
};
