import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusBadge } from '../utils/helpers';

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, recentExams, recentAttempts, recentResults, availableExams, activeAttempt } = data || {};

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl min-w-0">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-2">
            <span>Role: {user?.role}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight break-words">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
            {isAdmin && 'Comprehensive administrative dashboard for monitoring all ERP exam operations and student performance.'}
            {isTeacher && 'Manage your exams, author questions, and review detailed student attempt analytics.'}
            {isStudent && 'Take online tests, track your real-time progress, and review your performance analytics.'}
          </p>
        </div>

        {/* Action Button */}
        {(isAdmin || isTeacher) && (
          <Link
            to="/exams/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all w-full md:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Exam
          </Link>
        )}

        {isStudent && (
          <Link
            to="/exams"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all w-full md:w-auto"
          >
            <BookOpen className="w-4 h-4" />
            Explore Exams
          </Link>
        )}
      </div>

      {/* Student Active In-Progress Attempt Alert */}
      {isStudent && activeAttempt && (
        <div className="p-4 sm:p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-200 text-amber-900 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded inline-block">
                Active Attempt in Progress
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
                {activeAttempt.examId?.title || 'Active Exam'}
              </h3>
              <p className="text-xs text-slate-600">
                You have an incomplete attempt started. Timer is running.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/take-exam/${activeAttempt.examId?._id}`)}
            className="px-5 py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 w-full sm:w-auto justify-center flex-shrink-0"
          >
            <Play className="w-4 h-4" />
            Resume Exam
          </button>
        </div>
      )}

      {/* ======================= ADMIN DASHBOARD ======================= */}
      {isAdmin && metrics && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Students</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalStudents}</h3>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Teachers</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalTeachers}</h3>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Subjects</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalSubjects}</h3>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Total Exams</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalExams}</h3>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Attempts</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalAttempts}</h3>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Pass Rate</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 truncate">{metrics.passRate}%</h3>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Recent Exams */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Exams</h3>
                <Link to="/exams" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentExams && recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <div key={exam._id} className="py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{exam.title}</h4>
                        <span className="text-xs text-slate-400 block truncate">
                          {exam.subjectId?.name} • {exam.duration} mins
                        </span>
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border self-start xs:self-center flex-shrink-0 ${getStatusBadge(exam.status)}`}>
                        {exam.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">No exams created yet.</p>
                )}
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Exam Submissions</h3>
                <Link to="/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentAttempts && recentAttempts.length > 0 ? (
                  recentAttempts.map((att) => (
                    <div key={att._id} className="py-3 flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{att.studentId?.name}</h4>
                        <span className="text-xs text-slate-400 block truncate">
                          {att.examId?.title} • {formatDate(att.submittedAt)}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600 block">
                          {att.score} / {att.totalMarks}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">{att.percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">No submissions yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================= TEACHER DASHBOARD ======================= */}
      {isTeacher && metrics && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">My Exams</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalMyExams}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Published</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 truncate">{metrics.publishedCount}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Drafts</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 truncate">{metrics.draftCount}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Student Attempts</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 truncate">{metrics.totalAttempts}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0 col-span-2 sm:col-span-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Avg Pass Rate</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.passRate}%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">My Recent Exams</h3>
                <Link to="/exams" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentExams && recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <div key={exam._id} className="py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{exam.title}</h4>
                        <span className="text-xs text-slate-400 block truncate">Duration: {exam.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-start xs:self-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(exam.status)}`}>
                          {exam.status}
                        </span>
                        <Link
                          to={`/exams/${exam._id}/questions`}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Questions
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">No exams created yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Student Attempts</h3>
                <Link to="/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentAttempts && recentAttempts.length > 0 ? (
                  recentAttempts.map((att) => (
                    <div key={att._id} className="py-3 flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{att.studentId?.name}</h4>
                        <span className="text-xs text-slate-400 block truncate">{att.examId?.title}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-slate-900">
                          {att.score} / {att.totalMarks}
                        </span>
                        <span className="text-xs block text-slate-400">{att.percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">No student attempts recorded.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================= STUDENT DASHBOARD ======================= */}
      {isStudent && metrics && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Completed Tests</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">{metrics.totalCompleted}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Passed</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 truncate">{metrics.passedCount}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Failed</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 truncate">{metrics.failedCount}</h3>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Avg Percentage</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 truncate">{metrics.avgPercentage}%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Available Exams */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Available Exams</h3>
                <Link to="/exams" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {availableExams && availableExams.length > 0 ? (
                  availableExams.map((exam) => (
                    <div key={exam._id} className="py-3.5 flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{exam.title}</h4>
                        <span className="text-xs text-slate-400 block truncate">
                          {exam.subjectId?.name} • {exam.duration} mins • {exam.totalMarks} Marks
                        </span>
                      </div>
                      <Link
                        to={`/take-exam/${exam._id}`}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex-shrink-0 self-start xs:self-center"
                      >
                        Start Exam
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">No new exams available at the moment.</p>
                )}
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">My Recent Results</h3>
                <Link to="/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  History <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentResults && recentResults.length > 0 ? (
                  recentResults.map((att) => {
                    const isPassed = att.score >= (att.examId?.passingMarks || 0);
                    return (
                      <div key={att._id} className="py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">{att.examId?.title}</h4>
                          <span className="text-xs text-slate-400 block truncate">
                            {formatDate(att.submittedAt)} • Score: {att.score} / {att.totalMarks}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-start xs:self-center">
                          <span
                            className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md border ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isPassed ? 'PASS' : 'FAIL'} ({att.percentage}%)
                          </span>
                          <Link
                            to={`/exam-result/${att._id}`}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 py-4">You have not completed any exams yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
