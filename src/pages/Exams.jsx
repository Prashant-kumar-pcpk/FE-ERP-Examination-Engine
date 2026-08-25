import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, subjectAPI } from '../services/api';
import {
  FileSpreadsheet,
  PlusCircle,
  Clock,
  Award,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  HelpCircle,
  Play,
  CheckCircle2,
  Send
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { formatDate, getStatusBadge } from '../utils/helpers';

const Exams = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete modal state
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const [examsRes, subjectsRes] = await Promise.all([
        examAPI.getAll({
          subjectId: selectedSubject || undefined,
          status: selectedStatus || undefined
        }),
        subjectAPI.getAll()
      ]);

      if (examsRes.success) {
        setExams(examsRes.data);
      }
      if (subjectsRes.success) {
        setSubjects(subjectsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedSubject, selectedStatus]);

  const handlePublish = async (examId) => {
    try {
      const res = await examAPI.publish(examId);
      if (res.success) {
        setToast({ type: 'success', message: 'Exam published successfully!' });
        fetchExams();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to publish exam' });
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await examAPI.delete(examToDelete._id);
      if (res.success) {
        setToast({ type: 'success', message: 'Exam deleted successfully' });
        setExamToDelete(null);
        fetchExams();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete exam' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const titleMatch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = exam.subjectId?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || subjectMatch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isStudent ? 'Exams Portal' : 'Exam Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStudent
              ? 'Browse scheduled tests, take ongoing exams, or check your past evaluations.'
              : 'Create, configure, publish, and monitor online examinations.'}
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <Link
            to="/exams/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full shadow-md shadow-indigo-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Exam
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam title or subject..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>

          {!isStudent && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <LoadingSpinner text="Loading examinations..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Examinations Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery || selectedSubject || selectedStatus
              ? 'No exams match your selected filters. Try resetting search criteria.'
              : 'There are currently no examinations scheduled in the system.'}
          </p>
          {(isAdmin || isTeacher) && (
            <Link
              to="/exams/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              Create First Exam
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const hasStudentAttempt = exam.userAttempt;
            const attemptStatus = hasStudentAttempt?.status;

            return (
              <div
                key={exam._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Subject Tag & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {exam.subjectId?.name || 'General'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(exam.status)}`}>
                      {exam.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {exam.description}
                    </p>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 py-3 my-2 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.duration} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalMarks || 0} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pass: {exam.passingMarks}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      <span>{exam.negativeMarking ? `Neg: -${exam.negativeMarks}` : 'No Negative'}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-2">
                    <div>Start: {formatDate(exam.startTime)}</div>
                    <div>End: {formatDate(exam.endTime)}</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Student Flow */}
                  {isStudent && (
                    <>
                      {attemptStatus === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => navigate(`/take-exam/${exam._id}`)}
                          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Resume Attempt
                        </button>
                      ) : attemptStatus === 'SUBMITTED' || attemptStatus === 'AUTO_SUBMITTED' ? (
                        <button
                          onClick={() => navigate(`/exam-result/${hasStudentAttempt._id}`)}
                          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          View Result ({hasStudentAttempt.percentage}%)
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/take-exam/${exam._id}`)}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Start Exam
                        </button>
                      )}
                    </>
                  )}

                  {/* Admin / Teacher Flow */}
                  {!isStudent && (
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/exams/${exam._id}/questions`}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1"
                          title="Manage Questions"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </Link>

                        <Link
                          to={`/exams/edit/${exam._id}`}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Edit Exam"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setExamToDelete(exam)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {exam.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(exam._id)}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Publish
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        title="Confirm Exam Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">{examToDelete?.title}</strong>?
            This will also delete all associated questions and student attempt records.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setExamToDelete(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Exams;
