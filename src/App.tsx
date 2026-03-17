import React, { useState, useEffect, useCallback } from 'react';
import { Download, FileText, Sparkles, Github, Linkedin, Mail, Plus, LogIn, LogOut, User, Cloud, CloudOff, Loader2, Settings as SettingsIcon, LayoutDashboard, Share2, Globe, X, Check, AlertCircle } from 'lucide-react';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { ThemeToggle, Theme } from './components/ThemeToggle';
import { Settings } from './components/Settings';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicResume } from './components/PublicResume';
import { ResumeImporter } from './components/ResumeImporter';
import { ResumeData, initialData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/errorHandling';
import { generateResumeFromProfile } from './services/gemini';

type View = 'home' | 'settings' | 'admin' | 'public';

export default function App() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [view, setView] = useState<View>('home');
  const [publicResumeId, setPublicResumeId] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);

  const isAdmin = user && (user.email === 'james@buildwaveai.com' || user.email === 'reality150@gmail.com');

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load from Firestore on login
        try {
          const docRef = doc(db, 'resumes', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData(docSnap.data() as ResumeData);
          } else {
            // If no cloud data, use local or initial
            const saved = localStorage.getItem('resume-data');
            if (saved) setData(JSON.parse(saved));
          }

          // Check for profile data to sync
          const profileRef = doc(db, 'profiles', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setPendingProfileData(profileData);
            setShowSyncModal(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `resumes/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
        // Load from local storage on logout
        const saved = localStorage.getItem('resume-data');
        if (saved) setData(JSON.parse(saved));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL routing for public resumes
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/resume\/(.+)/);
    if (match) {
      setPublicResumeId(match[1]);
      setView('public');
    }
  }, []);

  const applyProfileSync = () => {
    if (!pendingProfileData) return;
    
    setData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        fullName: pendingProfileData.fullName || prev.personalInfo.fullName,
        email: pendingProfileData.email || prev.personalInfo.email,
        phone: pendingProfileData.phone || prev.personalInfo.phone,
        github: pendingProfileData.socials?.github || prev.personalInfo.github,
        linkedin: pendingProfileData.socials?.linkedin || prev.personalInfo.linkedin,
        website: pendingProfileData.socials?.website || prev.personalInfo.website,
      }
    }));
    setShowSyncModal(false);
    setPendingProfileData(null);
  };

  const handleFullSync = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        const generatedResume = await generateResumeFromProfile(profileData);
        if (generatedResume) {
          setData(generatedResume);
          setSyncStatus('synced');
        }
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Full sync error:', error);
    }
  };

  // Local Persistence
  useEffect(() => {
    if (!authLoading) {
      localStorage.setItem('resume-data', JSON.stringify(data));
    }
  }, [data, authLoading]);

  // Auto-save to Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const timeoutId = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await setDoc(doc(db, 'resumes', user.uid), {
          ...data,
          userId: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setSyncStatus('synced');
      } catch (error) {
        setSyncStatus('error');
        handleFirestoreError(error, OperationType.WRITE, `resumes/${user.uid}`);
      }
    }, 2000); // Debounce save

    return () => clearTimeout(timeoutId);
  }, [data, user, authLoading]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', t === 'dark');
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!user) {
      alert('Please sign in to share your resume.');
      return;
    }
    
    try {
      // Set public flag
      await setDoc(doc(db, 'resumes', user.uid), { isPublic: true }, { merge: true });
      setData(prev => ({ ...prev, isPublic: true }));
      
      const shareUrl = `${window.location.origin}/resume/${user.uid}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Public share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing resume:', error);
      alert('Failed to generate share link.');
    }
  };

  if (view === 'public' && publicResumeId) {
    return <PublicResume resumeId={publicResumeId} onBack={() => setView('home')} />;
  }

  const handleSaveToFile = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${data.personalInfo.fullName || 'untitled'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setData(json);
      } catch (error) {
        alert('Invalid resume file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <nav className="no-print sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">ELITE RESUME</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Professional Builder</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 mr-4">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === 'home' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setView('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === 'settings' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Settings
              </button>
              {isAdmin && (
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  Admin
                </button>
              )}
            </div>
            {/* Sync Status */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {syncStatus === 'syncing' && <Loader2 size={12} className="animate-spin text-zinc-400" />}
                {syncStatus === 'synced' && <Cloud size={12} className="text-emerald-500" />}
                {syncStatus === 'error' && <CloudOff size={12} className="text-red-500" />}
                <span className={syncStatus === 'error' ? 'text-red-500' : 'text-zinc-500'}>
                  {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'error' ? 'Sync Error' : 'Cloud Ready'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-4 mr-2">
              <button
                onClick={handleSaveToFile}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Save to Local Drive (.json)"
              >
                <Download size={20} />
              </button>
              <label className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer" title="Load from Local Drive (.json)">
                <Plus size={20} />
                <input type="file" accept=".json" onChange={handleLoadFromFile} className="hidden" />
              </label>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            
            {/* Share Button */}
            {user && view === 'home' && (
              <button
                onClick={handleShare}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Share Resume Link"
              >
                <Share2 size={20} />
              </button>
            )}
            
            {/* Auth Button */}
            {authLoading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-zinc-400" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[100px]">{user.displayName}</p>
                  <button onClick={logout} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Logout</button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <User size={20} />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <FileText size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-8 h-full"
            >
              {/* Editor Side */}
              <div className="no-print w-full lg:w-[450px] flex-shrink-0 h-[calc(100vh-140px)] flex flex-col gap-6">
                <ResumeImporter onImport={setData} />
                <div className="flex-1 overflow-hidden">
                  <ResumeEditor data={data} onChange={setData} onFullSync={handleFullSync} />
                </div>
              </div>

              {/* Preview Side */}
              <div className="flex-1 overflow-y-auto h-[calc(100vh-140px)] pb-12">
                <div className="flex items-center justify-between mb-6 no-print">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Live Preview</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <ResumePreview data={data} />
              </div>
            </motion.div>
          )}

          {view === 'settings' && user && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Settings userId={user.uid} />
            </motion.div>
          )}

          {view === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sync Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">Sync Profile?</h3>
                  <p className="text-sm text-zinc-500">We found profile information for your account.</p>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Fields to populate:</p>
                <div className="grid grid-cols-2 gap-2">
                  {pendingProfileData.fullName && <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><Check size={12} className="text-emerald-500" /> Name</div>}
                  {pendingProfileData.email && <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><Check size={12} className="text-emerald-500" /> Email</div>}
                  {pendingProfileData.phone && <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><Check size={12} className="text-emerald-500" /> Phone</div>}
                  {pendingProfileData.socials?.github && <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><Check size={12} className="text-emerald-500" /> GitHub</div>}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={applyProfileSync}
                  className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
                >
                  Use Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="no-print bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-zinc-400 text-sm font-medium">
            © 2026 EliteResume Builder. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Mail size={20} />
            </a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
