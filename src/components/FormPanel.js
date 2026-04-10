import React, { useState } from 'react';
import './FormPanel.css';
import { suggestSummary, suggestBullets } from '../ai';

const SECTIONS = [
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'page', label: 'Page Setup', icon: '📐' },
];

export default function FormPanel({
  resume, activeSection, setActiveSection,
  updatePersonal,
  addExperience, updateExperience, removeExperience,
  addEducation, updateEducation, removeEducation,
  addSkill, removeSkill,
  sectionStyles, updateSectionStyle,
  pageSettings, updatePageSetting,
}) {
  return (
    <div className="form-panel">
      <nav className="section-nav">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`nav-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="nav-icon">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="form-content animate-in" key={activeSection}>
        {activeSection === 'personal' && (
          <PersonalForm
            data={resume.personal}
            update={updatePersonal}
            styles={sectionStyles.personal}
            updateStyle={(field, value) => updateSectionStyle('personal', field, value)}
            resume={resume}
          />
        )}
        {activeSection === 'experience' && (
          <ExperienceForm
            items={resume.experience}
            add={addExperience}
            update={updateExperience}
            remove={removeExperience}
            styles={sectionStyles.experience}
            updateStyle={(field, value) => updateSectionStyle('experience', field, value)}
          />
        )}
        {activeSection === 'education' && (
          <EducationForm
            items={resume.education}
            add={addEducation}
            update={updateEducation}
            remove={removeEducation}
            styles={sectionStyles.education}
            updateStyle={(field, value) => updateSectionStyle('education', field, value)}
          />
        )}
        {activeSection === 'skills' && (
          <SkillsForm
            skills={resume.skills}
            add={addSkill}
            remove={removeSkill}
            styles={sectionStyles.skills}
            updateStyle={(field, value) => updateSectionStyle('skills', field, value)}
          />
        )}
        {activeSection === 'page' && (
          <PageSetupForm settings={pageSettings} update={updatePageSetting} />
        )}
      </div>
    </div>
  );
}

// ── Personal ──────────────────────────────────────────────
function PersonalForm({ data, update, styles, updateStyle, resume }) {
  const [styleOpen, setStyleOpen] = useState(false);
  const [suggestingSum, setSuggestingSum] = useState(false);
  const [suggestedSummary, setSuggestedSummary] = useState(null);

  const handleSuggestSummary = async () => {
    setSuggestingSum(true);
    try {
      const summary = await suggestSummary({
        name: data.name,
        title: data.title,
        skills: resume.skills,
        experience: resume.experience,
        existingSummary: data.summary,
      });
      setSuggestedSummary(summary);
    } catch (err) {
      alert('AI suggestion failed: ' + err.message);
    } finally {
      setSuggestingSum(false);
    }
  };

  const acceptSummary  = () => { update('summary', suggestedSummary); setSuggestedSummary(null); };
  const discardSummary = () => setSuggestedSummary(null);

  const reset = () => {
    updateStyle('headerAlign', 'left');
    updateStyle('showIcons', true);
  };

  return (
    <div className="form-section">
      <h2 className="section-heading">Personal Information</h2>

      {/* Style Options collapsible */}
      <div className="style-toolbar">
        <button className="style-toolbar-toggle" onClick={() => setStyleOpen(o => !o)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
          Style Options
          <span className="style-toolbar-chevron">{styleOpen ? '▲' : '▼'}</span>
        </button>
        {styleOpen && (
          <div className="style-toolbar-body">

            {/* Header alignment */}
            <div className="style-row">
              <label className="style-label">Header Alignment</label>
              <div className="align-toggle">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    className={`align-btn ${styles.headerAlign === align ? 'active' : ''}`}
                    onClick={() => updateStyle('headerAlign', align)}
                    title={align.charAt(0).toUpperCase() + align.slice(1)}
                  >
                    {align === 'left'   && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>}
                    {align === 'center' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>}
                    {align === 'right'  && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>}
                    <span>{align.charAt(0).toUpperCase() + align.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icons toggle */}
            <div className="style-row">
              <label className="style-label">Contact Icons</label>
              <button
                className={`sep-btn ${styles.showIcons ? 'active' : ''}`}
                onClick={() => updateStyle('showIcons', !styles.showIcons)}
              >
                Show Icons
              </button>
            </div>

            <button className="btn-reset-margins" onClick={reset}>
              ↺ Reset to defaults
            </button>
          </div>
        )}
      </div>
      <Field label="Full Name" value={data.name} onChange={v => update('name', v)} placeholder="John Smith" />
      <Field label="Professional Title" value={data.title} onChange={v => update('title', v)} placeholder="Senior Software Engineer" />
      <div className="field-row">
        <Field label="Email" value={data.email} onChange={v => update('email', v)} placeholder="john@email.com" type="email" />
        <Field label="Phone" value={data.phone} onChange={v => update('phone', v)} placeholder="+1 555 000 0000" />
      </div>
      <Field label="Location" value={data.location} onChange={v => update('location', v)} placeholder="Boston, MA" />
      <div className="field-row">
        <Field label="LinkedIn URL" value={data.linkedin} onChange={v => update('linkedin', v)} placeholder="linkedin.com/in/john" />
        <Field label="Website" value={data.website} onChange={v => update('website', v)} placeholder="johnsmith.dev" />
      </div>
      <div className="ai-field-wrapper">
        <div className="ai-field-label-row">
          <span className="field-label">Professional Summary</span>
          <button className="btn-ai-suggest" onClick={handleSuggestSummary} disabled={suggestingSum}>
            {suggestingSum ? '⏳ Writing…' : data.summary?.trim() ? '✨ Improve' : '✨ Suggest'}
          </button>
        </div>
        <textarea
          className="field-input"
          value={data.summary}
          onChange={e => update('summary', e.target.value)}
          placeholder="A brief 2–3 sentence overview of your professional background and goals…"
          rows={4}
        />
        {suggestedSummary && (
          <div className="ai-preview">
            <div className="ai-preview-label">✨ AI Suggestion</div>
            <p className="ai-preview-text">{suggestedSummary}</p>
            <div className="ai-preview-actions">
              <button className="btn-ai-accept" onClick={acceptSummary}>✅ Accept</button>
              <button className="btn-ai-discard" onClick={discardSummary}>✕ Discard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Style Toolbar ─────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
];

function StyleToolbar({ styles, updateStyle, showBulletSpacing = false }) {
  const [open, setOpen] = useState(false);

  const reset = () => {
    updateStyle('fontFamily', 'DM Sans');
    updateStyle('fontSize', 13);
    if (showBulletSpacing) updateStyle('bulletSpacing', 3);
  };

  return (
    <div className="style-toolbar">
      <button className="style-toolbar-toggle" onClick={() => setOpen(o => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
        </svg>
        Style Options
        <span className="style-toolbar-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="style-toolbar-body">
          {/* Font Family */}
          <div className="style-row">
            <label className="style-label">Font</label>
            <select
              className="style-select"
              value={styles.fontFamily}
              onChange={e => updateStyle('fontFamily', e.target.value)}
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="style-row">
            <label className="style-label">Size <span className="style-value">{styles.fontSize}px</span></label>
            <input
              type="range" min={10} max={16} step={0.5}
              value={styles.fontSize}
              onChange={e => updateStyle('fontSize', parseFloat(e.target.value))}
              className="style-slider"
            />
          </div>

          {/* Bullet Spacing (only for experience) */}
          {showBulletSpacing && (
            <div className="style-row">
              <label className="style-label">Bullet Spacing <span className="style-value">{styles.bulletSpacing}px</span></label>
              <input
                type="range" min={0} max={12} step={1}
                value={styles.bulletSpacing}
                onChange={e => updateStyle('bulletSpacing', parseInt(e.target.value))}
                className="style-slider"
              />
            </div>
          )}

          <button className="btn-reset-margins" onClick={reset}>
            ↺ Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}

// ── Experience ────────────────────────────────────────────
function ExperienceForm({ items, add, update, remove, styles, updateStyle }) {
  return (
    <div className="form-section">
      <h2 className="section-heading">Work Experience</h2>
      <StyleToolbar styles={styles} updateStyle={updateStyle} showBulletSpacing={true} />
      {items.length === 0 && (
        <p className="empty-hint">No experience added yet. Click the button below to add your first role.</p>
      )}
      {items.map((exp, idx) => (
        <ExperienceCard key={exp.id} exp={exp} idx={idx} update={update} remove={remove} />
      ))}
      <button className="btn-add" onClick={add}>
        <span>+</span> Add Experience
      </button>
    </div>
  );
}

function ExperienceCard({ exp, idx, update, remove }) {
  const [open, setOpen] = useState(true);
  const [suggestingBullets, setSuggestingBullets] = useState(false);
  const [suggestedBullets, setSuggestedBullets] = useState(null); // null | string[]

  const updateBullet = (i, val) => {
    const bullets = [...exp.bullets];
    bullets[i] = val;
    update(exp.id, 'bullets', bullets);
  };
  const addBullet    = () => update(exp.id, 'bullets', [...exp.bullets, '']);
  const removeBullet = (i) => update(exp.id, 'bullets', exp.bullets.filter((_, j) => j !== i));

  const handleSuggestBullets = async () => {
    setSuggestingBullets(true);
    try {
      const bullets = await suggestBullets({
        role: exp.role,
        company: exp.company,
        existingBullets: exp.bullets,
      });
      setSuggestedBullets(bullets);
    } catch (err) {
      alert('AI suggestion failed: ' + err.message);
    } finally {
      setSuggestingBullets(false);
    }
  };

  const acceptOneBullet = (suggestion) => {
    const existing = [...exp.bullets];
    if (suggestion.index < existing.length) {
      existing[suggestion.index] = suggestion.text;
      update(exp.id, 'bullets', existing);
    } else {
      update(exp.id, 'bullets', [...existing.filter(b => b.trim()), suggestion.text]);
    }
    setSuggestedBullets(prev => {
      const remaining = prev.filter(s => s.index !== suggestion.index);
      return remaining.length ? remaining : null;
    });
  };

  const acceptAllBullets = () => {
    update(exp.id, 'bullets', suggestedBullets.map(s => s.text));
    setSuggestedBullets(null);
  };

  const discardBullets = () => setSuggestedBullets(null);

  return (
    <div className="card">
      <div className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="card-title">
          <span className="card-index">#{idx + 1}</span>
          <span>{exp.role || exp.company || 'New Position'}</span>
        </div>
        <div className="card-controls">
          <button className="btn-icon" onClick={e => { e.stopPropagation(); remove(exp.id); }} title="Remove">✕</button>
          <span className="card-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="card-body">
          <div className="field-row">
            <Field label="Company" value={exp.company} onChange={v => update(exp.id, 'company', v)} placeholder="Acme Corp" />
            <Field label="Job Title" value={exp.role} onChange={v => update(exp.id, 'role', v)} placeholder="Product Manager" />
          </div>
          <div className="field-row">
            <Field label="Start Date" value={exp.startDate} onChange={v => update(exp.id, 'startDate', v)} placeholder="Jan 2022" />
            <Field label="End Date" value={exp.endDate} onChange={v => update(exp.id, 'endDate', v)} placeholder="Present" disabled={exp.current} />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={exp.current} onChange={e => update(exp.id, 'current', e.target.checked)} />
            I currently work here
          </label>
          <div className="ai-field-label-row">
            <div className="bullets-label">Key Accomplishments</div>
            <button className="btn-ai-suggest" onClick={handleSuggestBullets} disabled={suggestingBullets}>
              {suggestingBullets ? '⏳ Writing…' : exp.bullets.filter(b => b.trim()).length ? '✨ Improve' : '✨ Suggest'}
            </button>
          </div>
          {exp.bullets.map((b, i) => (
            <div className="bullet-row" key={i}>
              <span className="bullet-dot">•</span>
              <textarea
                className="bullet-input"
                value={b}
                onChange={e => updateBullet(i, e.target.value)}
                placeholder="Achieved X by doing Y, resulting in Z…"
                rows={2}
              />
              {exp.bullets.length > 1 && (
                <button className="btn-icon small" onClick={() => removeBullet(i)}>✕</button>
              )}
            </div>
          ))}
          <button className="btn-add-bullet" onClick={addBullet}>+ Add bullet</button>

          {suggestedBullets && (
            <div className="ai-preview">
              <div className="ai-preview-label-row">
                <span className="ai-preview-label">✨ AI Suggestions</span>
                <div className="ai-preview-actions">
                  <button className="btn-ai-accept" onClick={acceptAllBullets}>✅ Accept All</button>
                  <button className="btn-ai-discard" onClick={discardBullets}>✕ Discard</button>
                </div>
              </div>
              {suggestedBullets.map((s) => {
                const isReplace = s.index < exp.bullets.filter(b => b.trim()).length;
                return (
                  <div className="ai-bullet-row" key={s.index}>
                    <div className="ai-bullet-content">
                      <span className={`ai-bullet-tag ${isReplace ? 'tag-replace' : 'tag-add'}`}>
                        {isReplace ? `Replace #${s.index + 1}` : 'Add'}
                      </span>
                      <span className="ai-bullet-text">• {s.text}</span>
                    </div>
                    <button className="btn-ai-accept-one" onClick={() => acceptOneBullet(s)}>✅</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Education ─────────────────────────────────────────────
function EducationForm({ items, add, update, remove, styles, updateStyle }) {
  return (
    <div className="form-section">
      <h2 className="section-heading">Education</h2>
      <StyleToolbar styles={styles} updateStyle={updateStyle} showBulletSpacing={false} />
      {items.length === 0 && (
        <p className="empty-hint">No education added yet.</p>
      )}
      {items.map((edu, idx) => (
        <div className="card" key={edu.id}>
          <div className="card-header">
            <div className="card-title">
              <span className="card-index">#{idx + 1}</span>
              <span>{edu.school || 'New School'}</span>
            </div>
            <button className="btn-icon" onClick={() => remove(edu.id)}>✕</button>
          </div>
          <div className="card-body">
            <Field label="School / University" value={edu.school} onChange={v => update(edu.id, 'school', v)} placeholder="MIT" />
            <div className="field-row">
              <Field label="Degree" value={edu.degree} onChange={v => update(edu.id, 'degree', v)} placeholder="B.S." />
              <Field label="Field of Study" value={edu.field} onChange={v => update(edu.id, 'field', v)} placeholder="Computer Science" />
            </div>
            <div className="field-row">
              <Field label="Start Year" value={edu.startDate} onChange={v => update(edu.id, 'startDate', v)} placeholder="2018" />
              <Field label="End Year" value={edu.endDate} onChange={v => update(edu.id, 'endDate', v)} placeholder="2022" />
              <Field label="GPA (optional)" value={edu.gpa} onChange={v => update(edu.id, 'gpa', v)} placeholder="3.8" />
            </div>
          </div>
        </div>
      ))}
      <button className="btn-add" onClick={add}>
        <span>+</span> Add Education
      </button>
    </div>
  );
}

// ── Skills ────────────────────────────────────────────────
function SkillsForm({ skills, add, remove, styles, updateStyle }) {
  const [input, setInput] = useState('');
  const [styleOpen, setStyleOpen] = useState(false);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) { add(trimmed); setInput(''); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const SUGGESTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'TypeScript', 'AWS', 'Docker', 'Figma', 'Project Management', 'Data Analysis', 'Machine Learning'];

  return (
    <div className="form-section">
      <h2 className="section-heading">Skills</h2>

      {/* Style Options collapsible */}
      <div className="style-toolbar">
        <button className="style-toolbar-toggle" onClick={() => setStyleOpen(o => !o)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
          Style Options
          <span className="style-toolbar-chevron">{styleOpen ? '▲' : '▼'}</span>
        </button>
        {styleOpen && (
          <div className="style-toolbar-body">
            <div className="style-row">
              <label className="style-label">Separator Style</label>
              <div className="separator-toggle">
                <button
                  className={`sep-btn ${styles.separator === 'comma' ? 'active' : ''}`}
                  onClick={() => updateStyle('separator', 'comma')}
                >
                  Comma Separated
                </button>
                <button
                  className={`sep-btn ${styles.separator === 'marker' ? 'active' : ''}`}
                  onClick={() => updateStyle('separator', 'marker')}
                >
                  Marker Separated
                </button>
              </div>
            </div>
            <button className="btn-reset-margins" onClick={() => updateStyle('separator', 'comma')}>
              ↺ Reset to defaults
            </button>
          </div>
        )}
      </div>
      <div className="skills-input-row">
        <input
          className="field-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter…"
        />
        <button className="btn-add-skill" onClick={handleAdd}>Add</button>
      </div>
      <div className="skill-tags">
        {skills.map(s => (
          <span className="skill-tag" key={s}>
            {s} <button onClick={() => remove(s)}>✕</button>
          </span>
        ))}
        {skills.length === 0 && <span className="empty-hint">No skills added yet.</span>}
      </div>
      <div className="suggestions-label">Suggestions:</div>
      <div className="suggestions">
        {SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
          <button key={s} className="suggestion-btn" onClick={() => add(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ── Page Setup ────────────────────────────────────────────
function PageSetupForm({ settings, update }) {
  const MARGIN_MIN = 0.25;
  const MARGIN_MAX = 2.0;
  const MARGIN_STEP = 0.25;

  const reset = () => {
    update('marginTop', 1.0);
    update('marginBottom', 1.0);
    update('marginLeft', 1.0);
    update('marginRight', 1.0);
    update('lineHeight', 1.6);
    update('colorAccents', true);
  };

  return (
    <div className="form-section">
      <h2 className="section-heading">Page Setup</h2>
      <p className="page-setup-desc">
        Adjust margins for your printed resume. The live preview will update in real time.
        All values are in inches.
      </p>

      {/* Color Accents toggle */}
      <div className="style-row">
        <label className="style-label">Color</label>
        <button
          className={`sep-btn ${(settings.colorAccents ?? true) ? 'active' : ''}`}
          onClick={() => update('colorAccents', !(settings.colorAccents ?? true))}
        >
          Color Accents
        </button>
      </div>

      {/* Visual margin diagram */}
      <div className="margin-diagram">
        <div className="margin-diagram-page">
          <div
            className="margin-diagram-top"
            style={{ height: `${(settings.marginTop / MARGIN_MAX) * 40 + 8}px` }}
          >
            <span>{settings.marginTop}"</span>
          </div>
          <div className="margin-diagram-middle">
            <div
              className="margin-diagram-left"
              style={{ width: `${(settings.marginLeft / MARGIN_MAX) * 40 + 8}px` }}
            >
              <span>{settings.marginLeft}"</span>
            </div>
            <div className="margin-diagram-content">
              <div className="margin-diagram-lines">
                {[80, 60, 70, 50, 65].map((w, i) => (
                  <div key={i} className="margin-diagram-line" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div
              className="margin-diagram-right"
              style={{ width: `${(settings.marginRight / MARGIN_MAX) * 40 + 8}px` }}
            >
              <span>{settings.marginRight}"</span>
            </div>
          </div>
          <div
            className="margin-diagram-bottom"
            style={{ height: `${(settings.marginBottom / MARGIN_MAX) * 40 + 8}px` }}
          >
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
            <span className="style-value">{(settings.lineHeight ?? 1.6).toFixed(1)}×</span>
          </div>
          <input
            type="range" min={1.0} max={2.2} step={0.1}
            value={settings.lineHeight ?? 1.6}
            onChange={e => update('lineHeight', parseFloat(e.target.value))}
            className="style-slider"
          />
          <div className="margin-slider-ticks">
            <span>1.0×</span>
            <span>1.6×</span>
            <span>2.2×</span>
          </div>
        </div>
      </div>

      {/* Margin sliders */}
      <div className="margin-sliders">
        {[
          { key: 'marginTop', label: 'Top Margin', icon: '↑' },
          { key: 'marginBottom', label: 'Bottom Margin', icon: '↓' },
          { key: 'marginLeft', label: 'Left Margin', icon: '←' },
          { key: 'marginRight', label: 'Right Margin', icon: '→' },
        ].map(({ key, label, icon }) => (
          <div className="margin-slider-row" key={key}>
            <div className="margin-slider-header">
              <span className="margin-icon">{icon}</span>
              <label className="style-label">{label}</label>
              <span className="style-value">{settings[key].toFixed(2)}"</span>
            </div>
            <input
              type="range"
              min={MARGIN_MIN}
              max={MARGIN_MAX}
              step={MARGIN_STEP}
              value={settings[key]}
              onChange={e => update(key, parseFloat(e.target.value))}
              className="style-slider"
            />
            <div className="margin-slider-ticks">
              <span>0.25"</span>
              <span>1.00"</span>
              <span>2.00"</span>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-reset-margins" onClick={reset}>
        ↺ Reset to defaults (1" all sides)
      </button>

      <div className="page-info-box">
        <div className="page-info-row">
          <span>Paper Size</span>
          <strong>US Letter — 8.5 × 11 in</strong>
        </div>
        <div className="page-info-row">
          <span>Orientation</span>
          <strong>Portrait</strong>
        </div>
        <div className="page-info-row">
          <span>Content Width</span>
          <strong>{(8.5 - settings.marginLeft - settings.marginRight).toFixed(2)}" available</strong>
        </div>
        <div className="page-info-row">
          <span>Content Height</span>
          <strong>{(11 - settings.marginTop - settings.marginBottom).toFixed(2)}" per page</strong>
        </div>
      </div>
    </div>
  );
}

// ── Shared Field ──────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', multiline = false, disabled = false }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {multiline ? (
        <textarea
          className="field-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          disabled={disabled}
        />
      ) : (
        <input
          className="field-input"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}
