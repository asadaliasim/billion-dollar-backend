function normalizeOrigin(raw) {
  if (!raw) return '';
  return raw.trim().replace(/\/+$/, '');
}

function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
}

function resolveFrontendUrl(requestedOrigin) {
  const allowed = getAllowedOrigins();
  const normalizedRequest = normalizeOrigin(requestedOrigin);

  if (normalizedRequest && allowed.includes(normalizedRequest)) {
    return normalizedRequest;
  }

  return allowed[0] || 'http://localhost:5173';
}

module.exports = { resolveFrontendUrl, getAllowedOrigins };
