import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { subjectAPI, examAPI } from '../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, Save, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const CreateExam = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    duration: 30,
    passingMarks: 10,
    negativeMarking: false,
    negativeMarks: 0.5,
    shuffleQuestions: true,
    shuffleOptions: false,
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getAll();
        if (res.success && res.data) {
          setSubjects(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, subjectId: res.data[0]._id }));
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load subjects');
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId || !formData.duration || formData.passingMarks === undefined) {
      setError('Please fill in all required fields.');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      setError('Exam Start Time must be strictly before End Time.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await examAPI.create(formData);
      if (res.success && res.data) {
        // Direct to question manager for this new exam
        navigate(`/exams/${res.data._id}/questions`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubjects) {
    return <LoadingSpinner fullScreen text="Loading exam builder..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Exams
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Examination
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure examination rules, timing, scoring parameters, and randomization settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4">
          <h3 className="text-base font-bold text-amber-900">No Subjects Available</h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            You must create at least one subject before creating an examination.
          </p>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl"
          >
            Manage Subjects
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              1. Basic Information
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
                  placeholder="e.g. Mid-Term Computer Science Assessment"
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
                  Duration (in Minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="300"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Description / Guidelines
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Instructions for students taking this exam..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Scoring Rules */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              2. Scoring Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="negativeMarking"
                    checked={formData.negativeMarking}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Enable Negative Marking for Wrong Answers
                  </span>
                </label>
              </div>

              {formData.negativeMarking && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Penalty per Wrong Answer (Marks)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    name="negativeMarks"
                    value={formData.negativeMarks}
                    onChange={handleChange}
                    min="0.1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Exam Schedule & Shuffling */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              3. Availability Window & Randomization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Window Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Window End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-2 md:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Randomize Question Order
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Generates a unique deterministic question order for each student attempt.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shuffleOptions"
                    checked={formData.shuffleOptions}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Randomize Multiple-Choice Options
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Shuffles option choices (A, B, C, D) for each question.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/exams"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {submitting ? (
                'Creating Exam...'
              ) : (
                <>
                  <span>Save Draft & Add Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateExam;
