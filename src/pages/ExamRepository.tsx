import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CLASS_LEVELS, SUBJECTS, EXAMINATION_TYPES, ACADEMIC_YEARS, TERMS } from '../constants';
import { Examination } from '../types';
import {
  Search,
  Filter,
  FileText,
  Eye,
  Printer,
  Download,
  Copy,
  Trash2,
  Calendar,
  Clock,
  User,
  BookOpen,
  XCircle,
  ChevronDown,
  FileCheck,
} from 'lucide-react';

interface ExamRepositoryProps {
  onNavigate: (page: string) => void;
}

const ExamRepository: React.FC<ExamRepositoryProps> = ({ onNavigate }) => {
  const { examinations, deleteExamination, schoolSettings } = useData();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [viewMode, setViewMode] = useState<'paper' | 'marking'>('paper');

  // Filter examinations
  const filteredExams = examinations.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || exam.classId === filterClass;
    const matchesSubject = !filterSubject || exam.subjectId === filterSubject;
    const matchesYear = !filterYear || exam.academicYear === filterYear;
    const matchesTerm = !filterTerm || exam.term === filterTerm;
    const matchesType = !filterType || exam.examinationType === filterType;

    return matchesSearch && matchesClass && matchesSubject && matchesYear && matchesTerm && matchesType;
  });

  const handleDelete = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      deleteExamination(examId);
    }
  };

  const handleDuplicate = (_exam: Examination) => {
    // Navigate to generate exam with pre-filled data
    alert('Duplicating examination... This would open the generator with pre-filled data.');
  };

  const handlePrint = (exam: Examination, type: 'paper' | 'marking') => {
    const printContent = generatePrintContent(exam, type);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (exam: Examination, type: 'paper' | 'marking') => {
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${exam.title} - ${type === 'marking' ? 'Marking Scheme' : 'Question Paper'}</title>
        <style>
          body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header .motto { font-style: italic; margin: 5px 0; }
          .exam-info { display: flex; justify-content: space-between; margin: 20px 0; font-size: 14px; }
          .section { margin: 20px 0; page-break-inside: avoid; }
          .section-title { font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
          .question { margin: 15px 0; }
          .question-number { font-weight: bold; }
          .options { margin-left: 20px; }
          .answer { color: green; margin-top: 5px; border-left: 3px solid green; padding-left: 10px; }
          .working { color: blue; font-style: italic; }
          .two-columns { column-count: 2; column-gap: 40px; }
          .divider { border-bottom: 1px solid black; margin: 10px 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolSettings.name}</h1>
          <p class="motto">MOTTO: ${schoolSettings.motto}</p>
          ${schoolSettings.address ? `<p>${schoolSettings.address}</p>` : ''}
          <hr>
          <h2>${EXAMINATION_TYPES.find(e => e.id === exam.examinationType)?.name.toUpperCase()}</h2>
          <h2>${exam.subjectName.toUpperCase()}</h2>
          ${type === 'marking' ? '<h3 style="color: red;">MARKING SCHEME</h3>' : ''}
        </div>
        
        <div class="exam-info">
          <span>Class: ${exam.className}</span>
          <span>Duration: ${exam.duration} minutes</span>
          <span>Total Marks: ${exam.totalMarks}</span>
        </div>
        <div class="exam-info">
          <span>Academic Year: ${exam.academicYear}</span>
          <span>Term: ${TERMS.find(t => t.id === exam.term)?.name}</span>
          <span>Date: ${exam.date}</span>
        </div>
        <div class="exam-info">
          <span>Teacher: ${exam.teacherName}</span>
        </div>
        <hr>
        
        ${exam.sections.map(section => `
          <div class="section">
            <div class="section-title">${section.name}: ${section.label}</div>
            <p><em>${section.instructions}</em></p>
            <p>[${section.totalMarks} marks]</p>
            
            <div class="${section.columns === 2 ? 'two-columns' : ''}">
              ${section.questions.map((q, idx) => `
                <div class="question">
                  <p>
                    <span class="question-number">${idx + 1}.</span>
                    ${q.isCompulsory ? '<strong>[COMPULSORY]</strong> ' : ''}
                    ${q.text}
                    <span>[${q.marks} mark${q.marks > 1 ? 's' : ''}]</span>
                  </p>
                  ${q.options ? `
                    <div class="options">
                      ${q.options.map(opt => `<p>${opt.label}. ${opt.text}</p>`).join('')}
                    </div>
                  ` : ''}
                  ${q.subQuestions ? `
                    <div class="options">
                      ${q.subQuestions.map(sq => `<p>${sq.label} ${sq.text} [${sq.marks} marks]</p>`).join('')}
                    </div>
                  ` : ''}
                  ${type === 'marking' ? `
                    <div class="answer">
                      <strong>Answer:</strong> ${q.answer}
                      ${q.workings ? `<br><span class="working">Working: ${q.workings}</span>` : ''}
                    </div>
                    ${q.subQuestions ? `
                      ${q.subQuestions.map(sq => `
                        <div class="answer" style="margin-left: 20px;">
                          <strong>${sq.label}</strong> ${sq.answer}
                        </div>
                      `).join('')}
                    ` : ''}
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          <hr class="divider">
        `).join('')}
        
        <p style="text-align: center; margin-top: 30px;">
          <strong>END OF ${type === 'marking' ? 'MARKING SCHEME' : 'EXAMINATION'}</strong>
        </p>
      </body>
      </html>
    `;
  };

  const exportToDocx = (exam: Examination) => {
    // Create a simple text export (in production, use docx library)
    const content = `${schoolSettings.name}\nMOTTO: ${schoolSettings.motto}\n\n${exam.title}\n\nClass: ${exam.className}\nSubject: ${exam.subjectName}\nDuration: ${exam.duration} minutes\nTotal Marks: ${exam.totalMarks}\n\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Examination Repository
          </h1>
          <p className="text-gray-500">Access all saved examinations shared across the school</p>
        </div>
        <button
          onClick={() => onNavigate('generate-exam')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FileText size={18} />
          Generate New Exam
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search examinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
            <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Classes</option>
              {CLASS_LEVELS.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((subj) => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Years</option>
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Terms</option>
              {TERMS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              {EXAMINATION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredExams.length} of {examinations.length} examinations
          </p>
        </div>

        {filteredExams.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        exam.status === 'approved' ? 'bg-green-100 text-green-700' :
                        exam.status === 'published' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {exam.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {exam.subjectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {exam.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {exam.academicYear} - {TERMS.find(t => t.id === exam.term)?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {exam.duration} mins
                      </span>
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Created by {exam.createdBy} on {new Date(exam.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExam(exam);
                        setViewMode('paper');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExam(exam);
                        setViewMode('marking');
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Marking Scheme"
                    >
                      <FileCheck size={18} />
                    </button>
                    <button
                      onClick={() => handlePrint(exam, 'paper')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Print"
                    >
                      <Printer size={18} />
                    </button>
                    <button
                      onClick={() => exportToDocx(exam)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Export"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(exam)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    {hasPermission('canDeleteAllRecords') && (
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No examinations found</p>
            <button
              onClick={() => onNavigate('generate-exam')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate First Examination
            </button>
          </div>
        )}
      </div>

      {/* Exam Viewer Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{selectedExam.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('paper')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === 'paper' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Question Paper
                  </button>
                  <button
                    onClick={() => setViewMode('marking')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === 'marking' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Marking Scheme
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedExam, viewMode)}
                  className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Exam Header */}
              <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
                <h1 className="text-2xl font-bold">{schoolSettings.name}</h1>
                <p className="text-gray-600 italic">MOTTO: {schoolSettings.motto}</p>
                {schoolSettings.address && <p className="text-sm text-gray-500">{schoolSettings.address}</p>}
                <div className="my-4"></div>
                <h2 className="text-lg font-semibold">
                  {EXAMINATION_TYPES.find(e => e.id === selectedExam.examinationType)?.name.toUpperCase()}
                </h2>
                <h2 className="text-xl font-bold mt-2">{selectedExam.subjectName.toUpperCase()}</h2>
                {viewMode === 'marking' && (
                  <h3 className="text-lg font-bold text-red-600 mt-2">MARKING SCHEME</h3>
                )}
              </div>

              <div className="flex justify-between text-sm mb-4">
                <span>Class: {selectedExam.className}</span>
                <span>Duration: {selectedExam.duration} minutes</span>
                <span>Total Marks: {selectedExam.totalMarks}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 text-gray-600">
                <span>Academic Year: {selectedExam.academicYear}</span>
                <span>Term: {TERMS.find(t => t.id === selectedExam.term)?.name}</span>
                <span>Date: {selectedExam.date}</span>
              </div>
              <div className="text-sm mb-6">
                <span>Teacher: {selectedExam.teacherName}</span>
              </div>

              <hr className="mb-6" />

              {/* Sections */}
              {selectedExam.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-bold mb-2">
                    {section.name}: {section.label}
                  </h3>
                  <p className="text-sm italic text-gray-600 mb-2">{section.instructions}</p>
                  <p className="text-sm text-blue-600 mb-4">[{section.totalMarks} marks]</p>

                  <div className={section.columns === 2 ? 'grid grid-cols-2 gap-4' : ''}>
                    {section.questions.map((q, idx) => (
                      <div key={q.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-2">
                          {idx + 1}. {q.isCompulsory && <span className="text-red-500">[COMPULSORY] </span>}
                          {q.isPractical && <span className="text-blue-500">[PRACTICAL] </span>}
                          {q.text}
                          <span className="text-sm text-gray-500 ml-2">[{q.marks} mark{q.marks > 1 ? 's' : ''}]</span>
                        </p>

                        {q.options && (
                          <div className="ml-4 space-y-1">
                            {q.options.map((opt) => (
                              <p key={opt.id} className={viewMode === 'marking' && opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                                {opt.label}. {opt.text}
                              </p>
                            ))}
                          </div>
                        )}

                        {q.subQuestions && (
                          <div className="ml-4 mt-2 space-y-2">
                            {q.subQuestions.map((sq) => (
                              <div key={sq.id}>
                                <p className="font-medium">{sq.label} {sq.text} [{sq.marks} marks]</p>
                                {viewMode === 'marking' && (
                                  <p className="text-green-600 ml-4 mt-1">Answer: {sq.answer}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {viewMode === 'marking' && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-green-600">
                              <strong>Answer:</strong> {q.answer}
                            </p>
                            {q.workings && (
                              <p className="text-blue-600 mt-1">
                                <strong>Working:</strong> {q.workings}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="text-center font-bold mt-8">
                END OF {viewMode === 'marking' ? 'MARKING SCHEME' : 'EXAMINATION'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRepository;
