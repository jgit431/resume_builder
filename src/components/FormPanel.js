import React, { useState } from 'react';
import './FormPanel.css';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
];

export default function FormPanel({
  resume, activeSection, setActiveSection,
  updatePersonal,
  addExperience, updateExperience, removeExperience,
  addEducation, updateEducation, removeEducation,
  addSkill, removeSkill,
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
          <PersonalForm data={resume.personal} update={updatePersonal} />
        )}
        {activeSection === 'experience' && (
          <ExperienceForm
            items={resume.experience}
            add={addExperience}
            update={updateExperience}
            remove={removeExperience}
          />
        )}
        {activeSection === 'education' && (
          <EducationForm
            items={resume.education}
            add={addEducation}
            update={updateEducation}
            remove={removeEducation}
          />
        )}
        {activeSection === 'skills' && (
          <SkillsForm skills={resume.skills} add={addSkill} remove={removeSkill} />
        )}
      </div>
    </div>
  );
}

// ── Personal ──────────────────────────────────────────────
function PersonalForm({ data, update }) {
  return (
    <div className="form-section">
      <h2 className="section-heading">Personal Information</h2>
      <Field label="Full Name" value={data.name} onChange={v => update('name', v)} placeholder="Jane Smith" />
      <Field label="Professional Title" value={data.title} onChange={v => update('title', v)} placeholder="Senior Product Designer" />
      <div className="field-row">
        <Field label="Email" value={data.email} onChange={v => update('email', v)} placeholder="jane@email.com" type="email" />
        <Field label="Phone" value={data.phone} onChange={v => update('phone', v)} placeholder="+1 555 000 0000" />
      </div>
      <Field label="Location" value={data.location} onChange={v => update('location', v)} placeholder="Boston, MA" />
      <div className="field-row">
        <Field label="LinkedIn URL" value={data.linkedin} onChange={v => update('linkedin', v)} placeholder="linkedin.com/in/jane" />
        <Field label="Website" value={data.website} onChange={v => update('website', v)} placeholder="janesmith.com" />
      </div>
      <Field
        label="Professional Summary"
        value={data.summary}
        onChange={v => update('summary', v)}
        placeholder="A brief 2–3 sentence overview of your professional background and goals…"
        multiline
      />
    </div>
  );
}

// ── Experience ────────────────────────────────────────────
function ExperienceForm({ items, add, update, remove }) {
  return (
    <div className="form-section">
      <h2 className="section-heading">Work Experience</h2>
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

  const updateBullet = (i, val) => {
    const bullets = [...exp.bullets];
    bullets[i] = val;
    update(exp.id, 'bullets', bullets);
  };
  const addBullet = () => update(exp.id, 'bullets', [...exp.bullets, '']);
  const removeBullet = (i) => update(exp.id, 'bullets', exp.bullets.filter((_, j) => j !== i));

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
          <div className="bullets-label">Key Accomplishments</div>
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
        </div>
      )}
    </div>
  );
}

// ── Education ─────────────────────────────────────────────
function EducationForm({ items, add, update, remove }) {
  return (
    <div className="form-section">
      <h2 className="section-heading">Education</h2>
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
function SkillsForm({ skills, add, remove }) {
  const [input, setInput] = useState('');

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
