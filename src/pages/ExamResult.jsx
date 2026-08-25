import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptAPI } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  BookOpen,
  LayoutDashboard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatSeconds, formatDate } from '../utils/helpers';

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await attemptAPI.getById(attemptId);
        if (res.success && res.data) {
          setResult(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load examination result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading examination evaluation..." />;
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Result</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Result record not found.'}</p>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const {
    exam,
    student,
    score,
    totalMarks,
    percentage,
    correctAnswers,
    wrongAnswers,
    unanswered,
    isPassed,
    timeTakenSeconds,
    status,
    submittedAt,
    answers = []
  } = result;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Top Banner Card */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white shadow-2xl relative overflow-hidden min-w-0 ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900'
            : 'bg-gradient-to-br from-rose-800 via-slate-900 to-indigo-950'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 min-w-0">
          <div className="text-center md:text-left space-y-2 min-w-0 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <span>{exam?.subjectId?.name || 'Subject Assessment'}</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight break-words">
              {exam?.title}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-md break-words">
              Candidate: <span className="font-bold text-white">{student?.name}</span> • Submitted on {formatDate(submittedAt)}
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full md:w-auto min-w-0 sm:min-w-[200px] text-center shadow-lg flex-shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              Overall Score
            </span>
            <div className="text-4xl sm:text-5xl font-black my-1.5 sm:my-2">
              {percentage}%
            </div>
            <span
              className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isPassed ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
              }`}
            >
              {isPassed ? 'PASSED' : 'FAILED'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
            Net Score
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">
            {score} / {totalMarks}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">Pass mark: {exam?.passingMarks}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block truncate">
            Correct Answers
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 block truncate">
            {correctAnswers}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">+{exam?.negativeMarking ? 'Full marks' : 'Points earned'}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider block truncate">
            Wrong Answers
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block truncate">
            {wrongAnswers}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">
            {exam?.negativeMarking ? `Penalty applied` : 'No penalties'}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
            Time Taken
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block truncate">
            {formatSeconds(timeTakenSeconds)}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">Allowed: {exam?.duration} mins</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => setShowReview(!showReview)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs w-full sm:w-auto"
        >
          <span>{showReview ? 'Hide Question Breakdown' : 'View Question Breakdown'}</span>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/results"
            className="px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs text-center flex-1 sm:flex-none"
          >
            All Results History
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md shadow-indigo-200 text-center flex-1 sm:flex-none"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Question-by-Question Solution Breakdown */}
      {showReview && (
        <div className="space-y-4 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-2 border-b border-slate-200 gap-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Detailed Question Analysis ({answers.length} Questions)
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Review answers & explanations
            </span>
          </div>

          {answers.map((ans, idx) => {
            const isUnanswered = !ans.selectedAnswer;
            const isCorrect = ans.isCorrect;

            let borderClass = 'border-slate-200 bg-white';
            let badgeText = 'Unanswered (0 Marks)';
            let badgeClass = 'bg-slate-100 text-slate-600';

            if (!isUnanswered) {
              if (isCorrect) {
                borderClass = 'border-emerald-200 bg-emerald-50/20';
                badgeText = `Correct (+${ans.marksObtained} Marks)`;
                badgeClass = 'bg-emerald-100 text-emerald-800';
              } else {
                borderClass = 'border-rose-200 bg-rose-50/20';
                badgeText = `Incorrect (${ans.marksObtained} Marks)`;
                badgeClass = 'bg-rose-100 text-rose-800';
              }
            }

            return (
              <div
                key={idx}
                className={`rounded-2xl border ${borderClass} p-4 sm:p-6 shadow-xs transition-all space-y-3 sm:space-y-4 min-w-0`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                      {ans.type === 'TRUE_FALSE' ? 'True / False' : 'Multiple Choice'}
                    </span>
                  </div>

                  <span className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed break-words">
                  {ans.questionText}
                </h4>

                {/* Option grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ans.options?.map((opt, optIdx) => {
                    const isSelected = String(opt).trim().toLowerCase() === String(ans.selectedAnswer || '').trim().toLowerCase();
                    const isCorrectAnswer = String(opt).trim().toLowerCase() === String(ans.correctAnswer || '').trim().toLowerCase();

                    let optionClass = 'bg-slate-50 border-slate-200 text-slate-700';

                    if (isCorrectAnswer) {
                      optionClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-rose-100 border-rose-400 text-rose-950 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 sm:p-3 rounded-xl border text-xs flex items-start justify-between gap-2 min-w-0 ${optionClass}`}
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-white/80 border flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="break-words min-w-0 flex-1">{opt}</span>
                        </div>

                        {isCorrectAnswer && (
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 flex items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 flex items-center gap-1 flex-shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {ans.explanation && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed break-words">
                    <strong className="font-bold text-indigo-950">Explanation: </strong>
                    {ans.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamResult;
