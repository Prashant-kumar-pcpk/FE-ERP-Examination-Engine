/**
 * Helper utility functions for the Exam Engine frontend
 */

/**
 * Format total seconds into MM:SS or HH:MM:SS format
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatSeconds = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Format date strings to user-friendly local representations
 * @param {string|Date} dateInput
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatDate = (dateInput, includeTime = true) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };

  return date.toLocaleDateString(undefined, options);
};

/**
 * Return appropriate Tailwind badge styling for exam or attempt statuses
 * @param {string} status
 * @returns {string}
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'SUBMITTED':
    case 'PASS':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'DRAFT':
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'COMPLETED':
    case 'AUTO_SUBMITTED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ARCHIVED':
    case 'FAIL':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Debounce helper function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
