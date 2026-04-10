import React from 'react';
import { TEMPLATES, TemplateSVG } from '../data/templates';
import Header from './Header';
import './TemplatePage.css';


export default function TemplatePage({ onSelectTemplate, onBack }) {
  return (
    <div className="template-page">
      <Header onHome={onBack} />

      <main className="template-page-main">
        <button className="template-page-back" onClick={onBack}>← Back</button>

        <div className="template-page-hero">
          <h1 className="template-page-title">Choose a template</h1>
          <p className="template-page-subtitle">Pick a style to get started. You can customize everything in the editor.</p>
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
