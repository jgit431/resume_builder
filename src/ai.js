// All AI calls go through the backend server — the API key never touches the browser.

async function post(endpoint, body) {
  const res = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(err.error || `Server error ${res.status}`);
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
