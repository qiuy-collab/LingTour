const configuredBase =
  process.env.LINGTOUR_API_BASE ||
  process.env.LINGTOUR_API_ORIGIN ||
  'https://api.lingfengtranstour.cn';

const normalizedBase = configuredBase.replace(/\/+$/, '');
const apiBase = normalizedBase.endsWith('/api/v1')
  ? normalizedBase
  : `${normalizedBase}/api/v1`;
const origin = apiBase.replace(/\/api\/v1$/, '');
const timeoutMs = Number(process.env.LINGTOUR_SMOKE_TIMEOUT_MS || 10_000);
const mediaTimeoutMs = Number(
  process.env.LINGTOUR_SMOKE_MEDIA_TIMEOUT_MS || 20_000,
);
const mediaRetries = Number(process.env.LINGTOUR_SMOKE_MEDIA_RETRIES || 2);

const publicEndpoints = [
  { path: '/public/home', data: 'object' },
  { path: '/public/settings' },
  { path: '/public/cities', data: true },
  { path: '/public/routes', data: true },
  { path: '/public/routes/stats' },
  { path: '/public/shop/collections', data: true },
  { path: '/public/shop/products', data: true },
  { path: '/public/shop/featured' },
  { path: '/public/interpreting' },
  { path: '/public/community/posts', data: true },
  { path: '/public/community/briefs', data: true },
  { path: '/public/events', data: true },
];

const adminEndpoints = [
  '/admin/dashboard',
  '/admin/home',
  '/admin/settings',
  '/admin/cities?page=1&limit=100',
  '/admin/routes?page=1&limit=100',
  '/admin/shop/collections?page=1&pageSize=100',
  '/admin/shop/products?page=1&limit=100',
  '/admin/shop/featured',
  '/admin/interpreting',
  '/admin/interpreting/modes?page=1&pageSize=100',
  '/admin/interpreting/profiles?page=1&pageSize=100',
  '/admin/interpreting/faqs?page=1&pageSize=100',
  '/admin/bookings?page=1&pageSize=100',
  '/admin/orders?page=1&pageSize=100',
  '/admin/upload/files?page=1&limit=100',
  '/admin/upload/media?page=1&limit=100',
  '/admin/upload/media/orphans',
  '/admin/users?page=1&pageSize=100',
  '/admin/users/staff?page=1&pageSize=100',
  '/admin/audit-logs?page=1&pageSize=100',
  '/admin/audit-logs/stats',
  '/admin/community/posts?page=1&limit=100&includeDeleted=true',
  '/admin/community/briefs?page=1&limit=100',
  '/admin/events?page=1&limit=100',
  '/admin/notifications?page=1&pageSize=100',
  '/admin/notifications/unread-count',
  '/auth/me',
  '/auth/me/favorites',
  '/account/interpreting/bookings',
  '/public/community/me/reactions',
  '/public/community/me/saves',
];

const detailChecks = [
  { list: '/public/cities?limit=100', detail: '/public/cities/', key: 'slug' },
  { list: '/public/routes?limit=100', detail: '/public/routes/', key: 'slug' },
  {
    list: '/public/shop/products?limit=100',
    detail: '/public/shop/products/',
    key: 'slug',
  },
  { list: '/public/events?limit=100', detail: '/public/events/', key: 'slug' },
  { list: '/public/community/posts?limit=100', detail: '/public/community/posts/', key: 'id' },
  { list: '/admin/cities?page=1&limit=100', detail: '/admin/cities/', key: 'id', auth: true },
  { list: '/admin/routes?page=1&limit=100', detail: '/admin/routes/', key: 'id', auth: true },
  {
    list: '/admin/shop/collections?page=1&pageSize=100',
    detail: '/admin/shop/collections/',
    key: 'id',
    auth: true,
  },
  {
    list: '/admin/shop/products?page=1&limit=100',
    detail: '/admin/shop/products/',
    key: 'id',
    auth: true,
  },
  {
    list: '/admin/interpreting/modes?page=1&pageSize=100',
    detail: '/admin/interpreting/modes/',
    key: 'id',
    auth: true,
  },
  {
    list: '/admin/interpreting/profiles?page=1&pageSize=100',
    detail: '/admin/interpreting/profiles/',
    key: 'id',
    auth: true,
  },
  {
    list: '/admin/interpreting/faqs?page=1&pageSize=100',
    detail: '/admin/interpreting/faqs/',
    key: 'id',
    auth: true,
  },
  { list: '/admin/bookings?page=1&pageSize=100', detail: '/admin/bookings/', key: 'id', auth: true },
  { list: '/admin/orders?page=1&pageSize=100', detail: '/admin/orders/', key: 'id', auth: true },
  {
    list: '/admin/community/posts?page=1&limit=100&includeDeleted=true',
    detail: '/admin/community/posts/',
    key: 'id',
    auth: true,
  },
  {
    list: '/admin/community/briefs?page=1&limit=100',
    detail: '/admin/community/briefs/',
    key: 'id',
    auth: true,
  },
  { list: '/admin/events?page=1&limit=100', detail: '/admin/events/', key: 'id', auth: true },
];

const results = [];
const responseBodies = [];

function withTimeout(options = {}) {
  return { ...options, signal: AbortSignal.timeout(timeoutMs) };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function unwrapList(body) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];

  const candidates = [body.data, body.items, body.results, body.data?.data, body.data?.items];
  return candidates.find(Array.isArray) || [];
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function shouldCollectMedia(path) {
  return (
    !path.startsWith('/admin/audit-logs') &&
    !path.includes('includeDeleted=true')
  );
}

async function apiRequest(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${apiBase}${path}`, withTimeout({ headers }));
  const body = await readJson(response);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  if (shouldCollectMedia(path)) responseBodies.push(body);
  return body;
}

async function obtainToken() {
  if (process.env.LINGTOUR_ADMIN_TOKEN) return process.env.LINGTOUR_ADMIN_TOKEN;

  const email = process.env.LINGTOUR_ADMIN_EMAIL;
  const password = process.env.LINGTOUR_ADMIN_PASSWORD;
  if (!email || !password) return '';

  const response = await fetch(
    `${apiBase}/auth/login`,
    withTimeout({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
  const body = await readJson(response);
  if (!response.ok || !body?.access_token) {
    throw new Error(`管理员登录失败：${response.status}`);
  }
  return body.access_token;
}

function record(group, path, ok, detail = '') {
  results.push({ group, path, ok, detail });
}

async function checkEndpoint(group, path, token, requireData = false) {
  try {
    const body = await apiRequest(path, token);
    const items = unwrapList(body);
    if (requireData === true && items.length === 0) {
      throw new Error('接口可用，但没有返回真实数据');
    }
    if (
      requireData === 'object' &&
      (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0)
    ) {
      throw new Error('接口可用，但没有返回配置数据');
    }
    record(group, path, true, items.length ? `${items.length} 条` : '响应正常');
    return body;
  } catch (error) {
    record(group, path, false, error.message);
    return null;
  }
}

function collectMedia(value, state, inMediaField = false) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMedia(item, state, inMediaField));
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, item] of Object.entries(value)) {
    const mediaField =
      inMediaField ||
      /(?:image|avatar|poster|media|gallery|video|thumbnail|cover)/i.test(key);

    if (typeof item === 'string') {
      if (item.startsWith('/uploads/')) state.paths.add(item);
      if (mediaField && /^https?:\/\//i.test(item)) state.external.add(item);
      continue;
    }
    collectMedia(item, state, mediaField);
  }
}

async function checkMediaFiles() {
  const state = { paths: new Set(), external: new Set() };
  responseBodies.forEach((body) => collectMedia(body, state));

  for (const url of state.external) {
    record('media-policy', url, false, '发现外部媒体链接');
  }

  await mapWithConcurrency([...state.paths], 3, async (path) => {
    let lastError = '';
    for (let attempt = 0; attempt <= mediaRetries; attempt += 1) {
      try {
        const response = await fetch(`${origin}${path}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(mediaTimeoutMs),
        });
        if (response.ok) {
          record('media-file', path, true, `${response.status}`);
          return;
        }
        lastError = `${response.status} ${response.statusText}`;
      } catch (error) {
        lastError = error.message;
      }
      if (attempt < mediaRetries) await wait(250 * (attempt + 1));
    }
    record('media-file', path, false, lastError);
  });

  return { checked: state.paths.size, external: state.external.size };
}

async function mapWithConcurrency(items, concurrency, worker) {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index], index);
      }
    },
  );
  await Promise.all(workers);
}

async function main() {
  console.log(`[live-smoke] ${apiBase}`);

  try {
    const health = await fetch(`${origin}/health`, withTimeout());
    record('system', '/health', health.ok, `${health.status}`);
  } catch (error) {
    record('system', '/health', false, error.message);
  }

  const token = await obtainToken();
  if (!token) {
    throw new Error(
      '缺少后台凭证：设置 LINGTOUR_ADMIN_TOKEN，或同时设置 LINGTOUR_ADMIN_EMAIL 和 LINGTOUR_ADMIN_PASSWORD',
    );
  }

  await Promise.all([
    ...publicEndpoints.map((endpoint) =>
      checkEndpoint('public', endpoint.path, '', endpoint.data),
    ),
    ...adminEndpoints.map((path) => checkEndpoint('admin', path, token)),
  ]);

  await Promise.all(
    detailChecks.map(async (check) => {
      const listBody = await checkEndpoint(
        check.auth ? 'admin-list' : 'public-list',
        check.list,
        check.auth ? token : '',
      );
      const first = unwrapList(listBody)[0];
      const key = first?.[check.key];
      if (!key) {
        record('detail', check.detail, false, `列表中没有可用于详情请求的 ${check.key}`);
        return;
      }
      await checkEndpoint(
        'detail',
        `${check.detail}${encodeURIComponent(key)}`,
        check.auth ? token : '',
      );
    }),
  );

  const media = await checkMediaFiles();
  const failed = results.filter((item) => !item.ok);
  const groups = Object.fromEntries(
    [...new Set(results.map((item) => item.group))].map((group) => [
      group,
      {
        passed: results.filter((item) => item.group === group && item.ok).length,
        failed: results.filter((item) => item.group === group && !item.ok).length,
      },
    ]),
  );

  console.log(
    JSON.stringify(
      {
        target: apiBase,
        requests: results.length,
        passed: results.length - failed.length,
        failed: failed.length,
        media,
        groups,
        failures: failed,
      },
      null,
      2,
    ),
  );

  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[live-smoke] ${error.message}`);
  process.exit(1);
});
