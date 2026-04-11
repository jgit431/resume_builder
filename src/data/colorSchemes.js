// ─────────────────────────────────────────────────────────────────────────────
// COLOR SCHEMES
//
// Each scheme defines:
//   accent      — primary color for section titles, icons, dividers, skill dots
//   sidebarBg   — sidebar background (Sidebar template)
//   sidebarBorder — sidebar divider line (Sidebar template)
//   divider     — section title underline color (subtler than accent for some)
//   name        — display label
//   swatch      — hex color shown in the color picker swatch
//
// 'none' = black and white, no color accents.
// Add a new scheme here and it automatically appears in the Page Setup picker.
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR_SCHEMES = {
  teal: {
    name: 'Teal',
    swatch: '#2a6b6b',
    accent: '#2a6b6b',
    sidebarBg: '#e8f2f2',
    sidebarBorder: '#c8e0e0',
    divider: '#ddd',
  },
  navy: {
    name: 'Navy',
    swatch: '#1e3a5f',
    accent: '#1e3a5f',
    sidebarBg: '#e6ecf4',
    sidebarBorder: '#b8cce0',
    divider: '#ddd',
  },
  burgundy: {
    name: 'Burgundy',
    swatch: '#7a2040',
    accent: '#7a2040',
    sidebarBg: '#f4e8ed',
    sidebarBorder: '#e0b8c8',
    divider: '#ddd',
  },
  forest: {
    name: 'Forest',
    swatch: '#2d5a2d',
    accent: '#2d5a2d',
    sidebarBg: '#e8f0e8',
    sidebarBorder: '#b8d4b8',
    divider: '#ddd',
  },
  slate: {
    name: 'Slate',
    swatch: '#455a64',
    accent: '#455a64',
    sidebarBg: '#eaeff1',
    sidebarBorder: '#c0d0d8',
    divider: '#ddd',
  },
  coral: {
    name: 'Coral',
    swatch: '#c4522e',
    accent: '#c4522e',
    sidebarBg: '#faeae4',
    sidebarBorder: '#e8c4b8',
    divider: '#ddd',
  },
  none: {
    name: 'None',
    swatch: '#1a1a1a',
    accent: '#1a1a1a',
    sidebarBg: '#f5f5f5',
    sidebarBorder: '#ddd',
    divider: '#1a1a1a',
  },
};

export const DEFAULT_COLOR_SCHEME = 'teal';

// Helper — get the scheme object, falling back to teal
export function getScheme(colorScheme) {
  return COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES.teal;
}
