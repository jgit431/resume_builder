// ─────────────────────────────────────────────────────────────────────────────
// PROJECT STORE
//
// All persistence lives here. Currently uses localStorage.
// To migrate to a backend API later, only this file needs to change —
// swap loadProjects/persistProjects for fetch calls, keep the rest.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_RESUMES            = 2;
export const MAX_COVER_LETTERS_TOTAL = 6;
export const MAX_COVER_LETTERS_PER_PROJECT = 3;

const STORAGE_KEY = 'cedar_projects';

// ── ID generation ─────────────────────────────────────────
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Persistence ───────────────────────────────────────────
export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Cedar Resumes: could not save projects to localStorage:', e);
  }
}

// ── Counters ──────────────────────────────────────────────
export function countTotals(projects) {
  const resumes      = projects.filter(p => p.resume !== null).length;
  const coverLetters = projects.reduce((sum, p) => sum + p.coverLetters.length, 0);
  return { resumes, coverLetters };
}

// ── Project factory ───────────────────────────────────────
// type: 'resume' | 'cover-letter' | 'full'
export function makeProject({ type = 'resume', name = 'New Project' } = {}) {
  return {
    id:           generateId(),
    name,
    type,
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
    resume:       null,
    coverLetters: [],
  };
}

// ── Resume slot factory ───────────────────────────────────
// Stored inside project.resume once a template is chosen.
export function makeResumeSlot({ templateId = 'classic', templateName = 'Classic', sectionStyles = null, pageSettings = null } = {}) {
  return {
    templateId,
    templateName,
    sectionStyles,  // null until template is selected; filled by App.js
    pageSettings,
    data: {
      personal:   { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: null, summary: '' },
      experience: [],
      education:  [],
      skills:     [],
    },
  };
}

// ── Cover letter slot factory ─────────────────────────────
// Stored inside project.coverLetters[].
export function makeCoverLetterSlot({ templateId = 'classic', templateName = 'Classic', linkedToResume = true, defaultBodyFont = 'DM Sans' } = {}) {
  return {
    id:                generateId(),
    templateId,
    templateName,
    linkedToResume,
    targetCompany:     '',
    targetRole:        '',
    hiringManagerName: '',
    customDate:        null,
    showDate:          true,
    sections: {
      opening: '',
      body1:   '',
      body2:   '',
      closing: '',
    },
    sectionStyles: null,
    pageSettings:  null, // set after slot creation from template + defaultBodyFont
    _defaultBodyFont: defaultBodyFont, // stored so App.js can apply it to pageSettings
    standaloneInfo: linkedToResume ? null : {
      name: '', title: '', skills: [], experience: [], education: [],
    },
  };
}

// ── CRUD (immutable — always return new arrays) ────────────
export function upsertProject(projects, project) {
  const updated = { ...project, updatedAt: Date.now() };
  const exists  = projects.some(p => p.id === project.id);
  return exists
    ? projects.map(p => p.id === project.id ? updated : p)
    : [...projects, updated];
}

export function removeProject(projects, id) {
  return projects.filter(p => p.id !== id);
}

// Returns a name that doesn't clash with any existing project.
// e.g. "New Resume" → "New Resume 2" → "New Resume 3"
export function uniqueProjectName(projects, baseName) {
  const existing = new Set(projects.map(p => p.name));
  if (!existing.has(baseName)) return baseName;
  let counter = 2;
  while (existing.has(`${baseName} ${counter}`)) counter++;
  return `${baseName} ${counter}`;
}
