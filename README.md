# Cedar Resumes

A full-stack AI-powered resume and cover letter builder with live preview, PDF export, multiple layout templates, headshot support, side-by-side template comparison, and a project-based workspace.

---

## Prerequisites

### 1. Install Node.js

Download and install Node.js (version 18 or higher) from:
**https://nodejs.org** — download the **LTS** version.

To verify the installation worked, run:
```bash
node -v
npm -v
```
Both should print version numbers.

---

## Getting Started

### 2. Clone the repository

```bash
git clone git@github.com:jgit431/resume_builder.git
cd resume_builder
```

### 3. Install all dependencies

```bash
npm install
```

This installs all frontend and backend dependencies listed in `package.json`, including:

| Package | Purpose |
|---|---|
| `react`, `react-dom` | Frontend UI framework |
| `react-scripts` | Create React App toolchain |
| `react-easy-crop` | Circular headshot crop tool |
| `pdfjs-dist` | PDF text extraction for resume import |
| `html2canvas` | Captures the live preview for PDF export |
| `jspdf` | Generates the downloadable PDF |
| `express` | Backend server |
| `cors` | Allows the frontend to talk to the backend |
| `dotenv` | Loads API keys from `.env` |
| `groq-sdk` | AI features (summary suggestions, bullet improvements, PDF parsing, cover letter generation) |

### 4. Set up your API key

Create a `.env` file in the root of the project and add your Groq API key:

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

Replace `your_groq_api_key_here` with your actual key. Get a free Groq API key at **https://console.groq.com**.

> ⚠️ Never commit `.env` to Git. It's already in `.gitignore`.

---

## Running the App

Cedar Resumes requires **two terminals** running simultaneously.

### Terminal 1 — Frontend (React)

```bash
npm start
```

Opens the app at **http://localhost:3000**

### Terminal 2 — Backend (Node/Express)

```bash
node server.js
```

Runs the AI API server at **http://localhost:3001**

> The backend must be running for AI features to work (summary suggestions, bullet improvements, PDF import parsing, and cover letter generation). The rest of the app works without it.

---

## Project Structure

```
resume_builder/
├── public/
│   └── logos/
│       └── logo.png                        # App logo (circular, no words)
├── src/
│   ├── App.js                              # Root component, state, routing, sync prompt
│   ├── ai.js                               # Frontend AI API calls (resume + cover letter)
│   ├── data/
│   │   ├── templates.js                    # Resume templates + SVG thumbnails
│   │   ├── coverLetterTemplates.js         # Cover letter templates + SVG thumbnails
│   │   ├── colorSchemes.js                 # Color scheme definitions
│   │   ├── defaults.js                     # Shared default styles and page settings
│   │   └── projectStore.js                 # Project data model + localStorage persistence
│   └── components/
│       ├── Header.js / .css                # Builder page header
│       ├── Dashboard.js / .css             # Home page — project list + new project cards
│       ├── ProjectHome.js / .css           # Per-project hub (resume + cover letter cards)
│       ├── TemplatePage.js / .css          # Resume template picker (also used in compare mode)
│       ├── CoverLetterTemplatePage.js/.css # Cover letter template picker with resume match highlight
│       ├── FormPanel.js / .css             # Resume editing form
│       ├── PreviewPanel.js / .css          # Resume live preview + PDF export
│       ├── CoverLetterBuilder.js / .css    # Cover letter editor + live preview + PDF export
│       ├── CompareView.js / .css           # Side-by-side template comparison
│       └── PhotoCropModal.js / .css        # Circular headshot crop modal
├── server.js                               # Express backend (AI endpoints)
├── .env                                    # Your API keys (not committed)
├── .env.example                            # Template for .env
├── package.json
└── package-lock.json
```

---

## Project Workspace

Cedar Resumes uses a **project-based** model. Each project can contain one resume and up to 3 cover letters.

**Limits:** 2 resumes total · 6 cover letters total · 3 cover letters per project

### Dashboard (Home)
The home page shows all your projects and lets you start new ones. Three entry points:

- **Resume** — build or import a resume, choose a template
- **Cover Letter** — AI-crafted cover letter (recommends creating a resume first)
- **Full Application** — start with a resume; cover letter can be added from the project hub

### Project Hub
Each project has its own hub showing the resume card and cover letters list. From here you can edit, change template, compare templates, or delete either document. Cover letter items show whether they are linked to the resume.

---

## Adding or Modifying Templates

### Resume templates
All resume templates are defined in **`src/data/templates.js`**. This is the only file you need to touch for style-only changes.

- **Add a template** — append an object to the `TEMPLATES` array
- **Delete a template** — remove its object
- **Reorder templates** — rearrange the array

For style-only templates (font, alignment, spacing, color), set `layout: 'standard'` and only edit `styles` and `pageSettings`. No other files need to change.

For a new layout, you also need to build a body component in `PreviewPanel.js` and add a thumbnail branch in `TemplateSVG`.

### Cover letter templates
All cover letter templates are defined in **`src/data/coverLetterTemplates.js`**. Each template has a `resumeTemplateId` that links it to its matching resume template for the auto-sync feature.

Cover letter templates always use a single-column layout regardless of the resume layout, sharing only the fonts and color scheme.

---

## Compare Templates

From the resume builder, click **Compare** in the preview toolbar to open the template picker in compare mode. Select any template to see your resume rendered side by side in both templates, paginated correctly for each. Click **Keep [Current]** or **Switch to [Template]** at the bottom.

---

## Cover Letter Builder

### Flow
1. From the project hub, click **+ Add Cover Letter**
2. Choose a cover letter style — the one matching your resume template is highlighted
3. Enter the target company and role
4. Click **✨ Generate Full Cover Letter** to have the AI write all four sections at once, or use **✨ Generate / Rewrite** on each section individually
5. Edit any section directly in the textarea
6. Download as PDF from the toolbar

### Sections
The cover letter is structured into four named sections, each independently editable and regeneratable: Opening Paragraph, Body Paragraph 1, Body Paragraph 2, and Closing Paragraph.

### Linked vs. standalone
If the project has a resume, the AI automatically uses the resume's name, title, skills, experience, and education as context. If no resume is linked, a standalone info form appears at the top of the left panel to collect that context manually.

### Template sync
When you change your resume template while a linked cover letter exists, Cedar prompts: *"You changed your resume template to [Name]. Update your cover letter to match?"* You can accept or keep the current cover letter style.

---

## AI Features

All AI features require the backend server to be running (`node server.js`).

| Feature | How to trigger |
|---|---|
| **Resume summary** | Personal tab → ✨ Suggest / ✨ Improve |
| **Resume bullets** | Experience tab → ✨ Suggest / ✨ Improve |
| **PDF import** | Dashboard → Resume → Import PDF |
| **Cover letter — full** | Cover letter builder → ✨ Generate Full Cover Letter |
| **Cover letter — section** | Cover letter builder → ✨ Generate / Rewrite on any section |

AI is powered by **Groq** using `llama-3.1-8b-instant`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your Groq API key from console.groq.com |

---

## Notes

- The backend server must be restarted after any changes to `server.js`:
  ```bash
  node server.js
  ```
- The React frontend hot-reloads automatically on save — no restart needed
- Do not run `npm audit fix --force` — it will break the Create React App toolchain
- `node_modules/` is not committed — always run `npm install` after cloning
- Projects are currently saved to `localStorage`. Full backend persistence is planned for a future release
