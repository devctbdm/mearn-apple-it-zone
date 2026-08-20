// Pathao Courier integration (sandbox + production).
// Docs base: process.env.BASE_URL (e.g. https://courier-api-sandbox.pathao.com)

const BASE_URL = process.env.BASE_URL || 'https://courier-api-sandbox.pathao.com';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// Pathao's required webhook response secret (merchant-specific). Used as the
// fallback so the webhook works even with no .env entry.
const WEBHOOK_SECRET_DEFAULT = 'f3992ecc-59da-4cbe-a049-a13da2018d51';

let tokenCache = { token: null, expiresAt: 0 };
let configCache = null;
let configLoadedAt = 0;
const CONFIG_TTL = 60 * 1000;

// Resolve the active Pathao config. Prefers the DB-backed admin config; falls
// back to environment variables when the config doc is missing or the DB is
// unavailable, so behaviour is unchanged on first boot.
export async function loadConfig() {
  if (configCache && Date.now() - configLoadedAt < CONFIG_TTL) return configCache;
  try {
    const DeliveryConfig = (await import('../models/DeliveryConfig.js')).default;
    const cfg = await DeliveryConfig.findOne({ key: 'pathao' });
    if (cfg) {
      configCache = {
        baseUrl: cfg.baseUrl || BASE_URL,
        clientId: cfg.clientId || CLIENT_ID || '',
        clientSecret: cfg.clientSecret || CLIENT_SECRET || '',
        username: cfg.username || USERNAME || '',
        password: cfg.password || PASSWORD || '',
        webhookSecret:
          cfg.webhookSecret || process.env.PATHAO_WEBHOOK_SECRET || WEBHOOK_SECRET_DEFAULT,
      };
      configLoadedAt = Date.now();
      return configCache;
    }
  } catch {
    // fall through to env defaults
  }
  const fallback = {
    baseUrl: BASE_URL,
    clientId: CLIENT_ID || '',
    clientSecret: CLIENT_SECRET || '',
    username: USERNAME || '',
    password: PASSWORD || '',
    webhookSecret: process.env.PATHAO_WEBHOOK_SECRET || WEBHOOK_SECRET_DEFAULT,
  };
  configCache = fallback;
  configLoadedAt = Date.now();
  return configCache;
}

export function invalidateConfigCache() {
  configCache = null;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// Extract a token from the issue-token response (shapes differ per client lib).
function extractToken(data) {
  if (!data) return null;
  return (
    data.token ||
    data.access_token ||
    data.data?.token ||
    data.data?.access_token ||
    null
  );
}

export async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const cfg = await loadConfig();
  const res = await fetch(`${cfg.baseUrl}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      username: cfg.username,
      password: cfg.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  const token = extractToken(data);
  if (!token) {
    const err = new Error(
      data?.message || 'Pathao authentication failed'
    );
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  // Default 55-min lifetime (tokens are ~60 min).
  tokenCache.token = token;
  tokenCache.expiresAt = Date.now() + 55 * 60 * 1000;
  return token;
}

async function apiGet(path) {
  const cfg = await loadConfig();
  const token = await getToken();
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Pathao GET ${path} failed`);
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}

async function apiPost(path, body = {}) {
  const cfg = await loadConfig();
  const token = await getToken();
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Pathao POST ${path} failed`);
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}

// Pull an array out of the various Pathao response envelopes.
function extractList(obj) {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && Array.isArray(obj.data.data)) return obj.data.data;
  if (Array.isArray(obj.cities)) return obj.cities;
  if (Array.isArray(obj.zones)) return obj.zones;
  if (Array.isArray(obj.areas)) return obj.areas;
  return [];
}

// Normalize location items to { id, name }.
function normalizeLocation(item) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.city_id ?? item.zone_id ?? item.area_id;
  const name =
    item.name ??
    item.city_name ??
    item.zone_name ??
    item.area_name ??
    '';
  if (id == null || !name) return null;
  return { id, name: String(name) };
}

// Try multiple candidate endpoints; return first that yields a list.
async function tryLocations(paths) {
  let lastErr;
  for (const p of paths) {
    try {
      const data = await apiGet(p);
      const list = extractList(data).map(normalizeLocation).filter(Boolean);
      if (list.length) return list;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

export const pathaoService = {
  getStores: async () => {
    const data = await apiGet('/aladdin/api/v1/stores');
    return extractList(data);
  },

  getCities: async () => {
    return tryLocations([
      '/aladdin/api/v1/cities',
      '/aladdin/api/v1/city-list',
      '/aladdin/api/v1/countries/1/city-list',
      '/aladdin/api/v1/countries/1/city_list',
    ]);
  },

  getZones: async (cityId) => {
    return tryLocations([
      `/aladdin/api/v1/cities/${cityId}/zone-list`,
      `/aladdin/api/v1/zones?city_id=${cityId}`,
    ]);
  },

  getAreas: async (zoneId) => {
    return tryLocations([
      `/aladdin/api/v1/zones/${zoneId}/area-list`,
      `/aladdin/api/v1/areas?zone_id=${zoneId}`,
    ]);
  },

  // Create a delivery order. `payload` is the raw Pathao order body.
  createOrder: async (payload) => {
    const data = await apiPost('/aladdin/api/v1/orders', payload);
    // Success responses wrap data in `data` (or `data.data`).
    return data?.data ?? data;
  },

  getOrderInfo: async (consignmentId) => {
    const data = await apiGet(
      `/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`
    );
    return data?.data ?? data;
  },

  cancelOrder: async (consignmentId) => {
    const data = await apiPost(
      `/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/cancel`,
      {}
    );
    return data?.data ?? data;
  },
};
