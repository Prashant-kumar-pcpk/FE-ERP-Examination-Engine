import React from 'react';
import { CheckCircle2, Bookmark, CircleDot, Send } from 'lucide-react';

const QuestionNavigator = ({
  questions = [],
  currentIndex,
  answers = {},
  reviews = {},
  onSelectQuestion,
  onSubmitClick
}) => {
  // Counts
  let answeredCount = 0;
  let reviewCount = 0;

  questions.forEach((q) => {
    const qId = q._id;
    if (answers[qId]) answeredCount++;
    if (reviews[qId]) reviewCount++;
  });

  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
          Question Navigator
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {answeredCount} / {questions.length} Answered
        </span>
      </div>

      {/* Question Number Grid */}
      <div className="grid grid-cols-5 gap-2.5 mb-6 overflow-y-auto max-h-64 p-1">
        {questions.map((q, idx) => {
          const qId = q._id;
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answers[qId]);
          const isReviewed = Boolean(reviews[qId]);

          // Status-specific classes
          let buttonClasses = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

          if (isAnswered && isReviewed) {
            buttonClasses = 'bg-purple-100 border-purple-400 text-purple-900 font-bold';
          } else if (isReviewed) {
            buttonClasses = 'bg-purple-600 text-white border-purple-700 font-bold shadow-xs';
          } else if (isAnswered) {
            buttonClasses = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs';
          }

          if (isCurrent) {
            buttonClasses += ' ring-2 ring-indigo-600 ring-offset-2 scale-105';
          }

          return (
            <button
              key={qId}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`relative h-10 w-full rounded-xl border flex items-center justify-center text-sm font-semibold transition-all duration-150 ${buttonClasses}`}
            >
              {idx + 1}
              {isReviewed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>Answered</span>
          </div>
          <span className="font-bold text-slate-800">{answeredCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-slate-200" />
            <span>Unanswered</span>
          </div>
          <span className="font-bold text-slate-800">{unansweredCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-purple-600" />
            <span>Marked for Review</span>
          </div>
          <span className="font-bold text-slate-800">{reviewCount}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={onSubmitClick}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default QuestionNavigator;
