import React, { useState, useRef } from 'react';
import Header from './Header';
import { getScheme } from '../data/colorSchemes';
import { generateCoverLetterSection, generateCoverLetterAll } from '../ai';
import './CoverLetterBuilder.css';

const PAGE_W = 650;
const INCH   = PAGE_W / 8.5;
const TODAY  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const SECTION_LABELS = {
  opening: 'Opening Paragraph',
  body1:   'Body — Paragraph 1',
  body2:   'Body — Paragraph 2',
  closing: 'Closing Paragraph',
};

const SECTION_PLACEHOLDERS = {
  opening: 'Express your enthusiasm for the role and company…',
  body1:   'Highlight your most relevant experience and achievements…',
  body2:   'Describe your key skills and why you\'re a great fit…',
  closing: 'Thank the reader and invite them to get in touch…',
};

// ─────────────────────────────────────────────────────────
// Letter preview — single-page render
// ─────────────────────────────────────────────────────────
function LetterPreview({ coverLetter, resumeData, templateStyles, pageSettings }) {
  const scheme  = getScheme(pageSettings.colorScheme ?? 'teal');
  const accent  = scheme.accent;
  const noColor = (pageSettings.colorScheme ?? 'teal') === 'none';
  const align   = templateStyles.headerAlign ?? 'left';
  const font    = templateStyles.fontFamily  ?? 'DM Sans';
  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH);
  const lh      = pageSettings.lineHeight ?? 1.6;

  const personal = resumeData?.personal ?? {};
  const name     = personal.name  || coverLetter.standaloneInfo?.name  || '';
  const title    = personal.title || coverLetter.standaloneInfo?.title || '';

  const { sections, targetCompany, targetRole } = coverLetter;

  const contactItems = [
    personal.email    || coverLetter.standaloneInfo?.email,
    personal.phone    || coverLetter.standaloneInfo?.phone,
    personal.location || coverLetter.standaloneInfo?.location,
    personal.linkedin || coverLetter.standaloneInfo?.linkedin,
  ].filter(Boolean);

  const hasAnyContent = Object.values(sections).some(s => s && s.trim());

  return (
    <div
      className="cl-page-sheet"
      style={{ paddingTop: mTop, paddingBottom: mBottom, paddingLeft: mLeft, paddingRight: mRight }}
    >
      <div
        className="cl-letter-body"
        style={{ fontFamily: font, lineHeight: lh, textAlign: 'left' }}
      >
        {/* ── Header ── */}
        <div className="cl-letter-header" style={{ textAlign: align }}>
          {name && (
            <div className="cl-letter-name" style={{ fontSize: 20, fontFamily: font }}>
              {name}
            </div>
          )}
          {title && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {title}
            </div>
          )}
          {contactItems.length > 0 && (
            <div
              className="cl-letter-contact"
              style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}
            >
              {contactItems.map((item, i) => <span key={i}>{item}</span>)}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div
          className="cl-letter-divider"
          style={{ background: noColor ? '#1a1a1a' : accent }}
        />

        {/* ── Date ── */}
        <div className="cl-letter-date">{TODAY}</div>

        {/* ── Recipient ── */}
        {(targetCompany || targetRole) && (
          <div className="cl-letter-recipient">
            {targetRole && <div>Hiring Manager</div>}
            {targetCompany && <div>{targetCompany}</div>}
          </div>
        )}

        {/* ── Salutation ── */}
        <div className="cl-letter-salutation">Dear Hiring Manager,</div>

        {/* ── Body sections ── */}
        {!hasAnyContent ? (
          <p className="cl-letter-section empty">
            Your cover letter will appear here as you write it…
          </p>
        ) : (
          ['opening', 'body1', 'body2', 'closing'].map(key => (
            sections[key] ? (
              <p key={key} className="cl-letter-section">{sections[key]}</p>
            ) : null
          ))
        )}

        {/* ── Sign-off ── */}
        {hasAnyContent && (
          <div className="cl-letter-closing">
            <div className="cl-letter-sign-off">Sincerely,</div>
            <div className="cl-letter-signature">{name || 'Your Name'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Section editor card
// ─────────────────────────────────────────────────────────
function SectionCard({ sectionKey, value, onChange, onRegenerate, loading }) {
  const [suggestion, setSuggestion] = useState(null);
  const [generating,  setGenerating] = useState(false);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const text = await onRegenerate(sectionKey, value);
      setSuggestion(text);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="cl-section-card">
      <div className="cl-section-header">
        <span className="cl-section-label">{SECTION_LABELS[sectionKey]}</span>
        <button
          className="btn-cl-regenerate"
          onClick={handleRegenerate}
          disabled={generating || loading}
        >
          {generating ? '…' : '✨'} {generating ? 'Writing…' : value ? 'Rewrite' : 'Generate'}
        </button>
      </div>

      <textarea
        className="cl-section-textarea"
        value={value}
        onChange={e => onChange(sectionKey, e.target.value)}
        placeholder={SECTION_PLACEHOLDERS[sectionKey]}
        rows={4}
      />

      {suggestion && (
        <div className="cl-ai-preview">
          <div className="cl-ai-preview-label">✨ AI Suggestion</div>
          <div className="cl-ai-preview-text">{suggestion}</div>
          <div className="cl-ai-preview-actions">
            <button className="btn-cl-accept" onClick={() => { onChange(sectionKey, suggestion); setSuggestion(null); }}>
              Use This
            </button>
            <button className="btn-cl-discard" onClick={() => setSuggestion(null)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Standalone info form (when no resume is linked)
// ─────────────────────────────────────────────────────────
function StandaloneInfoForm({ info, onChange }) {
  const set = (field, val) => onChange({ ...info, [field]: val });
  return (
    <div className="cl-standalone-fields">
      <div className="cl-standalone-banner">
        💡 No resume linked. Fill in your details so the AI has context to write your cover letter.
      </div>
      {[
        { key: 'name',       label: 'Full Name',    placeholder: 'Jane Smith' },
        { key: 'title',      label: 'Current Title', placeholder: 'Software Engineer' },
        { key: 'email',      label: 'Email',         placeholder: 'jane@email.com' },
        { key: 'phone',      label: 'Phone',         placeholder: '+1 (555) 000-0000' },
        { key: 'location',   label: 'Location',      placeholder: 'Austin, TX' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} className="cl-target-field">
          <label className="cl-target-label">{label}</label>
          <input
            className="cl-target-input"
            value={info[key] || ''}
            onChange={e => set(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      ))}
      <div className="cl-target-field">
        <label className="cl-target-label">Key Skills (comma separated)</label>
        <input
          className="cl-target-input"
          value={(info.skills || []).join(', ')}
          onChange={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="React, Node.js, Leadership…"
        />
      </div>
      <div className="cl-target-field">
        <label className="cl-target-label">Experience Summary</label>
        <textarea
          className="cl-target-input"
          value={info.experienceSummary || ''}
          onChange={e => set('experienceSummary', e.target.value)}
          placeholder="Brief overview of your work history…"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main CoverLetterBuilder
// ─────────────────────────────────────────────────────────
export default function CoverLetterBuilder({
  coverLetter,
  resumeData,        // null if standalone
  templateStyles,
  pageSettings,
  templateName,
  onBack,
  onChange,          // (updatedCoverLetter) => void
  onDownload,
}) {
  const [generatingAll, setGeneratingAll] = useState(false);

  const updateSections = (key, val) => {
    onChange({ ...coverLetter, sections: { ...coverLetter.sections, [key]: val } });
  };

  const updateTarget = (field, val) => {
    onChange({ ...coverLetter, [field]: val });
  };

  const updateStandaloneInfo = (info) => {
    onChange({ ...coverLetter, standaloneInfo: info });
  };

  // Build resumeInfo for AI calls
  const buildResumeInfo = () => {
    if (resumeData) {
      return {
        name:       resumeData.personal?.name,
        title:      resumeData.personal?.title,
        email:      resumeData.personal?.email,
        phone:      resumeData.personal?.phone,
        location:   resumeData.personal?.location,
        linkedin:   resumeData.personal?.linkedin,
        summary:    resumeData.personal?.summary,
        skills:     resumeData.skills,
        experience: resumeData.experience,
        education:  resumeData.education,
      };
    }
    // Standalone — build from standaloneInfo
    const si = coverLetter.standaloneInfo || {};
    return {
      name:     si.name,
      title:    si.title,
      email:    si.email,
      phone:    si.phone,
      location: si.location,
      skills:   si.skills || [],
      experience: si.experienceSummary
        ? [{ role: si.title || '', company: si.experienceSummary }]
        : [],
    };
  };

  const handleRegenerateSection = async (sectionKey, existingText) => {
    const text = await generateCoverLetterSection({
      section:       sectionKey,
      targetCompany: coverLetter.targetCompany,
      targetRole:    coverLetter.targetRole,
      existingText,
      resumeInfo:    buildResumeInfo(),
    });
    return text;
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      const sections = await generateCoverLetterAll({
        targetCompany: coverLetter.targetCompany,
        targetRole:    coverLetter.targetRole,
        resumeInfo:    buildResumeInfo(),
      });
      onChange({ ...coverLetter, sections });
    } catch (e) {
      console.error('Generate all failed:', e);
    } finally {
      setGeneratingAll(false);
    }
  };

  const hasContent = Object.values(coverLetter.sections).some(s => s && s.trim());

  return (
    <div className="cl-builder">
      <Header onHome={onBack} />

      <div className="cl-workspace">
        {/* ── Left: form ── */}
        <div className="cl-form-panel">
          <div className="cl-form-header">
            <div className="cl-form-header-top">
              <span className="cl-form-title">Cover Letter</span>
              <span className="cl-template-badge">{templateName}</span>
            </div>
          </div>

          {/* Target company + role */}
          <div className="cl-target-row">
            <div className="cl-target-field">
              <label className="cl-target-label">Target Company</label>
              <input
                className="cl-target-input"
                value={coverLetter.targetCompany}
                onChange={e => updateTarget('targetCompany', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="cl-target-field">
              <label className="cl-target-label">Target Role</label>
              <input
                className="cl-target-input"
                value={coverLetter.targetRole}
                onChange={e => updateTarget('targetRole', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          {/* Generate all */}
          <div className="cl-generate-all-bar">
            <button
              className="btn-cl-generate-all"
              onClick={handleGenerateAll}
              disabled={generatingAll}
            >
              {generatingAll ? '⏳ Writing your letter…' : '✨ Generate Full Cover Letter'}
            </button>
          </div>

          <div className="cl-sections-scroll">
            {/* Standalone info if no resume linked */}
            {!resumeData && (
              <StandaloneInfoForm
                info={coverLetter.standaloneInfo || {}}
                onChange={updateStandaloneInfo}
              />
            )}

            {/* Section editors */}
            {['opening', 'body1', 'body2', 'closing'].map(key => (
              <SectionCard
                key={key}
                sectionKey={key}
                value={coverLetter.sections[key]}
                onChange={updateSections}
                onRegenerate={handleRegenerateSection}
                loading={generatingAll}
              />
            ))}
          </div>
        </div>

        {/* ── Right: preview ── */}
        <div className="cl-preview-panel">
          <div className="cl-preview-toolbar">
            <div className="cl-preview-toolbar-left">
              <button className="btn-cl-back" onClick={onBack}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                My Project
              </button>
              <span className="cl-preview-label">Live Preview</span>
            </div>
            <button
              className="btn-cl-download"
              onClick={onDownload}
              disabled={!hasContent}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>

          <div className="cl-preview-scroll">
            <LetterPreview
              coverLetter={coverLetter}
              resumeData={resumeData}
              templateStyles={templateStyles}
              pageSettings={pageSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
