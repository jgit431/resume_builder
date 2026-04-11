import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import { getScheme } from '../data/colorSchemes';
import { generateCoverLetterSection, generateCoverLetterAll } from '../ai';
import './FormPanel.css';
import './CoverLetterBuilder.css';

const PAGE_W = 650;
const PAGE_H = Math.round(PAGE_W / 8.5 * 11); // ~841px
const INCH   = PAGE_W / 8.5;
const TODAY  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const CL_FONT_OPTIONS = [
  { label: 'DM Sans',         value: 'DM Sans' },
  { label: 'Georgia',         value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif' },
  { label: 'Garamond',        value: 'Garamond, serif' },
  { label: 'Courier New',     value: 'Courier New, monospace' },
];

// ─────────────────────────────────────────────────────────
// EditableValue — click-to-edit numeric label (same as FormPanel)
// ─────────────────────────────────────────────────────────
function EditableValue({ value, min, max, step, unit, decimals, onChange }) {
  const [editing, setEditing] = useState(false);
  const [raw,     setRaw]     = useState('');

  const start = () => { setRaw(value.toFixed(decimals)); setEditing(true); };
  const commit = () => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="editable-value-input"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        autoFocus
        style={{ width: 52 }}
      />
    );
  }
  return (
    <span className="editable-value" onClick={start} title="Click to type a value">
      {value.toFixed(decimals)}{unit}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// CLPageSetupForm — mirrors the resume's PageSetupForm
// ─────────────────────────────────────────────────────────
function CLPageSetupForm({ settings, onUpdate, defaultSettings }) {
  const MARGIN_MIN  = 0.25;
  const MARGIN_MAX  = 2.0;
  const MARGIN_STEP = 0.25;

  const d = defaultSettings ?? settings;

  const reset = () => {
    // Apply all fields in one call to avoid stale closure overwriting
    const resetPS = {
      ...settings,
      marginTop:    d.marginTop    ?? 1.0,
      marginBottom: d.marginBottom ?? 1.0,
      marginLeft:   d.marginLeft   ?? 1.0,
      marginRight:  d.marginRight  ?? 1.0,
      lineHeight:   d.lineHeight   ?? 1.6,
      bodyFont:     d.bodyFont     ?? 'DM Sans',
    };
    onUpdate('__reset__', resetPS);
  };

  return (
    <div className="form-section">
      <h2 className="section-heading">Page Setup</h2>
      <p className="page-setup-desc">
        Adjust font, spacing and margins for your cover letter. All values are in inches.
      </p>

          {/* Body Font */}
          <div className="style-row">
            <label className="style-label">Body Font</label>
            <select
              className="style-select"
              value={settings.bodyFont ?? 'DM Sans'}
              onChange={e => onUpdate('bodyFont', e.target.value)}
            >
              {CL_FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Visual margin diagram */}
          <div className="margin-diagram">
            <div className="margin-diagram-page">
              <div className="margin-diagram-top" style={{ height: `${(settings.marginTop / MARGIN_MAX) * 40 + 8}px` }}>
                <span>{settings.marginTop}"</span>
              </div>
              <div className="margin-diagram-middle">
                <div className="margin-diagram-left" style={{ width: `${(settings.marginLeft / MARGIN_MAX) * 40 + 8}px` }}>
                  <span>{settings.marginLeft}"</span>
                </div>
                <div className="margin-diagram-content">
                  <div className="margin-diagram-lines">
                    {[80, 60, 70, 50, 65].map((w, i) => (
                      <div key={i} className="margin-diagram-line" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <div className="margin-diagram-right" style={{ width: `${(settings.marginRight / MARGIN_MAX) * 40 + 8}px` }}>
                  <span>{settings.marginRight}"</span>
                </div>
              </div>
              <div className="margin-diagram-bottom" style={{ height: `${(settings.marginBottom / MARGIN_MAX) * 40 + 8}px` }}>
                <span>{settings.marginBottom}"</span>
              </div>
            </div>
          </div>

          {/* Line Height */}
          <div className="margin-sliders">
            <div className="margin-slider-row">
              <div className="margin-slider-header">
                <span className="margin-icon">↕</span>
                <label className="style-label">Line Height</label>
                <EditableValue value={settings.lineHeight ?? 1.6} min={1.0} max={2.2} step={0.05} unit="×" decimals={2} onChange={v => onUpdate('lineHeight', v)} />
              </div>
              <input type="range" min={1.0} max={2.2} step={0.1}
                value={settings.lineHeight ?? 1.6}
                onChange={e => onUpdate('lineHeight', parseFloat(e.target.value))}
                className="style-slider" />
              <div className="margin-slider-ticks">
                <span>1.0×</span><span>1.6×</span><span>2.2×</span>
              </div>
            </div>
          </div>

          {/* Margin sliders */}
          <div className="margin-sliders">
            {[
              { key: 'marginTop',    label: 'Top Margin',    icon: '↑' },
              { key: 'marginBottom', label: 'Bottom Margin', icon: '↓' },
              { key: 'marginLeft',   label: 'Left Margin',   icon: '←' },
              { key: 'marginRight',  label: 'Right Margin',  icon: '→' },
            ].map(({ key, label, icon }) => (
              <div className="margin-slider-row" key={key}>
                <div className="margin-slider-header">
                  <span className="margin-icon">{icon}</span>
                  <label className="style-label">{label}</label>
                  <EditableValue value={settings[key] ?? 1.0} min={MARGIN_MIN} max={MARGIN_MAX} step={0.05} unit='"' decimals={2} onChange={v => onUpdate(key, v)} />
                </div>
                <input type="range" min={MARGIN_MIN} max={MARGIN_MAX} step={MARGIN_STEP}
                  value={settings[key] ?? 1.0}
                  onChange={e => onUpdate(key, parseFloat(e.target.value))}
                  className="style-slider" />
                <div className="margin-slider-ticks">
                  <span>0.25"</span><span>1.00"</span><span>2.00"</span>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-reset-margins" onClick={reset}>
            ↺ Reset to template defaults
          </button>

          <div className="page-info-box">
            <div className="page-info-row">
              <span>Paper Size</span>
              <strong>US Letter — 8.5 × 11 in</strong>
            </div>
            <div className="page-info-row">
              <span>Content Width</span>
              <strong>{(8.5 - (settings.marginLeft ?? 1) - (settings.marginRight ?? 1)).toFixed(2)}" available</strong>
            </div>
            <div className="page-info-row">
              <span>Content Height</span>
              <strong>{(11 - (settings.marginTop ?? 1) - (settings.marginBottom ?? 1)).toFixed(2)}" per page</strong>
            </div>
          </div>
        </div>
  );
}

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
// ─────────────────────────────────────────────────────────
function LetterBody({ coverLetter, resumeData, templateStyles, pageSettings, bodyRef }) {
  const scheme  = getScheme(pageSettings.colorScheme ?? 'teal');
  const accent  = scheme.accent;
  const noColor = (pageSettings.colorScheme ?? 'teal') === 'none';
  const align   = templateStyles.headerAlign ?? 'left';
  const font    = pageSettings.bodyFont ?? 'DM Sans';
  const lh      = pageSettings.lineHeight ?? 1.6;

  const personal = resumeData?.personal ?? {};
  const name     = personal.name  || coverLetter.standaloneInfo?.name  || '';
  const title    = personal.title || coverLetter.standaloneInfo?.title || '';

  const { sections, targetCompany, targetRole, hiringManagerName, customDate, showDate } = coverLetter;

  const contactItems = [
    personal.email    || coverLetter.standaloneInfo?.email,
    personal.phone    || coverLetter.standaloneInfo?.phone,
    personal.location || coverLetter.standaloneInfo?.location,
    personal.linkedin || coverLetter.standaloneInfo?.linkedin,
  ].filter(Boolean);

  const salutation = hiringManagerName
    ? `Dear ${hiringManagerName},`
    : 'Dear Hiring Manager,';

  const dateText = customDate ?? TODAY;

  // A section is visible if it's a non-empty string (null = deleted, '' = empty but present)
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
      {showDate && <div className="cl-letter-date">{dateText}</div>}

      {/* ── Salutation ── */}
      <div className="cl-letter-salutation">{salutation}</div>

      {/* ── Body sections (null = deleted, skip entirely) ── */}
      {!hasAnyContent ? (
        <p className="cl-letter-section empty">
          Your cover letter will appear here as you write it…
        </p>
      ) : (
        ['opening', 'body1', 'body2', 'closing'].map(key =>
          (sections[key] !== null && sections[key]) ? (
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
// LetterPreview — paginated with safe cut points
// ─────────────────────────────────────────────────────────
function LetterPreview({ coverLetter, resumeData, templateStyles, pageSettings }) {
  const measureRef = useRef(null);
  const [pageSlices, setPageSlices] = useState([{ start: 0, end: PAGE_H }]);

  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH);

  const bodyProps = { coverLetter, resumeData, templateStyles, pageSettings };

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

    // Small structural elements that must not be split at all
    const atomics = Array.from(el.querySelectorAll(
      '.cl-letter-header, .cl-letter-divider, .cl-letter-date, ' +
      '.cl-letter-salutation, .cl-letter-closing'
    ));

    // Paragraphs CAN be split — but only on a line boundary, not mid-line
    const paras = Array.from(el.querySelectorAll('.cl-letter-section'));

    const cuts = [];
    let searchFrom = 0;

    for (let page = 1; page < rawPages; page++) {
      const idealCut = page * areaH;
      let bestCut    = idealCut; // default: cut exactly at ideal

      // Snap to bottom of an atomic element if it ends before the cut
      for (const elem of atomics) {
        const bottom = elem.offsetTop + elem.offsetHeight;
        if (bottom > searchFrom && bottom <= idealCut) bestCut = bottom;
      }

      // For paragraphs that straddle the cut, snap to the nearest complete line
      for (const para of paras) {
        const top    = para.offsetTop;
        const bottom = para.offsetTop + para.offsetHeight;
        if (top < idealCut && bottom > idealCut) {
          // Compute line height from computed styles
          const style  = window.getComputedStyle(para);
          const lineH  = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.6;
          // How many complete lines fit before the cut
          const lines  = Math.floor((idealCut - top) / lineH);
          const lineCut = top + lines * lineH;
          if (lineCut > searchFrom) bestCut = lineCut;
        }
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
      {/* Hidden measure host */}
      <div style={{ position: 'fixed', left: -9999, top: 0, width: PAGE_W - mLeft - mRight, background: 'white', pointerEvents: 'none' }}>
        <LetterBody {...bodyProps} bodyRef={measureRef} />
      </div>

      {/* Paginated page sheets */}
      {pageSlices.map((slice, i) => (
        <React.Fragment key={i}>
          <div className="cl-page-sheet" style={{ height: PAGE_H, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: mTop, left: mLeft, right: mRight, height: slice.end - slice.start, overflow: 'hidden' }}>
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
// SectionCard — with delete and restore
// ─────────────────────────────────────────────────────────
function SectionCard({ sectionKey, value, onChange, onDelete, onRestore, onRegenerate, loading }) {
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

  // Deleted state — show restore button
  if (value === null) {
    return (
      <button className="btn-cl-restore-section" onClick={() => onRestore(sectionKey)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add {SECTION_LABELS[sectionKey]}
      </button>
    );
  }

  return (
    <div className="cl-section-card">
      <div className="cl-section-header">
        <span className="cl-section-label">{SECTION_LABELS[sectionKey]}</span>
        <div className="cl-section-header-actions">
          <button className="btn-cl-regenerate" onClick={handleRegenerate} disabled={generating || loading}>
            {generating ? '…' : '✨'} {generating ? 'Writing…' : value ? 'Rewrite' : 'Generate'}
          </button>
          <button className="btn-cl-icon" onClick={() => onDelete(sectionKey)} title={`Remove ${SECTION_LABELS[sectionKey]}`}>✕</button>
        </div>
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
// StandaloneInfoForm
// ─────────────────────────────────────────────────────────
function StandaloneInfoForm({ info, onChange }) {
  const set = (field, val) => onChange({ ...info, [field]: val });
  return (
    <div className="cl-standalone-fields">
      <div className="cl-standalone-banner">
        💡 No resume linked. Fill in your details so the AI has context to write your cover letter.
      </div>
      {[
        { key: 'name',     label: 'Full Name',    placeholder: 'Jane Smith' },
        { key: 'title',    label: 'Current Title', placeholder: 'Software Engineer' },
        { key: 'email',    label: 'Email',         placeholder: 'jane@email.com' },
        { key: 'phone',    label: 'Phone',         placeholder: '+1 (555) 000-0000' },
        { key: 'location', label: 'Location',      placeholder: 'Austin, TX' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} className="cl-target-field">
          <label className="cl-target-label">{label}</label>
          <input className="cl-target-input" value={info[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
        </div>
      ))}
      <div className="cl-target-field">
        <label className="cl-target-label">Key Skills (comma separated)</label>
        <input className="cl-target-input" value={(info.skills || []).join(', ')} onChange={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="React, Node.js, Leadership…" />
      </div>
      <div className="cl-target-field">
        <label className="cl-target-label">Experience Summary</label>
        <textarea className="cl-target-input" value={info.experienceSummary || ''} onChange={e => set('experienceSummary', e.target.value)} placeholder="Brief overview of your work history…" rows={3} style={{ resize: 'vertical' }} />
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
  templateDefaultPageSettings,
  templateName,
  onBack,
  onChange,
  personName,
}) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [activeTab,     setActiveTab]     = useState('content'); // 'content' | 'page'
  const pdfCaptureRef = useRef(null);

  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH);

  // ── Updaters ─────────────────────────────────────────
  const update       = (field, val) => onChange({ ...coverLetter, [field]: val });
  const updateSect   = (key, val)   => onChange({ ...coverLetter, sections: { ...coverLetter.sections, [key]: val } });
  const deleteSection= (key)        => onChange({ ...coverLetter, sections: { ...coverLetter.sections, [key]: null } });
  const restoreSection=(key)        => onChange({ ...coverLetter, sections: { ...coverLetter.sections, [key]: '' } });
  const updateStandaloneInfo = (info) => onChange({ ...coverLetter, standaloneInfo: info });

  // ── PDF download ──────────────────────────────────────
  const handleDownload = async () => {
    const el = pdfCaptureRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF }                = await import('jspdf');
      const rect = el.getBoundingClientRect();
      const contentCanvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        scrollX: -rect.left, scrollY: -rect.top,
        windowWidth: PAGE_W - mLeft - mRight,
        windowHeight: el.scrollHeight + 50,
      });
      const scale   = 2;
      const pageW   = Math.round(PAGE_W * scale);
      const pageH   = Math.round(PAGE_H * scale);
      const mTopPx  = Math.round(mTop  * scale);
      const mLeftPx = Math.round(mLeft * scale);
      const areaH   = pageH - Math.round(mTop * scale) - Math.round(mBottom * scale);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      let srcY = 0, pageNum = 0;
      while (srcY < contentCanvas.height) {
        if (pageNum > 0) pdf.addPage();
        const srcH       = Math.min(areaH, contentCanvas.height - srcY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = pageW; pageCanvas.height = pageH;
        const ctx        = pageCanvas.getContext('2d');
        ctx.fillStyle    = '#ffffff'; ctx.fillRect(0, 0, pageW, pageH);
        ctx.drawImage(contentCanvas, 0, srcY, contentCanvas.width, srcH, mLeftPx, mTopPx, contentCanvas.width, srcH);
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, 8.5, 11);
        pageCanvas.width = 0;
        srcY += areaH; pageNum++;
      }
      pdf.save(`${personName || 'cover_letter'}_cover_letter.pdf`);
    } catch (err) {
      console.error('CL PDF export failed:', err);
    }
  };

  // ── AI ────────────────────────────────────────────────
  const buildResumeInfo = () => {
    if (resumeData) {
      return {
        name: resumeData.personal?.name, title: resumeData.personal?.title,
        email: resumeData.personal?.email, phone: resumeData.personal?.phone,
        location: resumeData.personal?.location, linkedin: resumeData.personal?.linkedin,
        summary: resumeData.personal?.summary, skills: resumeData.skills,
        experience: resumeData.experience, education: resumeData.education,
      };
    }
    const si = coverLetter.standaloneInfo || {};
    return {
      name: si.name, title: si.title, email: si.email, phone: si.phone,
      location: si.location, skills: si.skills || [],
      experience: si.experienceSummary ? [{ role: si.title || '', company: si.experienceSummary }] : [],
    };
  };

  const handleRegenerateSection = async (sectionKey, existingText) =>
    generateCoverLetterSection({
      section: sectionKey, targetCompany: coverLetter.targetCompany,
      targetRole: coverLetter.targetRole, existingText, resumeInfo: buildResumeInfo(),
    });

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      const sections = await generateCoverLetterAll({
        targetCompany: coverLetter.targetCompany, targetRole: coverLetter.targetRole,
        resumeInfo: buildResumeInfo(),
      });
      onChange({ ...coverLetter, sections });
    } catch (e) { console.error('Generate all failed:', e); }
    finally { setGeneratingAll(false); }
  };

  const hasContent = Object.values(coverLetter.sections).some(s => s && s.trim());
  const bodyProps  = { coverLetter, resumeData, templateStyles, pageSettings };
  const showDate   = coverLetter.showDate !== false;
  const customDate = coverLetter.customDate ?? null;

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

          {/* Tab nav — matches resume editor */}
          <nav className="section-nav">
            <button
              className={`nav-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <span className="nav-icon">✉️</span>
              <span>Content</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'page' ? 'active' : ''}`}
              onClick={() => setActiveTab('page')}
            >
              <span className="nav-icon">📐</span>
              <span>Page Setup</span>
            </button>
          </nav>

          {/* Content tab */}
          {activeTab === 'content' && (
            <>
              <div className="cl-target-row">
                <div className="cl-target-field">
                  <label className="cl-target-label">Target Company</label>
                  <input className="cl-target-input" value={coverLetter.targetCompany} onChange={e => update('targetCompany', e.target.value)} placeholder="Acme Corp" />
                </div>
                <div className="cl-target-field">
                  <label className="cl-target-label">Target Role</label>
                  <input className="cl-target-input" value={coverLetter.targetRole} onChange={e => update('targetRole', e.target.value)} placeholder="Software Engineer" />
                </div>
              </div>

              <div className="cl-target-row">
                <div className="cl-target-field">
                  <label className="cl-target-label">Hiring Manager Name</label>
                  <input className="cl-target-input" value={coverLetter.hiringManagerName || ''} onChange={e => update('hiringManagerName', e.target.value)} placeholder="e.g. Sarah Johnson (optional)" />
                </div>
                <div className="cl-target-field">
                  <label className="cl-target-label">
                    Date
                    {showDate ? (
                      <button className="btn-cl-icon" onClick={() => update('showDate', false)} title="Remove date">✕</button>
                    ) : (
                      <button className="btn-cl-field-restore" onClick={() => update('showDate', true)}>+ Add date</button>
                    )}
                  </label>
                  {showDate && (
                    <input className="cl-target-input" value={customDate ?? TODAY} onChange={e => update('customDate', e.target.value)} placeholder={TODAY} />
                  )}
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
                  <SectionCard
                    key={key}
                    sectionKey={key}
                    value={coverLetter.sections[key]}
                    onChange={updateSect}
                    onDelete={deleteSection}
                    onRestore={restoreSection}
                    onRegenerate={handleRegenerateSection}
                    loading={generatingAll}
                  />
                ))}
              </div>
            </>
          )}

          {/* Page Setup tab */}
          {activeTab === 'page' && (
            <div className="form-content animate-in">
              <CLPageSetupForm
                settings={pageSettings}
                onUpdate={(field, val) => {
                  if (field === '__reset__') {
                    onChange({ ...coverLetter, pageSettings: val });
                  } else {
                    onChange({ ...coverLetter, pageSettings: { ...pageSettings, [field]: val } });
                  }
                }}
                defaultSettings={templateDefaultPageSettings}
              />
            </div>
          )}
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

      {/* Hidden PDF capture host — body only, no page wrapper */}
      <div style={{ position: 'fixed', left: -9999, top: 0, width: PAGE_W - mLeft - mRight, background: 'white', pointerEvents: 'none' }}>
        <LetterBody {...bodyProps} bodyRef={pdfCaptureRef} />
      </div>
    </div>
  );
}
