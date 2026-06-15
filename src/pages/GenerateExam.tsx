import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  CLASS_LEVELS,
  SUBJECTS,
  EXAMINATION_TYPES,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  ACADEMIC_YEARS,
  TERMS,
  TOPICS,
  EARLY_CHILDHOOD_CLASSES,
} from '../constants';
import {
  generateQuestions,
  generateRMEScenarioQuestion,
  generatePracticalQuestion,
  generateMarkingSchemeFromExam,
} from '../services/aiService';
import { Examination, ExamSection, Question } from '../types';
import {
  Wand2,
  Plus,
  Trash2,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  GripVertical,
} from 'lucide-react';

interface GenerateExamProps {
  onNavigate: (page: string) => void;
}

const GenerateExam: React.FC<GenerateExamProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { schoolSettings, addExamination, addMarkingScheme, addToQuestionBank } = useData();

  // Form State
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[1]);
  const [term, setTerm] = useState<'1' | '2' | '3'>('2');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [duration, setDuration] = useState(60);
  const [teacherName, setTeacherName] = useState(user?.fullName || '');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  // Section Configuration
  const [sections, setSections] = useState<{
    id: string;
    name: string;
    label: string;
    type: 'objective' | 'subjective';
    questionCount: number;
    marksPerQuestion: number;
    questionTypes: string[];
    difficulty: string;
    includeCompulsory: boolean;
    includePractical: boolean;
    expanded: boolean;
  }[]>([
    {
      id: uuidv4(),
      name: 'Section A',
      label: 'OBJECTIVE',
      type: 'objective',
      questionCount: 20,
      marksPerQuestion: 1,
      questionTypes: ['multiple_choice'],
      difficulty: 'medium',
      includeCompulsory: false,
      includePractical: false,
      expanded: true,
    },
  ]);

  // Generated Exam State
  const [generatedSections, setGeneratedSections] = useState<ExamSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get applicable subjects for selected class
  const applicableSubjects = SUBJECTS.filter((s) =>
    s.applicableClasses.includes(selectedClass)
  );

  // Check if early childhood (no formal exams)
  const isEarlyChildhood = EARLY_CHILDHOOD_CLASSES.includes(selectedClass);

  // Get topics for selected subject
  const getTopicsForSubject = () => {
    const subjectKey = selectedSubject.toLowerCase().replace(/\s+/g, '_').replace('_language', '');
    const classLevel = CLASS_LEVELS.find(c => c.id === selectedClass);
    const topicData = TOPICS[subjectKey as keyof typeof TOPICS];
    
    if (!topicData) return [];
    
    if ('all' in topicData) {
      return topicData.all;
    }
    
    if (classLevel?.level === 'jhs' && 'jhs' in topicData) {
      return topicData.jhs;
    }
    
    if ('primary' in topicData) {
      return topicData.primary;
    }
    
    return [];
  };

  const addSection = () => {
    const sectionLabels = ['A', 'B', 'C', 'D', 'E'];
    const nextIndex = sections.length;
    if (nextIndex >= 5) return;

    setSections([
      ...sections,
      {
        id: uuidv4(),
        name: `Section ${sectionLabels[nextIndex]}`,
        label: nextIndex === 0 ? 'OBJECTIVE' : 'SUBJECTIVE',
        type: nextIndex === 0 ? 'objective' : 'subjective',
        questionCount: 5,
        marksPerQuestion: nextIndex === 0 ? 1 : 5,
        questionTypes: nextIndex === 0 ? ['multiple_choice'] : ['short_answer'],
        difficulty: 'medium',
        includeCompulsory: nextIndex === 1,
        includePractical: false,
        expanded: true,
      },
    ]);
  };

  const removeSection = (id: string) => {
    if (sections.length === 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<(typeof sections)[0]>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addCustomTopic = () => {
    if (newTopic.trim() && !customTopics.includes(newTopic.trim())) {
      setCustomTopics([...customTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeCustomTopic = (topic: string) => {
    setCustomTopics(customTopics.filter((t) => t !== topic));
  };

  const generateExamination = async () => {
    if (!selectedClass || !selectedSubject || !examType) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const generatedSections: ExamSection[] = [];
      const subjectData = SUBJECTS.find((s) => s.id === selectedSubject);
      const classData = CLASS_LEVELS.find((c) => c.id === selectedClass);
      const allTopics = [...getTopicsForSubject(), ...customTopics];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const questions: Question[] = [];

        // Check if this subject requires a compulsory practical Q1
        const needsPracticalQ1 = 
          section.type === 'subjective' && 
          i === 1 && 
          subjectData?.hasPractical && 
          classData?.level === 'jhs';

        // For RME, Q1 should be scenario-based
        const needsScenarioQ1 = 
          section.type === 'subjective' && 
          i === 1 && 
          selectedSubject === 'rme' && 
          classData?.level === 'jhs';

        if (needsScenarioQ1) {
          const scenarioQuestion = await generateRMEScenarioQuestion();
          questions.push(scenarioQuestion);
        } else if (needsPracticalQ1) {
          const practicalQuestion = await generatePracticalQuestion(subjectData!.name);
          questions.push(practicalQuestion);
        }

        // Generate remaining questions
        const remainingCount = section.questionCount - questions.length;
        if (remainingCount > 0) {
          const generatedQuestions = await generateQuestions({
            subject: subjectData?.name || '',
            classLevel: classData?.name || '',
            topics: allTopics.length > 0 ? allTopics : ['General'],
            questionTypes: section.questionTypes as any[],
            numberOfQuestions: remainingCount,
            difficulty: section.difficulty as any,
            marksPerQuestion: section.marksPerQuestion,
            isCompulsory: section.includeCompulsory,
            isPractical: section.includePractical,
          });
          questions.push(...generatedQuestions);
        }

        generatedSections.push({
          id: section.id,
          name: section.name,
          label: section.label,
          instructions:
            section.type === 'objective'
              ? 'Answer ALL questions in this section. Each question carries equal marks.'
              : needsPracticalQ1 || needsScenarioQ1
              ? 'Answer Question 1 and any other required questions from this section.'
              : 'Answer the required number of questions from this section.',
          questionType: section.type,
          questions,
          totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
          columns: section.type === 'objective' ? 2 : 1,
          hasVerticalDivider: section.type === 'objective',
        });
      }

      setGeneratedSections(generatedSections);
      setSuccess('Examination generated successfully! Review and save below.');
    } catch (err) {
      setError('Failed to generate examination. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveExamination = () => {
    if (generatedSections.length === 0) {
      setError('Please generate the examination first');
      return;
    }

    const classData = CLASS_LEVELS.find((c) => c.id === selectedClass);
    const subjectData = SUBJECTS.find((s) => s.id === selectedSubject);
    const examTypeData = EXAMINATION_TYPES.find((e) => e.id === examType);

    const totalMarks = generatedSections.reduce((sum, s) => sum + s.totalMarks, 0);

    const examination: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${classData?.name} ${subjectData?.name} ${examTypeData?.name}`,
      academicYear,
      term,
      classId: selectedClass,
      className: classData?.name || '',
      subjectId: selectedSubject,
      subjectName: subjectData?.name || '',
      examinationType: examType as any,
      teacherId: user?.id || '',
      teacherName,
      duration,
      totalMarks,
      date: examDate,
      sections: generatedSections,
      status: 'saved',
      createdBy: user?.fullName || '',
      lastModifiedBy: user?.fullName || '',
    };

    const savedExam = addExamination(examination);

    // Generate and save marking scheme
    const markingSections = generateMarkingSchemeFromExam({ sections: generatedSections });
    addMarkingScheme({
      examinationId: savedExam.id,
      sections: markingSections,
    });

    // Add questions to question bank
    generatedSections.forEach((section) => {
      section.questions.forEach((question) => {
        addToQuestionBank({
          question,
          subjectId: selectedSubject,
          subjectName: subjectData?.name || '',
          classId: selectedClass,
          className: classData?.name || '',
          topic: question.topic,
          subtopic: question.subtopic,
          teacherId: user?.id || '',
          teacherName,
          academicYear,
          term,
          difficulty: question.difficulty,
        });
      });
    });

    setSuccess('Examination saved successfully to repository!');
    setTimeout(() => {
      onNavigate('exam-repository');
    }, 1500);
  };

  // Edit question function - can be used for inline editing
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setGeneratedSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
              totalMarks: section.questions.reduce(
                (sum, q) => sum + (q.id === questionId ? updates.marks || q.marks : q.marks),
                0
              ),
            }
          : section
      )
    );
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setGeneratedSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
              totalMarks: section.questions
                .filter((q) => q.id !== questionId)
                .reduce((sum, q) => sum + q.marks, 0),
            }
          : section
      )
    );
  };

  const totalMarks = generatedSections.reduce((sum, s) => sum + s.totalMarks, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wand2 className="text-blue-600" />
            AI Examination Generator
          </h1>
          <p className="text-gray-500">Generate examinations compliant with GES, NaCCA, SBC & CCP standards</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as '1' | '2' | '3')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TERMS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {isEarlyChildhood && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
                  <AlertCircle className="inline mr-1" size={16} />
                  Early childhood classes use activity-based assessments, not formal examinations.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedClass}
                >
                  <option value="">Select Subject</option>
                  {applicableSubjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examination Type *</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  {EXAMINATION_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={15}
                  max={180}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Topics</h2>
            
            <div className="space-y-3">
              {getTopicsForSubject().map((topic, idx) => (
                <label key={idx} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  {topic}
                </label>
              ))}
              
              {customTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                  <span className="text-sm text-blue-700">{topic}</span>
                  <button onClick={() => removeCustomTopic(topic)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Add custom topic..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                />
                <button
                  onClick={addCustomTopic}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Examination Sections</h2>
              <button
                onClick={addSection}
                disabled={sections.length >= 5}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section, idx) => (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                    onClick={() => updateSection(section.id, { expanded: !section.expanded })}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-gray-400" size={18} />
                      <span className="font-medium">{section.name}</span>
                      <span className="text-sm text-gray-500">({section.label})</span>
                      <span className="text-sm text-blue-600">
                        {section.questionCount} questions × {section.marksPerQuestion} marks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(section.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {section.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {section.expanded && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                          <select
                            value={section.type}
                            onChange={(e) =>
                              updateSection(section.id, {
                                type: e.target.value as 'objective' | 'subjective',
                                label: e.target.value === 'objective' ? 'OBJECTIVE' : 'SUBJECTIVE',
                                questionTypes: e.target.value === 'objective' ? ['multiple_choice'] : ['short_answer'],
                                marksPerQuestion: e.target.value === 'objective' ? 1 : 5,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="objective">Objective</option>
                            <option value="subjective">Subjective</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                          <input
                            type="number"
                            value={section.questionCount}
                            onChange={(e) =>
                              updateSection(section.id, { questionCount: parseInt(e.target.value) || 1 })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min={1}
                            max={50}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marks per Question</label>
                          <input
                            type="number"
                            value={section.marksPerQuestion}
                            onChange={(e) =>
                              updateSection(section.id, { marksPerQuestion: parseInt(e.target.value) || 1 })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min={1}
                            max={20}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                          <select
                            value={section.difficulty}
                            onChange={(e) => updateSection(section.id, { difficulty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {DIFFICULTY_LEVELS.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
                        <div className="flex flex-wrap gap-2">
                          {QUESTION_TYPES.filter((qt) =>
                            section.type === 'objective'
                              ? qt.category === 'objective'
                              : qt.category === 'subjective'
                          ).map((qt) => (
                            <label key={qt.id} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded">
                              <input
                                type="checkbox"
                                checked={section.questionTypes.includes(qt.id)}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [...section.questionTypes, qt.id]
                                    : section.questionTypes.filter((t) => t !== qt.id);
                                  updateSection(section.id, { questionTypes: types.length > 0 ? types : [qt.id] });
                                }}
                                className="rounded text-blue-600"
                              />
                              {qt.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      {section.type === 'subjective' && idx === 1 && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={section.includeCompulsory}
                              onChange={(e) => updateSection(section.id, { includeCompulsory: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                            Include Compulsory Question 1
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={section.includePractical}
                              onChange={(e) => updateSection(section.id, { includePractical: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                            Question 1 is Practical
                          </label>
                        </div>
                      )}

                      <div className="text-right text-sm text-gray-600">
                        Section Total: <strong>{section.questionCount * section.marksPerQuestion} marks</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-semibold">
                Total Marks: {sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0)}
              </div>
              <button
                onClick={generateExamination}
                disabled={isGenerating || !selectedClass || !selectedSubject || !examType}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Examination
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Preview */}
          {generatedSections.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Generated Examination Preview</h2>
                <div className="flex gap-3">
                  <button
                    onClick={saveExamination}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save size={18} />
                    Save to Repository
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Printer size={18} />
                    Print Preview
                  </button>
                </div>
              </div>

              {/* Exam Header Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                <div className="text-center">
                  <h3 className="text-xl font-bold">{schoolSettings.name}</h3>
                  <p className="text-sm text-gray-600">MOTTO: {schoolSettings.motto}</p>
                  <div className="my-4 border-b border-gray-300"></div>
                  <p className="font-semibold">
                    {EXAMINATION_TYPES.find((e) => e.id === examType)?.name.toUpperCase()}
                  </p>
                  <p className="text-lg font-bold mt-2">
                    {SUBJECTS.find((s) => s.id === selectedSubject)?.name.toUpperCase()}
                  </p>
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <span>Class: {CLASS_LEVELS.find((c) => c.id === selectedClass)?.name}</span>
                    <span>Duration: {duration} minutes</span>
                    <span>Total Marks: {totalMarks}</span>
                  </div>
                  <div className="flex justify-center gap-8 mt-2 text-sm text-gray-600">
                    <span>Academic Year: {academicYear}</span>
                    <span>Term: {TERMS.find((t) => t.id === term)?.name}</span>
                    <span>Date: {examDate}</span>
                  </div>
                  <p className="text-sm mt-2">Teacher: {teacherName}</p>
                </div>
              </div>

              {/* Sections Preview */}
              {generatedSections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-bold mb-2">
                    {section.name}: {section.label}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 italic">{section.instructions}</p>
                  <p className="text-sm text-blue-600 mb-4">
                    [{section.totalMarks} marks]
                  </p>

                  <div className={section.columns === 2 ? 'grid grid-cols-2 gap-4' : ''}>
                    {section.questions.map((question, qIdx) => (
                      <div
                        key={question.id}
                        className="p-4 border border-gray-200 rounded-lg mb-3 hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {qIdx + 1}. {question.isCompulsory && <span className="text-red-500">[COMPULSORY] </span>}
                            {question.isPractical && <span className="text-blue-500">[PRACTICAL] </span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">[{question.marks} mark{question.marks > 1 ? 's' : ''}]</span>
                            <button
                              onClick={() => deleteQuestion(section.id, question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{question.text}</p>

                        {question.options && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((opt) => (
                              <p key={opt.id} className={`text-sm ${opt.isCorrect ? 'text-green-600 font-medium' : ''}`}>
                                {opt.label}. {opt.text}
                              </p>
                            ))}
                          </div>
                        )}

                        {question.subQuestions && (
                          <div className="mt-3 ml-4 space-y-2">
                            {question.subQuestions.map((sq) => (
                              <div key={sq.id} className="text-sm">
                                <span className="font-medium">{sq.label}</span> {sq.text}
                                <span className="text-gray-500 ml-2">[{sq.marks} marks]</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-green-600">
                            <strong>Answer:</strong> {question.answer}
                          </p>
                          {question.workings && (
                            <p className="text-sm text-blue-600 mt-1">
                              <strong>Working:</strong> {question.workings}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateExam;
