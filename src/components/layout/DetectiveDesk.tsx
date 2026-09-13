import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DetectiveDeskProps {
  children?: React.ReactNode;
}

export function DetectiveDesk({ children }: DetectiveDeskProps) {
  return (
    <div className="desk-workspace w-screen h-screen overflow-hidden relative flex flex-col">
      {/* Main desk layout grid */}
      <div className="relative w-full h-full flex gap-4 p-6" style={{ zIndex: 1 }}>
        {/* Left: Leather Binder Navigation */}
        <div className="leather-binder flex flex-col w-48 rounded-l-lg overflow-hidden">
          <div className="binder-spine">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="binder-rivet" />
            ))}
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            {/* Index tabs will be populated by parent */}
            {children}
          </div>
        </div>

        {/* Right: Main Content Area (Evidence Folder + Terminal) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top: Manila Evidence Folder */}
          <div className="manila-folder rounded-lg p-8 flex-1 flex flex-col overflow-y-auto">
            <div className="manila-tab-label mb-4">
              <span>INCIDENT FILE #4 OF 4</span>
              <span className="ml-auto text-xs">CLASSIFIED</span>
            </div>
            {/* Content will be populated by parent */}
          </div>

          {/* Bottom: CRT Terminal */}
          <div className="crt-chassis p-4 flex flex-col gap-4 h-64">
            <div className="flex justify-between items-center px-2">
              <div className="flex gap-2">
                <div className="status-led-green" />
                <span className="text-xs font-mono text-gray-400">LINE CLEAR // READY</span>
              </div>
              <div className="flex gap-3">
                <div className="hex-screw" />
                <div className="rotary-knob" />
                <div className="hex-screw" />
              </div>
            </div>
            <div className="crt-screen flex-1 rounded p-3">
              {/* Terminal content */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
