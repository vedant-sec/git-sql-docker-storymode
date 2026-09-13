import { ReactNode } from 'react';

interface LeatherBinderNavProps {
  tabs: {
    id: string;
    label: string;
    icon?: ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function LeatherBinderNav({ tabs, activeTab, onTabChange }: LeatherBinderNavProps) {
  return (
    <div className="flex flex-col gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`index-tab ${activeTab === tab.id ? 'index-tab-active' : ''}`}
          title={tab.label}
        >
          <span className="text-xs">{tab.label}</span>
          {tab.icon && <span className="ml-1">{tab.icon}</span>}
        </button>
      ))}
    </div>
  );
}
