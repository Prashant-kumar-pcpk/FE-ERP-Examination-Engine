import React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

const QuestionCard = ({
  question,
  index,
  total,
  selectedAnswer,
  isMarkedForReview,
  onSelectOption,
  onToggleReview,
  onClearAnswer,
  onPrev,
  onNext,
  isSaving
}) => {
  if (!question) return null;

  const options = question.options || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Question Header */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider">
            Question {index + 1} of {total}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {question.type === 'TRUE_FALSE' ? 'True / False' : 'Multiple Choice'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            +{question.marks || 1} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          {question.negativeMarks > 0 && (
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
              -{question.negativeMarks} Neg
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-indigo-600 font-medium animate-pulse">
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 md:p-8 flex-1">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-relaxed mb-6">
          {question.text}
        </h2>

        {/* Options List */}
        <div className="space-y-3">
          {options.map((option, optIdx) => {
            const isSelected =
              String(selectedAnswer || '').trim().toLowerCase() ===
              String(option).trim().toLowerCase();

            const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

            return (
              <label
                key={optIdx}
                onClick={() => onSelectOption(option)}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-4 h-4" /> : optionLabel}
                </div>
                <span className="text-base font-medium flex-1 pt-0.5 leading-normal">
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleReview}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              isMarkedForReview
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>

          {selectedAnswer && (
            <button
              type="button"
              onClick={onClearAnswer}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            type="button"
            disabled={index === total - 1}
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
