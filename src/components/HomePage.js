import React, { useRef } from 'react';
import { TEMPLATES } from '../data/templates';
import './HomePage.css';

export { TEMPLATES };

// ── HomePage ───────────────────────────────────────────────
export default function HomePage({ onStartScratch, onImport, uploadStatus }) {
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
      <header className="home-header">
        <div className="home-logo">
          <img src={`${process.env.PUBLIC_URL}/logos/logo.png`} alt="Cedar Resumes" className="home-logo-img" />
          <div className="home-logo-text">
            <span className="home-logo-name">Cedar Resumes</span>
            <span className="home-logo-tagline">Build it. Love it. Ship it.</span>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="home-get-started">
          <h1 className="home-get-started-title">Let's get started</h1>
          <p className="home-get-started-sub">How would you like to build your resume?</p>
        </div>

        <div className="home-actions">
          <button className="home-action-btn blank" onClick={onStartScratch}>
            <span className="home-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </span>
            <span className="home-action-title">Start from Scratch</span>
            <span className="home-action-desc">Choose a template and build your resume step by step</span>
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
      </main>

      <footer className="home-footer">
        <span>© 2025 Cedar Resumes · Built with ✦</span>
      </footer>
    </div>
  );
}
