import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-[#834863] italic py-1">Query completed with 0 rows returned.</div>;
  }

  return (
    <div className="my-2 border border-[#4b1064] rounded-lg overflow-hidden bg-[#180123] shadow-lg text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#240632] border-b border-[#3b0d52] text-[#F0593F] font-semibold uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-[#3b0d52] last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3b0d52]/60">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-[#881E3F]/25 transition-colors odd:bg-[#1a0226] even:bg-[#14011e]"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-[#3b0d52]/50 last:border-r-0 text-[#fdedea] whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-[#834863] italic">NULL</span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-[#F0593F] font-medium">{cell}</span>
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
      <div className="bg-[#13011b] px-3 py-1.5 border-t border-[#3b0d52] flex justify-between items-center text-[11px] text-[#b98f9c]">
        <span>
          Showing <strong className="text-[#F0593F]">{values.length}</strong> row{values.length === 1 ? '' : 's'}
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-[#834863]">Query latency: {executionTimeMs} ms</span>
        )}
      </div>
    </div>
  );
};
