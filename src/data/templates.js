import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
//
// To add a template:   append an object to the array below.
// To delete:           remove its object.
// To reorder:          rearrange the array — the grid renders in order.
//
// For a style-only template (fonts, spacing, alignment), set layout: 'standard'
// and only touch styles/pageSettings — no other files need to change.
//
// For a brand new layout, you also need to:
//   1. Build a new body component in PreviewPanel.js
//   2. Add a new layout: 'your-id' value
//   3. Add it to the routing switch in PreviewPanel (layoutType check)
//   4. Add an SVG thumbnail branch in TemplateSVG below
//
// features flags — control which UI options appear in the form:
//   photo:           true = shows the headshot upload field in Personal
//   photoPosition:   true = shows the Left/Right toggle in Page Setup
//   skillsSeparator: true = shows Comma/Marker toggle in Skills style options
//   headerAlign:     true = shows header alignment buttons in Personal style options
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and traditional. Timeless for any industry.',
    features: { photo: false, photoPosition: false, skillsSeparator: true, headerAlign: true },
    styles: {
      personal:   { headerAlign: 'left', showIcons: true },
      experience: { fontSize: 13, bulletSpacing: 3 },
      education:  { fontSize: 13 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0, lineHeight: 1.6, colorScheme: 'teal', layout: 'standard', bodyFont: 'DM Sans' },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Centered header, marker skills, teal accents. Bold and contemporary.',
    features: { photo: false, photoPosition: false, skillsSeparator: true, headerAlign: true },
    styles: {
      personal:   { headerAlign: 'center', showIcons: true },
      experience: { fontSize: 13, bulletSpacing: 5 },
      education:  { fontSize: 13 },
      skills:     { separator: 'marker' },
    },
    pageSettings: { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75, lineHeight: 1.7, colorScheme: 'teal', layout: 'standard', bodyFont: 'DM Sans' },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Georgia serif, wide margins, centered, no color. Authoritative and refined.',
    features: { photo: false, photoPosition: false, skillsSeparator: true, headerAlign: true },
    styles: {
      personal:   { headerAlign: 'center', showIcons: false },
      experience: { fontSize: 13, bulletSpacing: 6 },
      education:  { fontSize: 13 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.25, marginRight: 1.25, lineHeight: 1.8, colorScheme: 'none', layout: 'standard', bodyFont: 'Georgia' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'No icons, no color, tight margins. Let the content speak.',
    features: { photo: false, photoPosition: false, skillsSeparator: true, headerAlign: true },
    styles: {
      personal:   { headerAlign: 'left', showIcons: false },
      experience: { fontSize: 12, bulletSpacing: 2 },
      education:  { fontSize: 12 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75, lineHeight: 1.5, colorScheme: 'none', layout: 'standard', bodyFont: 'DM Sans' },
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column layout with photo, contact & skills on the left. Great for creative roles.',
    features: { photo: true, photoPosition: false, skillsSeparator: false, headerAlign: false },
    styles: {
      personal:   { headerAlign: 'left', showIcons: true },
      experience: { fontSize: 12, bulletSpacing: 3 },
      education:  { fontSize: 12 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75, lineHeight: 1.6, colorScheme: 'teal', layout: 'sidebar', photoPosition: 'left', bodyFont: 'DM Sans' },
  },
  {
    id: 'executive-photo',
    name: 'Executive Photo',
    description: 'Classic single-column with an optional circular headshot. Position left or right in Page Setup.',
    features: { photo: true, photoPosition: true, skillsSeparator: true, headerAlign: true },
    styles: {
      personal:   { headerAlign: 'center', showIcons: false },
      experience: { fontSize: 13, bulletSpacing: 5 },
      education:  { fontSize: 13 },
      skills:     { separator: 'comma' },
    },
    pageSettings: { marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0, lineHeight: 1.7, colorScheme: 'none', layout: 'executive-photo', photoPosition: 'left', bodyFont: 'Georgia' },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TemplateSVG — generates a thumbnail for each template card.
//
// To add a thumbnail for a new layout, add an:
//   if (layout === 'your-layout-id') { return <svg>...</svg>; }
// branch before the standard layout fallback at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

export function TemplateSVG({ template }) {
  const { styles, pageSettings } = template;
  const layout  = pageSettings.layout ?? 'standard';
  const scheme  = pageSettings.colorScheme ?? 'teal';
  const color   = scheme === 'none' ? '#888' : {
    teal: '#2a6b6b', navy: '#1e3a5f', burgundy: '#7a2040',
    forest: '#2d5a2d', slate: '#455a64', coral: '#c4522e',
  }[scheme] ?? '#2a6b6b';
  const noColor = scheme === 'none';
  const W = 120, H = 160;

  // ── Sidebar layout thumbnail ──────────────────────────────
  if (layout === 'sidebar') {
    const sideW = 36;
    const sideBg = noColor ? '#f0f0f0' : color + '22';
    return (
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect width={W} height={H} fill="white"/>
        <rect x={0} y={0} width={sideW} height={H} fill={sideBg}/>
        <rect x={sideW} y={0} width={1} height={H} fill={color} opacity={0.3}/>
        <circle cx={sideW/2} cy={20} r={11} fill={color} opacity={0.2}/>
        <circle cx={sideW/2} cy={20} r={11} fill="none" stroke={color} strokeWidth={1}/>
        <rect x={4} y={35} width={28} height={4} rx={0.5} fill="#1a1a1a"/>
        <rect x={6} y={42} width={24} height={2.5} rx={0.5} fill="#888"/>
        <rect x={4} y={50} width={18} height={2} rx={0.5} fill={color}/>
        <rect x={4} y={53} width={28} height={0.5} fill={color} opacity={0.4}/>
        {[0,1,2,3,4].map(i => <rect key={i} x={4} y={56+i*6} width={[22,20,24,18,22][i]} height={2.5} rx={0.5} fill="#ddd"/>)}
        <rect x={4} y={90} width={14} height={2} rx={0.5} fill={color}/>
        <rect x={4} y={93} width={28} height={0.5} fill={color} opacity={0.4}/>
        {[0,1,2,3,4,5].map(i => <rect key={i} x={4} y={96+i*5} width={[20,16,22,18,20,14][i]} height={2.5} rx={0.5} fill="#ddd"/>)}
        <rect x={42} y={10} width={30} height={2} rx={0.5} fill={color}/>
        <rect x={42} y={13} width={74} height={0.5} fill={color} opacity={0.4}/>
        <rect x={42} y={17} width={40} height={3} rx={0.5} fill="#1a1a1a"/>
        {[0,1,2].map(i => <rect key={i} x={46} y={22+i*5} width={[66,58,62][i]} height={2.5} rx={0.5} fill="#ddd"/>)}
        <rect x={42} y={40} width={36} height={3} rx={0.5} fill="#1a1a1a"/>
        {[0,1].map(i => <rect key={i} x={46} y={45+i*5} width={[60,54][i]} height={2.5} rx={0.5} fill="#ddd"/>)}
        <rect x={42} y={58} width={28} height={2} rx={0.5} fill={color}/>
        <rect x={42} y={61} width={74} height={0.5} fill={color} opacity={0.4}/>
        <rect x={42} y={65} width={50} height={3} rx={0.5} fill="#1a1a1a"/>
        <rect x={42} y={70} width={38} height={2.5} rx={0.5} fill="#ddd"/>
        <rect x={42} y={78} width={50} height={3} rx={0.5} fill="#1a1a1a"/>
        <rect x={42} y={83} width={42} height={2.5} rx={0.5} fill="#ddd"/>
      </svg>
    );
  }

  // ── Executive Photo layout thumbnail ──────────────────────
  if (layout === 'executive-photo') {
    const photoPos = pageSettings.photoPosition ?? 'left';
    const photoX = photoPos === 'right' ? 88 : 10;
    const textX  = photoPos === 'right' ? 10 : 32;
    const textW  = 70;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect width={W} height={H} fill="white"/>
        <circle cx={photoX + 11} cy={16} r={11} fill="#ddd"/>
        <circle cx={photoX + 11} cy={16} r={11} fill="none" stroke={noColor ? '#888' : color} strokeWidth={1.5}/>
        <rect x={textX} y={8} width={52} height={5} rx={0.5} fill="#1a1a1a"/>
        <rect x={textX+6} y={16} width={38} height={3} rx={0.5} fill="#666"/>
        <rect x={textX} y={22} width={textW} height={2} rx={0.5} fill="#bbb"/>
        <rect x={10} y={32} width={100} height={1.5} fill={noColor ? '#1a1a1a' : color}/>
        <rect x={10} y={38} width={30} height={2.5} rx={0.5} fill={noColor ? '#555' : color}/>
        <rect x={10} y={42} width={100} height={0.5} fill="#ccc"/>
        <rect x={10} y={46} width={50} height={3} rx={0.5} fill="#1a1a1a"/>
        {[0,1,2].map(i => <rect key={i} x={14} y={51+i*6} width={[88,80,84][i]} height={2.5} rx={0.5} fill="#e8e8e8"/>)}
        <rect x={10} y={72} width={50} height={3} rx={0.5} fill="#1a1a1a"/>
        {[0,1].map(i => <rect key={i} x={14} y={77+i*6} width={[84,72][i]} height={2.5} rx={0.5} fill="#e8e8e8"/>)}
        <rect x={10} y={94} width={28} height={2.5} rx={0.5} fill={noColor ? '#555' : color}/>
        <rect x={10} y={98} width={100} height={0.5} fill="#ccc"/>
        <rect x={10} y={102} width={52} height={3} rx={0.5} fill="#1a1a1a"/>
        <rect x={10} y={107} width={38} height={2.5} rx={0.5} fill="#e8e8e8"/>
        <rect x={10} y={118} width={22} height={2.5} rx={0.5} fill={noColor ? '#555' : color}/>
        <rect x={10} y={122} width={100} height={0.5} fill="#ccc"/>
        <rect x={10} y={126} width={100} height={2.5} rx={0.5} fill="#e8e8e8"/>
        <rect x={10} y={131} width={70} height={2.5} rx={0.5} fill="#e8e8e8"/>
      </svg>
    );
  }

  // ── Standard layout thumbnail (fallback for all style-only templates) ──
  const align  = styles.personal?.headerAlign ?? 'left';
  const tight  = (pageSettings.marginLeft ?? 1) <= 0.6;
  const wide   = (pageSettings.marginLeft ?? 1) >= 1.2;
  const mx     = tight ? 6 : wide ? 18 : 12;
  const my     = tight ? 6 : wide ? 16 : 10;
  const gap    = (pageSettings.lineHeight ?? 1.6) >= 1.8 ? 6 : tight ? 2 : 4;
  const serif  = (pageSettings.bodyFont ?? '').includes('Georgia') ||
                 (pageSettings.bodyFont ?? '').includes('Garamond') ||
                 (pageSettings.bodyFont ?? '').includes('Times');
  const mono   = (pageSettings.bodyFont ?? '').includes('Courier');
  const marker = styles.skills?.separator === 'marker';
  const icons  = styles.personal?.showIcons !== false;
  const cw     = W - mx * 2;

  const nameW = serif ? 58 : mono ? 62 : 54;
  const nameX = align === 'right' ? W - mx - nameW : align === 'center' ? mx + (cw - nameW) / 2 : mx;
  const titleW = 36;
  const titleX = align === 'right' ? W - mx - titleW : align === 'center' ? mx + (cw - titleW) / 2 : mx;
  const contactItems = icons ? [14, 28, 42] : [12, 24, 36];
  const contactY = my + 18;
  const contactStartX = align === 'right' ? W - mx - 50 : align === 'center' ? mx + (cw - 52) / 2 : mx;
  const lh = tight ? 3 : gap >= 5 ? 4.5 : 3.5;
  let y = contactY + 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect width={W} height={H} fill="white"/>
      <rect x={nameX} y={my} width={nameW} height={serif ? 8 : mono ? 7 : 7.5} rx={serif ? 0.5 : 1} fill="#1a1a1a"/>
      <rect x={titleX} y={my + 11} width={titleW} height={3} rx={0.5} fill="#666"/>
      <rect x={mx} y={my + 17} width={cw} height={noColor ? 1.5 : 1} fill={noColor ? '#1a1a1a' : color}/>
      {icons && contactItems.map((offset, i) => <circle key={i} cx={contactStartX + offset} cy={contactY + 3} r={2} fill={color}/>)}
      {!icons && contactItems.map((offset, i) => <rect key={i} x={contactStartX + offset - 6} y={contactY + 1} width={12} height={2.5} rx={0.5} fill="#bbb"/>)}
      {(() => { y = contactY + 13; return null; })()}
      <rect x={mx} y={y} width={30} height={2.5} rx={0.5} fill={color}/>
      <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>
      {(() => { y += 8; return null; })()}
      <rect x={mx} y={y} width={45} height={3} rx={0.5} fill="#1a1a1a"/>
      {[0,1,2].map(i => <rect key={i} x={mx + 3} y={y + 5 + i * (lh + gap)} width={[cw-3, cw-8, cw-5][i]} height={lh} rx={0.5} fill="#ddd"/>)}
      {(() => { y += 5 + 3 * (lh + gap) + 5; return null; })()}
      <rect x={mx} y={y} width={40} height={3} rx={0.5} fill="#1a1a1a"/>
      {[0,1].map(i => <rect key={i} x={mx + 3} y={y + 5 + i * (lh + gap)} width={[cw-6, cw-3][i]} height={lh} rx={0.5} fill="#ddd"/>)}
      {(() => { y += 5 + 2 * (lh + gap) + 6; return null; })()}
      {y < H - 30 && <>
        <rect x={mx} y={y} width={28} height={2.5} rx={0.5} fill={color}/>
        <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>
        <rect x={mx} y={y + 8} width={42} height={3} rx={0.5} fill="#1a1a1a"/>
        <rect x={mx} y={y + 13} width={30} height={lh} rx={0.5} fill="#ddd"/>
      </>}
      {(() => { y += 20; return null; })()}
      {y < H - 20 && <>
        <rect x={mx} y={y} width={22} height={2.5} rx={0.5} fill={color}/>
        <rect x={mx} y={y + 4} width={cw} height={0.5} fill={noColor ? '#aaa' : color} opacity={0.4}/>
        {marker ? (
          [0,1,2,3].map(i => (
            <g key={i}>
              <circle cx={mx + i * 28 + 3} cy={y + 11} r={1.5} fill={color}/>
              <rect x={mx + i * 28 + 7} y={y + 9} width={14} height={3} rx={0.5} fill="#ddd"/>
            </g>
          ))
        ) : (
          <>
            <rect x={mx} y={y + 8} width={cw} height={lh} rx={0.5} fill="#ddd"/>
            {y + 8 + lh + 3 < H - 4 && <rect x={mx} y={y + 8 + lh + 3} width={cw * 0.7} height={lh} rx={0.5} fill="#ddd"/>}
          </>
        )}
      </>}
    </svg>
  );
}
