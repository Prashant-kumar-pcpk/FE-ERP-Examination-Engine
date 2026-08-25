import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-indigo-600`} />
      {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700">{text}</p>
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
