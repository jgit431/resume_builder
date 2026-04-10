// All AI calls go through the backend server — the API key never touches the frontend.
const SERVER = 'http://localhost:3001';

async function post(endpoint, body) {
  const res = await fetch(`${SERVER}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Server error ${res.status}`);
  }
  return res.json();
}

export async function suggestSummary({ name, title, skills, experience }) {
  const { summary } = await post('/api/suggest-summary', { name, title, skills, experience });
  return summary;
}

export async function suggestBullets({ role, company, existingBullets }) {
  const { bullets } = await post('/api/suggest-bullets', { role, company, existingBullets });
  return bullets;
}

export async function parseResume({ text }) {
  const { resume } = await post('/api/parse-resume', { text });
  return resume;
}

