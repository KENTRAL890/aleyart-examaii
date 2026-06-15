import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { ROLE_PERMISSIONS } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.administrator) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for the system
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@aleyart.edu.gh',
    password: 'admin123',
    role: 'administrator',
    staffId: 'ADM001',
    phone: '+233 24 123 4567',
    qualification: 'M.Ed Administration',
    position: 'System Administrator',
    assignedClasses: [],
    assignedSubjects: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    fullName: 'Dr. Kwame Asante',
    email: 'headteacher@aleyart.edu.gh',
    password: 'head123',
    role: 'headteacher',
    staffId: 'HT001',
    phone: '+233 24 234 5678',
    qualification: 'Ph.D Education',
    position: 'Headteacher',
    assignedClasses: [],
    assignedSubjects: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    fullName: 'Akua Mensah',
    email: 'exams@aleyart.edu.gh',
    password: 'exams123',
    role: 'examination_officer',
    staffId: 'EO001',
    phone: '+233 24 345 6789',
    qualification: 'B.Ed',
    position: 'Examination Officer',
    assignedClasses: [],
    assignedSubjects: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    fullName: 'Kofi Owusu',
    email: 'teacher@aleyart.edu.gh',
    password: 'teacher123',
    role: 'teacher',
    staffId: 'TCH001',
    phone: '+233 24 456 7890',
    qualification: 'B.Ed Science',
    position: 'Science Teacher',
    assignedClasses: ['basic7', 'basic8', 'basic9'],
    assignedSubjects: ['science', 'computing'],
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('aleyart_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('aleyart_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aleyart_user');
  };

  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.administrator): boolean => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions[permission] ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
