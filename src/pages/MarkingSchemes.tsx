import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_LEVELS, SUBJECTS, TERMS } from '../constants';
import {
  FileCheck,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Printer,
  Download,
} from 'lucide-react';

const MarkingSchemes: React.FC = () => {
  const { examinations, schoolSettings, getMarkingSchemeByExam } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  // Filter examinations that have marking schemes
  const examsWithSchemes = examinations.filter(exam => 
    getMarkingSchemeByExam(exam.id) !== undefined
  );

  const filteredExams = examsWithSchemes.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || exam.classId === filterClass;
    const matchesSubject = !filterSubject || exam.subjectId === filterSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  const selectedExamData = selectedExam ? examinations.find(e => e.id === selectedExam) : null;
  const selectedScheme = selectedExam ? getMarkingSchemeByExam(selectedExam) : null;

  const handlePrint = (exam: typeof selectedExamData) => {
    if (!exam) return;
    
    const scheme = getMarkingSchemeByExam(exam.id);
    if (!scheme) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Marking Scheme - ${exam.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid black; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; }
          .exam-info { margin: 20px 0; }
          .section { margin: 25px 0; page-break-inside: avoid; }
          .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
          .question { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #333; }
          .question-num { font-weight: bold; }
          .answer { color: green; margin-top: 10px; padding: 10px; background: #e8f5e9; }
          .working { color: blue; font-style: italic; margin-top: 5px; }
          .marks { color: #666; float: right; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolSettings.name}</h1>
          <p style="font-style: italic;">MOTTO: ${schoolSettings.motto}</p>
          <hr>
          <h2>${exam.subjectName.toUpperCase()}</h2>
          <h2 style="color: red;">MARKING SCHEME</h2>
        </div>
        
        <div class="exam-info">
          <p><strong>Class:</strong> ${exam.className} | <strong>Total Marks:</strong> ${exam.totalMarks} | <strong>Academic Year:</strong> ${exam.academicYear}</p>
          <p><strong>Term:</strong> ${TERMS.find(t => t.id === exam.term)?.name} | <strong>Date:</strong> ${exam.date}</p>
        </div>
        
        ${scheme.sections.map(section => `
          <div class="section">
            <div class="section-title">${section.sectionName}</div>
            ${section.answers.map(answer => `
              <div class="question">
                <p>
                  <span class="question-num">${answer.questionNumber}.</span>
                  ${answer.questionText}
                  <span class="marks">[${answer.marks} mark${answer.marks > 1 ? 's' : ''}]</span>
                </p>
                <div class="answer">
                  <strong>Answer:</strong> ${answer.answer}
                  ${answer.workings ? `<p class="working"><strong>Working:</strong> ${answer.workings}</p>` : ''}
                </div>
                ${answer.subAnswers ? answer.subAnswers.map(sub => `
                  <div class="answer" style="margin-left: 20px; margin-top: 10px;">
                    <strong>${sub.label}</strong> ${sub.answer}
                    <span class="marks">[${sub.marks} marks]</span>
                  </div>
                `).join('') : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
        
        <p style="text-align: center; margin-top: 40px; font-weight: bold;">
          END OF MARKING SCHEME
        </p>
        <p style="text-align: center; font-size: 12px;">
          ${schoolSettings.name} • ${schoolSettings.motto}
        </p>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileCheck className="text-green-600" />
            Marking Schemes
          </h1>
          <p className="text-gray-500">View and print marking schemes with exact answers</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800">Complete Marking Schemes</h3>
        <p className="text-sm text-green-700 mt-1">
          Each marking scheme contains the EXACT CORRECT ANSWERS to every question, including:
        </p>
        <ul className="text-sm text-green-700 mt-2 ml-4 list-disc">
          <li>Complete answers for all objective questions</li>
          <li>Full solutions with workings for mathematics problems</li>
          <li>Exact expected answers for subjective questions</li>
          <li>Mark allocations for each question and sub-question</li>
        </ul>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search marking schemes..."
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
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
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
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            {filteredExams.length} marking scheme{filteredExams.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {filteredExams.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                    <p className="text-sm text-gray-500">
                      {exam.className} • {exam.subjectName} • {exam.totalMarks} marks
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {exam.academicYear} - {TERMS.find(t => t.id === exam.term)?.name} • By {exam.teacherName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExam(exam.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handlePrint(exam)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Print"
                    >
                      <Printer size={18} />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Export"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileCheck className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No marking schemes found</p>
            <p className="text-sm text-gray-400 mt-2">
              Marking schemes are automatically generated when you create examinations
            </p>
          </div>
        )}
      </div>

      {/* Marking Scheme Viewer Modal */}
      {selectedExamData && selectedScheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <div>
                <h2 className="text-lg font-semibold text-green-800">Marking Scheme</h2>
                <p className="text-sm text-green-600">{selectedExamData.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedExamData)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                <h1 className="text-xl font-bold">{schoolSettings.name}</h1>
                <p className="italic text-gray-600">MOTTO: {schoolSettings.motto}</p>
                <h2 className="text-lg font-bold mt-4">{selectedExamData.subjectName.toUpperCase()}</h2>
                <h3 className="text-lg font-bold text-red-600">MARKING SCHEME</h3>
              </div>

              <div className="flex justify-between text-sm mb-4">
                <span>Class: {selectedExamData.className}</span>
                <span>Total Marks: {selectedExamData.totalMarks}</span>
                <span>Date: {selectedExamData.date}</span>
              </div>

              {/* Sections */}
              {selectedScheme.sections.map((section) => (
                <div key={section.sectionId} className="mb-8">
                  <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">
                    {section.sectionName}
                  </h3>

                  {section.answers.map((answer) => (
                    <div key={answer.questionId} className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">
                          <span className="font-bold">{answer.questionNumber}.</span> {answer.questionText}
                        </p>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          [{answer.marks} mark{answer.marks > 1 ? 's' : ''}]
                        </span>
                      </div>

                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-green-800">
                          <strong>Answer:</strong> {answer.answer}
                        </p>
                        {answer.workings && (
                          <p className="text-blue-700 mt-2 italic">
                            <strong>Working:</strong> {answer.workings}
                          </p>
                        )}
                      </div>

                      {answer.subAnswers && answer.subAnswers.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2">
                          {answer.subAnswers.map((sub) => (
                            <div key={sub.subQuestionId} className="p-2 bg-green-50 rounded border border-green-200">
                              <p className="text-green-800">
                                <strong>{sub.label}</strong> {sub.answer}
                                <span className="text-gray-500 ml-2">[{sub.marks} marks]</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <p className="text-center font-bold mt-8">END OF MARKING SCHEME</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkingSchemes;
