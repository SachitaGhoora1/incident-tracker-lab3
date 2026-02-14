// services/api.js
import { config } from '../config.js';

const BASE = config.API_BASE_URL;

async function handleJson(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) ||
      `Request failed with status ${res.status}`;
    const details = body && body.details ? body.details : null;
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }

  return body;
}

export async function health() {
  const res = await fetch(`${BASE}/health`);
  return handleJson(res);
}

export async function listIncidents(includeArchived = false) {
  const url = includeArchived 
    ? `${BASE}/api/incidents?includeArchived=true`
    : `${BASE}/api/incidents`;
  const res = await fetch(url);
  return handleJson(res);
}

export async function getIncident(id) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}`);
  return handleJson(res);
}

export async function createIncident(payload) {
  const res = await fetch(`${BASE}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson(res);
}

export async function changeIncidentStatus(id, status) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return handleJson(res);
}

// NEW: Archive an incident
export async function archiveIncident(id) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return handleJson(res);
}

// NEW: Unarchive an incident
export async function unarchiveIncident(id) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}/unarchive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return handleJson(res);
}

export async function bulkUploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/api/incidents/bulk-upload`, {
    method: "POST",
    body: fd
  });

  return handleJson(res);
}