import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_LEVELS, SUBJECTS, GRADE_SCALE } from '../constants';
import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  Download,
  Printer,
  TrendingUp,
} from 'lucide-react';

const Results: React.FC = () => {
  const { results, schoolSettings } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || result.className === filterClass;
    const matchesSubject = !filterSubject || result.subject === filterSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Calculate statistics
  const totalResults = filteredResults.length;
  const averageScore = totalResults > 0
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalResults)
    : 0;
  const passCount = filteredResults.filter(r => r.percentage >= 50).length;
  const passRate = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-yellow-100 text-yellow-700';
      case 'D': return 'bg-orange-100 text-orange-700';
      case 'E': return 'bg-red-100 text-red-700';
      case 'F': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePrintReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Results Report - ${schoolSettings.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
          .stat-box { background: #f5f5f5; padding: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolSettings.name}</h1>
          <p>${schoolSettings.motto}</p>
          <h2>EXAMINATION RESULTS REPORT</h2>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <strong>Total Results</strong><br>
            ${totalResults}
          </div>
          <div class="stat-box">
            <strong>Average Score</strong><br>
            ${averageScore}%
          </div>
          <div class="stat-box">
            <strong>Pass Count</strong><br>
            ${passCount}
          </div>
          <div class="stat-box">
            <strong>Pass Rate</strong><br>
            ${passRate}%
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${filteredResults.map(result => `
              <tr>
                <td>${result.studentName}</td>
                <td>${result.className}</td>
                <td>${result.subject}</td>
                <td>${result.obtainedMarks}/${result.totalMarks} (${result.percentage}%)</td>
                <td>${result.grade}</td>
                <td>${result.remarks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p style="text-align: center; margin-top: 30px;">
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
            <ClipboardList className="text-blue-600" />
            Examination Results
          </h1>
          <p className="text-gray-500">View and manage examination results</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Printer size={18} />
            Print Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Results</p>
          <p className="text-2xl font-bold text-gray-800">{totalResults}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">{averageScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Pass Count</p>
          <p className="text-2xl font-bold text-green-600">{passCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pass Rate</p>
              <p className="text-2xl font-bold text-purple-600">{passRate}%</p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name..."
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
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((subj) => (
                <option key={subj.id} value={subj.name}>{subj.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredResults.length} results
          </p>
        </div>

        {filteredResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{result.studentName}</td>
                    <td className="px-4 py-3 text-sm">{result.className}</td>
                    <td className="px-4 py-3 text-sm">{result.subject}</td>
                    <td className="px-4 py-3 text-sm">{result.obtainedMarks}/{result.totalMarks}</td>
                    <td className="px-4 py-3 text-sm font-medium">{result.percentage}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No results found</p>
            <p className="text-sm text-gray-400 mt-2">
              Results will appear here when examinations are graded
            </p>
          </div>
        )}
      </div>

      {/* Grade Scale Reference */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {GRADE_SCALE.map((scale) => (
            <div key={scale.grade} className="text-center p-3 bg-gray-50 rounded-lg">
              <span className={`inline-block px-3 py-1 rounded font-bold mb-2 ${getGradeColor(scale.grade)}`}>
                {scale.grade}
              </span>
              <p className="text-sm text-gray-600">{scale.min}-{scale.max}%</p>
              <p className="text-xs text-gray-500">{scale.remarks}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
