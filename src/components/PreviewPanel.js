import React, { useRef, useState, useEffect } from 'react';
import { getScheme } from '../data/colorSchemes';
import './PreviewPanel.css';

const PAGE_W_PX = 650;
const INCH_PX   = PAGE_W_PX / 8.5;
const PAGE_H_PX = Math.round(INCH_PX * 11); // ~841px

// ─────────────────────────────────────────────────────────
// Resume body — plain component, no forwardRef needed.
// Left/right margins applied here; top/bottom handled per-page.
// ─────────────────────────────────────────────────────────
// SVG_ICONS(color, forced)
// - forced=false (default): branded colors for location/linkedin, accent for others
// - forced=true: all icons use `color` uniformly
const SVG_ICONS = {
  email: (color) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  phone: (color) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.09 4.93 2 2 0 0 1 3 2.84h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.16 17z"/>
    </svg>
  ),
  location: (color, forced) => forced ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#e84040" stroke="#e84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" stroke="white"/>
    </svg>
  ),
  linkedin: (color, forced) => forced ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24">
      <rect x="0" y="0" width="24" height="24" rx="4" fill="#0077b5"/>
      <path d="M7 10v7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="7" r="1.2" fill="white"/>
      <path d="M11 10v7M11 13c0-1.66 1.34-3 3-3s3 1.34 3 3v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  website: (color) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

export function ResumeBody({ resume, sectionStyles, mLeft, mRight, lineHeight, personalStyles, colorScheme }) {
  const { personal, experience, education, skills } = resume;
  const hasContent = personal.name || personal.email ||
                     experience.length > 0 || education.length > 0;
  const align           = personalStyles.headerAlign ?? 'left';
  const showIcons       = personalStyles.showIcons ?? true;
  const scheme          = getScheme(colorScheme);
  const accent          = scheme.accent;
  const noColor         = colorScheme === 'none';
  const iconColor       = personalStyles.iconColor ?? 'default';
  const forced          = iconColor === 'accent';
  const iconCol         = forced ? accent : '#555';
  const headerFont      = personalStyles.headerFont ?? 'DM Serif Display';
  const headerNameSize  = personalStyles.headerNameSize ?? 32;
  const headerContactSize = personalStyles.headerContactSize ?? 12;

  // Helper to build inline style from formatting object
  const fmt = (f) => f ? {
    fontWeight:     f.bold      ? 'bold'      : 'normal',
    fontStyle:      f.italic    ? 'italic'    : 'normal',
    textDecoration: f.underline ? 'underline' : 'none',
  } : {};

  const expFmt = sectionStyles.experience?.formatting ?? {};
  const eduFmt = sectionStyles.education?.formatting  ?? {};
  const skFmt  = sectionStyles.skills?.formatting     ?? {};

  // Section title scales with body font size
  const expTitleSize = Math.max(9, sectionStyles.experience.fontSize - 1);
  const eduTitleSize = Math.max(9, sectionStyles.education.fontSize  - 1);

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
            {personal.name  && <h1 className="r-name" style={{ fontFamily: headerFont, fontSize: `${headerNameSize}px` }}>{personal.name}</h1>}
            {personal.title && <p className="r-title">{personal.title}</p>}
            <div className="r-contact" style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', fontSize: `${headerContactSize}px` }}>
              {personal.email    && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.email(iconCol, forced)}{personal.email}</span>}
              {personal.phone    && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.phone(iconCol, forced)}{personal.phone}</span>}
              {personal.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.location(iconCol, forced)}{personal.location}</span>}
              {personal.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.linkedin(iconCol, forced)}{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
              {personal.website  && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.website(iconCol, forced)}{personal.website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
            </div>
          </div>

          {personal.summary && (
            <div className="r-section">
              <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${expTitleSize}px` }}>Summary</div>
              <p className="r-summary">{personal.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="r-section" style={{
              fontFamily: sectionStyles.experience.fontFamily,
              fontSize:   `${sectionStyles.experience.fontSize}px`,
            }}>
              <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${expTitleSize}px` }}>Experience</div>
              {experience.map(exp => {
                const bullets = exp.bullets.filter(b => b.trim());
                return (
                  <div className="r-entry" key={exp.id}>
                    <div className="r-entry-header">
                      <div>
                        <span className="r-entry-role" style={fmt(expFmt.role)}>{exp.role}</span>
                        {exp.company && <span className="r-entry-company" style={fmt(expFmt.company)}> · {exp.company}</span>}
                      </div>
                      <span className="r-entry-date" style={fmt(expFmt.date)}>
                        {exp.startDate}
                        {exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                        {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {bullets.length > 0 && (
                      <ul className="r-bullets">
                        {bullets.map((b, i) => (
                          <li key={i} style={{ marginBottom: `${sectionStyles.experience.bulletSpacing}px` }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {education.length > 0 && (
            <div className="r-section" style={{
              fontFamily: sectionStyles.education.fontFamily,
              fontSize:   `${sectionStyles.education.fontSize}px`,
            }}>
              <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${eduTitleSize}px` }}>Education</div>
              {education.map(edu => (
                <div className="r-education-entry" key={edu.id}>
                  <div className="r-entry-header">
                    <div>
                      {(edu.degree || edu.field) && (
                        <span className="r-entry-role" style={fmt(eduFmt.degree)}>{[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>
                      )}
                      {edu.school && <span className="r-entry-company" style={fmt(eduFmt.school)}>{(edu.degree || edu.field) ? ' · ' : ''}{edu.school}</span>}
                      {edu.gpa && <span className="r-entry-company"> — GPA {edu.gpa}</span>}
                    </div>
                    <span className="r-entry-date" style={fmt(eduFmt.date)}>
                      {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div className="r-section">
              <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${eduTitleSize}px` }}>Skills</div>
              {sectionStyles.skills.separator === 'comma' ? (
                <p className="r-skills-comma" style={fmt(skFmt)}>{skills.join(', ')}</p>
              ) : (
                <p className="r-skills-marker">
                  {skills.map((s, i) => (
                    <span key={s} style={fmt(skFmt)}>
                      {i > 0 && <span className="r-skill-dot" style={{ color: accent }}>▪</span>}
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
// Sidebar layout — two-column with photo, contact & skills on left
// ─────────────────────────────────────────────────────────
export function SidebarBody({ resume, sectionStyles, mLeft, mRight, lineHeight, colorScheme, personalStyles }) {
  const { personal, experience, education, skills } = resume;
  const scheme        = getScheme(colorScheme);
  const accent        = scheme.accent;
  const sidebarBg     = scheme.sidebarBg;
  const sidebarBorder = scheme.sidebarBorder;
  const sidebarW      = '32%';
  const showIcons       = personalStyles?.showIcons ?? true;
  const iconColor       = personalStyles?.iconColor ?? 'default';
  const forced          = iconColor === 'accent';
  const iconCol         = forced ? accent : '#555';
  const headerFont      = personalStyles?.headerFont ?? 'DM Serif Display';
  const headerNameSize  = personalStyles?.headerNameSize ?? 32;
  const headerContactSize = personalStyles?.headerContactSize ?? 12;

  const expFmt = sectionStyles.experience?.formatting ?? {};
  const eduFmt = sectionStyles.education?.formatting  ?? {};
  const skFmt  = sectionStyles.skills?.formatting     ?? {};

  const expTitleSize = Math.max(9, sectionStyles.experience.fontSize - 1);
  const eduTitleSize = Math.max(9, sectionStyles.education.fontSize  - 1);

  const fmt = (f) => f ? {
    fontWeight:     f.bold      ? 'bold'      : 'normal',
    fontStyle:      f.italic    ? 'italic'    : 'normal',
    textDecoration: f.underline ? 'underline' : 'none',
  } : {};

  const sectionTitle = (title, size) => (
    <div className="r-section-title" style={{
      fontSize: size ?? 10, fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: accent,
      borderBottom: `1.5px solid ${accent}`,
      paddingBottom: 3, marginBottom: 8, marginTop: 14,
    }}>{title}</div>
  );

  return (
    <div style={{ display: 'flex', paddingLeft: mLeft, paddingRight: mRight, lineHeight, minHeight: '100%' }}>
      {/* ── Left sidebar ── */}
      <div style={{ width: sidebarW, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, padding: '20px 16px 20px 0', boxSizing: 'border-box' }}>
        {personal.photo && (
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <img src={personal.photo} alt="Headshot" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}` }} />
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {personal.name  && <div style={{ fontFamily: headerFont, fontWeight: 700, fontSize: Math.round(headerNameSize * 0.5), color: '#1a1a1a', lineHeight: 1.2 }}>{personal.name}</div>}
          {personal.title && <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{personal.title}</div>}
        </div>

        {(personal.email || personal.phone || personal.location || personal.linkedin || personal.website) && (
          <>
            {sectionTitle('Contact')}
            {[
              personal.email    && { icon: SVG_ICONS.email(iconCol, forced),    text: personal.email },
              personal.phone    && { icon: SVG_ICONS.phone(iconCol, forced),    text: personal.phone },
              personal.location && { icon: SVG_ICONS.location(iconCol, forced), text: personal.location },
              personal.linkedin && { icon: SVG_ICONS.linkedin(iconCol, forced), text: personal.linkedin.replace(/^https?:\/\/(www\.)?/, '') },
              personal.website  && { icon: SVG_ICONS.website(iconCol, forced),  text: personal.website.replace(/^https?:\/\/(www\.)?/, '') },
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: headerContactSize, color: '#333', marginBottom: 5, wordBreak: 'break-all' }}>
                {showIcons && <span style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</span>}
                <span>{item.text}</span>
              </div>
            ))}
          </>
        )}

        {skills.length > 0 && (
          <>
            {sectionTitle('Skills')}
            {sectionStyles.skills?.separator === 'marker' ? (
              skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#333', padding: '3px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ color: accent, fontSize: 8 }}>▪</span>
                  <span style={fmt(skFmt)}>{s}</span>
                </div>
              ))
            ) : (
              skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10.5, color: '#333', padding: '3px 0', borderBottom: '1px solid #e8e8e8', ...fmt(skFmt) }}>{s}</div>
              ))
            )}
          </>
        )}
      </div>

      {/* ── Right main content ── */}
      <div style={{ flex: 1, paddingLeft: 18, paddingTop: 20, paddingBottom: 20, boxSizing: 'border-box' }}>
        {personal.summary && (
          <>
            {sectionTitle('Summary', expTitleSize)}
            <p style={{ fontSize: 11.5, color: '#333', marginBottom: 12, lineHeight: 1.6 }}>{personal.summary}</p>
          </>
        )}

        {experience.length > 0 && (
          <>
            {sectionTitle('Experience', expTitleSize)}
            {experience.map(exp => {
              const bullets = exp.bullets.filter(b => b.trim());
              return (
                <div key={exp.id} style={{ marginBottom: 12, fontFamily: sectionStyles.experience.fontFamily, fontSize: `${sectionStyles.experience.fontSize}px` }}>
                  <div className="r-entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={fmt(expFmt.role)}>{exp.role}</span>
                      {exp.company && <span style={{ color: '#555', ...fmt(expFmt.company) }}> · {exp.company}</span>}
                    </div>
                    <span style={{ fontSize: 10.5, color: '#888', flexShrink: 0, marginLeft: 8, ...fmt(expFmt.date) }}>
                      {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="r-bullets" style={{ margin: '4px 0 0 14px', padding: 0 }}>
                      {bullets.map((b, i) => (
                        <li key={i} style={{ marginBottom: `${sectionStyles.experience.bulletSpacing}px`, fontSize: `${sectionStyles.experience.fontSize}px` }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}

        {education.length > 0 && (
          <>
            {sectionTitle('Education', eduTitleSize)}
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 8, fontFamily: sectionStyles.education.fontFamily, fontSize: `${sectionStyles.education.fontSize}px` }}>
                <div className="r-entry-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    {(edu.degree || edu.field) && <span style={fmt(eduFmt.degree)}>{[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>}
                    {edu.school && <span style={{ color: '#555', ...fmt(eduFmt.school) }}>{(edu.degree || edu.field) ? ' · ' : ''}{edu.school}</span>}
                    {edu.gpa && <span style={{ color: '#888' }}> — GPA {edu.gpa}</span>}
                  </div>
                  <span style={{ fontSize: 10.5, color: '#888', ...fmt(eduFmt.date) }}>{edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Executive Photo layout — classic single-column with optional circular headshot
// ─────────────────────────────────────────────────────────
export function ExecutivePhotoBody({ resume, sectionStyles, mLeft, mRight, lineHeight, personalStyles, colorScheme, photoPosition }) {
  const { personal, experience, education, skills } = resume;
  const scheme    = getScheme(colorScheme);
  const accent    = scheme.accent;
  const noColor   = colorScheme === 'none';
  const align           = personalStyles.headerAlign ?? 'center';
  const showIcons       = personalStyles.showIcons ?? true;
  const iconColor       = personalStyles.iconColor ?? 'default';
  const forced          = iconColor === 'accent';
  const iconCol         = forced ? accent : '#555';
  const headerFont      = personalStyles.headerFont ?? 'DM Serif Display';
  const headerNameSize  = personalStyles.headerNameSize ?? 32;
  const headerContactSize = personalStyles.headerContactSize ?? 12;
  const photoSide = photoPosition ?? 'left';
  const PHOTO_SIZE = 72;

  const expFmt = sectionStyles.experience?.formatting ?? {};
  const eduFmt = sectionStyles.education?.formatting  ?? {};
  const skFmt  = sectionStyles.skills?.formatting     ?? {};

  const expTitleSize = Math.max(9, sectionStyles.experience.fontSize - 1);
  const eduTitleSize = Math.max(9, sectionStyles.education.fontSize  - 1);

  const fmt = (f) => f ? {
    fontWeight:     f.bold      ? 'bold'      : 'normal',
    fontStyle:      f.italic    ? 'italic'    : 'normal',
    textDecoration: f.underline ? 'underline' : 'none',
  } : {};

  return (
    <div className="resume-body" style={{ paddingLeft: mLeft, paddingRight: mRight, lineHeight }}>
      {/* Header with optional photo */}
      <div style={{ display: 'flex', flexDirection: photoSide === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 18, marginBottom: 12 }}>
        {personal.photo && (
          <img src={personal.photo} alt="Headshot" style={{ width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2.5px solid ${accent}` }} />
        )}
        <div style={{ flex: 1, textAlign: align }}>
          {personal.name  && <h1 className="r-name" style={{ fontFamily: headerFont, fontSize: `${headerNameSize}px` }}>{personal.name}</h1>}
          {personal.title && <p className="r-title">{personal.title}</p>}
          <div className="r-contact" style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', fontSize: `${headerContactSize}px` }}>
            {personal.email    && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.email(iconCol, forced)}{personal.email}</span>}
            {personal.phone    && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.phone(iconCol, forced)}{personal.phone}</span>}
            {personal.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.location(iconCol, forced)}{personal.location}</span>}
            {personal.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.linkedin(iconCol, forced)}{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
            {personal.website  && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{showIcons && SVG_ICONS.website(iconCol, forced)}{personal.website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          </div>
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: `2px solid ${accent}`, margin: '0 0 12px 0' }} />

      {/* Rest is identical to ResumeBody */}
      {personal.summary && (
        <div className="r-section">
          <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${expTitleSize}px` }}>Summary</div>
          <p className="r-summary">{personal.summary}</p>
        </div>
      )}
      {experience.length > 0 && (
        <div className="r-section" style={{ fontFamily: sectionStyles.experience.fontFamily, fontSize: `${sectionStyles.experience.fontSize}px` }}>
          <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${expTitleSize}px` }}>Experience</div>
          {experience.map(exp => {
            const bullets = exp.bullets.filter(b => b.trim());
            return (
              <div className="r-entry" key={exp.id}>
                <div className="r-entry-header">
                  <div><span className="r-entry-role" style={fmt(expFmt.role)}>{exp.role}</span>{exp.company && <span className="r-entry-company" style={fmt(expFmt.company)}> · {exp.company}</span>}</div>
                  <span className="r-entry-date" style={fmt(expFmt.date)}>{exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</span>
                </div>
                {bullets.length > 0 && (
                  <ul className="r-bullets">{bullets.map((b, i) => <li key={i} style={{ marginBottom: `${sectionStyles.experience.bulletSpacing}px` }}>{b}</li>)}</ul>
                )}
              </div>
            );
          })}
        </div>
      )}
      {education.length > 0 && (
        <div className="r-section" style={{ fontFamily: sectionStyles.education.fontFamily, fontSize: `${sectionStyles.education.fontSize}px` }}>
          <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${eduTitleSize}px` }}>Education</div>
          {education.map(edu => (
            <div className="r-education-entry" key={edu.id}>
              <div className="r-entry-header">
                <div>
                  {(edu.degree || edu.field) && <span className="r-entry-role" style={fmt(eduFmt.degree)}>{[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>}
                  {edu.school && <span className="r-entry-company" style={fmt(eduFmt.school)}>{(edu.degree || edu.field) ? ' · ' : ''}{edu.school}</span>}
                  {edu.gpa && <span className="r-entry-company"> — GPA {edu.gpa}</span>}
                </div>
                <span className="r-entry-date" style={fmt(eduFmt.date)}>{edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div className="r-section">
          <div className="r-section-title" style={{ color: accent, borderColor: noColor ? '#1a1a1a' : '#ddd', fontSize: `${eduTitleSize}px` }}>Skills</div>
          {sectionStyles.skills.separator === 'comma' ? (
            <p className="r-skills-comma" style={fmt(skFmt)}>{skills.join(', ')}</p>
          ) : (
            <p className="r-skills-marker">
              {skills.map((s, i) => (
                <span key={s} style={fmt(skFmt)}>{i > 0 && <span className="r-skill-dot" style={{ color: accent }}>▪</span>}{s}</span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────
export default function PreviewPanel({ resume, sectionStyles, pageSettings, onChangeTemplate, onCompareTemplate }) {
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
  const colorScheme    = pageSettings.colorScheme ?? 'teal';
  const personalStyles = sectionStyles.personal ?? { headerAlign: 'left', showIcons: true };
  const photoPosition  = pageSettings.photoPosition ?? 'left';
  const layoutType     = pageSettings.layout ?? 'standard';

  const bodyProps = { resume, sectionStyles, mLeft, mRight, lineHeight, personalStyles, colorScheme };

  const BodyComponent = layoutType === 'sidebar'         ? SidebarBody
                      : layoutType === 'executive-photo' ? ExecutivePhotoBody
                      : ResumeBody;

  const extraProps = layoutType === 'executive-photo' ? { photoPosition } : {};

  const hasContent = resume.personal.name || resume.personal.email ||
                     resume.experience.length > 0 || resume.education.length > 0;

  // ── PDF export ───────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // Capture raw content (no top/bottom margins — added per-page below)
      const el = measureRef.current;
      const rect = el.getBoundingClientRect();
      const contentCanvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: -rect.left,
        scrollY: -rect.top,
        windowWidth: PAGE_W_PX,
      });

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
        <div className="preview-toolbar-actions">
          <button className="btn-compare-template" onClick={onCompareTemplate} disabled={!hasContent} title="Compare templates side by side">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/>
            </svg>
            Compare
          </button>
          <button className="btn-change-template" onClick={onChangeTemplate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Change Template
          </button>
          <button className="btn-download" onClick={handleDownload} disabled={!hasContent}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Hidden body for height measurement ── */}
      <div className="measure-host" ref={measureRef}>
        <BodyComponent {...bodyProps} {...extraProps} />
      </div>

      {/* ── Visible paginated preview ── */}
      <div className="preview-scroll">
        <div className="pages-stack" style={{ width: PAGE_W_PX }}>
          {Array.from({ length: numPages }, (_, i) => (
            <React.Fragment key={i}>
              <div className="page-sheet" style={{ height: PAGE_H_PX }}>
                <div className="page-clip" style={{ top: mTop, height: pageSlices[i].end - pageSlices[i].start }}>
                  <div className="page-clip-inner" style={{ top: -pageSlices[i].start }}>
                    <BodyComponent {...bodyProps} {...extraProps} />
                  </div>
                </div>
              </div>
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
