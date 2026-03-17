import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ResumeData, Experience, Education, Project, Certification } from '../types';
import { suggestBulletPoints, generateSummary } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeEditor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [expanded, setExpanded] = useState<string>('personal');

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      bullets: [],
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter((exp) => exp.id !== id) });
  };

  const handleSuggestBullets = async (exp: Experience) => {
    if (!exp.position || !exp.company || !exp.description) return;
    setLoading({ ...loading, [exp.id]: true });
    try {
      const bullets = await suggestBulletPoints(exp.position, exp.company, exp.description);
      updateExperience(exp.id, { bullets: [...exp.bullets, ...bullets] });
    } finally {
      setLoading({ ...loading, [exp.id]: false });
    }
  };

  const handleGenerateSummary = async () => {
    if (!data.personalInfo.fullName || data.skills.length === 0) return;
    setLoading({ ...loading, summary: true });
    try {
      const summary = await generateSummary(
        data.personalInfo.fullName,
        data.experience[0]?.position || "Professional",
        data.skills
      );
      onChange({ ...data, summary });
    } finally {
      setLoading({ ...loading, summary: false });
    }
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((edu) => edu.id !== id) });
  };

  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) });
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
    };
    onChange({ ...data, certifications: [...data.certifications, newCert] });
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    onChange({
      ...data,
      certifications: data.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCertification = (id: string) => {
    onChange({ ...data, certifications: data.certifications.filter((c) => c.id !== id) });
  };

  const addLanguage = () => {
    onChange({ ...data, languages: [...data.languages, ""] });
  };

  const updateLanguage = (index: number, value: string) => {
    const newLangs = [...data.languages];
    newLangs[index] = value;
    onChange({ ...data, languages: newLangs });
  };

  const removeLanguage = (index: number) => {
    onChange({ ...data, languages: data.languages.filter((_, i) => i !== index) });
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button
      onClick={() => setExpanded(expanded === id ? '' : id)}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <span className="font-bold text-zinc-900 dark:text-white">{title}</span>
      </div>
      {expanded === id ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="flex-1 overflow-y-auto">
        {/* Personal Info */}
        <SectionHeader id="personal" title="Personal Information" icon={Plus} />
        <AnimatePresence>
          {expanded === 'personal' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={data.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">GitHub</label>
                  <input
                    type="text"
                    value={data.personalInfo.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                    placeholder="github.com/johndoe"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <SectionHeader id="summary" title="Professional Summary" icon={Sparkles} />
        <AnimatePresence>
          {expanded === 'summary' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Summary</label>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loading.summary}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50"
                  >
                    {loading.summary ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Generate
                  </button>
                </div>
                <textarea
                  value={data.summary}
                  onChange={(e) => onChange({ ...data, summary: e.target.value })}
                  className="w-full h-32 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all resize-none"
                  placeholder="Briefly describe your professional background and key strengths..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experience */}
        <SectionHeader id="experience" title="Work Experience" icon={Plus} />
        <AnimatePresence>
          {expanded === 'experience' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-8">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all disabled:opacity-50"
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-white"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">I currently work here</label>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description (for AI)</label>
                          <button
                            onClick={() => handleSuggestBullets(exp)}
                            disabled={loading[exp.id]}
                            className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50"
                          >
                            {loading[exp.id] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            AI Suggest Bullets
                          </button>
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                          className="w-full h-24 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all resize-none"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Bullet Points</label>
                        <div className="space-y-2">
                          {exp.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...exp.bullets];
                                  newBullets[idx] = e.target.value;
                                  updateExperience(exp.id, { bullets: newBullets });
                                }}
                                className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                              />
                              <button
                                onClick={() => {
                                  updateExperience(exp.id, { bullets: exp.bullets.filter((_, i) => i !== idx) });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ""] })}
                            className="w-full py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all font-medium text-sm"
                          >
                            + Add Bullet Point
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Experience
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills */}
        <SectionHeader id="skills" title="Skills" icon={Plus} />
        <AnimatePresence>
          {expanded === 'skills' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Skills (comma separated)</label>
                <textarea
                  value={data.skills.join(', ')}
                  onChange={(e) => onChange({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== "") })}
                  className="w-full h-24 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all resize-none"
                  placeholder="React, TypeScript, Node.js, Project Management..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Education */}
        <SectionHeader id="education" title="Education" icon={Plus} />
        <AnimatePresence>
          {expanded === 'education' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="relative p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">School</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Education
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects */}
        <SectionHeader id="projects" title="Projects" icon={Plus} />
        <AnimatePresence>
          {expanded === 'projects' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="relative p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                          className="w-full h-24 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Technologies (comma separated)</label>
                        <input
                          type="text"
                          value={proj.technologies.join(', ')}
                          onChange={(e) => updateProject(proj.id, { technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t !== "") })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addProject}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certifications */}
        <SectionHeader id="certifications" title="Certifications" icon={Plus} />
        <AnimatePresence>
          {expanded === 'certifications' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="relative p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => removeCertification(cert.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Issuer</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Date</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addCertification}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Certification
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Languages */}
        <SectionHeader id="languages" title="Languages" icon={Plus} />
        <AnimatePresence>
          {expanded === 'languages' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {data.languages.map((lang, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={lang}
                      onChange={(e) => updateLanguage(idx, e.target.value)}
                      className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-white outline-none transition-all"
                      placeholder="English (Fluent)"
                    />
                    <button
                      onClick={() => removeLanguage(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="w-full py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all font-medium text-sm"
                >
                  + Add Language
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
