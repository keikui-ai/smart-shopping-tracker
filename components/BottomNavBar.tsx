import React from 'react';
import { ClipboardListIcon, PlusCircleIcon, HistoryIcon } from './icons';

type Tab = 'list' | 'add' | 'history';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const navItems = [
  { id: 'list' as Tab, label: 'List', icon: ClipboardListIcon },
  { id: 'add' as Tab, label: 'Add Item', icon: PlusCircleIcon },
  { id: 'history' as Tab, label: 'History', icon: HistoryIcon },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 flex justify-around py-2 shrink-0">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-1 w-24 p-1 rounded-md transition-colors duration-200 ${
            activeTab === id ? 'text-brand-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavBar;