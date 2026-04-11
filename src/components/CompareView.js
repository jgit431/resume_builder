import React, { useRef, useState, useEffect } from 'react';
import { ResumeBody, SidebarBody, ExecutivePhotoBody } from './PreviewPanel';
import Header from './Header';
import './CompareView.css';

const RESUME_W = 650;
const INCH_PX  = RESUME_W / 8.5;
const PAGE_H   = Math.round(INCH_PX * 11); // ~841px

// ─────────────────────────────────────────────────────────
// Picks the right body component for a given layout string
// ─────────────────────────────────────────────────────────
function getBodyComponent(layoutType) {
  if (layoutType === 'sidebar')         return SidebarBody;
  if (layoutType === 'executive-photo') return ExecutivePhotoBody;
  return ResumeBody;
}

// ─────────────────────────────────────────────────────────
// Single scaled resume preview (first page only)
// ─────────────────────────────────────────────────────────
function ResumePreview({ resume, styles, pageSettings, scale }) {
  const layoutType    = pageSettings.layout        ?? 'standard';
  const colorScheme   = pageSettings.colorScheme   ?? 'teal';
  const lineHeight    = pageSettings.lineHeight     ?? 1.6;
  const photoPosition = pageSettings.photoPosition  ?? 'left';
  const personalStyles = styles.personal ?? {};

  const mTop   = Math.round((pageSettings.marginTop   ?? 1.0) * INCH_PX);
  const mLeft  = Math.round((pageSettings.marginLeft  ?? 1.0) * INCH_PX);
  const mRight = Math.round((pageSettings.marginRight ?? 1.0) * INCH_PX);

  const BodyComponent = getBodyComponent(layoutType);
  const extraProps    = layoutType === 'executive-photo' ? { photoPosition } : {};

  const bodyProps = {
    resume,
    sectionStyles: styles,
    mLeft,
    mRight,
    lineHeight,
    personalStyles,
    colorScheme,
    ...extraProps,
  };

  const scaledW = Math.round(RESUME_W * scale);
  const scaledH = Math.round(PAGE_H  * scale);

  return (
    <div
      className="compare-preview-wrap"
      style={{ width: scaledW, height: scaledH }}
    >
      <div
        className="compare-preview-inner"
        style={{
          width: RESUME_W,
          paddingTop: mTop,
          background: '#fff',
          minHeight: PAGE_H,
          transform: `scale(${scale})`,
        }}
      >
        <BodyComponent {...bodyProps} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main compare view
// ─────────────────────────────────────────────────────────
export default function CompareView({
  resume,
  currentStyles,
  currentPageSettings,
  currentTemplateName,
  proposedTemplate,
  proposedStyles,
  proposedPageSettings,
  onKeep,
  onSwitch,
}) {
  const colRef   = useRef(null);
  const [scale, setScale] = useState(0.7);

  // Dynamically compute scale so the preview fills its column
  useEffect(() => {
    if (!colRef.current) return;
    const measure = () => {
      const colW = colRef.current?.offsetWidth ?? 600;
      const s    = Math.min(1, (colW - 4) / RESUME_W); // 4px breathing room
      setScale(parseFloat(s.toFixed(4)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(colRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="compare-page">
      <Header onHome={onKeep} />

      {/* ── Top label bar ── */}
      <div className="compare-topbar">
        <span className="compare-topbar-label">Compare Templates</span>
        <span className="compare-topbar-hint">
          Previewing your resume in two templates side by side
        </span>
        <span />
      </div>

      {/* ── Columns ── */}
      <div className="compare-scroll">
        <div className="compare-columns">
          {/* ── Left: current ── */}
          <div className="compare-col" ref={colRef}>
            <div className="compare-col-header">
              <span className="compare-badge current">Current</span>
              <span className="compare-col-name">{currentTemplateName}</span>
            </div>
            <ResumePreview
              resume={resume}
              styles={currentStyles}
              pageSettings={currentPageSettings}
              scale={scale}
            />
          </div>

          {/* ── Right: proposed ── */}
          <div className="compare-col">
            <div className="compare-col-header">
              <span className="compare-badge proposed">Proposed</span>
              <span className="compare-col-name">{proposedTemplate.name}</span>
            </div>
            <ResumePreview
              resume={resume}
              styles={proposedStyles}
              pageSettings={proposedPageSettings}
              scale={scale}
            />
          </div>
        </div>
      </div>

      {/* ── Fixed bottom action bar ── */}
      <div className="compare-action-bar">
        <span className="compare-action-hint">Which do you prefer?</span>

        <button className="btn-keep-current" onClick={onKeep}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Keep {currentTemplateName}
        </button>

        <button className="btn-switch-template" onClick={onSwitch}>
          Switch to {proposedTemplate.name}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
