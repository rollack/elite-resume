import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ResumeData } from '../types';
import { FileText, Trash2, ExternalLink, Loader2, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeWithId extends ResumeData {
  id: string;
}

export function AdminDashboard() {
  const [resumes, setResumes] = useState<ResumeWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchResumes() {
      try {
        const q = query(collection(db, 'resumes'), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as ResumeWithId[];
        setResumes(data);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteDoc(doc(db, 'resumes', id));
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Users size={24} />
            Admin Dashboard
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Manage all user resumes across the platform.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredResumes.map((resume) => (
            <motion.div
              key={resume.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                    {resume.personalInfo.fullName || 'Untitled User'}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate max-w-[180px]">
                    {resume.personalInfo.email || 'No email'}
                  </p>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <FileText size={20} className="text-zinc-500" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => window.open(`/resume/${resume.id}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <ExternalLink size={14} />
                  View
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredResumes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">No resumes found matching your search.</p>
        </div>
      )}
    </div>
  );
}
