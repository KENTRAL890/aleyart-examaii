import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Database,
  FileCheck,
  Printer,
  Settings,
  LogOut,
  School,
  UserCheck,
  FileSpreadsheet,
  BookMarked,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout, hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['examinations']);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      id: 'examinations',
      label: 'Examinations',
      icon: <FileText size={20} />,
      children: [
        { id: 'generate-exam', label: 'Generate Examination', icon: <FileText size={18} /> },
        { id: 'exam-repository', label: 'Exam Repository', icon: <Database size={18} /> },
        { id: 'question-bank', label: 'Question Bank', icon: <BookMarked size={18} /> },
        { id: 'marking-schemes', label: 'Marking Schemes', icon: <FileCheck size={18} /> },
      ],
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <Printer size={20} />,
      children: [
        { id: 'omr-sheets', label: 'OMR Sheets', icon: <FileSpreadsheet size={18} /> },
        { id: 'answer-booklets', label: 'Answer Booklets', icon: <BookOpen size={18} /> },
      ],
    },
    { id: 'teachers', label: 'Teachers', icon: <UserCheck size={20} />, permission: 'canManageTeachers' },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'results', label: 'Results', icon: <ClipboardList size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} />, permission: 'canManageUsers' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (item.permission && !hasPermission(item.permission as any)) {
      return null;
    }

    const isExpanded = expandedMenus.includes(item.id);
    const isActive = currentPage === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              onNavigate(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
            depth > 0 ? 'pl-10' : ''
          } ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <span>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="bg-gray-900">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-800 min-h-screen flex flex-col">
      {/* Logo and School Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <School className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">ALEYART EXAMAI PRO</h1>
            <p className="text-gray-400 text-xs">SEEKING WISDOM</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.fullName}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
