const API_BASE = "http://localhost:5000/api";

// ─── ISSUES ────────────────────────────────────────────────────────────────

export async function getIssues(city?: string) {
  const url = city
    ? `${API_BASE}/issues?city=${encodeURIComponent(city)}`
    : `${API_BASE}/issues`;
  const res = await fetch(url);
  return res.json();
}

export async function getIssuesByCity(city: string) {
  const res = await fetch(`${API_BASE}/issues/city/${encodeURIComponent(city)}`);
  return res.json();
}

export async function getIssuesByDomain(domain: string, city?: string) {
  const url = city
    ? `${API_BASE}/issues/domain/${domain}?city=${encodeURIComponent(city)}`
    : `${API_BASE}/issues/domain/${domain}`;
  const res = await fetch(url);
  return res.json();
}

export async function getIssuesByUser(userId: string) {
  const res = await fetch(`${API_BASE}/issues/user/${userId}`);
  return res.json();
}

export async function createIssue(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return { data: json, error: res.ok ? null : json };
}

export async function updateIssueStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/issues/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function upvoteIssue(id: string, userId: string) {
  const res = await fetch(`${API_BASE}/issues/${id}/upvote`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  return res.json();
}
