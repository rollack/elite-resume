import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { ResumeData } from '../types';

interface PreviewProps {
  data: ResumeData;
}

export const ResumePreview: React.FC<PreviewProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="print-area bg-white shadow-2xl dark:shadow-zinc-900/50 min-h-[1056px] w-full max-w-[816px] mx-auto p-12 text-zinc-800 font-sans leading-relaxed transition-shadow duration-300">
      {/* Header - Centered for Impact */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-black tracking-tight text-zinc-900 uppercase mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-xl font-semibold text-zinc-600 uppercase tracking-[0.2em] mb-4">
            {personalInfo.title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-y-2 gap-x-6 text-sm font-medium text-zinc-500">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-zinc-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-zinc-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-zinc-400" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-zinc-400" />
              <span>{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin size={14} className="text-zinc-400" />
              <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1.5">
              <Github size={14} className="text-zinc-400" />
              <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-4 pb-1">
            Executive Summary
          </h2>
          <p className="text-[15px] text-zinc-700 leading-relaxed font-medium">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-6 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-bold text-zinc-900">{exp.position}</h3>
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">
                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-md font-bold text-zinc-600">{exp.company}</span>
                  <span className="text-xs text-zinc-400 font-medium italic">{exp.location}</span>
                </div>
                <ul className="list-disc list-outside ml-5 space-y-2">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-[14px] text-zinc-700 leading-snug">
                      {bullet.startsWith('- ') ? bullet.substring(2) : bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Expertise - Categorized feel */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-4 pb-1">
            Core Competencies
          </h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            {skills.map((skill, idx) => (
              <div key={idx} className="text-[13px] text-zinc-700 font-semibold flex items-center">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full mr-3" />
                {skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-6 pb-1">
            Education
          </h2>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-md font-bold text-zinc-900">{edu.degree}</h3>
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-zinc-600">{edu.school}</span>
                  <span className="text-xs text-zinc-400 font-medium italic">{edu.location}</span>
                </div>
                {edu.gpa && <p className="text-xs font-bold text-zinc-500 mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages - Side by Side */}
      <div className="grid grid-cols-2 gap-12">
        {certifications && certifications.length > 0 && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-4 pb-1">
              Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-[13px]">
                  <span className="font-bold text-zinc-800">{cert.name}</span>
                  <span className="text-zinc-500"> — {cert.issuer} ({cert.date})</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages && languages.length > 0 && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-4 pb-1">
              Languages
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {languages.map((lang, idx) => (
                <div key={idx} className="text-[13px] font-bold text-zinc-700">
                  {lang}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-900 border-b-2 border-zinc-900 mb-6 pb-1">
            Selected Projects
          </h2>
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-md font-bold text-zinc-900">{project.name}</h3>
                  {project.link && (
                    <span className="text-xs text-zinc-400 font-medium italic">{project.link}</span>
                  )}
                </div>
                <p className="text-[14px] text-zinc-700 mb-3 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded border border-zinc-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
