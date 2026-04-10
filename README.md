# Cedar Resumes

A full-stack AI-powered resume builder with live preview, PDF export, multiple layout templates, and headshot support.

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
| `groq-sdk` | AI features (summary suggestions, bullet improvements, PDF parsing) |

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

> The backend must be running for AI features to work (summary suggestions, bullet improvements, and PDF import parsing). The rest of the app works without it.

---

## Project Structure

```
resume_builder/
├── public/
│   └── logos/
│       └── logo.png              # App logo (circular, no words)
├── src/
│   ├── App.js                    # Root component, state, routing
│   ├── ai.js                     # Frontend AI API calls
│   ├── data/
│   │   └── templates.js          # All templates + SVG thumbnails (edit here to add/remove templates)
│   └── components/
│       ├── Header.js / .css      # Builder page header
│       ├── HomePage.js / .css    # Landing page
│       ├── TemplatePage.js / .css # Template selection page
│       ├── FormPanel.js / .css   # Resume editing form
│       └── PreviewPanel.js / .css # Live preview + PDF export
├── server.js                     # Express backend (AI endpoints)
├── .env                          # Your API keys (not committed)
├── .env.example                  # Template for .env
├── package.json
└── package-lock.json
```

---

## Adding or Modifying Templates

All templates are defined in **`src/data/templates.js`**. This is the only file you need to touch.

- **Add a template** — append an object to the `TEMPLATES` array
- **Delete a template** — remove its object
- **Reorder templates** — rearrange the array

For style-only templates (font, alignment, spacing, color), set `layout: 'standard'` and only edit `styles` and `pageSettings`. No other files need to change.

For a new layout (e.g. a colored header band or three-column), you'd also need to build a body component in `PreviewPanel.js`.

---

## AI Features

All AI features require the backend server to be running (`node server.js`).

| Feature | How to trigger |
|---|---|
| **Summary** | Personal tab → ✨ Suggest / ✨ Improve |
| **Bullet points** | Experience tab → ✨ Suggest / ✨ Improve |
| **PDF import** | Home page → Import Existing Resume |

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
