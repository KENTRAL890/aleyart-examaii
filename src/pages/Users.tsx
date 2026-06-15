import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../constants';
import {
  Users as UsersIcon,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Demo users (in production, this would come from the backend)
const DEMO_USERS = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@aleyart.edu.gh',
    role: 'administrator' as UserRole,
    staffId: 'ADM001',
    phone: '+233 24 123 4567',
    position: 'System Administrator',
    status: 'active',
  },
  {
    id: '2',
    fullName: 'Dr. Kwame Asante',
    email: 'headteacher@aleyart.edu.gh',
    role: 'headteacher' as UserRole,
    staffId: 'HT001',
    phone: '+233 24 234 5678',
    position: 'Headteacher',
    status: 'active',
  },
  {
    id: '3',
    fullName: 'Akua Mensah',
    email: 'exams@aleyart.edu.gh',
    role: 'examination_officer' as UserRole,
    staffId: 'EO001',
    phone: '+233 24 345 6789',
    position: 'Examination Officer',
    status: 'active',
  },
  {
    id: '4',
    fullName: 'Kofi Owusu',
    email: 'teacher@aleyart.edu.gh',
    role: 'teacher' as UserRole,
    staffId: 'TCH001',
    phone: '+233 24 456 7890',
    position: 'Science Teacher',
    status: 'active',
  },
];

const Users: React.FC = () => {
  const { hasPermission } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const filteredUsers = selectedRole
    ? DEMO_USERS.filter((u) => u.role === selectedRole)
    : DEMO_USERS;

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'bg-purple-100 text-purple-700';
      case 'headteacher':
        return 'bg-blue-100 text-blue-700';
      case 'examination_officer':
        return 'bg-green-100 text-green-700';
      case 'teacher':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const permissionLabels: Record<keyof typeof ROLE_PERMISSIONS.administrator, string> = {
    canManageUsers: 'Manage Users',
    canManageTeachers: 'Manage Teachers',
    canManageSubjects: 'Manage Subjects',
    canManageClasses: 'Manage Classes',
    canManageExaminations: 'Manage Examinations',
    canManageRepository: 'Manage Repository',
    canManageQuestionBank: 'Manage Question Bank',
    canManageMarkingSchemes: 'Manage Marking Schemes',
    canManageOMR: 'Manage OMR',
    canManageAnswerBooklets: 'Manage Answer Booklets',
    canManageResults: 'Manage Results',
    canViewAllRecords: 'View All Records',
    canEditAllRecords: 'Edit All Records',
    canDeleteAllRecords: 'Delete All Records',
    canApproveExaminations: 'Approve Examinations',
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="font-semibold">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UsersIcon className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500">Manage system users and their permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{DEMO_USERS.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Administrators</p>
          <p className="text-2xl font-bold text-purple-600">
            {DEMO_USERS.filter((u) => u.role === 'administrator').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Teachers</p>
          <p className="text-2xl font-bold text-orange-600">
            {DEMO_USERS.filter((u) => u.role === 'teacher').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {DEMO_USERS.filter((u) => u.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Filter by role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="administrator">Administrator</option>
            <option value="headteacher">Headteacher</option>
            <option value="examination_officer">Examination Officer</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} users
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {user.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.position}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{user.email}</span>
                      <span>{user.phone}</span>
                      <span>{user.staffId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium capitalize">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="text-blue-600" />
          Role Permissions Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Permission</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-purple-600">Administrator</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-blue-600">Headteacher</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-green-600">Exam Officer</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-orange-600">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Object.keys(permissionLabels) as (keyof typeof permissionLabels)[]).map((permission) => (
                <tr key={permission} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{permissionLabels[permission]}</td>
                  <td className="py-3 px-4 text-center">
                    {ROLE_PERMISSIONS.administrator[permission] ? (
                      <CheckCircle className="inline text-green-500" size={18} />
                    ) : (
                      <XCircle className="inline text-red-400" size={18} />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ROLE_PERMISSIONS.headteacher[permission] ? (
                      <CheckCircle className="inline text-green-500" size={18} />
                    ) : (
                      <XCircle className="inline text-red-400" size={18} />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ROLE_PERMISSIONS.examination_officer[permission] ? (
                      <CheckCircle className="inline text-green-500" size={18} />
                    ) : (
                      <XCircle className="inline text-red-400" size={18} />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ROLE_PERMISSIONS.teacher[permission] ? (
                      <CheckCircle className="inline text-green-500" size={18} />
                    ) : (
                      <XCircle className="inline text-red-400" size={18} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
