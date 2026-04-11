// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER TEMPLATES
//
// One template per resume template. Each shares the same font, color scheme,
// and accent as its resume counterpart, but always uses a clean single-column
// layout regardless of the resume's layout.
//
// resumeTemplateId — links this template to its resume pair for auto-sync.
// styles           — mirrors the resume template's visual identity.
// pageSettings     — always single-column, adjusted margins/spacing per style.
// ─────────────────────────────────────────────────────────────────────────────

export const COVER_LETTER_TEMPLATES = [
  {
    id: 'classic-cl',
    resumeTemplateId: 'classic',
    name: 'Classic',
    description: 'Clean left-aligned header, teal accents. Pairs with the Classic resume.',
    styles: {
      headerAlign: 'left',
      fontFamily:  'DM Sans',
      fontSize:    13,
      colorScheme: 'teal',
    },
    pageSettings: {
      marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0,
      lineHeight: 1.6, colorScheme: 'teal',
    },
  },
  {
    id: 'modern-cl',
    resumeTemplateId: 'modern',
    name: 'Modern',
    description: 'Centered header, bold accent line. Pairs with the Modern resume.',
    styles: {
      headerAlign: 'center',
      fontFamily:  'DM Sans',
      fontSize:    13,
      colorScheme: 'teal',
    },
    pageSettings: {
      marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75,
      lineHeight: 1.7, colorScheme: 'teal',
    },
  },
  {
    id: 'executive-cl',
    resumeTemplateId: 'executive',
    name: 'Executive',
    description: 'Georgia serif, centered, no color. Pairs with the Executive resume.',
    styles: {
      headerAlign: 'center',
      fontFamily:  'Georgia',
      fontSize:    13,
      colorScheme: 'none',
    },
    pageSettings: {
      marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.25, marginRight: 1.25,
      lineHeight: 1.8, colorScheme: 'none',
    },
  },
  {
    id: 'minimal-cl',
    resumeTemplateId: 'minimal',
    name: 'Minimal',
    description: 'No color, tight spacing, content-first. Pairs with the Minimal resume.',
    styles: {
      headerAlign: 'left',
      fontFamily:  'DM Sans',
      fontSize:    12,
      colorScheme: 'none',
    },
    pageSettings: {
      marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75,
      lineHeight: 1.5, colorScheme: 'none',
    },
  },
  {
    id: 'sidebar-cl',
    resumeTemplateId: 'sidebar',
    name: 'Sidebar',
    description: 'Teal accent header, single column. Pairs with the Sidebar resume.',
    styles: {
      headerAlign: 'left',
      fontFamily:  'DM Sans',
      fontSize:    12,
      colorScheme: 'teal',
    },
    pageSettings: {
      marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75,
      lineHeight: 1.6, colorScheme: 'teal',
    },
  },
  {
    id: 'executive-photo-cl',
    resumeTemplateId: 'executive-photo',
    name: 'Executive Photo',
    description: 'Georgia serif, centered, refined. Pairs with the Executive Photo resume.',
    styles: {
      headerAlign: 'center',
      fontFamily:  'Georgia',
      fontSize:    13,
      colorScheme: 'none',
    },
    pageSettings: {
      marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0,
      lineHeight: 1.7, colorScheme: 'none',
    },
  },
];

// Helper — find the cover letter template that pairs with a given resume template id
export function getCoverLetterTemplate(resumeTemplateId) {
  return COVER_LETTER_TEMPLATES.find(t => t.resumeTemplateId === resumeTemplateId)
    ?? COVER_LETTER_TEMPLATES[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// CoverLetterTemplateSVG — thumbnail for each template card.
//
// Shows a single-column letter layout: header (name + contact), greeting,
// body paragraphs, and closing — styled to match the template's identity.
// ─────────────────────────────────────────────────────────────────────────────
export function CoverLetterTemplateSVG({ template }) {
  const { styles, pageSettings } = template;
  const W = 120, H = 160;

  const scheme  = pageSettings.colorScheme ?? 'teal';
  const noColor = scheme === 'none';
  const color   = noColor ? '#888' : {
    teal: '#2a6b6b', navy: '#1e3a5f', burgundy: '#7a2040',
    forest: '#2d5a2d', slate: '#455a64', coral: '#c4522e',
  }[scheme] ?? '#2a6b6b';

  const align  = styles.headerAlign ?? 'left';
  const serif  = (styles.fontFamily ?? '').includes('Georgia');
  const tight  = (pageSettings.marginLeft ?? 1.0) <= 0.8;
  const wide   = (pageSettings.marginLeft ?? 1.0) >= 1.2;
  const mx     = tight ? 8 : wide ? 18 : 12;
  const cw     = W - mx * 2; // content width

  // Name block width varies by font
  const nameW  = serif ? 60 : 52;
  const nameX  = align === 'center' ? mx + (cw - nameW) / 2
               : align === 'right'  ? W - mx - nameW
               : mx;

  const contactW = 72;
  const contactX = align === 'center' ? mx + (cw - contactW) / 2
                 : align === 'right'  ? W - mx - contactW
                 : mx;

  // Divider line under header
  const dividerY = 28;

  // Body block widths — slightly ragged right for realism
  const bodyLines = [cw, cw - 6, cw, cw - 12, cw - 4, cw, cw - 8, cw - 16];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <rect width={W} height={H} fill="white"/>

      {/* ── Name ── */}
      <rect
        x={nameX} y={10}
        width={nameW} height={serif ? 7 : 6}
        rx={serif ? 0.5 : 1}
        fill="#1a1a1a"
      />

      {/* ── Contact line ── */}
      <rect
        x={contactX} y={20}
        width={contactW} height={2}
        rx={0.5}
        fill="#aaa"
      />

      {/* ── Header divider ── */}
      <rect
        x={mx} y={dividerY}
        width={cw} height={noColor ? 1.5 : 1}
        fill={noColor ? '#1a1a1a' : color}
      />

      {/* ── Date ── */}
      <rect x={mx} y={34} width={30} height={2} rx={0.5} fill="#ccc"/>

      {/* ── Recipient block ── */}
      <rect x={mx} y={40} width={44} height={2.5} rx={0.5} fill="#888"/>
      <rect x={mx} y={44} width={36} height={2}   rx={0.5} fill="#bbb"/>
      <rect x={mx} y={48} width={52} height={2}   rx={0.5} fill="#bbb"/>

      {/* ── Salutation ── */}
      <rect x={mx} y={55} width={48} height={2.5} rx={0.5} fill="#444"/>

      {/* ── Body paragraphs ── */}
      {bodyLines.map((w, i) => (
        <rect
          key={i}
          x={mx}
          y={61 + i * 5.5}
          width={w}
          height={2.5}
          rx={0.5}
          fill="#ddd"
        />
      ))}

      {/* ── Gap between paragraphs ── */}
      {[0].map(i => (
        <rect key={i} x={mx} y={61 + 4 * 5.5 + 2} width={cw - 10} height={2.5} rx={0.5} fill="#ddd"/>
      ))}

      {/* ── Closing ── */}
      <rect x={mx} y={114} width={36} height={2.5} rx={0.5} fill="#888"/>
      <rect x={mx} y={124} width={nameW * 0.7} height={2.5} rx={0.5} fill="#444"/>
    </svg>
  );
}
