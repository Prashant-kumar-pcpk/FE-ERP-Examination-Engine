import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attemptAPI, examAPI } from '../services/api';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const Results = () => {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        if (isStudent) {
          // Student gets own results
          const res = await attemptAPI.getMyResults();
          if (res.success) {
            setResults(res.data);
          }
        } else {
          // Teacher / Admin can choose an exam
          const examsRes = await examAPI.getAll();
          if (examsRes.success && examsRes.data.length > 0) {
            setExams(examsRes.data);
            const firstExamId = examsRes.data[0]._id;
            setSelectedExam(firstExamId);

            const attemptsRes = await attemptAPI.getByExam(firstExamId);
            if (attemptsRes.success) {
              setResults(attemptsRes.data);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch examination results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isStudent]);

  const handleExamChange = async (examId) => {
    setSelectedExam(examId);
    if (!examId) return;
    try {
      setLoading(true);
      const res = await attemptAPI.getByExam(examId);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attempts for this exam');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((item) => {
    if (isStudent) {
      const title = item.examId?.title || '';
      const subject = item.examId?.subjectId?.name || '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      const studentName = item.studentId?.name || '';
      const email = item.studentId?.email || '';
      return (
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isStudent ? 'My Examination History' : 'Student Examination Results'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isStudent
              ? 'Review scores, performance metrics, and question answer keys from past exams.'
              : 'Monitor student performance, scores, pass rates, and individual candidate attempts.'}
          </p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isStudent
                ? 'Filter by exam title or subject...'
                : 'Search by student name or email...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!isStudent && exams.length > 0 && (
          <div className="relative w-full md:w-80 min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-left"
            >
              <span className="truncate flex-1 min-w-0">
                {exams.find((e) => e._id === selectedExam)?.title || 'Select Examination...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {exams.map((ex) => {
                  const isSelected = ex._id === selectedExam;
                  return (
                    <button
                      key={ex._id}
                      type="button"
                      onClick={() => {
                        handleExamChange(ex._id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate flex-1 min-w-0">{ex.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching results..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Results Recorded</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            {isStudent
              ? 'You have not completed any examinations yet. Head over to the exams portal to start.'
              : 'No student submissions found for the selected examination.'}
          </p>
          {isStudent && (
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
            >
              Go to Exams
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">
                    {isStudent ? 'Examination' : 'Candidate'}
                  </th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">
                    {isStudent ? 'Subject' : 'Score'}
                  </th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">Percentage</th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">Correct / Wrong</th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">Date</th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredResults.map((item) => {
                  const isPassed =
                    item.score >=
                    (item.examId?.passingMarks !== undefined ? item.examId.passingMarks : 0);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                      {/* Column 1 */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                        {isStudent ? (
                          <div className="max-w-[200px] truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              {item.examId?.title || 'Exam'}
                            </span>
                            <span className="text-xs text-slate-400 block truncate">
                              Duration: {item.examId?.duration} mins
                            </span>
                          </div>
                        ) : (
                          <div className="max-w-[200px] truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              {item.studentId?.name || 'Student'}
                            </span>
                            <span className="text-xs text-slate-400 block truncate">
                              {item.studentId?.email}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2 */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                        {isStudent ? (
                          <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold truncate max-w-[140px]">
                            {item.examId?.subjectId?.name || 'Subject'}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {item.score} / {item.totalMarks}
                          </span>
                        )}
                      </td>

                      {/* Column 3: Percentage */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                        <span className="font-extrabold text-slate-900">{item.percentage}%</span>
                      </td>

                      {/* Column 4: Breakdown */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                        <span className="text-emerald-600 font-bold">{item.correctAnswers}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-rose-600 font-bold">{item.wrongAnswers}</span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          ({item.unanswered} skipped)
                        </span>
                      </td>

                      {/* Column 5: Pass/Fail */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPassed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> PASS
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> FAIL
                            </>
                          )}
                        </span>
                      </td>

                      {/* Column 6: Date */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-xs text-slate-500">
                        {formatDate(item.submittedAt)}
                      </td>

                      {/* Column 7: Action */}
                      <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">
                        <Link
                          to={`/exam-result/${item._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
