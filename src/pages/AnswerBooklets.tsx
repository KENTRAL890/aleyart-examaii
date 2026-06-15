import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  BookOpen,
  Printer,
  FileText,
  Grid,
  AlignLeft,
} from 'lucide-react';

const AnswerBooklets: React.FC = () => {
  const { schoolSettings, generateAnswerBooklet, answerBooklets } = useData();

  const [bookletType, setBookletType] = useState<'standard' | 'lined' | 'graph' | 'branded'>('branded');
  const [pages, setPages] = useState(16);
  const [includeSchoolInfo, setIncludeSchoolInfo] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [candidateNumber, setCandidateNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');

  const handleGenerate = () => {
    generateAnswerBooklet({
      type: bookletType,
      pages,
      includeSchoolInfo,
      studentInfo: {
        name: studentName,
        candidateNumber,
        subject,
        className,
      },
    });
  };

  const handlePrint = () => {
    const generatePages = () => {
      let pagesHtml = '';
      for (let i = 0; i < pages; i++) {
        const isFirstPage = i === 0;
        const pageNum = i + 1;
        
        let pageContent = '';
        
        if (bookletType === 'graph') {
          // Graph paper pattern
          pageContent = `
            <div style="height: 100%; background-image: 
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
              background-size: 5mm 5mm;">
            </div>
          `;
        } else if (bookletType === 'lined') {
          // Lined paper
          const lines = 30;
          pageContent = Array.from({ length: lines }, () => `
            <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
          `).join('');
        } else {
          // Standard or branded - blank with light lines
          const lines = 25;
          pageContent = Array.from({ length: lines }, () => `
            <div style="border-bottom: 1px dotted #e5e7eb; height: 24px;"></div>
          `).join('');
        }
        
        pagesHtml += `
          <div class="page" style="page-break-after: always; padding: 20mm; min-height: 277mm; box-sizing: border-box;">
            ${isFirstPage && includeSchoolInfo ? `
              <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 15px;">
                <h1 style="margin: 0; font-size: 24px;">${schoolSettings.name}</h1>
                <p style="margin: 5px 0; font-style: italic;">${schoolSettings.motto}</p>
                <h2 style="margin: 10px 0;">ANSWER BOOKLET</h2>
              </div>
              <div style="margin-bottom: 20px;">
                <div style="display: flex; margin-bottom: 10px;">
                  <span style="width: 150px; font-weight: bold;">Student Name:</span>
                  <span style="flex: 1; border-bottom: 1px dotted #333;">${studentName}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                  <span style="width: 150px; font-weight: bold;">Candidate Number:</span>
                  <span style="flex: 1; border-bottom: 1px dotted #333;">${candidateNumber}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div style="display: flex;">
                    <span style="width: 100px; font-weight: bold;">Subject:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #333;">${subject}</span>
                  </div>
                  <div style="display: flex;">
                    <span style="width: 100px; font-weight: bold;">Class:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #333;">${className}</span>
                  </div>
                </div>
              </div>
              <hr style="margin-bottom: 20px;">
            ` : ''}
            ${pageContent}
            <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #666;">
              Page ${pageNum} of ${pages}
            </div>
          </div>
        `;
      }
      return pagesHtml;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Answer Booklet - ${schoolSettings.name}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; }
          .page { width: 210mm; }
        </style>
      </head>
      <body>
        ${generatePages()}
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
            <BookOpen className="text-blue-600" />
            Answer Booklet Generator
          </h1>
          <p className="text-gray-500">Generate branded answer booklets for examinations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Booklet Configuration</h2>
          
          <div className="space-y-4">
            {/* Booklet Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booklet Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBookletType('branded')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    bookletType === 'branded'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText size={24} className={bookletType === 'branded' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">School Branded</span>
                </button>
                <button
                  onClick={() => setBookletType('standard')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    bookletType === 'standard'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText size={24} className={bookletType === 'standard' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Standard</span>
                </button>
                <button
                  onClick={() => setBookletType('lined')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    bookletType === 'lined'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlignLeft size={24} className={bookletType === 'lined' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Lined</span>
                </button>
                <button
                  onClick={() => setBookletType('graph')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    bookletType === 'graph'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Grid size={24} className={bookletType === 'graph' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Graph Paper</span>
                </button>
              </div>
            </div>

            {/* Number of Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Pages</label>
              <select
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={8}>8 Pages</option>
                <option value={12}>12 Pages</option>
                <option value={16}>16 Pages</option>
                <option value={20}>20 Pages</option>
                <option value={24}>24 Pages</option>
                <option value={32}>32 Pages</option>
              </select>
            </div>

            {/* Include School Info */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeSchoolInfo}
                onChange={(e) => setIncludeSchoolInfo(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Include school header on first page</span>
            </label>

            {/* Student Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Information (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank for empty field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Number</label>
                  <input
                    type="text"
                    value={candidateNumber}
                    onChange={(e) => setCandidateNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                Generate Booklet
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
          
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-white aspect-[1/1.414] flex flex-col">
            {includeSchoolInfo && (
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
                <h3 className="font-bold text-lg">{schoolSettings.name}</h3>
                <p className="text-sm italic">{schoolSettings.motto}</p>
                <p className="font-semibold mt-2">ANSWER BOOKLET</p>
                
                <div className="mt-4 text-left text-sm space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-32">Student Name:</span>
                    <span className="flex-1 border-b border-dotted border-gray-400">
                      {studentName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Candidate No:</span>
                    <span className="flex-1 border-b border-dotted border-gray-400">
                      {candidateNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex">
                      <span className="font-semibold w-16">Subject:</span>
                      <span className="flex-1 border-b border-dotted border-gray-400">
                        {subject}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-16">Class:</span>
                      <span className="flex-1 border-b border-dotted border-gray-400">
                        {className}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page content preview */}
            <div className="flex-1 overflow-hidden">
              {bookletType === 'graph' ? (
                <div 
                  className="h-full"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '10px 10px',
                  }}
                />
              ) : bookletType === 'lined' ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="border-b border-gray-300 h-6" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="border-b border-dotted border-gray-200 h-8" />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-gray-500 mt-4 pt-2 border-t border-gray-200">
              Page 1 of {pages}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {pages}-page {bookletType} answer booklet
          </p>
        </div>
      </div>

      {/* Generated Booklets History */}
      {answerBooklets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generated Booklets ({answerBooklets.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {answerBooklets.slice(0, 8).map((booklet) => (
              <div key={booklet.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen size={20} className="text-blue-600" />
                  <span className="font-medium capitalize">{booklet.type}</span>
                </div>
                <p className="text-sm text-gray-500">{booklet.pages} pages</p>
                {booklet.studentInfo?.name && (
                  <p className="text-sm text-gray-600 mt-1">{booklet.studentInfo.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerBooklets;
