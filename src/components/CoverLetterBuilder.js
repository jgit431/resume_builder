import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import { getScheme } from '../data/colorSchemes';
import { generateCoverLetterSection, generateCoverLetterAll } from '../ai';
import './CoverLetterBuilder.css';

const PAGE_W = 650;
const PAGE_H = Math.round(PAGE_W / 8.5 * 11); // ~841px
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
  body2:   "Describe your key skills and why you're a great fit…",
  closing: 'Thank the reader and invite them to get in touch…',
};

// ─────────────────────────────────────────────────────────
// LetterBody — pure content, no page wrapper or margins.
// Rendered in the measure host, the paginated page sheets,
// and the PDF capture host.
// ─────────────────────────────────────────────────────────
function LetterBody({ coverLetter, resumeData, templateStyles, pageSettings, bodyRef }) {
  const scheme  = getScheme(pageSettings.colorScheme ?? 'teal');
  const accent  = scheme.accent;
  const noColor = (pageSettings.colorScheme ?? 'teal') === 'none';
  const align   = templateStyles.headerAlign ?? 'left';
  const font    = templateStyles.fontFamily  ?? 'DM Sans';
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
      ref={bodyRef}
      className="cl-letter-body"
      style={{ fontFamily: font, lineHeight: lh, textAlign: 'left' }}
    >
      {/* ── Header ── */}
      <div className="cl-letter-header" style={{ textAlign: align }}>
        {name && (
          <div className="cl-letter-name" style={{ fontSize: 20, fontFamily: font }}>{name}</div>
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
      <div className="cl-letter-divider" style={{ background: noColor ? '#1a1a1a' : accent }} />

      {/* ── Date ── */}
      <div className="cl-letter-date">{TODAY}</div>

      {/* ── Recipient ── */}
      {(targetCompany || targetRole) && (
        <div className="cl-letter-recipient">
          {targetRole    && <div>Hiring Manager</div>}
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
        ['opening', 'body1', 'body2', 'closing'].map(key =>
          sections[key] ? (
            <p key={key} className="cl-letter-section">{sections[key]}</p>
          ) : null
        )
      )}

      {/* ── Sign-off ── */}
      {hasAnyContent && (
        <div className="cl-letter-closing">
          <div className="cl-letter-sign-off">Sincerely,</div>
          <div className="cl-letter-signature">{name || 'Your Name'}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LetterPreview — paginated, mirrors PreviewPanel approach.
// Hidden measure host → cut points → page sheets + gaps.
// ─────────────────────────────────────────────────────────
function LetterPreview({ coverLetter, resumeData, templateStyles, pageSettings }) {
  const measureRef = useRef(null);
  const [pageSlices, setPageSlices] = useState([{ start: 0, end: PAGE_H }]);

  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH);

  const bodyProps = { coverLetter, resumeData, templateStyles, pageSettings };

  // Measure content height and compute safe page cut points
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const totalH = el.scrollHeight;
    const areaH  = PAGE_H - mTop - mBottom;
    if (areaH <= 0 || totalH <= areaH) {
      setPageSlices([{ start: 0, end: totalH }]);
      return;
    }
    const rawPages = Math.ceil(totalH / areaH);

    // Query all elements that should not be split across pages
    const elements = Array.from(el.querySelectorAll(
      '.cl-letter-header, .cl-letter-divider, .cl-letter-date, ' +
      '.cl-letter-recipient, .cl-letter-salutation, ' +
      '.cl-letter-section, .cl-letter-closing'
    ));

    const cuts = [];
    let searchFrom = 0;

    for (let page = 1; page < rawPages; page++) {
      const idealCut = page * areaH;
      let bestCut    = idealCut;

      // Walk elements to find the last one that ends at or before idealCut
      for (const elem of elements) {
        const bottom = elem.offsetTop + elem.offsetHeight;
        if (bottom > searchFrom && bottom <= idealCut) bestCut = bottom;
      }

      cuts.push(bestCut);
      searchFrom = bestCut;
    }

    setPageSlices(
      Array.from({ length: cuts.length + 1 }, (_, i) => ({
        start: i === 0 ? 0 : cuts[i - 1],
        end:   i < cuts.length ? cuts[i] : totalH,
      }))
    );
  }, [coverLetter, templateStyles, pageSettings, mTop, mBottom]);

  const numPages = pageSlices.length;

  return (
    <>
      {/* Hidden measure host — body only, no page margins */}
      <div
        style={{
          position: 'fixed', left: -9999, top: 0,
          width: PAGE_W - mLeft - mRight,
          background: 'white', pointerEvents: 'none',
        }}
      >
        <LetterBody {...bodyProps} bodyRef={measureRef} />
      </div>

      {/* Paginated page sheets */}
      {pageSlices.map((slice, i) => (
        <React.Fragment key={i}>
          <div className="cl-page-sheet" style={{ height: PAGE_H, position: 'relative', overflow: 'hidden' }}>
            {/* Content clip window — starts at mTop, shows only this slice */}
            <div style={{
              position: 'absolute',
              top: mTop,
              left: mLeft,
              right: mRight,
              height: slice.end - slice.start,
              overflow: 'hidden',
            }}>
              {/* Shift body up by slice.start to show the correct portion */}
              <div style={{ position: 'absolute', top: -slice.start, left: 0, right: 0 }}>
                <LetterBody {...bodyProps} />
              </div>
            </div>
          </div>

          {i < numPages - 1 && (
            <div className="cl-page-gap">
              <div className="cl-page-gap-rule" />
              <span className="cl-page-gap-label">Page {i + 2}</span>
              <div className="cl-page-gap-rule" />
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Section editor card
// ─────────────────────────────────────────────────────────
function SectionCard({ sectionKey, value, onChange, onRegenerate, loading }) {
  const [suggestion, setSuggestion] = useState(null);
  const [generating, setGenerating] = useState(false);

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
        { key: 'name',     label: 'Full Name',     placeholder: 'Jane Smith' },
        { key: 'title',    label: 'Current Title',  placeholder: 'Software Engineer' },
        { key: 'email',    label: 'Email',          placeholder: 'jane@email.com' },
        { key: 'phone',    label: 'Phone',          placeholder: '+1 (555) 000-0000' },
        { key: 'location', label: 'Location',       placeholder: 'Austin, TX' },
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
  resumeData,
  templateStyles,
  pageSettings,
  templateName,
  onBack,
  onChange,
  personName,
}) {
  const [generatingAll, setGeneratingAll] = useState(false);
  // PDF capture host — body only, no page wrapper
  const pdfCaptureRef = useRef(null);

  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH);

  // ── PDF download — matches PreviewPanel approach exactly ──
  const handleDownload = async () => {
    const el = pdfCaptureRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF }                = await import('jspdf');

      const rect = el.getBoundingClientRect();
      // Capture body content at natural height, no clipping
      const contentCanvas = await html2canvas(el, {
        scale:        2,
        useCORS:      true,
        backgroundColor: '#ffffff',
        scrollX:      -rect.left,
        scrollY:      -rect.top,
        windowWidth:  PAGE_W - mLeft - mRight,
        windowHeight: el.scrollHeight + 50,
      });

      const scale  = 2;
      const pageW  = Math.round(PAGE_W  * scale);
      const pageH  = Math.round(PAGE_H  * scale);
      const mTopPx = Math.round(mTop    * scale);
      const mLeftPx = Math.round(mLeft  * scale);
      const areaH  = pageH - Math.round(mTop * scale) - Math.round(mBottom * scale);

      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

      // Slice into pages — identical to resume export logic
      let srcY    = 0;
      let pageNum = 0;
      while (srcY < contentCanvas.height) {
        if (pageNum > 0) pdf.addPage();
        const srcH      = Math.min(areaH, contentCanvas.height - srcY);
        const pageCanvas      = document.createElement('canvas');
        pageCanvas.width      = pageW;
        pageCanvas.height     = pageH;
        const ctx             = pageCanvas.getContext('2d');
        ctx.fillStyle         = '#ffffff';
        ctx.fillRect(0, 0, pageW, pageH);
        // Draw with top + left margin offsets, same as resume
        ctx.drawImage(contentCanvas, 0, srcY, contentCanvas.width, srcH, mLeftPx, mTopPx, contentCanvas.width, srcH);
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, 8.5, 11);
        pageCanvas.width = 0;
        srcY    += areaH;
        pageNum += 1;
      }

      pdf.save(`${personName || 'cover_letter'}_cover_letter.pdf`);
    } catch (err) {
      console.error('CL PDF export failed:', err);
    }
  };

  const updateSections       = (key, val) => onChange({ ...coverLetter, sections: { ...coverLetter.sections, [key]: val } });
  const updateTarget         = (field, val) => onChange({ ...coverLetter, [field]: val });
  const updateStandaloneInfo = (info) => onChange({ ...coverLetter, standaloneInfo: info });

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
    const si = coverLetter.standaloneInfo || {};
    return {
      name: si.name, title: si.title, email: si.email,
      phone: si.phone, location: si.location, skills: si.skills || [],
      experience: si.experienceSummary ? [{ role: si.title || '', company: si.experienceSummary }] : [],
    };
  };

  const handleRegenerateSection = async (sectionKey, existingText) => {
    return generateCoverLetterSection({
      section: sectionKey, targetCompany: coverLetter.targetCompany,
      targetRole: coverLetter.targetRole, existingText, resumeInfo: buildResumeInfo(),
    });
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
  const bodyProps  = { coverLetter, resumeData, templateStyles, pageSettings };

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

          <div className="cl-target-row">
            <div className="cl-target-field">
              <label className="cl-target-label">Target Company</label>
              <input className="cl-target-input" value={coverLetter.targetCompany}
                onChange={e => updateTarget('targetCompany', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="cl-target-field">
              <label className="cl-target-label">Target Role</label>
              <input className="cl-target-input" value={coverLetter.targetRole}
                onChange={e => updateTarget('targetRole', e.target.value)} placeholder="Software Engineer" />
            </div>
          </div>

          <div className="cl-generate-all-bar">
            <button className="btn-cl-generate-all" onClick={handleGenerateAll} disabled={generatingAll}>
              {generatingAll ? '⏳ Writing your letter…' : '✨ Generate Full Cover Letter'}
            </button>
          </div>

          <div className="cl-sections-scroll">
            {!resumeData && (
              <StandaloneInfoForm info={coverLetter.standaloneInfo || {}} onChange={updateStandaloneInfo} />
            )}
            {['opening', 'body1', 'body2', 'closing'].map(key => (
              <SectionCard key={key} sectionKey={key} value={coverLetter.sections[key]}
                onChange={updateSections} onRegenerate={handleRegenerateSection} loading={generatingAll} />
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
            <button className="btn-cl-download" onClick={handleDownload} disabled={!hasContent}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>

          <div className="cl-preview-scroll">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <LetterPreview {...bodyProps} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hidden PDF capture host — body only, no page wrapper ── */}
      <div style={{ position: 'fixed', left: -9999, top: 0, width: PAGE_W - mLeft - mRight, background: 'white', pointerEvents: 'none' }}>
        <LetterBody {...bodyProps} bodyRef={pdfCaptureRef} />
      </div>
    </div>
  );
}
