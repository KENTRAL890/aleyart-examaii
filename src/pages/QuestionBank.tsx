import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_LEVELS, SUBJECTS, DIFFICULTY_LEVELS, ACADEMIC_YEARS, TERMS, QUESTION_TYPES } from '../constants';
import {
  Search,
  Filter,
  BookMarked,
  ChevronDown,
  Copy,
  Plus,
} from 'lucide-react';

interface QuestionBankProps {
  onNavigate: (page: string) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ onNavigate }) => {
  const { questionBank } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Get unique topics from question bank
  const uniqueTopics = [...new Set(questionBank.map(q => q.topic))].filter(Boolean);

  // Filter questions
  const filteredQuestions = questionBank.filter((entry) => {
    const matchesSearch =
      entry.question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || entry.classId === filterClass;
    const matchesSubject = !filterSubject || entry.subjectId === filterSubject;
    const matchesTopic = !filterTopic || entry.topic === filterTopic;
    const matchesDifficulty = !filterDifficulty || entry.difficulty === filterDifficulty;
    const matchesYear = !filterYear || entry.academicYear === filterYear;
    const matchesTerm = !filterTerm || entry.term === filterTerm;
    const matchesType = !filterType || entry.question.type === filterType;

    return matchesSearch && matchesClass && matchesSubject && matchesTopic && 
           matchesDifficulty && matchesYear && matchesTerm && matchesType;
  });

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookMarked className="text-blue-600" />
            Question Bank
          </h1>
          <p className="text-gray-500">Browse and reuse questions from the shared repository</p>
        </div>
        <button
          onClick={() => onNavigate('generate-exam')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Questions
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Questions</p>
          <p className="text-2xl font-bold text-gray-800">{questionBank.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Subjects Covered</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(questionBank.map(q => q.subjectId)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Classes Covered</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(questionBank.map(q => q.classId)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Contributors</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(questionBank.map(q => q.teacherId)).size}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions, topics, or teachers..."
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
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
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Topics</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.id} value={qt.id}>{qt.name}</option>
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
            <button
              onClick={() => {
                setFilterClass('');
                setFilterSubject('');
                setFilterTopic('');
                setFilterDifficulty('');
                setFilterYear('');
                setFilterTerm('');
                setFilterType('');
              }}
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Selected Questions Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-blue-700">
            {selectedQuestions.length} question{selectedQuestions.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Copy size={16} />
              Use in New Exam
            </button>
            <button
              onClick={() => setSelectedQuestions([])}
              className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredQuestions.length} of {questionBank.length} questions
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
              onChange={selectAll}
              className="rounded text-blue-600"
            />
            Select All
          </label>
        </div>

        {filteredQuestions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredQuestions.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 hover:bg-gray-50 transition ${
                  selectedQuestions.includes(entry.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(entry.id)}
                    onChange={() => toggleQuestionSelection(entry.id)}
                    className="mt-1 rounded text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {entry.className}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {entry.subjectName}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded capitalize">
                          {entry.question.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          entry.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          entry.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {entry.difficulty}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{entry.question.marks} mark{entry.question.marks > 1 ? 's' : ''}</span>
                    </div>

                    <p className="text-gray-800 mb-2 whitespace-pre-wrap">{entry.question.text}</p>

                    {entry.question.options && (
                      <div className="ml-4 space-y-1 mb-2">
                        {entry.question.options.map((opt) => (
                          <p key={opt.id} className={`text-sm ${opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {opt.label}. {opt.text} {opt.isCorrect && '✓'}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Topic: {entry.topic}</span>
                      <span>By: {entry.teacherName}</span>
                      <span>{entry.academicYear} - {TERMS.find(t => t.id === entry.term)?.name}</span>
                      <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Answer */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-green-600">
                        <strong>Answer:</strong> {entry.question.answer}
                      </p>
                      {entry.question.workings && (
                        <p className="text-sm text-blue-600">
                          <strong>Working:</strong> {entry.question.workings}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BookMarked className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No questions in the bank yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Questions are automatically added when you save examinations
            </p>
            <button
              onClick={() => onNavigate('generate-exam')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Examination
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
