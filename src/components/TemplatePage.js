import React from 'react';
import { TEMPLATES } from './HomePage';
import { ResumeBody } from './PreviewPanel';
import './TemplatePage.css';

const PAGE_W_PX = 650;
const INCH_PX   = PAGE_W_PX / 8.5;
const PAGE_H_PX = Math.round(INCH_PX * 11);
const PREVIEW_SCALE = 0.22;
const PREVIEW_W = Math.round(PAGE_W_PX * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PAGE_H_PX * PREVIEW_SCALE);

export default function TemplatePage({ onSelectTemplate, onBack, defaultResume }) {
  return (
    <div className="template-page">
      <header className="template-page-header">
        <div className="template-page-logo" onClick={onBack} title="Back">
          <img src={`${process.env.PUBLIC_URL}/logos/logo.png`} alt="Cedar Resumes" className="template-page-logo-img" />
          <span className="template-page-logo-name">Cedar Resumes</span>
        </div>
      </header>

      <main className="template-page-main">
        <div className="template-page-hero">
          <h1 className="template-page-title">Choose a template</h1>
          <p className="template-page-subtitle">Pick a style to get started. You can change everything later.</p>
        </div>

        <div className="template-page-grid">
          {TEMPLATES.map(t => {
            const mTop    = Math.round((t.pageSettings.marginTop    ?? 1.0) * INCH_PX);
            const mBottom = Math.round((t.pageSettings.marginBottom ?? 1.0) * INCH_PX);
            const mLeft   = Math.round((t.pageSettings.marginLeft   ?? 1.0) * INCH_PX);
            const mRight  = Math.round((t.pageSettings.marginRight  ?? 1.0) * INCH_PX);
            const lineHeight    = t.pageSettings.lineHeight ?? 1.6;
            const personalStyles = t.styles.personal ?? { headerAlign: 'left', showIcons: true };
            const colorAccents  = t.pageSettings.colorAccents ?? true;

            return (
              <button key={t.id} className="template-page-card" onClick={() => onSelectTemplate(t)}>
                {/* Scaled live preview */}
                <div className="template-preview-clip" style={{ width: PREVIEW_W, height: PREVIEW_H }}>
                  <div className="template-preview-inner" style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: PAGE_W_PX }}>
                    <ResumeBody
                      resume={defaultResume}
                      sectionStyles={t.styles}
                      mLeft={mLeft}
                      mRight={mRight}
                      mTop={mTop}
                      mBottom={mBottom}
                      lineHeight={lineHeight}
                      personalStyles={personalStyles}
                      colorAccents={colorAccents}
                    />
                  </div>
                </div>

                <div className="template-page-info">
                  <span className="template-page-name">{t.name}</span>
                  <span className="template-page-desc">{t.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        <button className="template-page-back" onClick={onBack}>
          ← Back
        </button>
      </main>
    </div>
  );
}
