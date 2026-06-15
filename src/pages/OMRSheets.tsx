import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_LEVELS, SUBJECTS } from '../constants';
import {
  FileSpreadsheet,
  Printer,
  Plus,
} from 'lucide-react';

const OMRSheets: React.FC = () => {
  const { schoolSettings, generateOMRSheet, omrSheets } = useData();

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    candidateNumber: '',
    indexNumber: '',
    subject: '',
    className: '',
    date: new Date().toISOString().split('T')[0],
    numberOfQuestions: 40,
    optionsPerQuestion: 4 as 4 | 5,
  });

  const [generatedSheet, setGeneratedSheet] = useState<boolean>(false);

  const handleGenerate = () => {
    generateOMRSheet({
      examinationId: '',
      studentId: formData.studentId,
      studentName: formData.studentName,
      candidateNumber: formData.candidateNumber,
      indexNumber: formData.indexNumber,
      subject: formData.subject,
      className: formData.className,
      date: formData.date,
      numberOfQuestions: formData.numberOfQuestions,
      optionsPerQuestion: formData.optionsPerQuestion,
    });
    setGeneratedSheet(true);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OMR Sheet - ${schoolSettings.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header .motto { font-style: italic; font-size: 14px; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .info-row { display: flex; border-bottom: 1px dotted #333; padding: 5px 0; }
          .info-label { font-weight: bold; width: 120px; }
          .info-value { flex: 1; }
          .instructions { background: #f5f5f5; padding: 10px; margin-bottom: 20px; font-size: 12px; }
          .answer-grid { }
          .question-row { display: flex; align-items: center; margin: 8px 0; }
          .question-num { width: 40px; font-weight: bold; }
          .options { display: flex; gap: 15px; }
          .option { width: 24px; height: 24px; border: 2px solid #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
          .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolSettings.name}</h1>
          <p class="motto">MOTTO: ${schoolSettings.motto}</p>
          <h2>OPTICAL MARK RECOGNITION (OMR) ANSWER SHEET</h2>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Student Name:</span>
            <span class="info-value">${formData.studentName || '________________________________'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Candidate No:</span>
            <span class="info-value">${formData.candidateNumber || '________________'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Index Number:</span>
            <span class="info-value">${formData.indexNumber || '________________'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Subject:</span>
            <span class="info-value">${formData.subject || '________________'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Class:</span>
            <span class="info-value">${formData.className || '________________'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formData.date}</span>
          </div>
        </div>
        
        <div class="instructions">
          <strong>INSTRUCTIONS:</strong>
          <ul>
            <li>Use a pencil (HB or 2B) to shade your answers.</li>
            <li>Shade the circle completely for your answer.</li>
            <li>Erase completely any answer you wish to change.</li>
            <li>Do not make any stray marks on this sheet.</li>
          </ul>
        </div>
        
        <div class="columns">
          <div class="answer-grid">
            ${Array.from({ length: Math.ceil(formData.numberOfQuestions / 2) }, (_, i) => i + 1)
              .map(num => `
                <div class="question-row">
                  <span class="question-num">${num}.</span>
                  <div class="options">
                    ${['A', 'B', 'C', 'D', ...(formData.optionsPerQuestion === 5 ? ['E'] : [])]
                      .map(opt => `<div class="option">${opt}</div>`)
                      .join('')}
                  </div>
                </div>
              `).join('')}
          </div>
          <div class="answer-grid">
            ${Array.from({ length: Math.floor(formData.numberOfQuestions / 2) }, (_, i) => i + Math.ceil(formData.numberOfQuestions / 2) + 1)
              .map(num => `
                <div class="question-row">
                  <span class="question-num">${num}.</span>
                  <div class="options">
                    ${['A', 'B', 'C', 'D', ...(formData.optionsPerQuestion === 5 ? ['E'] : [])]
                      .map(opt => `<div class="option">${opt}</div>`)
                      .join('')}
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 12px;">
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
            <FileSpreadsheet className="text-blue-600" />
            OMR Sheet Generator
          </h1>
          <p className="text-gray-500">Generate Optical Mark Recognition answer sheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sheet Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave blank for empty field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Number</label>
                <input
                  type="text"
                  value={formData.candidateNumber}
                  onChange={(e) => setFormData({ ...formData, candidateNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Index Number</label>
                <input
                  type="text"
                  value={formData.indexNumber}
                  onChange={(e) => setFormData({ ...formData, indexNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((subj) => (
                    <option key={subj.id} value={subj.name}>{subj.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                <input
                  type="number"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 40 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={10}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options per Question</label>
                <select
                  value={formData.optionsPerQuestion}
                  onChange={(e) => setFormData({ ...formData, optionsPerQuestion: parseInt(e.target.value) as 4 | 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={4}>4 Options (A, B, C, D)</option>
                  <option value={5}>5 Options (A, B, C, D, E)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Generate OMR Sheet
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print Preview
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
          
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-3 mb-4">
              <h3 className="font-bold text-lg">{schoolSettings.name}</h3>
              <p className="text-sm italic">MOTTO: {schoolSettings.motto}</p>
              <p className="font-semibold mt-2">OMR ANSWER SHEET</p>
            </div>

            {/* Info Fields */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex gap-2">
                <span className="font-semibold">Name:</span>
                <span className="border-b border-dotted border-gray-400 flex-1">
                  {formData.studentName || ''}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Candidate No:</span>
                <span className="border-b border-dotted border-gray-400 flex-1">
                  {formData.candidateNumber || ''}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Subject:</span>
                <span className="border-b border-dotted border-gray-400 flex-1">
                  {formData.subject || ''}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Class:</span>
                <span className="border-b border-dotted border-gray-400 flex-1">
                  {formData.className || ''}
                </span>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <span className="font-semibold w-6">{num}.</span>
                  <div className="flex gap-2">
                    {['A', 'B', 'C', 'D', ...(formData.optionsPerQuestion === 5 ? ['E'] : [])].map((opt) => (
                      <div
                        key={opt}
                        className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center text-xs"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              ... {formData.numberOfQuestions - 5} more questions
            </p>
          </div>

          {generatedSheet && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              OMR Sheet generated successfully! Click Print Preview to print.
            </div>
          )}
        </div>
      </div>

      {/* Generated Sheets History */}
      {omrSheets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generated Sheets ({omrSheets.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {omrSheets.slice(0, 10).map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{sheet.studentName || 'Blank'}</td>
                    <td className="px-4 py-2 text-sm">{sheet.subject}</td>
                    <td className="px-4 py-2 text-sm">{sheet.className}</td>
                    <td className="px-4 py-2 text-sm">{sheet.numberOfQuestions}</td>
                    <td className="px-4 py-2 text-sm">{sheet.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OMRSheets;
