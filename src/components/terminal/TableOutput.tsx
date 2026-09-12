import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-[#997777] italic py-1">Query completed with 0 rows returned.</div>;
  }

  return (
    <div className="my-2 border border-[#3d1515] rounded-lg overflow-hidden bg-[#170E0E] shadow-lg text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#8F0E0E] border-b border-[#D93E3E] text-white font-semibold uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-[#3d1515] last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d1212]">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-[#8F0E0E]/20 transition-colors odd:bg-[#1c1111] even:bg-[#140b0b]"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-[#2d1212]/70 last:border-r-0 text-[#EFEFEF] whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-[#775555] italic">NULL</span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-[#D93E3E] font-medium">{cell}</span>
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
      <div className="bg-[#100909] px-3 py-1.5 border-t border-[#2d1212] flex justify-between items-center text-[11px] text-[#997777]">
        <span>
          Showing <strong className="text-[#D93E3E]">{values.length}</strong> row{values.length === 1 ? '' : 's'}
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-[#775555]">Query latency: {executionTimeMs} ms</span>
        )}
      </div>
    </div>
  );
};
