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
// Compute safe page cut points — mirrors PreviewPanel logic
// ─────────────────────────────────────────────────────────
function computeCutPoints(el, mTop, mBottom) {
  const totalH = el.scrollHeight;
  const areaH  = PAGE_H - mTop - mBottom;
  if (areaH <= 0 || totalH <= areaH) return { totalH, cutPoints: [] };

  const rawPages = Math.ceil(totalH / areaH);
  const elements = Array.from(el.querySelectorAll(
    '.r-header, .r-section-title, .r-entry-header, .r-bullets li'
  ));
  const cuts = [];
  let searchFrom = 0;

  for (let page = 1; page < rawPages; page++) {
    const idealCut = page * areaH;
    let bestCut    = idealCut;
    for (const elem of elements) {
      const bottom = elem.offsetTop + elem.offsetHeight;
      if (bottom > searchFrom && bottom <= idealCut) bestCut = bottom;
    }
    cuts.push(bestCut);
    searchFrom = bestCut;
  }

  return { totalH, cutPoints: cuts };
}

// ─────────────────────────────────────────────────────────
// Paginated resume preview — one column in the compare view
// ─────────────────────────────────────────────────────────
function ResumePreview({ resume, styles, pageSettings, scale }) {
  const measureRef = useRef(null);
  const [pageSlices, setPageSlices] = useState([{ start: 0, end: PAGE_H }]);

  const layoutType     = pageSettings.layout        ?? 'standard';
  const colorScheme    = pageSettings.colorScheme   ?? 'teal';
  const lineHeight     = pageSettings.lineHeight     ?? 1.6;
  const photoPosition  = pageSettings.photoPosition  ?? 'left';
  const personalStyles = styles.personal ?? {};

  const mTop    = Math.round((pageSettings.marginTop    ?? 1.0) * INCH_PX);
  const mBottom = Math.round((pageSettings.marginBottom ?? 1.0) * INCH_PX);
  const mLeft   = Math.round((pageSettings.marginLeft   ?? 1.0) * INCH_PX);
  const mRight  = Math.round((pageSettings.marginRight  ?? 1.0) * INCH_PX);

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

  // Measure content height and compute page slices
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const { totalH, cutPoints } = computeCutPoints(el, mTop, mBottom);
    const numPages = cutPoints.length + 1;
    setPageSlices(
      Array.from({ length: numPages }, (_, i) => ({
        start: i === 0 ? 0 : cutPoints[i - 1],
        end:   i < cutPoints.length ? cutPoints[i] : totalH,
      }))
    );
  }, [resume, styles, pageSettings, mTop, mBottom]);

  const numPages = pageSlices.length;

  return (
    <>
      {/* Hidden measurement host — natural 650px width, no zoom */}
      <div
        ref={measureRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: RESUME_W,
          background: 'white',
          pointerEvents: 'none',
        }}
      >
        <BodyComponent {...bodyProps} />
      </div>

      {/* Visible paginated stack — all wrapped in zoom so every sheet scales together */}
      <div style={{ zoom: scale, width: RESUME_W }}>
        {pageSlices.map((slice, i) => (
          <React.Fragment key={i}>
            {/* One page sheet */}
            <div
              className="compare-page-sheet"
              style={{ height: PAGE_H }}
            >
              {/* Clip window: starts at top margin, height = slice content */}
              <div
                style={{
                  position: 'absolute',
                  top: mTop,
                  left: 0,
                  right: 0,
                  height: slice.end - slice.start,
                  overflow: 'hidden',
                }}
              >
                {/* Shift full body up so only this slice is visible */}
                <div style={{ position: 'absolute', top: -slice.start, left: 0, right: 0 }}>
                  <BodyComponent {...bodyProps} />
                </div>
              </div>
            </div>

            {/* Gap + label between pages */}
            {i < numPages - 1 && (
              <div className="compare-page-gap">
                <div className="compare-page-gap-rule" />
                <span className="compare-page-gap-label">Page {i + 2}</span>
                <div className="compare-page-gap-rule" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Page count hint below the preview */}
      {numPages > 1 && (
        <div className="compare-page-count">{numPages} pages</div>
      )}
    </>
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
  const colRef = useRef(null);
  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    if (!colRef.current) return;
    const measure = () => {
      const colW = colRef.current?.offsetWidth ?? 600;
      const s    = Math.min(1, (colW - 4) / RESUME_W);
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

      <div className="compare-topbar">
        <span className="compare-topbar-label">Compare Templates</span>
        <span className="compare-topbar-hint">Previewing your resume in two templates side by side</span>
        <span />
      </div>

      <div className="compare-scroll">
        <div className="compare-columns">
          {/* Left: current */}
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

          {/* Right: proposed */}
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
