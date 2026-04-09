import React, { useRef, useState, useEffect } from 'react';
import './PreviewPanel.css';

const PAGE_W_PX = 650;
const INCH_PX   = PAGE_W_PX / 8.5;
const PAGE_H_PX = Math.round(INCH_PX * 11); // ~841px

// ─────────────────────────────────────────────────────────
// Resume body — plain component, no forwardRef needed.
// Left/right margins applied here; top/bottom handled per-page.
// ─────────────────────────────────────────────────────────
function ResumeBody({ resume, sectionStyles, mLeft, mRight, lineHeight, personalStyles }) {
  const { personal, experience, education, skills } = resume;
  const hasContent = personal.name || personal.email ||
                     experience.length > 0 || education.length > 0;

  const align    = personalStyles.headerAlign ?? 'left';
  const showIcons = personalStyles.showIcons ?? true;

  const ICONS = { email: '✉', phone: '📞', location: '📍', linkedin: 'in', website: '🌐' };

  return (
    <div
      className="resume-body"
      style={{ paddingLeft: mLeft, paddingRight: mRight, lineHeight }}
    >
      {!hasContent ? (
        <div className="resume-empty">
          <div className="resume-empty-icon">📄</div>
          <p>Start filling in the form to see your resume here.</p>
        </div>
      ) : (
        <>
          <div className="r-header" style={{ textAlign: align }}>
            {personal.name  && <h1 className="r-name">{personal.name}</h1>}
            {personal.title && <p className="r-title">{personal.title}</p>}
            <div className="r-contact" style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
              {personal.email    && <span>{showIcons ? `${ICONS.email} ` : ''}{personal.email}</span>}
              {personal.phone    && <span>{showIcons ? `${ICONS.phone} ` : ''}{personal.phone}</span>}
              {personal.location && <span>{showIcons ? `${ICONS.location} ` : ''}{personal.location}</span>}
              {personal.linkedin && <span>{showIcons ? `${ICONS.linkedin} ` : ''}{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
              {personal.website  && <span>{showIcons ? `${ICONS.website} ` : ''}{personal.website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
            </div>
          </div>

          {personal.summary && (
            <div className="r-section">
              <div className="r-section-title">Summary</div>
              <p className="r-summary">{personal.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="r-section" style={{
              fontFamily: sectionStyles.experience.fontFamily,
              fontSize:   `${sectionStyles.experience.fontSize}px`,
            }}>
              <div className="r-section-title">Experience</div>
              {experience.map(exp => (
                <div className="r-entry" key={exp.id}>
                  <div className="r-entry-header">
                    <div>
                      <span className="r-entry-role">{exp.role}</span>
                      {exp.company && <span className="r-entry-company"> · {exp.company}</span>}
                    </div>
                    <span className="r-entry-date">
                      {exp.startDate}
                      {exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                      {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bullets.filter(b => b.trim()).length > 0 && (
                    <ul className="r-bullets">
                      {exp.bullets.filter(b => b.trim()).map((b, i) => (
                        <li key={i} style={{ marginBottom: `${sectionStyles.experience.bulletSpacing}px` }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="r-section" style={{
              fontFamily: sectionStyles.education.fontFamily,
              fontSize:   `${sectionStyles.education.fontSize}px`,
            }}>
              <div className="r-section-title">Education</div>
              {education.map(edu => (
                <div className="r-education-entry" key={edu.id}>
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

          {skills.length > 0 && (
            <div className="r-section">
              <div className="r-section-title">Skills</div>
              {sectionStyles.skills.separator === 'comma' ? (
                <p className="r-skills-comma">
                  {skills.join(', ')}
                </p>
              ) : (
                <p className="r-skills-marker">
                  {skills.map((s, i) => (
                    <span key={s}>
                      {i > 0 && <span className="r-skill-dot">▪</span>}
                      {s}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────
export default function PreviewPanel({ resume, sectionStyles, pageSettings }) {
  const measureRef = useRef();
  const [layout, setLayout] = useState({ bodyHeight: PAGE_H_PX, cutPoints: [] });

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const totalH  = el.scrollHeight;
    const mT      = Math.round(pageSettings.marginTop    * INCH_PX);
    const mB      = Math.round(pageSettings.marginBottom * INCH_PX);
    const areaH   = PAGE_H_PX - mT - mB;

    if (areaH <= 0) { setLayout({ bodyHeight: totalH, cutPoints: [] }); return; }

    const rawPages = Math.ceil(totalH / areaH);
    if (rawPages <= 1) { setLayout({ bodyHeight: totalH, cutPoints: [] }); return; }

    const elements = Array.from(el.querySelectorAll(
      '.r-header, .r-section-title, .r-entry-header, .r-bullets li'
    ));
    const newCuts  = [];
    let searchFrom = 0;

    for (let page = 1; page < rawPages; page++) {
      const idealCut = page * areaH;
      let bestCut    = idealCut;

      for (const elem of elements) {
        const bottom = elem.offsetTop + elem.offsetHeight;
        if (bottom > searchFrom && bottom <= idealCut) bestCut = bottom;
      }

      newCuts.push(bestCut);
      searchFrom = bestCut;
    }

    setLayout({ bodyHeight: totalH, cutPoints: newCuts });
  }, [resume, sectionStyles, pageSettings]);

  const { bodyHeight, cutPoints } = layout;

  const mTop    = Math.round(pageSettings.marginTop    * INCH_PX);
  const mBottom = Math.round(pageSettings.marginBottom * INCH_PX);
  const mLeft   = Math.round(pageSettings.marginLeft   * INCH_PX);
  const mRight  = Math.round(pageSettings.marginRight  * INCH_PX);

  const numPages = cutPoints.length + 1;

  // Start/end content-px for each page derived from safe cut points
  const pageSlices = Array.from({ length: numPages }, (_, i) => ({
    start: i === 0 ? 0 : cutPoints[i - 1],
    end:   i < cutPoints.length ? cutPoints[i] : bodyHeight,
  }));

  const lineHeight     = pageSettings.lineHeight ?? 1.6;
  const personalStyles = sectionStyles.personal ?? { headerAlign: 'left', showIcons: true };
  const bodyProps      = { resume, sectionStyles, mLeft, mRight, lineHeight, personalStyles };
  const hasContent = resume.personal.name || resume.personal.email ||
                     resume.experience.length > 0 || resume.education.length > 0;

  // ── PDF export ───────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // Capture raw content (no top/bottom margins — added per-page below)
      const el = measureRef.current;
      el.style.left = '0';
      const contentCanvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      el.style.left = '-9999px';

      // Canvas-pixel dimensions (scale=2)
      const scale     = 2;
      const pageW     = Math.round(PAGE_W_PX * scale);
      const pageH     = Math.round(PAGE_H_PX * scale);
      const mTopPx    = Math.round(mTop    * scale);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

      // Use the same safe cut points computed for the live preview
      const scaledCuts = cutPoints.map(c => Math.round(c * scale));

      for (let i = 0; i < numPages; i++) {
        if (i > 0) pdf.addPage();

        const srcY = i === 0 ? 0 : scaledCuts[i - 1];
        const srcH = (i < scaledCuts.length ? scaledCuts[i] : contentCanvas.height) - srcY;

        const pageCanvas    = document.createElement('canvas');
        pageCanvas.width    = pageW;
        pageCanvas.height   = pageH;
        const ctx           = pageCanvas.getContext('2d');
        ctx.fillStyle       = '#ffffff';
        ctx.fillRect(0, 0, pageW, pageH);

        if (srcH > 0) {
          ctx.drawImage(contentCanvas, 0, srcY, pageW, srcH, 0, mTopPx, pageW, srcH);
        }

        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, 8.5, 11);
        pageCanvas.width = 0; // free canvas memory
      }

      pdf.save(`${resume.personal.name || 'resume'}.pdf`);
    } catch (err) {
      if (measureRef.current) measureRef.current.style.left = '-9999px';
      console.error('PDF export failed', err);
      alert('PDF export failed: ' + err.message);
    }
  };

  return (
    <div className="preview-panel">
      {/* ── Toolbar ── */}
      <div className="preview-toolbar">
        <span className="preview-label">
          Live Preview
          {numPages > 1 && <span className="preview-page-count"> · {numPages} pages</span>}
        </span>
        <button className="btn-download" onClick={handleDownload} disabled={!hasContent}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>

      {/* ── Hidden body for height measurement ── */}
      <div className="measure-host" ref={measureRef}>
        <ResumeBody {...bodyProps} />
      </div>

      {/* ── Visible paginated preview ── */}
      <div className="preview-scroll">
        <div className="pages-stack" style={{ width: PAGE_W_PX }}>
          {Array.from({ length: numPages }, (_, i) => (
            <React.Fragment key={i}>
              {/* White page sheet */}
              <div className="page-sheet" style={{ height: PAGE_H_PX }}>
                <div className="page-clip" style={{ top: mTop, height: pageSlices[i].end - pageSlices[i].start }}>
                  <div
                    className="page-clip-inner"
                    style={{ top: -pageSlices[i].start }}
                  >
                    <ResumeBody {...bodyProps} />
                  </div>
                </div>
              </div>

              {/* Gap + dotted rule between pages */}
              {i < numPages - 1 && (
                <div className="page-gap">
                  <div className="page-gap-rule" />
                  <span className="page-gap-label">Page {i + 2}</span>
                  <div className="page-gap-rule" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
