import React, { useRef, useState } from 'react';
import { countTotals, MAX_RESUMES, MAX_COVER_LETTERS_TOTAL } from '../data/projectStore';
import './Dashboard.css';

// ── Helpers ───────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function docSummary(project) {
  const parts = [];
  if (project.resume) parts.push('1 resume');
  const cl = project.coverLetters.length;
  if (cl > 0) parts.push(`${cl} cover letter${cl > 1 ? 's' : ''}`);
  return parts.join(' · ') || 'Empty project';
}

// ── Project type icon ─────────────────────────────────────
function TypeIcon({ project }) {
  if (project.resume && project.coverLetters.length > 0) return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  );
  if (project.resume) return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

// ── Project card ──────────────────────────────────────────
function ProjectCard({ project, onOpen, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="proj-card animate-in">
      <div className="proj-card-icon">
        <TypeIcon project={project} />
      </div>

      <div className="proj-card-body" onClick={() => onOpen(project)}>
        <div className="proj-card-name">{project.name}</div>
        <div className="proj-card-docs">{docSummary(project)}</div>
        <div className="proj-card-date">Edited {formatDate(project.updatedAt)}</div>
      </div>

      <div className="proj-card-actions">
        {confirming ? (
          <div className="proj-card-confirm">
            <span className="proj-card-confirm-text">Delete?</span>
            <button className="btn-proj-confirm-yes" onClick={() => onDelete(project.id)}>Yes</button>
            <button className="btn-proj-confirm-no"  onClick={() => setConfirming(false)}>No</button>
          </div>
        ) : (
            <button className="btn-proj-delete" onClick={() => setConfirming(true)} title="Delete project">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

// ── Cover letter nudge overlay ────────────────────────────
function CoverLetterNudge({ onProceed, onCreateResume, onCancel }) {
  return (
    <div className="nudge-overlay" onClick={onCancel}>
      <div className="nudge-modal" onClick={e => e.stopPropagation()}>
        <div className="nudge-icon">✉️</div>
        <h2 className="nudge-title">Start with a resume first?</h2>
        <p className="nudge-body">
          Our AI writes much stronger cover letters when it has your resume to reference —
          your experience, skills, and tone are already there. We recommend building or
          importing a resume before creating a cover letter.
        </p>
        <div className="nudge-actions">
          <button className="btn-nudge-resume" onClick={onCreateResume}>
            Create a Resume First
          </button>
          <button className="btn-nudge-proceed" onClick={onProceed}>
            Proceed with Cover Letter Only
          </button>
        </div>
        <button className="btn-nudge-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Resume start modal ────────────────────────────────────
function ResumeModal({ onScratch, onImport, onCancel }) {
  return (
    <div className="nudge-overlay" onClick={onCancel}>
      <div className="nudge-modal" onClick={e => e.stopPropagation()}>
        <div className="nudge-icon">📄</div>
        <h2 className="nudge-title">How would you like to start?</h2>
        <p className="nudge-body">
          Build your resume step by step, or upload an existing PDF and we'll
          extract your information automatically.
        </p>
        <div className="nudge-actions">
          <button className="btn-nudge-resume" onClick={onImport}>
            ↑ Import Existing PDF
          </button>
          <button className="btn-nudge-proceed" onClick={onScratch}>
            Start from Scratch
          </button>
        </div>
        <button className="btn-nudge-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard({
  projects,
  onOpenProject,
  onDeleteProject,
  onNewResume,
  onNewCoverLetter,
  onNewFull,
  onImport,
  uploadStatus,
}) {
  const fileRef = useRef();
  const [showNudge,       setShowNudge]       = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(null); // null | 'resume' | 'full'

  const { resumes, coverLetters } = countTotals(projects);
  const atResumeLimit  = resumes      >= MAX_RESUMES;
  const atCoverLimit   = coverLetters >= MAX_COVER_LETTERS_TOTAL;
  const atFullLimit    = atResumeLimit || atCoverLimit;

  const statusLabel = {
    parsing: '⏳ Parsing your resume…',
    done:    '✅ Resume imported!',
    error:   '❌ Could not parse PDF',
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') onImport(file);
    e.target.value = '';
  };

  const handleCoverLetterClick = () => {
    if (atCoverLimit) return;
    setShowNudge(true);
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <img src={`${process.env.PUBLIC_URL}/logos/logo.png`} alt="Cedar Resumes" className="dashboard-logo-img" />
          <div className="dashboard-logo-text">
            <span className="dashboard-logo-name">Cedar Resumes</span>
            <span className="dashboard-logo-tagline">Build it. Love it. Ship it.</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">

        {/* ── Existing projects ── */}
        {projects.length > 0 && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-label">My Projects</h2>
            <div className="proj-cards-list">
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={onOpenProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Start new ── */}
        <section className="dashboard-section">
          <div className="dashboard-hero">
            <h1 className="dashboard-hero-title">
              {projects.length > 0 ? 'Start Something New' : "Let's get started"}
            </h1>
            <p className="dashboard-hero-sub">What would you like to create?</p>
          </div>

          <div className="dashboard-new-grid">

            {/* Resume */}
            <div className={`dash-new-card ${atResumeLimit ? 'at-limit' : ''}`}>
              <span className="dash-new-icon resume-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </span>
              <span className="dash-new-title">Resume</span>
              <span className="dash-new-desc">
                {atResumeLimit
                  ? `You've reached the limit of ${MAX_RESUMES} resumes. Delete one to create another.`
                  : 'Build a polished resume from scratch or import an existing PDF.'}
              </span>
              {!atResumeLimit && (
                <div className="dash-new-btns">
                  <button className="btn-dash-primary" onClick={() => setShowResumeModal('resume')}>Get Started</button>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className={`dash-new-card ${atCoverLimit ? 'at-limit' : ''}`}>
              <span className="dash-new-icon letter-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span className="dash-new-title">Cover Letter</span>
              <span className="dash-new-desc">
                {atCoverLimit
                  ? `You've reached the limit of ${MAX_COVER_LETTERS_TOTAL} cover letters.`
                  : 'AI-crafted cover letter tailored to the role you\'re applying for.'}
              </span>
              {!atCoverLimit && (
                <div className="dash-new-btns">
                  <button className="btn-dash-primary" onClick={handleCoverLetterClick}>Get Started</button>
                </div>
              )}
            </div>

            {/* Full Application */}
            <div className={`dash-new-card ${atFullLimit ? 'at-limit' : ''}`}>
              <span className="dash-new-icon full-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/>
                  <line x1="10" y1="14" x2="14" y2="14"/>
                </svg>
              </span>
              <span className="dash-new-title">Full Application</span>
              <span className="dash-new-desc">
                {atFullLimit
                  ? 'You\'ve reached a project limit.'
                  : 'Create a matched resume and cover letter together as one linked project.'}
              </span>
              {!atFullLimit && (
                <div className="dash-new-btns">
                  <button className="btn-dash-primary" onClick={() => setShowResumeModal('full')}>Get Started</button>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <footer className="dashboard-footer">© 2025 Cedar Resumes · Built with ✦</footer>

      {/* Resume start modal */}
      {showResumeModal && (
        <ResumeModal
          onScratch={() => {
            const handler = showResumeModal === 'full' ? onNewFull : onNewResume;
            setShowResumeModal(null);
            handler();
          }}
          onImport={() => { setShowResumeModal(null); fileRef.current?.click(); }}
          onCancel={() => setShowResumeModal(null)}
        />
      )}

      {/* Cover letter nudge overlay */}
      {showNudge && (
        <CoverLetterNudge
          onProceed={() => { setShowNudge(false); onNewCoverLetter({ standalone: true }); }}
          onCreateResume={() => { setShowNudge(false); onNewResume(); }}
          onCancel={() => setShowNudge(false)}
        />
      )}
    </div>
  );
}
