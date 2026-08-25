import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionAPI, examAPI } from '../services/api';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  HelpCircle,
  Send,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const QuestionManager = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State for Add / Edit Question
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Question Form State
  const [formData, setFormData] = useState({
    text: '',
    type: 'MCQ',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 2,
    negativeMarks: 0,
    explanation: ''
  });

  const [questionToDelete, setQuestionToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examRes, questionsRes] = await Promise.all([
        examAPI.getById(examId),
        questionAPI.getByExam(examId)
      ]);

      if (examRes.success) {
        setExam(examRes.data);
      }
      if (questionsRes.success) {
        setQuestions(questionsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      type: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 2,
      negativeMarks: exam?.negativeMarking ? exam.negativeMarks : 0,
      explanation: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      text: q.text,
      type: q.type,
      options: q.type === 'TRUE_FALSE' ? ['True', 'False'] : [...q.options],
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      negativeMarks: q.negativeMarks || 0,
      explanation: q.explanation || ''
    });
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...formData.options];
    updated[idx] = value;
    setFormData((prev) => ({
      ...prev,
      options: updated,
      // If the edited option was previously selected as correct answer, keep track
      correctAnswer: prev.correctAnswer === formData.options[idx] ? value : prev.correctAnswer
    }));
  };

  const addOptionField = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOptionField = (idx) => {
    if (formData.options.length > 2) {
      const optionToRemove = formData.options[idx];
      const updated = formData.options.filter((_, i) => i !== idx);
      setFormData((prev) => ({
        ...prev,
        options: updated,
        correctAnswer: prev.correctAnswer === optionToRemove ? '' : prev.correctAnswer
      }));
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setToast({ type: 'error', message: 'Question text is required' });
      return;
    }

    if (!formData.correctAnswer) {
      setToast({ type: 'error', message: 'Please select a correct answer' });
      return;
    }

    if (formData.type === 'MCQ') {
      const validOptions = formData.options.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setToast({ type: 'error', message: 'At least 2 non-empty options are required' });
        return;
      }
    }

    try {
      setSavingQuestion(true);
      if (editingQuestion) {
        // Update
        const res = await questionAPI.update(editingQuestion._id, {
          ...formData,
          options: formData.type === 'TRUE_FALSE' ? ['True', 'False'] : formData.options
        });
        if (res.success) {
          setToast({ type: 'success', message: 'Question updated successfully' });
        }
      } else {
        // Create
        const res = await questionAPI.create({
          examId,
          ...formData,
          options: formData.type === 'TRUE_FALSE' ? ['True', 'False'] : formData.options
        });
        if (res.success) {
          setToast({ type: 'success', message: 'Question added successfully' });
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save question' });
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      const res = await questionAPI.delete(questionToDelete._id);
      if (res.success) {
        setToast({ type: 'success', message: 'Question deleted' });
        setQuestionToDelete(null);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete question' });
    }
  };

  const handlePublish = async () => {
    try {
      const res = await examAPI.publish(examId);
      if (res.success) {
        setToast({ type: 'success', message: 'Exam published and active!' });
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to publish exam' });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading question editor..." />;
  }

  const computedTotalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 w-full min-w-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Exams
        </Link>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg truncate max-w-full">
              {exam?.subjectId?.name} ({exam?.subjectId?.code})
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
              Status: {exam?.status}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            {exam?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 mt-2">
            <span>Questions: {questions.length}</span>
            <span>•</span>
            <span>Total Marks: {computedTotalMarks}</span>
            <span>•</span>
            <span>Passing Marks: {exam?.passingMarks}</span>
            <span>•</span>
            <span>Duration: {exam?.duration} mins</span>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex-1 md:flex-none"
          >
            <PlusCircle className="w-4 h-4" />
            Add Question
          </button>

          {exam?.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              disabled={questions.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 transition-all disabled:opacity-50 flex-1 md:flex-none"
            >
              <Send className="w-4 h-4" />
              Publish Exam
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Questions Added Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            Add multiple-choice or true/false questions to configure this exam.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 hover:border-slate-300 transition-all min-w-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-50 text-indigo-600 font-bold rounded-lg flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {q.type === 'TRUE_FALSE' ? 'True / False' : 'Multiple Choice'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    +{q.marks} Marks
                  </span>
                  {q.negativeMarks > 0 && (
                    <span className="text-[11px] sm:text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      -{q.negativeMarks} Neg
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    aria-label="Edit question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestionToDelete(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4 break-words leading-relaxed">
                {q.text}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {q.options?.map((opt, optIdx) => {
                  const isCorrect =
                    String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 min-w-0 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="break-words min-w-0">{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 flex-shrink-0 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 break-words leading-relaxed">
                  <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: 'MCQ',
                    options: ['', '', '', ''],
                    correctAnswer: ''
                  }));
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all truncate ${
                  formData.type === 'MCQ'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Multiple Choice (MCQ)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: 'TRUE_FALSE',
                    options: ['True', 'False'],
                    correctAnswer: 'True'
                  }));
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all truncate ${
                  formData.type === 'TRUE_FALSE'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                True / False
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Statement *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
              rows="3"
              placeholder="Type your question here..."
              required
              className="w-full px-3.5 py-2.5 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Options input */}
          {formData.type === 'MCQ' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Options & Correct Answer *
                </label>
                {formData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 min-w-0">
                    {/* Radio to mark correct */}
                    <input
                      type="radio"
                      name="correctAnswerOption"
                      checked={formData.correctAnswer === opt && opt.trim() !== ''}
                      onChange={() => setFormData((prev) => ({ ...prev, correctAnswer: opt }))}
                      disabled={!opt.trim()}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                      title="Select as Correct Answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      required
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Click the circular radio button next to an option to mark it as the correct answer.
              </p>
            </div>
          )}

          {formData.type === 'TRUE_FALSE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correct Answer *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['True', 'False'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, correctAnswer: val }))}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      formData.correctAnswer === val
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Question Marks *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.marks}
                onChange={(e) => setFormData((prev) => ({ ...prev, marks: Number(e.target.value) }))}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Negative Marks (Penalty)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.negativeMarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, negativeMarks: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Explanation (Shown to students after submission)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
              rows="2"
              placeholder="Why is this the correct answer..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingQuestion}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 text-center"
            >
              {savingQuestion ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Delete Question"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 break-words">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuestionToDelete(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteQuestion}
              className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-center"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionManager;
