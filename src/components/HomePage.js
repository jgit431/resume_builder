import React, { useRef } from 'react';
import './HomePage.css';

// ── Template definitions ────────────────────────────────────
export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and traditional. Timeless for any industry.',
    styles: {
      personal:   { headerAlign: 'left', showIcons: true },
      experience: { fontFamily: 'DM Sans', fontSize: 13, bulletSpacing: 3 },
      education:  { fontFamily: 'DM Sans', fontSize: 13 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0, lineHeight: 1.6, colorAccents: true },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Centered header with marker-style skills. Bold and contemporary.',
    styles: {
      personal:   { headerAlign: 'center', showIcons: true },
      experience: { fontFamily: 'DM Sans', fontSize: 13, bulletSpacing: 5 },
      education:  { fontFamily: 'DM Sans', fontSize: 13 },
      skills:     { separator: 'marker' },
    },
    pageSettings: { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75, lineHeight: 1.7, colorAccents: true },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Serif fonts with generous spacing. Refined and authoritative.',
    styles: {
      personal:   { headerAlign: 'center', showIcons: false },
      experience: { fontFamily: 'Georgia', fontSize: 13, bulletSpacing: 6 },
      education:  { fontFamily: 'Georgia', fontSize: 13 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.25, marginRight: 1.25, lineHeight: 1.8, colorAccents: false },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Black and white, tight margins. Let the content speak.',
    styles: {
      personal:   { headerAlign: 'left', showIcons: false },
      experience: { fontFamily: 'DM Sans', fontSize: 12, bulletSpacing: 2 },
      education:  { fontFamily: 'DM Sans', fontSize: 12 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75, lineHeight: 1.5, colorAccents: false },
  },
];

// ── Template thumbnail SVGs ────────────────────────────────
function TemplateThumbnail({ id }) {
  const thumbs = {
    classic: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="white"/>
        {/* Name */}
        <rect x="10" y="12" width="60" height="7" rx="1" fill="#1a1a1a"/>
        {/* Title */}
        <rect x="10" y="23" width="40" height="4" rx="1" fill="#888"/>
        {/* Contact row */}
        <rect x="10" y="31" width="20" height="3" rx="1" fill="#bbb"/>
        <rect x="34" y="31" width="20" height="3" rx="1" fill="#bbb"/>
        <rect x="58" y="31" width="20" height="3" rx="1" fill="#bbb"/>
        {/* Divider */}
        <rect x="10" y="38" width="100" height="1.5" fill="#1a1a1a"/>
        {/* Section title */}
        <rect x="10" y="44" width="35" height="3" rx="1" fill="#2a6b6b"/>
        <rect x="10" y="49" width="100" height="0.5" fill="#ddd"/>
        {/* Entry */}
        <rect x="10" y="54" width="50" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="60" width="100" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="65" width="90" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="70" width="95" height="2.5" rx="1" fill="#eee"/>
        {/* Entry 2 */}
        <rect x="10" y="79" width="50" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="85" width="100" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="90" width="85" height="2.5" rx="1" fill="#eee"/>
        {/* Education section */}
        <rect x="10" y="100" width="35" height="3" rx="1" fill="#2a6b6b"/>
        <rect x="10" y="105" width="100" height="0.5" fill="#ddd"/>
        <rect x="10" y="110" width="55" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="116" width="40" height="2.5" rx="1" fill="#eee"/>
        {/* Skills */}
        <rect x="10" y="126" width="28" height="3" rx="1" fill="#2a6b6b"/>
        <rect x="10" y="131" width="100" height="0.5" fill="#ddd"/>
        <rect x="10" y="136" width="100" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="141" width="70" height="2.5" rx="1" fill="#eee"/>
      </svg>
    ),
    modern: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="white"/>
        {/* Centered name */}
        <rect x="25" y="12" width="70" height="7" rx="1" fill="#1a1a1a"/>
        {/* Centered title */}
        <rect x="35" y="23" width="50" height="4" rx="1" fill="#888"/>
        {/* Centered contact */}
        <rect x="15" y="31" width="22" height="3" rx="1" fill="#bbb"/>
        <rect x="42" y="31" width="22" height="3" rx="1" fill="#bbb"/>
        <rect x="69" y="31" width="22" height="3" rx="1" fill="#bbb"/>
        <rect x="10" y="38" width="100" height="1.5" fill="#1a1a1a"/>
        {/* Section */}
        <rect x="10" y="44" width="35" height="3" rx="1" fill="#2a6b6b"/>
        <rect x="10" y="49" width="100" height="0.5" fill="#ddd"/>
        <rect x="10" y="54" width="55" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="60" width="100" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="66" width="88" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="72" width="95" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="81" width="50" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="87" width="100" height="2.5" rx="1" fill="#eee"/>
        <rect x="10" y="93" width="75" height="2.5" rx="1" fill="#eee"/>
        {/* Skills with markers */}
        <rect x="10" y="103" width="28" height="3" rx="1" fill="#2a6b6b"/>
        <rect x="10" y="108" width="100" height="0.5" fill="#ddd"/>
        <circle cx="13" cy="115" r="1.5" fill="#2a6b6b"/>
        <rect x="17" y="113" width="18" height="3" rx="1" fill="#eee"/>
        <circle cx="40" cy="115" r="1.5" fill="#2a6b6b"/>
        <rect x="44" y="113" width="18" height="3" rx="1" fill="#eee"/>
        <circle cx="67" cy="115" r="1.5" fill="#2a6b6b"/>
        <rect x="71" y="113" width="18" height="3" rx="1" fill="#eee"/>
        <circle cx="13" cy="122" r="1.5" fill="#2a6b6b"/>
        <rect x="17" y="120" width="18" height="3" rx="1" fill="#eee"/>
        <circle cx="40" cy="122" r="1.5" fill="#2a6b6b"/>
        <rect x="44" y="120" width="22" height="3" rx="1" fill="#eee"/>
      </svg>
    ),
    executive: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="white"/>
        {/* Centered name, serif-style (taller) */}
        <rect x="20" y="10" width="80" height="9" rx="1" fill="#1a1a1a"/>
        <rect x="35" y="23" width="50" height="4" rx="1" fill="#555"/>
        <rect x="10" y="31" width="100" height="1.5" fill="#1a1a1a"/>
        <rect x="10" y="35" width="100" height="1" fill="#1a1a1a"/>
        {/* Sections — no color, serif feel */}
        <rect x="10" y="42" width="35" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="47" width="100" height="0.5" fill="#999"/>
        <rect x="10" y="52" width="55" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="58" width="100" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="64" width="90" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="70" width="95" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="79" width="50" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="85" width="100" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="91" width="80" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="100" width="35" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="105" width="100" height="0.5" fill="#999"/>
        <rect x="10" y="110" width="55" height="3.5" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="116" width="40" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="126" width="28" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="10" y="131" width="100" height="0.5" fill="#999"/>
        <rect x="10" y="136" width="100" height="2.5" rx="1" fill="#e8e8e8"/>
        <rect x="10" y="141" width="80" height="2.5" rx="1" fill="#e8e8e8"/>
      </svg>
    ),
    minimal: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="white"/>
        <rect x="8" y="10" width="55" height="6" rx="1" fill="#1a1a1a"/>
        <rect x="8" y="19" width="35" height="3.5" rx="1" fill="#666"/>
        <rect x="8" y="26" width="16" height="2.5" rx="1" fill="#bbb"/>
        <rect x="28" y="26" width="16" height="2.5" rx="1" fill="#bbb"/>
        <rect x="48" y="26" width="16" height="2.5" rx="1" fill="#bbb"/>
        <rect x="8" y="32" width="104" height="0.75" fill="#1a1a1a"/>
        <rect x="8" y="36" width="30" height="2.5" rx="1" fill="#555"/>
        <rect x="8" y="40" width="104" height="0.5" fill="#ccc"/>
        <rect x="8" y="44" width="48" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="8" y="49" width="104" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="53" width="90" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="57" width="96" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="64" width="48" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="8" y="69" width="104" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="73" width="84" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="80" width="48" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="8" y="85" width="104" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="89" width="70" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="96" width="30" height="2.5" rx="1" fill="#555"/>
        <rect x="8" y="100" width="104" height="0.5" fill="#ccc"/>
        <rect x="8" y="104" width="50" height="3" rx="1" fill="#1a1a1a"/>
        <rect x="8" y="109" width="36" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="116" width="30" height="2.5" rx="1" fill="#555"/>
        <rect x="8" y="120" width="104" height="0.5" fill="#ccc"/>
        <rect x="8" y="124" width="104" height="2" rx="1" fill="#efefef"/>
        <rect x="8" y="128" width="80" height="2" rx="1" fill="#efefef"/>
      </svg>
    ),
  };
  return thumbs[id] || null;
}

// ── HomePage ───────────────────────────────────────────────
export default function HomePage({ onSelectTemplate, onImport, onBlank, uploadStatus }) {
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') onImport(file);
    e.target.value = '';
  };

  const statusLabel = {
    parsing: '⏳ Parsing your resume…',
    done: '✅ Resume imported!',
    error: '❌ Could not parse PDF',
  };

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <header className="home-header">
        <div className="home-logo">
          <img src={`${process.env.PUBLIC_URL}/logos/logo.png`} alt="Cedar Resumes" className="home-logo-img" />
          <div className="home-logo-text">
            <span className="home-logo-name">Cedar Resumes</span>
            <span className="home-logo-tagline">Build it. Love it. Ship it.</span>
          </div>
        </div>
      </header>

      {/* ── Entry points ── */}
      <main className="home-main">
        <div className="home-actions">
          <button className="home-action-btn blank" onClick={onBlank}>
            <span className="home-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </span>
            <span className="home-action-title">Start from Scratch</span>
            <span className="home-action-desc">Build your resume step by step with a clean slate</span>
          </button>

          <button className="home-action-btn import" onClick={() => fileRef.current.click()}>
            <span className="home-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </span>
            <span className="home-action-title">Import Existing Resume</span>
            <span className="home-action-desc">Upload a PDF and we'll extract your information automatically</span>
            {uploadStatus && (
              <span className={`home-upload-status status-${uploadStatus}`}>
                {statusLabel[uploadStatus]}
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        {/* ── Templates ── */}
        <div className="home-templates-section">
          <h2 className="home-section-title">Or start with a template</h2>
          <div className="home-templates-grid">
            {TEMPLATES.map(t => (
              <button key={t.id} className="template-card" onClick={() => onSelectTemplate(t)}>
                <div className="template-thumb">
                  <TemplateThumbnail id={t.id} />
                </div>
                <div className="template-info">
                  <span className="template-name">{t.name}</span>
                  <span className="template-desc">{t.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <span>© 2025 Cedar Resumes · Built with ✦</span>
      </footer>
    </div>
  );
}
