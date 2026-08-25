import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subjectAPI } from '../services/api';
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { formatDate } from '../utils/helpers';

const Subjects = () => {
  const { isAdmin } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectAPI.getAll();
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setToast({ type: 'error', message: 'Subject name and code are required' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        const res = await subjectAPI.update(editingSubject._id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Subject updated successfully' });
        }
      } else {
        const res = await subjectAPI.create(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Subject created successfully' });
        }
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save subject' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
      setDeleting(true);
      const res = await subjectAPI.delete(subjectToDelete._id);
      if (res.success) {
        setToast({ type: 'success', message: 'Subject deleted successfully' });
        setSubjectToDelete(null);
        fetchSubjects();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete subject' });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and manage department subjects, course codes, and curricula.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl sm:rounded-full shadow-md shadow-indigo-200 transition-colors w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Subject
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name or course code..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading subjects catalog..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center">
          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Subjects Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            No academic subjects match your criteria.
          </p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              Add First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((subject) => (
            <div
              key={subject._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col justify-between hover:border-slate-300 transition-all group min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg truncate">
                    {subject.code}
                  </span>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {formatDate(subject.createdAt, false)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors break-words">
                  {subject.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 break-words">
                  {subject.description || 'No description provided for this subject.'}
                </p>
              </div>

              {isAdmin && (
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(subject)}
                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setSubjectToDelete(subject)}
                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Computer Networks"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Code * (Unique)
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. CS401"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Brief course overview and curriculum topics..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 text-center"
            >
              {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Subject Modal */}
      <Modal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        title="Confirm Subject Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 break-words">
            Are you sure you want to delete <strong className="text-slate-900">{subjectToDelete?.name}</strong>?
            Note: A subject with linked examinations cannot be removed.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubjectToDelete(null)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 text-center"
            >
              {deleting ? 'Deleting...' : 'Delete Subject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subjects;
