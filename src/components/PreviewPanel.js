import React, { useRef } from 'react';
import './PreviewPanel.css';

export default function PreviewPanel({ resume }) {
  const previewRef = useRef();

  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const el = previewRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume.personal.name || 'resume'}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF export failed. Please try again.');
    }
  };

  const { personal, experience, education, skills } = resume;
  const hasContent = personal.name || personal.email || experience.length > 0 || education.length > 0;

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-label">Live Preview</span>
        <button className="btn-download" onClick={handleDownload} disabled={!hasContent}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>

      <div className="preview-scroll">
        <div className="resume-page" ref={previewRef}>
          {!hasContent ? (
            <div className="resume-empty">
              <div className="resume-empty-icon">📄</div>
              <p>Start filling in the form to see your resume come to life here.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="r-header">
                {personal.name && <h1 className="r-name">{personal.name}</h1>}
                {personal.title && <p className="r-title">{personal.title}</p>}
                <div className="r-contact">
                  {personal.email && <span>✉ {personal.email}</span>}
                  {personal.phone && <span>📞 {personal.phone}</span>}
                  {personal.location && <span>📍 {personal.location}</span>}
                  {personal.linkedin && <span>in {personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                  {personal.website && <span>🌐 {personal.website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                </div>
              </div>

              {/* Summary */}
              {personal.summary && (
                <div className="r-section">
                  <div className="r-section-title">Summary</div>
                  <p className="r-summary">{personal.summary}</p>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="r-section">
                  <div className="r-section-title">Experience</div>
                  {experience.map(exp => (
                    <div className="r-entry" key={exp.id}>
                      <div className="r-entry-header">
                        <div>
                          <span className="r-entry-role">{exp.role}</span>
                          {exp.company && <span className="r-entry-company"> · {exp.company}</span>}
                        </div>
                        <span className="r-entry-date">
                          {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.bullets.filter(b => b.trim()).length > 0 && (
                        <ul className="r-bullets">
                          {exp.bullets.filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="r-section">
                  <div className="r-section-title">Education</div>
                  {education.map(edu => (
                    <div className="r-entry" key={edu.id}>
                      <div className="r-entry-header">
                        <div>
                          <span className="r-entry-role">{edu.school}</span>
                          {(edu.degree || edu.field) && (
                            <span className="r-entry-company"> · {[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>
                          )}
                          {edu.gpa && <span className="r-entry-company"> — GPA {edu.gpa}</span>}
                        </div>
                        <span className="r-entry-date">
                          {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="r-section">
                  <div className="r-section-title">Skills</div>
                  <div className="r-skills">
                    {skills.map(s => <span className="r-skill" key={s}>{s}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
