import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import Dashboard from './components/Dashboard';
import ProjectHome from './components/ProjectHome';
import CompareView from './components/CompareView';
import TemplatePage from './components/TemplatePage';
import CoverLetterTemplatePage from './components/CoverLetterTemplatePage';
import CoverLetterBuilder from './components/CoverLetterBuilder';
import { TEMPLATES } from './data/templates';
import { DEFAULT_STYLES, DEFAULT_PAGE_SETTINGS, buildStylesFromTemplate } from './data/defaults';
import { COVER_LETTER_TEMPLATES, getCoverLetterTemplate } from './data/coverLetterTemplates';
import {
  loadProjects, persistProjects,
  makeProject, makeResumeSlot, makeCoverLetterSlot,
  upsertProject, removeProject,
  countTotals, MAX_RESUMES,
  uniqueProjectName, generateId,
} from './data/projectStore';
import { parseResume } from './ai';
import './App.css';

const DEFAULT_RESUME = {
  personal: {
    name: 'John Smith', title: 'Senior Software Engineer',
    email: 'john.smith@email.com', phone: '+1 (555) 867-5309',
    location: 'Austin, TX', linkedin: 'linkedin.com/in/johnsmith',
    website: 'johnsmith.dev', photo: null,
    summary: 'Versatile Software Engineer with 8+ years of experience building scalable web applications.',
  },
  experience: [
    { id: 1, company: 'Orion Systems LLC', role: 'Senior Software Engineer', startDate: 'Jan 2022', endDate: '', current: true,
      bullets: ['Architected a distributed event-processing pipeline handling 12M+ daily transactions.'] },
    { id: 2, company: 'Vantage Loop Co.', role: 'Software Engineer', startDate: 'May 2019', endDate: 'Dec 2021', current: false,
      bullets: ['Built and maintained a customer-facing dashboard used by 30,000+ monthly active users.'] },
  ],
  education: [
    { id: 1, school: 'Westfield State University', degree: 'M.S.', field: 'Computer Science', startDate: '2015', endDate: '2017', gpa: '3.8' },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
};

const EMPTY_RESUME = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: null, summary: '' },
  experience: [], education: [], skills: [],
};

export default function App() {
  // ── Project state ─────────────────────────────────────
  const [projects,        setProjects]        = useState(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeCoverId,   setActiveCoverId]   = useState(null); // active cover letter id

  // ── View routing ──────────────────────────────────────
  // views: 'dashboard' | 'project-home' | 'template-select' | 'builder'
  //        'compare' | 'cl-template-select' | 'cl-builder'
  const [view,          setView]          = useState('dashboard');
  const [compareMode,   setCompareMode]   = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);

  // ── Working resume state ──────────────────────────────
  const [resume,               setResume]               = useState(EMPTY_RESUME);
  const [sectionStyles,        setSectionStyles]        = useState(DEFAULT_STYLES);
  const [pageSettings,         setPageSettings]         = useState(DEFAULT_PAGE_SETTINGS);
  const [templateFeatures,     setTemplateFeatures]     = useState({ photo: false, photoPosition: false });
  const [templateDefaultStyles,setTemplateDefaultStyles]= useState(DEFAULT_STYLES);
  const [activeSection,        setActiveSection]        = useState('personal');
  const [uploadStatus,         setUploadStatus]         = useState(null);
  const [currentTemplateName,  setCurrentTemplateName]  = useState('Classic');
  const [currentTemplateId,    setCurrentTemplateId]    = useState('classic');

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const activeCoverLetter = activeProject?.coverLetters?.find(cl => cl.id === activeCoverId) ?? null;

  // ── Persist to localStorage ───────────────────────────
  useEffect(() => { persistProjects(projects); }, [projects]);

  // ── Auto-save resume editor state → active project ───
  useEffect(() => {
    if (!activeProjectId) return;
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj || !proj.resume) return prev;

      const shouldAutoRename =
        (proj.name === 'New Resume' || proj.name === 'New Project' || proj.name === 'Imported Resume') &&
        resume.personal.name;
      const autoName = shouldAutoRename
        ? uniqueProjectName(
            prev.filter(p => p.id !== activeProjectId),
            `${resume.personal.name.split(' ')[0]}'s Application`
          )
        : proj.name;

      return upsertProject(prev, {
        ...proj,
        name: autoName,
        resume: {
          ...proj.resume,
          templateId: currentTemplateId,
          templateName: currentTemplateName,
          sectionStyles,
          pageSettings,
          data: resume,
        },
      });
    });
  }, [resume, sectionStyles, pageSettings, currentTemplateName, currentTemplateId, activeProjectId]);

  // ── Helpers ───────────────────────────────────────────
  const applyTemplate = useCallback((template) => {
    const merged = buildStylesFromTemplate(template);
    setSectionStyles(merged);
    setPageSettings(template.pageSettings);
    setTemplateFeatures(template.features ?? { photo: false, photoPosition: false });
    setTemplateDefaultStyles({ ...DEFAULT_STYLES, ...merged });
    setCurrentTemplateName(template.name);
    setCurrentTemplateId(template.id);
  }, []);

  const loadProjectIntoEditor = useCallback((project) => {
    if (project.resume) {
      setResume(project.resume.data ?? EMPTY_RESUME);
      setSectionStyles(project.resume.sectionStyles ?? DEFAULT_STYLES);
      setPageSettings(project.resume.pageSettings   ?? DEFAULT_PAGE_SETTINGS);
      setCurrentTemplateName(project.resume.templateName ?? 'Classic');
      setCurrentTemplateId(project.resume.templateId     ?? 'classic');
      const tmpl = TEMPLATES.find(t => t.id === (project.resume.templateId ?? 'classic'));
      if (tmpl) {
        setTemplateFeatures(tmpl.features ?? { photo: false, photoPosition: false });
        setTemplateDefaultStyles(buildStylesFromTemplate(tmpl));
      }
    } else {
      setResume(EMPTY_RESUME);
      setSectionStyles(DEFAULT_STYLES);
      setPageSettings(DEFAULT_PAGE_SETTINGS);
      setCurrentTemplateName('Classic');
      setCurrentTemplateId('classic');
      setTemplateFeatures({ photo: false, photoPosition: false });
      setTemplateDefaultStyles(DEFAULT_STYLES);
    }
  }, []);

  // ── Dashboard handlers ────────────────────────────────
  const handleOpenProject = useCallback((project) => {
    setActiveProjectId(project.id);
    loadProjectIntoEditor(project);
    setView('project-home');
  }, [loadProjectIntoEditor]);

  const handleDeleteProject = useCallback((id) => {
    setProjects(prev => removeProject(prev, id));
    if (activeProjectId === id) { setActiveProjectId(null); setView('dashboard'); }
  }, [activeProjectId]);

  const handleNewResume = useCallback(() => {
    const { resumes } = countTotals(projects);
    if (resumes >= MAX_RESUMES) return;
    const proj = makeProject({ type: 'resume', name: uniqueProjectName(projects, 'New Resume') });
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setResume(EMPTY_RESUME);
    setSectionStyles(DEFAULT_STYLES);
    setPageSettings(DEFAULT_PAGE_SETTINGS);
    setCurrentTemplateName('Classic');
    setCurrentTemplateId('classic');
    setCompareMode(false);
    setView('template-select');
  }, [projects]);

  const handleNewCoverLetter = useCallback(() => {
    if (!activeProjectId) return;
    setView('cl-template-select');
  }, [activeProjectId]);

  const handleNewFull = useCallback(() => {
    handleNewResume();
  }, [handleNewResume]);

  // ── Cover letter flow ─────────────────────────────────
  const handleSelectCLTemplate = useCallback((clTemplate) => {
    if (!activeProjectId) return;
    const proj = projects.find(p => p.id === activeProjectId);
    if (!proj) return;

    // Determine if linked to resume
    const linkedToResume = !!proj.resume;
    const cl = makeCoverLetterSlot({
      templateId:    clTemplate.id,
      templateName:  clTemplate.name,
      linkedToResume,
    });
    cl.sectionStyles = clTemplate.styles;
    cl.pageSettings  = clTemplate.pageSettings;

    setProjects(prev => {
      const p = prev.find(x => x.id === activeProjectId);
      if (!p) return prev;
      return upsertProject(prev, { ...p, coverLetters: [...p.coverLetters, cl] });
    });
    setActiveCoverId(cl.id);
    setView('cl-builder');
  }, [activeProjectId, projects]);

  const handleUpdateCoverLetter = useCallback((updated) => {
    if (!activeProjectId) return;
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      const cls = proj.coverLetters.map(cl => cl.id === updated.id ? updated : cl);
      return upsertProject(prev, { ...proj, coverLetters: cls });
    });
  }, [activeProjectId]);

  const handleEditCoverLetter = useCallback((clId) => {
    setActiveCoverId(clId);
    setView('cl-builder');
  }, []);

  const handleCLDownload = useCallback(async () => {
    // PDF download for cover letter — uses html2canvas + jsPDF on the preview element
    try {
      const el = document.querySelector('.cl-page-sheet');
      if (!el) return;
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 8.5, 11);
      const name = activeProject?.resume?.data?.personal?.name
                || activeCoverLetter?.standaloneInfo?.name
                || 'cover_letter';
      pdf.save(`${name}_cover_letter.pdf`);
    } catch (err) {
      console.error('CL PDF export failed:', err);
    }
  }, [activeProject, activeCoverLetter]);

  // ── Resume template select handlers ──────────────────
  const handleSelectTemplate = useCallback((template) => {
    if (compareMode) {
      setCompareMode(false);
      setCompareTarget({
        template,
        styles:       buildStylesFromTemplate(template),
        pageSettings: template.pageSettings,
      });
      setView('compare');
      return;
    }
    applyTemplate(template);
    const merged = buildStylesFromTemplate(template);
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      const updatedSlot = proj.resume
        ? { ...proj.resume, templateId: template.id, templateName: template.name, sectionStyles: merged, pageSettings: template.pageSettings }
        : { ...makeResumeSlot({ templateId: template.id, templateName: template.name, sectionStyles: merged, pageSettings: template.pageSettings }), data: resume };
      return upsertProject(prev, { ...proj, resume: updatedSlot });
    });
    setView('builder');
  }, [compareMode, applyTemplate, activeProjectId, resume]);

  const handleBackFromTemplateSelect = useCallback(() => {
    if (compareMode) { setCompareMode(false); setView('builder'); return; }
    const proj = projects.find(p => p.id === activeProjectId);
    if (proj && !proj.resume) {
      setProjects(prev => removeProject(prev, activeProjectId));
      setActiveProjectId(null);
      setView('dashboard');
    } else {
      setView(proj ? 'project-home' : 'dashboard');
    }
  }, [compareMode, projects, activeProjectId]);

  // ── Compare handlers ──────────────────────────────────
  const handleOpenCompare    = useCallback(() => { setCompareMode(true); setView('template-select'); }, []);
  const handleKeepCurrent    = useCallback(() => { setCompareTarget(null); setView('builder'); }, []);
  const handleSwitchTemplate = useCallback(() => {
    if (compareTarget) applyTemplate(compareTarget.template);
    setCompareTarget(null);
    setView('builder');
  }, [compareTarget, applyTemplate]);

  // ── Project home handlers ─────────────────────────────
  const handleUpdateProjectName = useCallback((name) => {
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      return upsertProject(prev, { ...proj, name });
    });
  }, [activeProjectId]);

  const handleEditResume = useCallback(() => {
    const proj = projects.find(p => p.id === activeProjectId);
    if (!proj) return;
    setView(proj.resume ? 'builder' : 'template-select');
  }, [projects, activeProjectId]);

  const handleDeleteResume = useCallback(() => {
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      return upsertProject(prev, { ...proj, resume: null });
    });
  }, [activeProjectId]);

  // ── PDF import ────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    setUploadStatus('parsing');
    const proj = makeProject({ type: 'resume', name: uniqueProjectName(projects, 'Imported Resume') });
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setResume(EMPTY_RESUME);
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      const parsed = await parseResume({ text: fullText });
      const withIds = {
        ...parsed,
        experience: (parsed.experience || []).map((e, i) => ({ ...e, id: e.id || Date.now() + i })),
        education:  (parsed.education  || []).map((e, i) => ({ ...e, id: e.id || Date.now() + i + 100 })),
      };
      setResume(withIds);
      setUploadStatus('done');
      setView('template-select');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('PDF import error:', err);
      setProjects(prev => removeProject(prev, proj.id));
      setActiveProjectId(null);
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  }, [projects]);

  // ── Resume mutation handlers ──────────────────────────
  const updatePersonal     = (f,v) => setResume(r => ({ ...r, personal: { ...r.personal, [f]: v } }));
  const addExperience      = ()    => setResume(r => ({ ...r, experience: [...r.experience, { id: Date.now(), company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }] }));
  const updateExperience   = (id,f,v) => setResume(r => ({ ...r, experience: r.experience.map(e => e.id===id ? {...e,[f]:v} : e) }));
  const removeExperience   = (id)  => setResume(r => ({ ...r, experience: r.experience.filter(e => e.id !== id) }));
  const addEducation       = ()    => setResume(r => ({ ...r, education: [...r.education, { id: Date.now(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }] }));
  const updateEducation    = (id,f,v) => setResume(r => ({ ...r, education: r.education.map(e => e.id===id ? {...e,[f]:v} : e) }));
  const removeEducation    = (id)  => setResume(r => ({ ...r, education: r.education.filter(e => e.id !== id) }));
  const addSkill           = (s)   => { if (s && !resume.skills.includes(s)) setResume(r => ({ ...r, skills: [...r.skills, s] })); };
  const removeSkill        = (s)   => setResume(r => ({ ...r, skills: r.skills.filter(k => k !== s) }));
  const updateSectionStyle = (sec,field,val) => setSectionStyles(s => ({ ...s, [sec]: { ...s[sec], [field]: val } }));
  const updatePageSetting  = (field,val)     => setPageSettings(s => ({ ...s, [field]: val }));

  // ── View routing ──────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <Dashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        onNewResume={handleNewResume}
        onNewCoverLetter={handleNewCoverLetter}
        onNewFull={handleNewFull}
        onImport={handleUpload}
        uploadStatus={uploadStatus}
      />
    );
  }

  if (view === 'project-home' && activeProject) {
    return (
      <ProjectHome
        project={activeProject}
        onBackToProjects={() => setView('dashboard')}
        onEditResume={handleEditResume}
        onChangeResumeTemplate={() => { setCompareMode(false); setView('template-select'); }}
        onCompareResumeTemplate={handleOpenCompare}
        onUpdateName={handleUpdateProjectName}
        onDeleteResume={handleDeleteResume}
        onAddCoverLetter={handleNewCoverLetter}
        onEditCoverLetter={handleEditCoverLetter}
      />
    );
  }

  if (view === 'template-select') {
    return (
      <TemplatePage
        compareMode={compareMode}
        onSelectTemplate={handleSelectTemplate}
        onBack={handleBackFromTemplateSelect}
        defaultResume={DEFAULT_RESUME}
      />
    );
  }

  if (view === 'cl-template-select') {
    return (
      <CoverLetterTemplatePage
        onSelectTemplate={handleSelectCLTemplate}
        onBack={() => setView('project-home')}
        resumeTemplateId={activeProject?.resume?.templateId ?? null}
      />
    );
  }

  if (view === 'cl-builder' && activeCoverLetter) {
    const clTemplate = COVER_LETTER_TEMPLATES.find(t => t.id === activeCoverLetter.templateId)
                    ?? COVER_LETTER_TEMPLATES[0];
    const resumeData = activeCoverLetter.linkedToResume && activeProject?.resume
      ? activeProject.resume.data
      : null;
    return (
      <CoverLetterBuilder
        coverLetter={activeCoverLetter}
        resumeData={resumeData}
        templateStyles={clTemplate.styles}
        pageSettings={clTemplate.pageSettings}
        templateName={clTemplate.name}
        onBack={() => setView('project-home')}
        onChange={handleUpdateCoverLetter}
        onDownload={handleCLDownload}
      />
    );
  }

  if (view === 'compare' && compareTarget) {
    return (
      <CompareView
        resume={resume}
        currentStyles={sectionStyles}
        currentPageSettings={pageSettings}
        currentTemplateName={currentTemplateName}
        proposedTemplate={compareTarget.template}
        proposedStyles={compareTarget.styles}
        proposedPageSettings={compareTarget.pageSettings}
        onKeep={handleKeepCurrent}
        onSwitch={handleSwitchTemplate}
      />
    );
  }

  return (
    <div className="app">
      <Header onHome={() => setView('dashboard')} />
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
          templateFeatures={templateFeatures}
          templateDefaultStyles={templateDefaultStyles}
        />
        <PreviewPanel
          resume={resume}
          sectionStyles={sectionStyles}
          pageSettings={pageSettings}
          onChangeTemplate={() => { setCompareMode(false); setView('template-select'); }}
          onCompareTemplate={handleOpenCompare}
          onBackToProject={() => setView('project-home')}
        />
      </div>
    </div>
  );
}
