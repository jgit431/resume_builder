import React, { useState } from 'react';
import Header from './components/Header';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import { parseResume } from './ai';
import './App.css';

const DEFAULT_RESUME = {
  personal: {
    name: 'John Smith',
    title: 'Senior Software Engineer',
    email: 'john.smith@email.com',
    phone: '+1 (555) 867-5309',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/johnsmith',
    website: 'johnsmith.dev',
    summary: 'Versatile Software Engineer with 8+ years of experience building scalable web applications and leading small engineering teams. Passionate about clean architecture, developer tooling, and shipping products that users love.',
  },
  experience: [
    {
      id: 1,
      company: 'Orion Systems LLC',
      role: 'Senior Software Engineer',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      bullets: [
        'Architected a distributed event-processing pipeline handling 12M+ daily transactions, reducing average latency by 41%.',
        'Led a team of 5 engineers to migrate a monolithic Rails application to a microservices architecture, cutting deployment time from 45 minutes to under 4.',
        'Introduced automated integration testing coverage from 23% to 91%, reducing production incidents by over half year-over-year.',
      ],
    },
    {
      id: 2,
      company: 'Vantage Loop Co.',
      role: 'Software Engineer',
      startDate: 'May 2019',
      endDate: 'Dec 2021',
      current: false,
      bullets: [
        'Built and maintained a customer-facing dashboard used by 30,000+ monthly active users, improving page load speed by 60% via code-splitting and lazy loading.',
        'Designed a RESTful API consumed by 3 internal teams and 2 third-party partners, with full OpenAPI documentation and versioning.',
        'Mentored 2 junior engineers through weekly code reviews and pair programming sessions.',
      ],
    },
    {
      id: 3,
      company: 'Trellford Group',
      role: 'Junior Developer',
      startDate: 'Jul 2017',
      endDate: 'Apr 2019',
      current: false,
      bullets: [
        'Developed reusable React component library adopted across 4 internal projects, reducing UI development time by an estimated 30%.',
        'Resolved 120+ bug tickets over 18 months, consistently meeting SLA targets for critical issues.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      school: 'Westfield State University',
      degree: 'M.S.',
      field: 'Computer Science',
      startDate: '2015',
      endDate: '2017',
      gpa: '3.8',
    },
    {
      id: 2,
      school: 'Crestview College',
      degree: 'B.S.',
      field: 'Software Engineering',
      startDate: '2011',
      endDate: '2015',
      gpa: '3.6',
    },
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'REST APIs',
    'CI/CD', 'System Design',
  ],
};

const DEFAULT_STYLES = {
  personal: {
    headerAlign: 'left',  // 'left' | 'center' | 'right'
    showIcons: true,
  },
  experience: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    bulletSpacing: 3,
  },
  education: {
    fontFamily: 'DM Sans',
    fontSize: 13,
  },
  skills: {
    separator: 'comma',
  },
};

const DEFAULT_PAGE_SETTINGS = {
  marginTop: 1.0,
  marginBottom: 1.0,
  marginLeft: 1.0,
  marginRight: 1.0,
  lineHeight: 1.6,
  colorAccents: true,
};

export default function App() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [sectionStyles, setSectionStyles] = useState(DEFAULT_STYLES);
  const [pageSettings, setPageSettings] = useState(DEFAULT_PAGE_SETTINGS);
  const [activeSection, setActiveSection] = useState('personal');
  const [uploadStatus, setUploadStatus] = useState(null);
  const updateSectionStyle = (section, field, value) => {
    setSectionStyles(s => ({
      ...s,
      [section]: { ...s[section], [field]: value },
    }));
  };

  const updatePageSetting = (field, value) => {
    setPageSettings(s => ({ ...s, [field]: value }));
  };

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

      const parsed = await parseResume({ text: fullText });

      // Ensure IDs are present on all entries
      const withIds = {
        ...parsed,
        experience: (parsed.experience || []).map((e, i) => ({ ...e, id: e.id || Date.now() + i })),
        education:  (parsed.education  || []).map((e, i) => ({ ...e, id: e.id || Date.now() + i + 100 })),
      };

      setResume(withIds);
      setUploadStatus('done');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('PDF import error:', err);
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
          sectionStyles={sectionStyles}
          updateSectionStyle={updateSectionStyle}
          pageSettings={pageSettings}
          updatePageSetting={updatePageSetting}
        />
        <PreviewPanel resume={resume} sectionStyles={sectionStyles} pageSettings={pageSettings} />
      </div>
    </div>
  );
}


