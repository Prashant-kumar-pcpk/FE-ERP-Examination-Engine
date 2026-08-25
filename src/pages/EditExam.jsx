import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examAPI, subjectAPI } from '../services/api';
import { ArrowLeft, Save, AlertCircle, HelpCircle, Calendar, Clock, ChevronDown } from 'lucide-react';
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

  // Helpers for robust mobile Date + Time handling
  const getSplitDateTime = (isoString) => {
    if (!isoString) return { date: '', time: '00:00' };
    const parts = String(isoString).split('T');
    return {
      date: parts[0] || '',
      time: parts[1] ? parts[1].slice(0, 5) : '00:00'
    };
  };

  const handleDateTimeChange = (field, type, value) => {
    setFormData((prev) => {
      const current = getSplitDateTime(prev[field]);
      const newDate = type === 'date' ? value : current.date;
      const newTime = type === 'time' ? value : current.time;
      return {
        ...prev,
        [field]: `${newDate || '2026-08-26'}T${newTime || '00:00'}`
      };
    });
  };

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
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 w-full min-w-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
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
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors self-start xs:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          Manage Questions
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Examination
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Modify configuration, duration, rules, and publishing status.
        </p>
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2 font-medium break-words">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 space-y-6 min-w-0">
        <div className="space-y-4 min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Exam Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            <div className="md:col-span-2 min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
              />
            </div>

            <div className="min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Subject *</span>
                <span className="text-[10px] text-indigo-600 font-semibold normal-case">Course Code</span>
              </label>
              <div className="relative w-full min-w-0 max-w-full">
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  required
                  className="w-full max-w-full min-w-0 appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border truncate cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id} className="text-slate-800">
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Status *</span>
                <span className="text-[10px] text-indigo-600 font-semibold normal-case">Publishing</span>
              </label>
              <div className="relative w-full min-w-0 max-w-full">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full max-w-full min-w-0 appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border truncate cursor-pointer"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="min-w-0 max-w-full">
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
                className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
              />
            </div>

            <div className="min-w-0 max-w-full">
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
                className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
              />
            </div>

            <div className="md:col-span-2 min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Guidelines
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
              />
            </div>

            {/* Start Time: Split Date + Time */}
            <div className="min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Start Window</span>
                <span className="text-[10px] text-indigo-600 font-semibold normal-case">Date & Time</span>
              </label>
              <div className="grid grid-cols-5 gap-2 min-w-0 max-w-full">
                <div className="col-span-3 relative min-w-0">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden xs:block" />
                  <input
                    type="date"
                    value={getSplitDateTime(formData.startTime).date}
                    onChange={(e) => handleDateTimeChange('startTime', 'date', e.target.value)}
                    className="w-full min-w-0 max-w-full pl-2 xs:pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
                  />
                </div>
                <div className="col-span-2 relative min-w-0">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden xs:block" />
                  <input
                    type="time"
                    value={getSplitDateTime(formData.startTime).time}
                    onChange={(e) => handleDateTimeChange('startTime', 'time', e.target.value)}
                    className="w-full min-w-0 max-w-full pl-2 xs:pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
                  />
                </div>
              </div>
            </div>

            {/* End Time: Split Date + Time */}
            <div className="min-w-0 max-w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>End Window</span>
                <span className="text-[10px] text-indigo-600 font-semibold normal-case">Date & Time</span>
              </label>
              <div className="grid grid-cols-5 gap-2 min-w-0 max-w-full">
                <div className="col-span-3 relative min-w-0">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden xs:block" />
                  <input
                    type="date"
                    value={getSplitDateTime(formData.endTime).date}
                    onChange={(e) => handleDateTimeChange('endTime', 'date', e.target.value)}
                    className="w-full min-w-0 max-w-full pl-2 xs:pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
                  />
                </div>
                <div className="col-span-2 relative min-w-0">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden xs:block" />
                  <input
                    type="time"
                    value={getSplitDateTime(formData.endTime).time}
                    onChange={(e) => handleDateTimeChange('endTime', 'time', e.target.value)}
                    className="w-full min-w-0 max-w-full pl-2 xs:pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:col-span-2 min-w-0 max-w-full">
              <label className="flex items-center gap-2 cursor-pointer min-w-0 max-w-full">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded flex-shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 break-words min-w-0">Negative Marking</span>
              </label>
            </div>

            {formData.negativeMarking && (
              <div className="md:col-span-2 min-w-0 max-w-full">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Negative Marks Penalty
                </label>
                <input
                  type="number"
                  step="0.25"
                  name="negativeMarks"
                  value={formData.negativeMarks}
                  onChange={handleChange}
                  className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 box-border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/exams"
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 text-center"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExam;
