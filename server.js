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
    max_tokens: 512,
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

    const existing = (existingBullets ?? []).filter(b => b.trim()).join('\n');

    const systemPrompt = `You are an expert resume writer. Generate exactly 3 strong, achievement-oriented bullet points for a resume job entry.
Each bullet should follow the pattern: accomplished X by doing Y, resulting in Z (quantify where possible).
Return exactly 3 bullet points, one per line, with no bullet symbols, numbers, or extra formatting — just the plain text of each bullet.`;

    const userPrompt = `Job Title: ${role || 'Not provided'}
Company: ${company || 'Not provided'}
${existing ? `Existing bullets for context:\n${existing}` : ''}

Generate 3 strong resume bullet points for this role.`;

    const text = await callGroq(systemPrompt, userPrompt);

    const bullets = text
      .split('\n')
      .map(l => l.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3);

    res.json({ bullets });
  } catch (err) {
    console.error('/api/suggest-bullets error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ResumeForge server running on port ${PORT}`));
