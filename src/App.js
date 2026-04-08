import React, { useState } from 'react';
import Header from './components/Header';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import './App.css';

const DEFAULT_RESUME = {
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
};

export default function App() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [activeSection, setActiveSection] = useState('personal');
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'parsing' | 'done' | 'error'

  const updatePersonal = (field, value) => {
    setResume(r => ({ ...r, personal: { ...r.personal, [field]: value } }));
  };

  const addExperience = () => {
    setResume(r => ({
      ...r,
      experience: [...r.experience, {
        id: Date.now(),
        company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''],
      }],
    }));
  };

  const updateExperience = (id, field, value) => {
    setResume(r => ({
      ...r,
      experience: r.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeExperience = (id) => {
    setResume(r => ({ ...r, experience: r.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    setResume(r => ({
      ...r,
      education: [...r.education, {
        id: Date.now(),
        school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '',
      }],
    }));
  };

  const updateEducation = (id, field, value) => {
    setResume(r => ({
      ...r,
      education: r.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeEducation = (id) => {
    setResume(r => ({ ...r, education: r.education.filter(e => e.id !== id) }));
  };

  const addSkill = (skill) => {
    if (skill && !resume.skills.includes(skill)) {
      setResume(r => ({ ...r, skills: [...r.skills, skill] }));
    }
  };

  const removeSkill = (skill) => {
    setResume(r => ({ ...r, skills: r.skills.filter(s => s !== skill) }));
  };

  const handleUpload = async (file) => {
    setUploadStatus('parsing');
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }

      // Basic text parsing heuristics
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      const parsed = parseResumeText(lines, fullText);
      setResume(parsed);
      setUploadStatus('done');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  return (
    <div className="app">
      <Header uploadStatus={uploadStatus} onUpload={handleUpload} />
      <div className="workspace">
        <FormPanel
          resume={resume}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          updatePersonal={updatePersonal}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          addSkill={addSkill}
          removeSkill={removeSkill}
        />
        <PreviewPanel resume={resume} />
      </div>
    </div>
  );
}

function parseResumeText(lines, fullText) {
  const result = { ...DEFAULT_RESUME };

  // Try to find name (first substantial line)
  if (lines[0] && lines[0].length < 60) {
    result.personal = { ...result.personal, name: lines[0] };
  }

  // Email
  const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  if (emailMatch) result.personal.email = emailMatch[0];

  // Phone
  const phoneMatch = fullText.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) result.personal.phone = phoneMatch[0];

  // LinkedIn
  const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.personal.linkedin = 'https://' + linkedinMatch[0];

  // Website
  const websiteMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)*/i);
  if (websiteMatch && !websiteMatch[0].includes('@') && !websiteMatch[0].includes('linkedin')) {
    result.personal.website = websiteMatch[0];
  }

  // Skills — look for a skills section
  const skillsIdx = lines.findIndex(l => /^skills?$/i.test(l));
  if (skillsIdx !== -1) {
    const skillLine = lines.slice(skillsIdx + 1, skillsIdx + 5).join(' ');
    result.skills = skillLine.split(/[,|•·]/g).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40).slice(0, 15);
  }

  return result;
}
