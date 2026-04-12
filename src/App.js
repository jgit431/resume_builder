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
  countTotals, MAX_RESUMES, MAX_COVER_LETTERS_TOTAL,
  uniqueProjectName,
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

// ── Template sync modal ───────────────────────────────────
function TemplateSyncModal({ resumeTemplateName, coverLetterTemplateName, onSync, onKeep }) {
  return (
    <div className="nudge-overlay" onClick={onKeep}>
      <div className="nudge-modal" onClick={e => e.stopPropagation()}>
        <div className="nudge-icon">🔗</div>
        <h2 className="nudge-title">Update cover letter to match?</h2>
        <p className="nudge-body">
          You switched your resume to the <strong>{resumeTemplateName}</strong> template.
          Your linked cover letter can be updated to the matching <strong>{coverLetterTemplateName}</strong> style to keep everything consistent.
        </p>
        <div className="nudge-actions">
          <button className="btn-nudge-resume" onClick={onSync}>
            Yes, update cover letter
          </button>
          <button className="btn-nudge-proceed" onClick={onKeep}>
            No, keep current style
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // ── Project state ─────────────────────────────────────
  const [projects,        setProjects]        = useState(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeCoverId,   setActiveCoverId]   = useState(null);

  // ── View routing ──────────────────────────────────────
  const [view,          setView]          = useState('dashboard');
  const [compareMode,   setCompareMode]   = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [fullAppMode,   setFullAppMode]   = useState(false); // true during full application setup

  // ── Template sync prompt state ────────────────────────
  // { resumeTemplateName, matchingCLTemplate } — shown after template change
  const [syncPrompt, setSyncPrompt] = useState(null);
  // The view to navigate to after dismissing the sync prompt
  const [syncDestView, setSyncDestView] = useState('builder');

  // ── Working resume state ──────────────────────────────
  const [resume,               setResume]               = useState(EMPTY_RESUME);
  const [sectionStyles,        setSectionStyles]        = useState(DEFAULT_STYLES);
  const [pageSettings,         setPageSettings]         = useState(DEFAULT_PAGE_SETTINGS);
  const [templateFeatures,     setTemplateFeatures]     = useState({ photo: false, photoPosition: false });
  const [templateDefaultStyles,setTemplateDefaultStyles]= useState(DEFAULT_STYLES);
  const [templateDefaultPageSettings, setTemplateDefaultPageSettings] = useState(DEFAULT_PAGE_SETTINGS);
  const [activeSection,        setActiveSection]        = useState('personal');
  const [uploadStatus,         setUploadStatus]         = useState(null);
  const [currentTemplateName,  setCurrentTemplateName]  = useState('Classic');
  const [currentTemplateId,    setCurrentTemplateId]    = useState('classic');

  const activeProject     = projects.find(p => p.id === activeProjectId) ?? null;
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
          templateId:   currentTemplateId,
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
    setTemplateDefaultPageSettings(template.pageSettings);
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
        setTemplateDefaultPageSettings(tmpl.pageSettings);
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

  // ── Check for linked cover letters and prompt sync ────
  const checkAndPromptSync = useCallback((newTemplate, destView) => {
    const proj = projects.find(p => p.id === activeProjectId);
    const linkedCLs = proj?.coverLetters?.filter(cl => cl.linkedToResume) ?? [];
    if (linkedCLs.length === 0) {
      setView(destView);
      return;
    }
    const matchingCLTemplate = getCoverLetterTemplate(newTemplate.id);
    // Only prompt if the matching CL template is different from what's already used
    const alreadyMatching = linkedCLs.every(cl => cl.templateId === matchingCLTemplate.id);
    if (alreadyMatching) {
      setView(destView);
      return;
    }
    setSyncDestView(destView);
    setSyncPrompt({
      resumeTemplateName:      newTemplate.name,
      matchingCLTemplate,
    });
  }, [projects, activeProjectId]);

  // ── Sync all linked cover letters to matching template ─
  const handleSyncCoverLetters = useCallback(() => {
    if (!syncPrompt) return;
    const { matchingCLTemplate } = syncPrompt;
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      const updatedCLs = proj.coverLetters.map(cl =>
        cl.linkedToResume
          ? { ...cl, templateId: matchingCLTemplate.id, templateName: matchingCLTemplate.name,
              sectionStyles: matchingCLTemplate.styles, pageSettings: matchingCLTemplate.pageSettings }
          : cl
      );
      return upsertProject(prev, { ...proj, coverLetters: updatedCLs });
    });
    setSyncPrompt(null);
    setView(syncDestView);
  }, [syncPrompt, activeProjectId, syncDestView]);

  const handleDismissSync = useCallback(() => {
    setSyncPrompt(null);
    setView(syncDestView);
  }, [syncDestView]);

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

  // Called from the nudge overlay — creates a standalone project then goes to CL template picker
  const handleNewStandaloneCoverLetter = useCallback(() => {
    const { coverLetters } = countTotals(projects);
    if (coverLetters >= MAX_COVER_LETTERS_TOTAL) return;
    const proj = makeProject({ type: 'cover-letter', name: uniqueProjectName(projects, 'New Cover Letter') });
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setView('cl-template-select');
  }, [projects]);

  const handleNewFull = useCallback(() => {
    const { resumes } = countTotals(projects);
    if (resumes >= MAX_RESUMES) return;
    const proj = makeProject({ type: 'full', name: uniqueProjectName(projects, 'New Application') });
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setResume(EMPTY_RESUME);
    setSectionStyles(DEFAULT_STYLES);
    setPageSettings(DEFAULT_PAGE_SETTINGS);
    setCurrentTemplateName('Classic');
    setCurrentTemplateId('classic');
    setCompareMode(false);
    setFullAppMode(true);
    setView('template-select');
  }, [projects]);

  // ── Cover letter flow ─────────────────────────────────
  const handleSelectCLTemplate = useCallback((clTemplate) => {
    if (!activeProjectId) return;
    const proj = projects.find(p => p.id === activeProjectId);
    if (!proj) return;

    const linkedToResume = !!proj.resume;
    // Default font: match linked resume's body font; otherwise use template default
    const defaultBodyFont = linkedToResume
      ? (proj.resume.pageSettings?.bodyFont ?? clTemplate.pageSettings.bodyFont ?? 'DM Sans')
      : (clTemplate.pageSettings.bodyFont ?? 'DM Sans');

    const cl = makeCoverLetterSlot({ templateId: clTemplate.id, templateName: clTemplate.name, linkedToResume, defaultBodyFont });
    cl.sectionStyles = clTemplate.styles;
    cl.pageSettings  = { ...clTemplate.pageSettings, bodyFont: defaultBodyFont };

    setProjects(prev => {
      const p = prev.find(x => x.id === activeProjectId);
      if (!p) return prev;
      return upsertProject(prev, { ...p, coverLetters: [...p.coverLetters, cl] });
    });
    setActiveCoverId(cl.id);

    if (fullAppMode) {
      setFullAppMode(false);
      setView('builder');
    } else {
      setView('cl-builder');
    }
  }, [activeProjectId, projects, fullAppMode]);

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

  const handleDeleteCoverLetter = useCallback((clId) => {
    if (!activeProjectId) return;
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj) return prev;
      return upsertProject(prev, { ...proj, coverLetters: proj.coverLetters.filter(cl => cl.id !== clId) });
    });
  }, [activeProjectId]);

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
    if (fullAppMode) {
      // Full application — go straight to cover letter template picker next
      setView('cl-template-select');
    } else {
      checkAndPromptSync(template, 'builder');
    }
  }, [compareMode, applyTemplate, activeProjectId, resume, fullAppMode, checkAndPromptSync]);

  const handleBackFromTemplateSelect = useCallback(() => {
    if (compareMode) { setCompareMode(false); setView('builder'); return; }
    if (fullAppMode) {
      // Cancel full application setup — delete the stub project
      setFullAppMode(false);
      setProjects(prev => removeProject(prev, activeProjectId));
      setActiveProjectId(null);
      setView('dashboard');
      return;
    }
    const proj = projects.find(p => p.id === activeProjectId);
    if (proj && !proj.resume) {
      setProjects(prev => removeProject(prev, activeProjectId));
      setActiveProjectId(null);
      setView('dashboard');
    } else {
      setView(proj ? 'project-home' : 'dashboard');
    }
  }, [compareMode, fullAppMode, projects, activeProjectId]);

  // ── Compare handlers ──────────────────────────────────
  const handleOpenCompare    = useCallback(() => { setCompareMode(true); setView('template-select'); }, []);
  const handleKeepCurrent    = useCallback(() => { setCompareTarget(null); setView('builder'); }, []);
  const handleSwitchTemplate = useCallback(() => {
    if (compareTarget) {
      applyTemplate(compareTarget.template);
      const merged = buildStylesFromTemplate(compareTarget.template);
      setProjects(prev => {
        const proj = prev.find(p => p.id === activeProjectId);
        if (!proj || !proj.resume) return prev;
        return upsertProject(prev, {
          ...proj,
          resume: { ...proj.resume, templateId: compareTarget.template.id, templateName: compareTarget.template.name, sectionStyles: merged, pageSettings: compareTarget.template.pageSettings },
        });
      });
      const newTemplate = compareTarget.template;
      setCompareTarget(null);
      checkAndPromptSync(newTemplate, 'builder');
    } else {
      setCompareTarget(null);
      setView('builder');
    }
  }, [compareTarget, applyTemplate, activeProjectId, checkAndPromptSync]);

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
  const updateSectionStyle = (sec,f,v) => setSectionStyles(s => ({ ...s, [sec]: { ...s[sec], [f]: v } }));
  const updatePageSetting  = (f,v)    => setPageSettings(s => ({ ...s, [f]: v }));

  // ── View routing ──────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <Dashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        onNewResume={handleNewResume}
        onNewCoverLetter={handleNewStandaloneCoverLetter}
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
        onUpdateName={handleUpdateProjectName}
        onDeleteResume={handleDeleteResume}
        onAddCoverLetter={handleNewCoverLetter}
        onEditCoverLetter={handleEditCoverLetter}
        onDeleteCoverLetter={handleDeleteCoverLetter}
      />
    );
  }

  if (view === 'template-select') {
    return (
      <TemplatePage
        compareMode={compareMode}
        fullAppMode={fullAppMode}
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
        onBack={() => fullAppMode ? setView('template-select') : setView('project-home')}
        resumeTemplateId={activeProject?.resume?.templateId ?? null}
        fullAppMode={fullAppMode}
      />
    );
  }

  if (view === 'cl-builder' && activeCoverLetter) {
    const clTemplate = COVER_LETTER_TEMPLATES.find(t => t.id === activeCoverLetter.templateId)
                    ?? COVER_LETTER_TEMPLATES[0];
    const resumeData = activeCoverLetter.linkedToResume && activeProject?.resume
      ? activeProject.resume.data
      : null;
    const personName = resumeData?.personal?.name
                    || activeCoverLetter?.standaloneInfo?.name
                    || 'cover_letter';
    // Use stored pageSettings on the slot (may have user customisations like bodyFont),
    // falling back to the template defaults if not yet set.
    const clPageSettings = activeCoverLetter.pageSettings ?? clTemplate.pageSettings;
    return (
      <CoverLetterBuilder
        coverLetter={{ ...activeCoverLetter, pageSettings: clPageSettings }}
        resumeData={resumeData}
        templateStyles={clTemplate.styles}
        pageSettings={clPageSettings}
        templateDefaultPageSettings={clTemplate.pageSettings}
        templateName={clTemplate.name}
        onBack={() => setView('project-home')}
        onChange={handleUpdateCoverLetter}
        personName={personName}
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
          templateDefaultPageSettings={templateDefaultPageSettings}
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

      {/* ── Template sync prompt ── */}
      {syncPrompt && (
        <TemplateSyncModal
          resumeTemplateName={syncPrompt.resumeTemplateName}
          coverLetterTemplateName={syncPrompt.matchingCLTemplate.name}
          onSync={handleSyncCoverLetters}
          onKeep={handleDismissSync}
        />
      )}
    </div>
  );
}
