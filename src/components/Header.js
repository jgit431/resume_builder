import React, { useRef } from 'react';
import './Header.css';

export default function Header({ onUpload, uploadStatus }) {
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    }
    e.target.value = '';
  };

  const statusLabel = {
    parsing: '⏳ Parsing PDF…',
    done: '✅ Resume imported!',
    error: '❌ Could not parse PDF',
  };

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">✦</span>
        <span className="header-title">ResumeForge</span>
        <span className="header-tagline">Build. Preview. Download.</span>
      </div>
      <div className="header-actions">
        {uploadStatus && (
          <span className={`upload-status status-${uploadStatus}`}>
            {statusLabel[uploadStatus]}
          </span>
        )}
        <button className="btn-upload" onClick={() => fileRef.current.click()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Existing Resume (PDF)
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
    </header>
  );
}
