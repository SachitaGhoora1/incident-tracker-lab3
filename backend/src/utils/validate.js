import { config } from '../../config.js';

export const categories = ["IT", "SAFETY", "FACILITIES", "OTHER"];
export const severities = ["LOW", "MEDIUM", "HIGH"];

export function validateCreateIncident(body) {
  const errors = [];

  if (!body.title || body.title.length < 5) errors.push("Invalid title");
  if (!body.description || body.description.length < 10) errors.push("Invalid description");
  if (!categories.includes(body.category)) errors.push("Invalid category");
  if (!severities.includes(body.severity)) errors.push("Invalid severity");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity
    }
  };
}

export function validateStatusChange(current, next) {
  // Define allowed transitions including ARCHIVED
  const transitions = {
    [config.STATUSES.OPEN]: [config.STATUSES.INVESTIGATING],
    [config.STATUSES.INVESTIGATING]: [config.STATUSES.RESOLVED],
    [config.STATUSES.RESOLVED]: [], // RESOLVED cannot transition directly (use archive)
    [config.STATUSES.ARCHIVED]: [] // ARCHIVED cannot transition directly (use unarchive)
  };

  // Special case for ARCHIVED status
  if (next === config.STATUSES.ARCHIVED) {
    // Check if current status is allowed to be archived
    if (!config.ARCHIVE_ALLOWED_FROM.includes(current)) {
      return { 
        ok: false, 
        error: `Cannot archive from ${current} status. Only ${config.ARCHIVE_ALLOWED_FROM.join(' or ')} incidents can be archived.` 
      };
    }
    return { ok: true, next };
  }

  // Check normal transitions
  if (!transitions[current] || !transitions[current].includes(next)) {
    return { ok: false, error: "Invalid status transition" };
  }

  return { ok: true, next };
}