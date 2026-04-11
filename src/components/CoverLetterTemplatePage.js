import React from 'react';
import { COVER_LETTER_TEMPLATES, CoverLetterTemplateSVG } from '../data/coverLetterTemplates';
import Header from './Header';
import './TemplatePage.css';
import './CoverLetterTemplatePage.css';

export default function CoverLetterTemplatePage({ onSelectTemplate, onBack, resumeTemplateId }) {
  // The matching template is the one whose resumeTemplateId equals the project's resume template
  const matchId = COVER_LETTER_TEMPLATES.find(t => t.resumeTemplateId === resumeTemplateId)?.id ?? null;

  return (
    <div className="template-page">
      <Header onHome={onBack} />

      <main className="template-page-main">
        <button className="template-page-back" onClick={onBack}>← Back</button>

        <div className="template-page-hero">
          <div className="template-compare-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Cover Letter
          </div>
          <h1 className="template-page-title">Choose a cover letter style</h1>
          <p className="template-page-subtitle">
            {matchId
              ? 'The highlighted style matches your resume. Pick any style you like.'
              : 'Each style matches a resume template — pick the one that pairs with your resume.'}
          </p>
        </div>

        <div className="template-page-grid">
          {COVER_LETTER_TEMPLATES.map(t => {
            const isMatch = t.id === matchId;
            return (
              <button
                key={t.id}
                className={`template-page-card ${isMatch ? 'cl-template-match' : ''}`}
                onClick={() => onSelectTemplate(t)}
              >
                <div className="template-preview-clip">
                  <CoverLetterTemplateSVG template={t} />
                  {isMatch && (
                    <div className="cl-match-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Matches your resume
                    </div>
                  )}
                </div>
                <div className="template-page-info">
                  <span className="template-page-name">{t.name}</span>
                  <span className="template-page-desc">{t.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
