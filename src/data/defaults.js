// Shared defaults — imported by App.js and CompareView.js
export const DEFAULT_STYLES = {
  personal: {
    headerAlign: 'left',
    showIcons: true,
    iconColor: 'default',
    headerFont: 'DM Serif Display',
    headerNameSize: 32,
    headerContactSize: 12,
  },
  experience: {
    // fontFamily removed — body font now lives in pageSettings.bodyFont
    fontSize: 13,
    bulletSpacing: 3,
    formatting: {
      role:    { bold: true,  italic: false, underline: false },
      company: { bold: false, italic: false, underline: false },
      date:    { bold: false, italic: false, underline: false },
    },
  },
  education: {
    // fontFamily removed — body font now lives in pageSettings.bodyFont
    fontSize: 13,
    formatting: {
      school: { bold: false, italic: false, underline: false },
      degree: { bold: false, italic: false, underline: false },
      date:   { bold: false, italic: false, underline: false },
    },
  },
  skills: {
    separator: 'comma',
    formatting: { bold: false, italic: false, underline: false },
  },
};

export const DEFAULT_PAGE_SETTINGS = {
  marginTop:    1.0,
  marginBottom: 1.0,
  marginLeft:   1.0,
  marginRight:  1.0,
  lineHeight:   1.6,
  colorScheme:  'teal',
  photoPosition: 'left',
  bodyFont:     'DM Sans',
};

/** Build merged sectionStyles from a template object + DEFAULT_STYLES */
export function buildStylesFromTemplate(template) {
  return {
    personal:   { ...DEFAULT_STYLES.personal,   ...template.styles.personal   },
    experience: { ...DEFAULT_STYLES.experience, ...template.styles.experience },
    education:  { ...DEFAULT_STYLES.education,  ...template.styles.education  },
    skills:     { ...DEFAULT_STYLES.skills,      ...template.styles.skills     },
  };
}
