require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const Groq    = require('groq-sdk');

const app  = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Shared Groq caller ─────────────────────────────────────
async function callGroq(systemPrompt, userPrompt) {
  const response = await groq.chat.completions.create({
    model:      'llama-3.1-8b-instant',
    max_tokens: 2000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? '';
}

// ── POST /api/suggest-summary ──────────────────────────────
app.post('/api/suggest-summary', async (req, res) => {
  try {
    const { name, title, skills, experience } = req.body;

    const expSummary = (experience ?? [])
      .filter(e => e.role || e.company)
      .map(e => `${e.role} at ${e.company}`)
      .join(', ');

    const systemPrompt = `You are an expert resume writer. Write a concise, professional 2-3 sentence summary for a resume.
Write in first person without using "I". Be specific and impactful. Return only the summary text, no quotes or extra formatting.`;

    const userPrompt = `Name: ${name || 'Not provided'}
Title: ${title || 'Not provided'}
Experience: ${expSummary || 'Not provided'}
Skills: ${(skills ?? []).join(', ') || 'Not provided'}

Write a strong professional summary for this person's resume.`;

    const summary = await callGroq(systemPrompt, userPrompt);
    res.json({ summary });
  } catch (err) {
    console.error('/api/suggest-summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/suggest-bullets ──────────────────────────────
app.post('/api/suggest-bullets', async (req, res) => {
  try {
    const { role, company, existingBullets } = req.body;
    const filled = (existingBullets ?? []).map((b, i) => ({ text: b.trim(), index: i })).filter(b => b.text);

    if (filled.length === 0) {
      // No existing bullets — generate 3 new ones
      const systemPrompt = `You are an expert resume writer. Generate exactly 3 strong, achievement-oriented bullet points for a resume job entry.
Each bullet should follow the pattern: accomplished X by doing Y, resulting in Z (quantify where possible).
Return exactly 3 bullet points, one per line, with no bullet symbols, numbers, or extra formatting.`;
      const userPrompt = `Job Title: ${role || 'Not provided'}\nCompany: ${company || 'Not provided'}\n\nGenerate 3 strong resume bullet points.`;
      const text = await callGroq(systemPrompt, userPrompt);
      const bullets = text.split('\n')
        .map((l, i) => ({ text: l.replace(/^[-•*\d.)\s]+/, '').trim(), index: i }))
        .filter(b => b.text).slice(0, 3);
      return res.json({ bullets });
    }

    // Improve all bullets in one prompt, preserving their numbering
    const systemPrompt = `You are an expert resume writer. Improve each of the numbered resume bullet points below for the given role.
For each bullet, return an improved version following this pattern: accomplished X by doing Y, resulting in Z (quantify where possible).
Return ONLY the improved bullets, numbered exactly the same way (e.g. "1. improved text"), one per line, no extra commentary.`;

    const bulletList = filled.map(b => `${b.index + 1}. ${b.text}`).join('\n');
    const userPrompt = `Job Title: ${role || 'Not provided'}
Company: ${company || 'Not provided'}

Bullets to improve:
${bulletList}`;

    const text = await callGroq(systemPrompt, userPrompt);

    // Parse "1. text" lines and map back to original indices
    const bullets = text.split('\n')
      .map(l => {
        const match = l.match(/^(\d+)\.\s+(.+)/);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        const original = filled.find(b => b.index + 1 === num);
        if (!original) return null;
        return { text: match[2].trim(), index: original.index };
      })
      .filter(Boolean);

    res.json({ bullets });
  } catch (err) {
    console.error('/api/suggest-bullets error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/parse-resume ─────────────────────────────────
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const systemPrompt = `You are an expert resume parser. Extract structured data from the resume text and return ONLY valid JSON with no extra text, markdown, or code fences.

Return this exact structure:
{
  "personal": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "summary": ""
  },
  "experience": [
    {
      "id": 1,
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": [""]
    }
  ],
  "education": [
    {
      "id": 1,
      "school": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": []
}

Rules:
- Use empty string "" for missing fields, never null
- current = true only if the role has no end date and appears to be ongoing
- bullets should be an array of strings, one per accomplishment
- skills should be a flat array of strings
- dates should be formatted as they appear (e.g. "Jan 2020" or "2020")
- id fields should be sequential integers starting at 1
- Return ONLY the JSON object, nothing else`;

    const text_truncated = text.slice(0, 6000); // stay within token limits
    const raw = await callGroq(systemPrompt, `Parse this resume:\n\n${text_truncated}`);

    // Strip any accidental markdown fences
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ resume: parsed });
  } catch (err) {
    console.error('/api/parse-resume error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Cedar Resumes server running on port ${PORT}`));
