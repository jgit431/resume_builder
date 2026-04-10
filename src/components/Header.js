import React from 'react';
import './Header.css';

export default function Header({ uploadStatus, onHome }) {
  const statusLabel = {
    parsing: '⏳ Parsing PDF…',
    done: '✅ Resume imported!',
    error: '❌ Could not parse PDF',
  };

  return (
    <header className="header">
      <div className="header-brand" onClick={onHome} style={{ cursor: 'pointer' }} title="Back to home">
        <img src={`${process.env.PUBLIC_URL}/logos/logo.png`} alt="Cedar Resumes" style={{ width: 105, height: 105, objectFit: 'contain' }} />
        <div className="header-text">
          <span className="header-title">Cedar Resumes</span>
          <span className="header-tagline">Build it. Love it. Ship it.</span>
        </div>
      </div>
      <div className="header-actions">
        {uploadStatus && (
          <span className={`upload-status status-${uploadStatus}`}>
            {statusLabel[uploadStatus]}
          </span>
        )}
      </div>
    </header>
  );
}
