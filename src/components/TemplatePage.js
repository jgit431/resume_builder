import React from 'react';
import { TEMPLATES } from './HomePage';
import Header from './Header';
import './TemplatePage.css';

// Generates an SVG thumbnail based on template characteristics
function TemplateSVG({ template }) {
  const { styles, pageSettings } = template;
  const align   = styles.personal?.headerAlign ?? 'left';
  const color   = pageSettings.colorAccents !== false ? '#2a6b6b' : '#888';
  const noColor = pageSettings.colorAccents === false;
  const tight   = (pageSettings.marginLeft ?? 1) <= 0.6;
  const wide    = (pageSettings.marginLeft ?? 1) >= 1.2;
  const mx      = tight ? 6 : wide ? 18 : 12;
  const my      = tight ? 6 : wide ? 16 : 10;
  const gap     = (pageSettings.lineHeight ?? 1.6) >= 1.8 ? 6 : tight ? 2 : 4;
  const serif   = (styles.experience?.fontFamily ?? '').includes('Georgia') ||
                  (styles.experience?.fontFamily ?? '').includes('Garamond') ||
                  (styles.experience?.fontFamily ?? '').includes('Times');
  const mono    = (styles.experience?.fontFamily ?? '').includes('Courier');
  const marker  = styles.skills?.separator === 'marker';
  const icons   = styles.personal?.showIcons !== false;
  const W = 120, H = 160;
  const cw = W - mx * 2; // content width

  // Name bar width / alignment
  const nameW = serif ? 58 : mono ? 62 : 54;
  const nameX = align === 'right' ? W - mx - nameW
              : align === 'center' ? mx + (cw - nameW) / 2
              : mx;
  const titleW = 36;
  const titleX = align === 'right' ? W - mx - titleW
               : align === 'center' ? mx + (cw - titleW) / 2
               : mx;

  // Contact dots
  const contactItems = icons ? [14, 28, 42] : [12, 24, 36];
  const contactY = my + 18;
  const contactStartX = align === 'right' ? W - mx - 50
                      : align === 'center' ? mx + (cw - 52) / 2
                      : mx;

  // Line heights for entries
  const lh = tight ? 3 : gap >= 5 ? 4.5 : 3.5;

  let y = contactY + 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect width={W} height={H} fill="white"/>

      {/* Name */}
      <rect x={nameX} y={my} width={nameW} height={serif ? 8 : mono ? 7 : 7.5} rx={serif ? 0.5 : 1} fill="#1a1a1a"/>
      {/* Title */}
      <rect x={titleX} y={my + 11} width={titleW} height={3} rx={0.5} fill="#666"/>
      {/* Divider */}
      <rect x={mx} y={my + 17} width={cw} height={noColor ? 1.5 : 1} fill={noColor ? '#1a1a1a' : color}/>

      {/* Contact icons */}
      {icons && contactItems.map((offset, i) => (
        <circle key={i} cx={contactStartX + offset} cy={contactY + 3} r={2} fill={color}/>
      ))}
      {!icons && contactItems.map((offset, i) => (
        <rect key={i} x={contactStartX + offset - 6} y={contactY + 1} width={12} height={2.5} rx={0.5} fill="#bbb"/>
      ))}

      {/* Section: Experience */}
      {(() => { y = contactY + 13; return null; })()}
      <rect x={mx} y={y} width={30} height={2.5} rx={0.5} fill={color}/>
      <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>

      {/* Entry 1 */}
      {(() => { y += 8; return null; })()}
      <rect x={mx} y={y} width={45} height={3} rx={0.5} fill="#1a1a1a"/>
      {[0,1,2].map(i => (
        <rect key={i} x={mx + 3} y={y + 5 + i * (lh + gap)} width={[cw-3, cw-8, cw-5][i]} height={lh} rx={0.5} fill="#ddd"/>
      ))}

      {/* Entry 2 */}
      {(() => { y += 5 + 3 * (lh + gap) + 5; return null; })()}
      <rect x={mx} y={y} width={40} height={3} rx={0.5} fill="#1a1a1a"/>
      {[0,1].map(i => (
        <rect key={i} x={mx + 3} y={y + 5 + i * (lh + gap)} width={[cw-6, cw-3][i]} height={lh} rx={0.5} fill="#ddd"/>
      ))}

      {/* Section: Education */}
      {(() => { y += 5 + 2 * (lh + gap) + 6; return null; })()}
      {y < H - 30 && <>
        <rect x={mx} y={y} width={28} height={2.5} rx={0.5} fill={color}/>
        <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>
        <rect x={mx} y={y + 8} width={42} height={3} rx={0.5} fill="#1a1a1a"/>
        <rect x={mx} y={y + 13} width={30} height={lh} rx={0.5} fill="#ddd"/>
      </>}

      {/* Section: Skills */}
      {(() => { y += 20; return null; })()}
      {y < H - 20 && <>
        <rect x={mx} y={y} width={22} height={2.5} rx={0.5} fill={color}/>
        <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>
        {marker ? (
          // Marker-style dots
          [0,1,2,3].map(i => (
            <g key={i}>
              <circle cx={mx + i * 28 + 3} cy={y + 11} r={1.5} fill={color}/>
              <rect x={mx + i * 28 + 7} y={y + 9} width={14} height={3} rx={0.5} fill="#ddd"/>
            </g>
          ))
        ) : (
          // Comma-style inline
          <>
            <rect x={mx} y={y + 8} width={cw} height={lh} rx={0.5} fill="#ddd"/>
            {y + 8 + lh + 3 < H - 4 && <rect x={mx} y={y + 8 + lh + 3} width={cw * 0.7} height={lh} rx={0.5} fill="#ddd"/>}
          </>
        )}
      </>}
    </svg>
  );
}

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
