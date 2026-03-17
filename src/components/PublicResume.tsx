import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ResumeData } from '../types';
import { ResumePreview } from './ResumePreview';
import { Loader2, AlertCircle, Home } from 'lucide-react';

interface PublicResumeProps {
  resumeId: string;
  onBack?: () => void;
}

export function PublicResume({ resumeId, onBack }: PublicResumeProps) {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResume() {
      try {
        const docRef = doc(db, 'resumes', resumeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const resumeData = docSnap.data() as ResumeData;
          // Check if public or if we're in a special context (like admin)
          // For now, we assume if you have the link and it's public, you can see it
          if (resumeData.isPublic) {
            setData(resumeData);
          } else {
            setError('This resume is private or does not exist.');
          }
        } else {
          setError('Resume not found.');
        }
      } catch (err) {
        console.error('Error fetching public resume:', err);
        setError('Failed to load resume. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-zinc-400" size={48} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Access Denied</h2>
            <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
            >
              <Home size={18} />
              Return Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="p-8 md:p-12">
            <ResumePreview data={data} />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm font-medium">
            Powered by <span className="text-zinc-900 dark:text-white font-black tracking-tighter">ELITE<span className="text-zinc-400">RESUME</span></span>
          </p>
        </div>
      </div>
    </div>
  );
}
