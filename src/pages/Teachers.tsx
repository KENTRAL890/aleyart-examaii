import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CLASS_LEVELS, SUBJECTS } from '../constants';
import { Teacher } from '../types';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

const Teachers: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    staffId: '',
    email: '',
    phone: '',
    qualification: '',
    position: '',
    assignedClasses: [] as string[],
    assignedSubjects: [] as string[],
  });

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      fullName: '',
      staffId: '',
      email: '',
      phone: '',
      qualification: '',
      position: '',
      assignedClasses: [],
      assignedSubjects: [],
    });
    setEditingTeacher(null);
    setShowForm(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      staffId: teacher.staffId,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      position: teacher.position,
      assignedClasses: teacher.assignedClasses,
      assignedSubjects: teacher.assignedSubjects,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
    } else {
      addTeacher(formData);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacher(id);
    }
  };

  const toggleClass = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter((c) => c !== classId)
        : [...prev.assignedClasses, classId],
    }));
  };

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedSubjects: prev.assignedSubjects.includes(subjectId)
        ? prev.assignedSubjects.filter((s) => s !== subjectId)
        : [...prev.assignedSubjects, subjectId],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-blue-600" />
            Teacher Management
          </h1>
          <p className="text-gray-500">Manage teachers and their class/subject assignments</p>
        </div>
        {hasPermission('canManageTeachers') && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Teacher
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search teachers by name, staff ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Teachers</p>
          <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Classes Covered</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(teachers.flatMap(t => t.assignedClasses)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Subjects Covered</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(teachers.flatMap(t => t.assignedSubjects)).size}
          </p>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </p>
        </div>

        {filteredTeachers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {teacher.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{teacher.fullName}</h3>
                      <p className="text-sm text-gray-500">{teacher.position}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <UserCheck size={14} />
                          {teacher.staffId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {teacher.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {teacher.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          {teacher.qualification}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Classes:</span>
                        {teacher.assignedClasses.map((classId) => {
                          const cls = CLASS_LEVELS.find(c => c.id === classId);
                          return cls ? (
                            <span key={classId} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {cls.name}
                            </span>
                          ) : null;
                        })}
                        {teacher.assignedClasses.length === 0 && (
                          <span className="text-xs text-gray-400">None assigned</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Subjects:</span>
                        {teacher.assignedSubjects.map((subjectId) => {
                          const subj = SUBJECTS.find(s => s.id === subjectId);
                          return subj ? (
                            <span key={subjectId} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              {subj.name}
                            </span>
                          ) : null;
                        })}
                        {teacher.assignedSubjects.length === 0 && (
                          <span className="text-xs text-gray-400">None assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasPermission('canManageTeachers') && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <UserCheck className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No teachers found</p>
            {hasPermission('canManageTeachers') && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Teacher
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                  <input
                    type="text"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., B.Ed, M.Ed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Science Teacher"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Classes</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {CLASS_LEVELS.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClass(cls.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        formData.assignedClasses.includes(cls.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Subjects</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {SUBJECTS.map((subj) => (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => toggleSubject(subj.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        formData.assignedSubjects.includes(subj.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {subj.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
