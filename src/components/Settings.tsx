import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Github, Linkedin, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  socials: {
    github: string;
    linkedin: string;
    website: string;
  };
}

interface SettingsProps {
  userId: string;
}

export function Settings({ userId }: SettingsProps) {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    socials: {
      github: '',
      linkedin: '',
      website: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', userId), {
        ...profile,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">User Profile</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Update your personal information to quickly populate new resumes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="John Doe"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="john@example.com"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Phone Number</span>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">GitHub URL</span>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="url"
                value={profile.socials.github || ''}
                onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, github: e.target.value } })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="https://github.com/username"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">LinkedIn URL</span>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="url"
                value={profile.socials.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, linkedin: e.target.value } })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Portfolio Website</span>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="url"
                value={profile.socials.website || ''}
                onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, website: e.target.value } })}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                placeholder="https://portfolio.com"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : saved ? (
            <CheckCircle2 size={18} />
          ) : (
            <Save size={18} />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
