import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Cloud, HardDrive } from 'lucide-react';
import {
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  School,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { schoolSettings, examinations, teachers, students, questionBank, isCloudMode } = useData();

  const stats = [
    {
      title: 'Total Examinations',
      value: examinations.length,
      icon: <FileText className="text-blue-600" size={24} />,
      color: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Teachers',
      value: teachers.length,
      icon: <Users className="text-green-600" size={24} />,
      color: 'bg-green-50',
      change: '+5%',
    },
    {
      title: 'Students',
      value: students.length,
      icon: <GraduationCap className="text-purple-600" size={24} />,
      color: 'bg-purple-50',
      change: '+8%',
    },
    {
      title: 'Question Bank',
      value: questionBank.length,
      icon: <BookOpen className="text-orange-600" size={24} />,
      color: 'bg-orange-50',
      change: '+25%',
    },
  ];

  const recentExams = examinations.slice(0, 5);

  const quickActions = [
    { label: 'Generate Examination', page: 'generate-exam', icon: <FileText size={20} /> },
    { label: 'View Repository', page: 'exam-repository', icon: <BookOpen size={20} /> },
    { label: 'Question Bank', page: 'question-bank', icon: <BookOpen size={20} /> },
    { label: 'OMR Sheets', page: 'omr-sheets', icon: <FileText size={20} /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {schoolSettings.logo ? (
              <img src={schoolSettings.logo} alt="School Logo" className="w-16 h-16 rounded-lg bg-white p-1" />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <School className="text-white" size={32} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{schoolSettings.name}</h1>
              <p className="text-blue-200 font-medium">"{schoolSettings.motto}"</p>
            </div>
          </div>
          <h2 className="text-xl mb-2">Welcome back, {user?.fullName}!</h2>
          <p className="text-blue-100">
            Manage examinations with AI-powered question generation compliant with Ghana Education Service standards.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>{stat.icon}</div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Examinations */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Recent Examinations</h3>
          </div>
          <div className="p-6">
            {recentExams.length > 0 ? (
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => onNavigate('exam-repository')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{exam.title}</h4>
                        <p className="text-sm text-gray-500">
                          {exam.className} • {exam.subjectName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{exam.totalMarks} marks</p>
                      <p className="text-xs text-gray-500">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No examinations yet</p>
                <button
                  onClick={() => onNavigate('generate-exam')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Generate First Examination
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onNavigate(action.page)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition text-left"
              >
                {action.icon}
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Term */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Current Term</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">2025/2026</p>
          <p className="text-gray-500">Second Term</p>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Exam Period</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">Mid-Term</p>
          <p className="text-gray-500">Examinations in progress</p>
        </div>

        {/* Compliance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Compliance</h3>
          </div>
          <p className="text-sm text-gray-600">
            GES • NaCCA • SBC • CCP
          </p>
          <p className="text-green-600 font-medium mt-1">All Standards Met ✓</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600">
          <strong>{schoolSettings.name}</strong> • {schoolSettings.motto}
        </p>
        {schoolSettings.address && (
          <p className="text-gray-500 text-sm mt-1">{schoolSettings.address}</p>
        )}
        {(schoolSettings.telephone || schoolSettings.email) && (
          <p className="text-gray-500 text-sm">
            {schoolSettings.telephone} {schoolSettings.telephone && schoolSettings.email && '•'} {schoolSettings.email}
          </p>
        )}
        
        {/* Data Mode Indicator */}
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isCloudMode 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isCloudMode ? (
            <>
              <Cloud size={16} />
              Cloud Mode: Data shared between all users
            </>
          ) : (
            <>
              <HardDrive size={16} />
              Local Mode: Data stored in browser only
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
