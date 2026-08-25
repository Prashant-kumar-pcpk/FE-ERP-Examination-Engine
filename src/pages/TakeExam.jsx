import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptAPI } from '../services/api';
import {
  GraduationCap,
  AlertTriangle,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import QuestionNavigator from '../components/QuestionNavigator';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Exam Data
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Engine State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: 'Option Text' }
  const [reviews, setReviews] = useState({}); // { [questionId]: true/false }
  const [isSaving, setIsSaving] = useState(false);

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize Exam Attempt
  useEffect(() => {
    const initAttempt = async () => {
      try {
        setLoading(true);
        const res = await attemptAPI.start(examId);

        if (res.success && res.data) {
          const { exam: examData, questions: qList, attempt: attData, remainingSeconds: seconds } = res.data;

          if (res.isCompleted) {
            // Already expired and auto-submitted
            navigate(`/exam-result/${res.data.attemptId}`, { replace: true });
            return;
          }

          setExam(examData);
          setQuestions(qList);
          setAttempt(attData);
          setRemainingSeconds(seconds);

          // Populate existing answers if resuming
          const initialAns = {};
          const initialRev = {};
          if (attData.answers && Array.isArray(attData.answers)) {
            attData.answers.forEach((ans) => {
              if (ans.selectedAnswer) {
                initialAns[ans.questionId] = ans.selectedAnswer;
              }
              if (ans.markedForReview) {
                initialRev[ans.questionId] = true;
              }
            });
          }
          setAnswers(initialAns);
          setReviews(initialRev);
        }
      } catch (err) {
        setError(err.message || 'Failed to start examination attempt.');
      } finally {
        setLoading(false);
      }
    };

    initAttempt();
  }, [examId, navigate]);

  // Real-time server auto-save
  const persistAnswerToServer = async (qId, selectedVal, isReview) => {
    if (!attempt?._id) return;
    try {
      setIsSaving(true);
      const res = await attemptAPI.saveAnswer(attempt._id, {
        questionId: qId,
        selectedAnswer: selectedVal,
        markedForReview: isReview
      });

      if (res.isExpired) {
        setToast({
          type: 'error',
          message: 'Exam time expired! Auto-submitting...'
        });
        navigate(`/exam-result/${attempt._id}`, { replace: true });
      }
    } catch (err) {
      console.error('[AutoSave Error]:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle student selecting an option
  const handleSelectOption = (optionText) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ._id;

    const newAnswers = { ...answers, [qId]: optionText };
    setAnswers(newAnswers);

    persistAnswerToServer(qId, optionText, Boolean(reviews[qId]));
  };

  // Toggle mark for review
  const handleToggleReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ._id;

    const newReviewState = !reviews[qId];
    const newReviews = { ...reviews, [qId]: newReviewState };
    setReviews(newReviews);

    persistAnswerToServer(qId, answers[qId] || '', newReviewState);
  };

  // Clear answer choice for current question
  const handleClearAnswer = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ._id;

    const newAnswers = { ...answers };
    delete newAnswers[qId];
    setAnswers(newAnswers);

    persistAnswerToServer(qId, '', Boolean(reviews[qId]));
  };

  // Timer Expiration Callback
  const handleTimerExpired = useCallback(async () => {
    if (!attempt?._id || submitting) return;
    try {
      setSubmitting(true);
      setToast({
        type: 'error',
        message: 'Time is up! Your answers are being submitted and evaluated.'
      });
      const res = await attemptAPI.autoSubmit(attempt._id);
      if (res.success) {
        navigate(`/exam-result/${attempt._id}`, { replace: true });
      }
    } catch (err) {
      navigate(`/exam-result/${attempt._id}`, { replace: true });
    }
  }, [attempt, submitting, navigate]);

  // Manual Submission Confirmation
  const handleFinalSubmit = async () => {
    if (!attempt?._id) return;
    try {
      setSubmitting(true);
      const res = await attemptAPI.submit(attempt._id);
      if (res.success) {
        setIsSubmitModalOpen(false);
        navigate(`/exam-result/${attempt._id}`, { replace: true });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to submit exam' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Preparing examination environment..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Start Exam</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/exams')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviews).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col w-full overflow-x-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Exam Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 min-h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">
                {exam?.title}
              </h1>
              <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider block truncate">
                {exam?.subject?.name || 'General Assessment'}
              </span>
            </div>
          </div>

          {/* Real-time Synced Countdown Timer */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Timer initialSeconds={remainingSeconds} onExpire={handleTimerExpired} />
          </div>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {/* Left / Center 2 Columns: Question Card */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              selectedAnswer={answers[currentQuestion?._id]}
              isMarkedForReview={Boolean(reviews[currentQuestion?._id])}
              onSelectOption={handleSelectOption}
              onToggleReview={handleToggleReview}
              onClearAnswer={handleClearAnswer}
              onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              isSaving={isSaving}
            />

            {/* Quick Helper Notes */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
              <span>Answers are automatically saved securely to the server in real-time.</span>
            </div>
          </div>

          {/* Right Column: Question Navigator */}
          <div className="lg:col-span-1 min-w-0">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              reviews={reviews}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
              onSubmitClick={() => setIsSubmitModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => !submitting && setIsSubmitModalOpen(false)}
        title="Confirm Exam Submission"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 break-words">
            Are you sure you want to finalize and submit your examination? Once submitted, answers cannot be modified and your result will be evaluated immediately.
          </p>

          {/* Summary matrix */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="p-1 sm:p-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 block truncate">Answered</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="p-1 sm:p-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 block truncate">Unanswered</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-700">{unansweredCount}</span>
            </div>
            <div className="p-1 sm:p-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 block truncate">For Review</span>
              <span className="text-lg sm:text-xl font-extrabold text-purple-600">{reviewCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>You have {unansweredCount} unanswered questions remaining.</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Resume Test
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TakeExam;
