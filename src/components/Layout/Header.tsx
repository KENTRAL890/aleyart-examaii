import React from 'react';
import { useData } from '../../context/DataContext';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { schoolSettings } = useData();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              {schoolSettings.name} • {schoolSettings.motto}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none ml-2 text-sm w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Current Date */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-800">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
