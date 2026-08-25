import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examAPI, subjectAPI } from '../services/api';
import { ArrowLeft, Save, AlertCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    duration: 30,
    passingMarks: 10,
    negativeMarking: false,
    negativeMarks: 0,
    shuffleQuestions: true,
    shuffleOptions: false,
    startTime: '',
    endTime: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examRes, subjectsRes] = await Promise.all([
          examAPI.getById(id),
          subjectAPI.getAll()
        ]);

        if (subjectsRes.success) {
          setSubjects(subjectsRes.data);
        }

        if (examRes.success && examRes.data) {
          const exam = examRes.data;
          setFormData({
            title: exam.title,
            subjectId: exam.subjectId?._id || exam.subjectId,
            description: exam.description || '',
            duration: exam.duration,
            passingMarks: exam.passingMarks,
            negativeMarking: exam.negativeMarking || false,
            negativeMarks: exam.negativeMarks || 0,
            shuffleQuestions: exam.shuffleQuestions !== undefined ? exam.shuffleQuestions : true,
            shuffleOptions: exam.shuffleOptions || false,
            startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
            endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
            status: exam.status
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await examAPI.update(id, formData);
      if (res.success) {
        setToast({ type: 'success', message: 'Exam updated successfully!' });
        setTimeout(() => navigate('/exams'), 800);
      }
    } catch (err) {
      setError(err.message || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading exam details..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Exams
          </Link>
        </div>

        <Link
          to={`/exams/${id}/questions`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Manage Questions
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Examination
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify configuration, duration, rules, and publishing status.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Exam Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject *
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (in Minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Passing Marks *
              </label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Guidelines
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">Negative Marking</span>
              </label>
            </div>

            {formData.negativeMarking && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Negative Marks Penalty
                </label>
                <input
                  type="number"
                  step="0.25"
                  name="negativeMarks"
                  value={formData.negativeMarks}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/exams"
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExam;
