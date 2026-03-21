const API_BASE = "http://localhost:5000/api";

export async function getIssues() {
  const res = await fetch(`${API_BASE}/issues`);
  return res.json();
}

export async function getIssuesByDomain(domain) {
  const res = await fetch(`${API_BASE}/issues/domain/${domain}`);
  return res.json();
}

export async function getIssuesByUser(userId) {
  const res = await fetch(`${API_BASE}/issues/user/${userId}`);
  return res.json();
}

export async function createIssue(data) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateIssueStatus(id, status) {
  const res = await fetch(`${API_BASE}/issues/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
}