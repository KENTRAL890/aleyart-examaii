import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GenerateExam from './pages/GenerateExam';
import ExamRepository from './pages/ExamRepository';
import QuestionBank from './pages/QuestionBank';
import MarkingSchemes from './pages/MarkingSchemes';
import OMRSheets from './pages/OMRSheets';
import AnswerBooklets from './pages/AnswerBooklets';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Results from './pages/Results';
import Users from './pages/Users';
import Settings from './pages/Settings';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'generate-exam': 'Generate Examination',
  'exam-repository': 'Examination Repository',
  'question-bank': 'Question Bank',
  'marking-schemes': 'Marking Schemes',
  'omr-sheets': 'OMR Sheets',
  'answer-booklets': 'Answer Booklets',
  teachers: 'Teacher Management',
  students: 'Student Management',
  results: 'Results',
  users: 'User Management',
  settings: 'Settings',
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'generate-exam':
        return <GenerateExam onNavigate={setCurrentPage} />;
      case 'exam-repository':
        return <ExamRepository onNavigate={setCurrentPage} />;
      case 'question-bank':
        return <QuestionBank onNavigate={setCurrentPage} />;
      case 'marking-schemes':
        return <MarkingSchemes />;
      case 'omr-sheets':
        return <OMRSheets />;
      case 'answer-booklets':
        return <AnswerBooklets />;
      case 'teachers':
        return <Teachers />;
      case 'students':
        return <Students />;
      case 'results':
        return <Results />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header
          title={PAGE_TITLES[currentPage] || 'Dashboard'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
