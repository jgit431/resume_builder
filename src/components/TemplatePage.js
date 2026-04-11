import React from 'react';
import { TEMPLATES, TemplateSVG } from '../data/templates';
import Header from './Header';
import './TemplatePage.css';

export default function TemplatePage({ onSelectTemplate, onBack, compareMode = false }) {
  const title    = compareMode ? 'Compare with a template' : 'Choose a template';
  const subtitle = compareMode
    ? 'Select a template to preview side by side with your current one.'
    : 'Pick a style to get started. You can customize everything in the editor.';

  return (
    <div className="template-page">
      <Header onHome={onBack} />

      <main className="template-page-main">
        <button className="template-page-back" onClick={onBack}>← Back</button>

        <div className="template-page-hero">
          {compareMode && (
            <div className="template-compare-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/>
              </svg>
              Compare mode
            </div>
          )}
          <h1 className="template-page-title">{title}</h1>
          <p className="template-page-subtitle">{subtitle}</p>
        </div>

        <div className="template-page-grid">
          {TEMPLATES.map(t => (
            <button key={t.id} className="template-page-card" onClick={() => onSelectTemplate(t)}>
              <div className="template-preview-clip">
                <TemplateSVG template={t} />
              </div>
              <div className="template-page-info">
                <span className="template-page-name">{t.name}</span>
                <span className="template-page-desc">{t.description}</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
