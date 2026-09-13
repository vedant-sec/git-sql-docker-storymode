import React from 'react';

interface TableOutputProps {
  columns: string[];
  values: any[][];
  executionTimeMs?: number;
}

export const TableOutput: React.FC<TableOutputProps> = ({ columns, values, executionTimeMs }) => {
  if (columns.length === 0) {
    return <div className="text-stone-500 italic py-1 font-typewriter">-- 0 RECORDS MATCHED CRITERIA --</div>;
  }

  return (
    <div className="my-2 border border-[#421a1a] rounded-lg overflow-hidden bg-[#0c0505] shadow-lg text-xs font-mono">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1c0b0b] border-b-2 border-[#4a1c1c] text-theme-scarlet font-bold uppercase tracking-wider sticky top-0 font-typewriter">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3 border-r border-[#331414] last:border-r-0 whitespace-nowrap text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#261010]">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-[#261010]/70 transition-colors odd:bg-[#0c0606] even:bg-[#120808]"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-1.5 px-3 border-r border-[#261010] last:border-r-0 text-stone-200 whitespace-nowrap"
                  >
                    {cell === null ? (
                      <span className="text-stone-600 italic">NULL</span>
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
      <div className="bg-[#170808] px-3 py-1.5 border-t border-[#3b1717] flex justify-between items-center text-[11px] text-stone-400 font-typewriter">
        <span>
          RECORDS INTERCEPTED: <strong className="text-theme-scarlet">{values.length}</strong> ROW{values.length === 1 ? '' : 'S'}
        </span>
        {executionTimeMs !== undefined && (
          <span className="text-stone-500">LINE LATENCY: {executionTimeMs} MS</span>
        )}
      </div>
    </div>
  );
};
