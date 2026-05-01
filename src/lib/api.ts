const API_BASE = "http://localhost:5000/api";

// ─── HELPER ────────────────────────────────────────────────────────────────
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── ISSUES ────────────────────────────────────────────────────────────────

export async function getIssues(city?: string) {
  const url = city
    ? `${API_BASE}/issues?city=${encodeURIComponent(city)}`
    : `${API_BASE}/issues`;
  return safeFetch<unknown[]>(url) ?? [];
}

export async function getIssuesByCity(city: string) {
  return safeFetch<unknown[]>(`${API_BASE}/issues/city/${encodeURIComponent(city)}`) ?? [];
}

export async function getIssuesByDomain(domain: string, city?: string) {
  const url = city
    ? `${API_BASE}/issues/domain/${domain}?city=${encodeURIComponent(city)}`
    : `${API_BASE}/issues/domain/${domain}`;
  return safeFetch<unknown[]>(url) ?? [];
}

export async function getIssuesByUser(userId: string) {
  return safeFetch<unknown[]>(`${API_BASE}/issues/user/${userId}`) ?? [];
}

export async function createIssue(data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return { data: json, error: res.ok ? null : json };
  } catch {
    return { data: null, error: { message: "Network error. Is the backend running?" } };
  }
}

export async function updateIssueStatus(id: string, status: string, token?: string) {
  const res = await fetch(`${API_BASE}/issues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
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

// ─── WEATHER ───────────────────────────────────────────────────────────────

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weather: string;
  description: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
}

export async function getCityWeather(city: string): Promise<WeatherData | null> {
  return safeFetch<WeatherData>(`${API_BASE}/weather/${encodeURIComponent(city)}`);
}

// ─── CITY STATS (derived from issues) ──────────────────────────────────────

export interface CityStats {
  active: number;
  inProgress: number;
  resolved: number;
  total: number;
}

export async function getCityStats(city: string): Promise<CityStats> {
  const issues = (await getIssuesByCity(city)) as Array<{ status: string }>;
  if (!Array.isArray(issues)) return { active: 0, inProgress: 0, resolved: 0, total: 0 };
  const active = issues.filter(i => i.status === "reported").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;
  return { active, inProgress, resolved, total: issues.length };
}
