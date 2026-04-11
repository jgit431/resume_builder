import React, { useState } from 'react';
import { TEMPLATES, TemplateSVG } from '../data/templates';
import { MAX_COVER_LETTERS_PER_PROJECT } from '../data/projectStore';
import Header from './Header';
import './ProjectHome.css';

// ── Inline name editor ────────────────────────────────────
function EditableName({ name, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);

  const commit = () => {
    setEditing(false);
    const trimmed = val.trim();
    if (trimmed && trimmed !== name) onSave(trimmed);
    else setVal(name);
  };

  if (editing) {
    return (
      <input
        className="proj-home-name-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter')  commit();
          if (e.key === 'Escape') { setVal(name); setEditing(false); }
        }}
        autoFocus
      />
    );
  }

  return (
    <h1 className="proj-home-name" onClick={() => setEditing(true)} title="Click to rename">
      {name}
      <span className="proj-home-name-pencil">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </span>
    </h1>
  );
}

// ── Resume doc card ───────────────────────────────────────
function ResumeCard({ resume, onEdit, onChangeTemplate, onCompare, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const template = TEMPLATES.find(t => t.id === resume?.templateId);

  if (!resume) {
    return (
      <div className="proj-doc-card resume-card empty">
        <div className="proj-doc-card-label">Resume</div>
        <div className="proj-doc-empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No resume yet</p>
          <button className="btn-proj-doc-create" onClick={onEdit}>Create Resume</button>
        </div>
      </div>
    );
  }

  return (
    <div className="proj-doc-card resume-card">
      <div className="proj-doc-card-header">
        <span className="proj-doc-card-label">Resume</span>
        <span className="proj-doc-template-badge">{resume.templateName}</span>
      </div>

      {template && (
        <div className="proj-doc-thumbnail">
          <TemplateSVG template={template} />
        </div>
      )}

      <div className="proj-doc-info">
        <div className="proj-doc-person-name">
          {resume.data.personal.name || 'Untitled Resume'}
        </div>
        {resume.data.personal.title && (
          <div className="proj-doc-person-title">{resume.data.personal.title}</div>
        )}
        <div className="proj-doc-counts">
          {resume.data.experience.length > 0 && (
            <span>{resume.data.experience.length} experience {resume.data.experience.length === 1 ? 'entry' : 'entries'}</span>
          )}
          {resume.data.skills.length > 0 && (
            <span>{resume.data.skills.length} skills</span>
          )}
        </div>
      </div>

      <div className="proj-doc-actions">
        <button className="btn-proj-edit" onClick={onEdit}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
        <button className="btn-proj-change-template" onClick={onChangeTemplate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Change Template
        </button>
        <button className="btn-proj-compare" onClick={onCompare}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/>
          </svg>
          Compare
        </button>
        {confirmDelete ? (
          <div className="proj-doc-delete-confirm">
            <span>Delete resume?</span>
            <button className="btn-proj-confirm-yes" onClick={() => { setConfirmDelete(false); onDelete(); }}>Yes</button>
            <button className="btn-proj-confirm-no"  onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        ) : (
          <button className="btn-proj-delete-resume" onClick={() => setConfirmDelete(true)} title="Delete resume">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Cover letters card ────────────────────────────────────
function CoverLettersCard({ project, onAddCoverLetter, onEditCoverLetter }) {
  const cls = project.coverLetters;
  const atLimit = cls.length >= MAX_COVER_LETTERS_PER_PROJECT;
  const hasResume = !!project.resume;

  return (
    <div className="proj-doc-card cl-card">
      <div className="proj-doc-card-header">
        <span className="proj-doc-card-label">Cover Letters</span>
        <span className="proj-doc-cl-count">{cls.length} / {MAX_COVER_LETTERS_PER_PROJECT}</span>
      </div>

      {cls.length === 0 ? (
        <div className="proj-doc-empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <p>No cover letters yet</p>
          {!hasResume && (
            <p className="proj-doc-tip">
              💡 Add a resume first so the AI has more to work with.
            </p>
          )}
          <button className="btn-proj-doc-create" onClick={onAddCoverLetter}>
            + Add Cover Letter
          </button>
        </div>
      ) : (
        <div className="proj-cl-list">
          {cls.map(cl => (
            <div key={cl.id} className="proj-cl-item" onClick={() => onEditCoverLetter(cl.id)}>
              <div className="proj-cl-item-info">
                <div className="proj-cl-company">{cl.targetCompany || 'Untitled'}</div>
                {cl.targetRole && <div className="proj-cl-role">{cl.targetRole}</div>}
              </div>
              <div className="proj-cl-item-badges">
                {cl.linkedToResume && (
                  <span className="proj-cl-linked-badge" title="Linked to resume">🔗 Linked</span>
                )}
                <span className="proj-cl-template-badge">{cl.templateName}</span>
              </div>
              <button className="btn-proj-cl-edit" onClick={e => { e.stopPropagation(); onEditCoverLetter(cl.id); }}>
                Edit →
              </button>
            </div>
          ))}
          {!atLimit && (
            <button className="btn-proj-cl-add" onClick={onAddCoverLetter}>
              + Add Another Cover Letter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProjectHome ───────────────────────────────────────────
export default function ProjectHome({
  project,
  onBackToProjects,
  onEditResume,
  onChangeResumeTemplate,
  onCompareResumeTemplate,
  onUpdateName,
  onDeleteResume,
  onAddCoverLetter,
  onEditCoverLetter,
}) {
  return (
    <div className="proj-home">
      <Header onHome={onBackToProjects} />

      <main className="proj-home-main">
        {/* Breadcrumb */}
        <button className="proj-home-back" onClick={onBackToProjects}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          My Projects
        </button>

        {/* Project name */}
        <EditableName name={project.name} onSave={onUpdateName} />

        {/* Documents */}
        <div className="proj-home-docs">
          <ResumeCard
            resume={project.resume}
            onEdit={onEditResume}
            onChangeTemplate={onChangeResumeTemplate}
            onCompare={onCompareResumeTemplate}
            onDelete={onDeleteResume}
          />
          <CoverLettersCard
            project={project}
            onAddCoverLetter={onAddCoverLetter}
            onEditCoverLetter={onEditCoverLetter}
          />
        </div>
      </main>
    </div>
  );
}
