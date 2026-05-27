const base = process.env.LINGTOUR_API_BASE ?? 'https://api.lingfengtranstour.cn/api/v1';
const adminEmail = process.env.LINGTOUR_ADMIN_EMAIL ?? 'admin@lingtour.cn';
const adminPassword = process.env.LINGTOUR_ADMIN_PASSWORD ?? 'LingTour2026!';

const png1x1Base64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9nV4QAAAAASUVORK5CYII=';

function stamp(prefix) {
  return `${prefix}-${Date.now()}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function textOf(value) {
  if (typeof value === 'string') return value;
  return value?.en ?? value?.zh ?? '';
}

function ensure(condition, message, detail) {
  if (!condition) {
    const error = new Error(message);
    error.detail = detail;
    throw error;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, options);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const error = new Error(`${options.method ?? 'GET'} ${path} failed with ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function login() {
  const body = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  return body.access_token;
}

function authHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function record(results, module, action, ok, detail) {
  results.push({ module, action, ok, detail });
}

async function runStep(results, module, action, fn) {
  try {
    const detail = await fn();
    record(results, module, action, true, detail);
    return detail;
  } catch (error) {
    record(results, module, action, false, {
      message: error.message,
      status: error.status,
      body: error.body ?? error.detail ?? null,
    });
    return null;
  }
}

async function getAdmin(token, path) {
  return request(path, { headers: authHeaders(token) });
}

async function sendAdmin(token, path, method, body) {
  return request(path, {
    method,
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

async function testCities(token, results) {
  const slug = stamp('e2e-city');
  const payload = {
    slug,
    name: { zh: `测试城市 ${slug}`, en: `Test City ${slug}` },
    regionLabel: { zh: '测试区域', en: 'Test region' },
    adcode: Number(String(Date.now()).slice(-6)),
    heroImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    heroNarrative: { zh: '测试城市概述', en: 'Test city narrative' },
    tags: [{ zh: '测试标签', en: 'test-tag' }],
    editorIntro: { zh: '测试城市正文', en: 'Test city intro' },
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    foodTitle: { zh: '测试风味', en: 'Test flavors' },
    foodDescription: { zh: '测试美食说明', en: 'Test food copy' },
    foodImages: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    ],
    published: false,
    routeSlugs: [],
    relatedCitySlugs: [],
    sections: [],
  };

  const created = await sendAdmin(token, '/admin/cities', 'POST', payload);
  record(results, 'cities', 'create', true, created.id);

  payload.tags = [{ zh: '已更新标签', en: 'updated-tag' }];
  payload.regionLabel = { zh: '已更新区域', en: 'Updated region' };
  await sendAdmin(token, `/admin/cities/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/cities/${created.id}?rawI18n=true`);
  record(
    results,
    'cities',
    'update',
    updated.tags?.[0]?.en === 'updated-tag' && updated.regionLabel?.en === 'Updated region',
    { tags: updated.tags, regionLabel: updated.regionLabel },
  );

  await request(`/admin/cities/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const deleted = await getAdmin(token, `/admin/cities/${created.id}?rawI18n=true`);
  record(results, 'cities', 'delete', Boolean(deleted.deletedAt), deleted.deletedAt);
}

async function testRoutes(token, results) {
  const cityList = await getAdmin(token, '/admin/cities?page=1&limit=5');
  const city = cityList.data?.[0];
  ensure(city?.slug, 'No city available for route test');

  const slug = stamp('e2e-route');
  const payload = {
    slug,
    title: { zh: `测试路线 ${slug}`, en: `Test Route ${slug}` },
    cultureTag: 'test-culture',
    cityName: { zh: city.name?.zh ?? city.name ?? city.slug, en: city.name?.en ?? city.name ?? city.slug },
    citySlugs: [city.slug],
    duration: { zh: '半天', en: 'Half day' },
    audience: { zh: '首次来访者', en: 'First-time visitors' },
    summary: { zh: '测试路线摘要', en: 'Test route summary' },
    story: { zh: '测试路线故事', en: 'Test route story' },
    coverImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    published: false,
    stops: [
      {
        sortOrder: 0,
        time: '09:00',
        stopName: { zh: '第一站', en: 'Stop One' },
        story: { zh: '站点故事', en: 'Stop story' },
        culturalStory: { zh: '文化解读', en: 'Cultural story' },
        details: [{ zh: '细节', en: 'Detail' }],
        image:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        lat: 21.27,
        lng: 110.36,
      },
    ],
  };

  const created = await sendAdmin(token, '/admin/routes', 'POST', payload);
  record(results, 'routes', 'create', true, created.id);

  payload.summary = { zh: '已更新路线摘要', en: 'Updated route summary' };
  await sendAdmin(token, `/admin/routes/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/routes/${created.id}?rawI18n=true`);
  record(results, 'routes', 'update', textOf(updated.summary) === 'Updated route summary', updated.summary);

  await request(`/admin/routes/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const deleted = await getAdmin(token, `/admin/routes/${created.id}?rawI18n=true`);
  record(results, 'routes', 'delete', Boolean(deleted.deletedAt), deleted.deletedAt);
}

async function testCollections(token, results) {
  const routeList = await getAdmin(token, '/admin/routes?page=1&limit=1');
  const route = routeList.items?.[0];
  ensure(route?.slug, 'No route available for collection test');

  const slug = stamp('e2e-collection');
  const payload = {
    slug,
    title: { zh: `测试系列 ${slug}`, en: `Test Collection ${slug}` },
    routeName: route.title,
    routeSlug: route.slug,
    image:
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
    body: { zh: '测试系列正文', en: 'Test collection body' },
    sortOrder: 0,
    published: false,
  };

  const created = await sendAdmin(token, '/admin/shop/collections', 'POST', payload);
  record(results, 'collections', 'create', true, created.id);

  payload.body = { zh: '已更新系列正文', en: 'Updated collection body' };
  await sendAdmin(token, `/admin/shop/collections/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/shop/collections/${created.id}?rawI18n=true`);
  record(results, 'collections', 'update', textOf(updated.body) === 'Updated collection body', updated.body);

  await request(`/admin/shop/collections/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'collections', 'delete', true, created.id);
}

async function testProducts(token, results) {
  const collections = await getAdmin(token, '/admin/shop/collections?page=1&pageSize=1');
  const collection = collections[0];
  ensure(collection?.id, 'No collection available for product test');

  const slug = stamp('e2e-product');
  const payload = {
    slug,
    name: { zh: `测试商品 ${slug}`, en: `Test Product ${slug}` },
    collectionId: collection.id,
    price: 12.5,
    currency: 'SGD',
    tag: { zh: '测试', en: 'test' },
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    story: { zh: '测试商品故事', en: 'Test product story' },
    material: { zh: '陶', en: 'Ceramic' },
    dimensions: { zh: '10cm', en: '10cm' },
    origin: { zh: '湛江', en: 'Zhanjiang' },
    care: { zh: '轻拿轻放', en: 'Handle with care' },
    originTrace: null,
    gallery: [],
    stock: 5,
    published: false,
  };

  const created = await sendAdmin(token, '/admin/shop/products', 'POST', payload);
  record(results, 'products', 'create', true, created.id);

  payload.story = { zh: '已更新商品故事', en: 'Updated product story' };
  await sendAdmin(token, `/admin/shop/products/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/shop/products/${created.id}?rawI18n=true`);
  record(results, 'products', 'update', updated.story?.en === 'Updated product story', updated.story);

  await request(`/admin/shop/products/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'products', 'delete', true, created.id);
}

async function testEvents(token, results) {
  const cityList = await getAdmin(token, '/admin/cities?page=1&limit=1');
  const city = cityList.data?.[0];
  const routeList = await getAdmin(token, '/admin/routes?page=1&limit=1');
  const route = routeList.items?.[0];
  const slug = stamp('e2e-event');
  const payload = {
    slug,
    title: { zh: `测试活动 ${slug}`, en: `Test Event ${slug}` },
    summary: { zh: '测试活动摘要', en: 'Test event summary' },
    description: { zh: '测试活动正文', en: 'Test event description' },
    city: city?.name?.zh ?? city?.name ?? 'Zhanjiang',
    citySlug: city?.slug ?? '',
    date: '2026-06-20',
    endDate: '2026-06-21',
    tags: ['test'],
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    status: 'draft',
    relatedRouteSlugs: route?.slug ? [route.slug] : [],
  };

  const created = await sendAdmin(token, '/admin/events', 'POST', payload);
  record(results, 'events', 'create', true, created.id);

  payload.summary = { zh: '已更新活动摘要', en: 'Updated event summary' };
  await sendAdmin(token, `/admin/events/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/events/${created.id}?rawI18n=true`);
  record(results, 'events', 'update', textOf(updated.summary) === 'Updated event summary', updated.summary);

  await request(`/admin/events/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'events', 'delete', true, created.id);
}

async function testModes(token, results) {
  const payload = {
    sortOrder: 999,
    title: { zh: '测试服务模式', en: 'Test service mode' },
    price: { zh: 'S$100', en: 'S$100' },
    bestFor: { zh: '测试场景', en: 'Test cases' },
    body: { zh: '测试正文', en: 'Test body' },
    includes: [{ zh: '测试项', en: 'Test item' }],
    accent: 'light',
    featured: false,
  };

  const created = await sendAdmin(token, '/admin/interpreting/modes', 'POST', payload);
  record(results, 'modes', 'create', true, created.id);

  payload.body = { zh: '已更新模式正文', en: 'Updated mode body' };
  await sendAdmin(token, `/admin/interpreting/modes/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/interpreting/modes/${created.id}`);
  record(results, 'modes', 'update', textOf(updated.body) === 'Updated mode body', updated.body);

  await request(`/admin/interpreting/modes/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'modes', 'delete', true, created.id);
}

async function testProfiles(token, results) {
  const payload = {
    sortOrder: 999,
    name: { zh: '测试口译员', en: 'Test Interpreter' },
    language: { zh: '中英粤', en: 'Chinese English Cantonese' },
    focus: { zh: '测试方向', en: 'Test focus' },
    helps: [{ zh: '测试帮助', en: 'Test help' }],
    avatar: '',
    bio: { zh: '测试简介', en: 'Test bio' },
    status: 'active',
    city: 'zhanjiang',
  };

  const created = await sendAdmin(token, '/admin/interpreting/profiles', 'POST', payload);
  record(results, 'profiles', 'create', true, created.id);

  payload.bio = { zh: '已更新简介', en: 'Updated bio' };
  await sendAdmin(token, `/admin/interpreting/profiles/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/interpreting/profiles/${created.id}`);
  record(results, 'profiles', 'update', textOf(updated.bio) === 'Updated bio', updated.bio);

  await request(`/admin/interpreting/profiles/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'profiles', 'delete', true, created.id);
}

async function testFaqs(token, results) {
  const payload = {
    sortOrder: 999,
    question: { zh: '这是测试 FAQ 吗？', en: 'Is this a test FAQ?' },
    answer: { zh: '是的，这是测试答案。', en: 'Yes, this is a test answer.' },
    category: 'interpreting',
  };

  const created = await sendAdmin(token, '/admin/interpreting/faqs', 'POST', payload);
  record(results, 'faqs', 'create', true, created.id);

  payload.answer = { zh: '已更新 FAQ 答案。', en: 'Updated FAQ answer.' };
  await sendAdmin(token, `/admin/interpreting/faqs/${created.id}`, 'PUT', payload);
  const updated = await getAdmin(token, `/admin/interpreting/faqs/${created.id}`);
  record(results, 'faqs', 'update', textOf(updated.answer) === 'Updated FAQ answer.', updated.answer);

  await request(`/admin/interpreting/faqs/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'faqs', 'delete', true, created.id);
}

async function testCommunityPosts(token, results) {
  const payload = {
    channel: 'FieldNotes',
    status: 'pending_review',
    user: { name: 'E2E Admin', avatar: '', handle: 'e2e-admin' },
    title: { zh: '测试帖子标题', en: 'Test post title' },
    excerpt: { zh: '测试帖子摘要', en: 'Test post excerpt' },
    tags: ['test'],
    image: '',
    location: 'Zhanjiang',
    route: 'southern-sea-table',
    mood: 'Calm',
    featured: false,
    likes: 0,
    comments: 0,
    saves: 0,
  };

  const created = await sendAdmin(token, '/admin/community/posts', 'POST', payload);
  record(results, 'community-posts', 'create', true, created.id);

  payload.excerpt = { zh: '已更新帖子摘要', en: 'Updated post excerpt' };
  payload.featured = true;
  await sendAdmin(token, `/admin/community/posts/${created.id}`, 'PUT', payload);
  await request(`/admin/community/posts/${created.id}/featured`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ featured: true }),
  });
  await request(`/admin/community/posts/${created.id}/review`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'published' }),
  });
  const list = await getAdmin(token, '/admin/community/posts?page=1&limit=10&includeDeleted=true');
  const updated = (list.items ?? []).find((item) => item.id === created.id);
  record(
    results,
    'community-posts',
    'update-review',
    textOf(updated?.excerpt) === 'Updated post excerpt' && updated?.featured === true && updated?.status === 'published',
    updated,
  );

  await request(`/admin/community/posts/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await request(`/admin/community/posts/${created.id}/restore`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  await request(`/admin/community/posts/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'community-posts', 'delete-restore', true, created.id);
}

async function testCommunityBriefs(token, results) {
  const slug = stamp('e2e-brief');
  const payload = {
    slug,
    title: { zh: '测试任务标题', en: 'Test brief title' },
    prompt: { zh: '测试任务提示', en: 'Test brief prompt' },
    channel: 'Field Notes',
    location: 'Zhanjiang',
    route: 'southern-sea-table',
    mood: 'Quiet',
    sortOrder: 999,
    active: true,
  };

  const created = await sendAdmin(token, '/admin/community/briefs', 'POST', payload);
  record(results, 'community-briefs', 'create', true, created.id);

  payload.prompt = { zh: '已更新任务提示', en: 'Updated brief prompt' };
  await sendAdmin(token, `/admin/community/briefs/${created.id}`, 'PUT', payload);
  const briefs = await getAdmin(token, '/admin/community/briefs?page=1&limit=50');
  const updated = (briefs ?? []).find((item) => item.id === created.id);
  record(results, 'community-briefs', 'update', textOf(updated?.prompt) === 'Updated brief prompt', updated?.prompt);

  await request(`/admin/community/briefs/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'community-briefs', 'delete', true, created.id);
}

async function testUsers(token, results) {
  const users = await getAdmin(token, '/admin/users?page=1&limit=5');
  const user = users.items?.[0];
  ensure(user?.id, 'No user available for user test');
  const original = clone(user);

  const updatedProfile = await request(`/admin/users/${user.id}/profile`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: `${original.name || 'User'} E2E`,
      bio: 'E2E profile check',
    }),
  });
  await request(`/admin/users/${user.id}/profile`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: original.name ?? '',
      bio: original.bio ?? '',
    }),
  });
  record(results, 'users', 'update-rollback', Boolean(updatedProfile.id), user.id);
}

async function testHome(token, results) {
  const original = await getAdmin(token, '/admin/home');
  const marker = stamp('home');
  const next = {
    hero: { ...(original.hero ?? {}), e2eMarker: marker },
    trustMetrics: original.trustMetrics ?? [],
    entryCards: original.entryCards ?? [],
    cultureHighlights: original.cultureHighlights ?? [],
    testimonials: original.testimonials ?? [],
    featuredRouteSlugs: original.featuredRouteSlugs ?? [],
    featuredProductSlugs: original.featuredProductSlugs ?? [],
    featuredCitySlugs: original.featuredCitySlugs ?? [],
  };
  await sendAdmin(token, '/admin/home', 'PUT', next);
  const updated = await getAdmin(token, '/admin/home');
  const added = updated.hero?.e2eMarker === marker;
  record(results, 'home', 'update', added, updated.hero);
  await sendAdmin(token, '/admin/home', 'PUT', {
    hero: original.hero ?? {},
    trustMetrics: original.trustMetrics ?? [],
    entryCards: original.entryCards ?? [],
    cultureHighlights: original.cultureHighlights ?? [],
    testimonials: original.testimonials ?? [],
    featuredRouteSlugs: original.featuredRouteSlugs ?? [],
    featuredProductSlugs: original.featuredProductSlugs ?? [],
    featuredCitySlugs: original.featuredCitySlugs ?? [],
  });
  record(results, 'home', 'rollback', true, 'restored');
}

async function testSettings(token, results) {
  const original = await getAdmin(token, '/admin/settings');
  const payload = clone(original.payload ?? {});
  payload.e2eMarker = stamp('settings');
  await sendAdmin(token, '/admin/settings', 'PUT', { payload });
  const updated = await getAdmin(token, '/admin/settings');
  record(results, 'settings', 'update', updated.payload?.e2eMarker === payload.e2eMarker, updated.payload?.e2eMarker);
  await sendAdmin(token, '/admin/settings', 'PUT', { payload: original.payload ?? {} });
  record(results, 'settings', 'rollback', true, 'restored');
}

async function testMedia(token, results) {
  const form = new FormData();
  form.append('module', 'cities');
  form.append(
    'file',
    new Blob([Buffer.from(png1x1Base64, 'base64')], { type: 'image/png' }),
    `${stamp('e2e-media')}.png`,
  );

  const uploaded = await request('/admin/upload', {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  record(results, 'media', 'upload', true, uploaded.filename);

  const files = await getAdmin(token, '/admin/upload/files?page=1&limit=30&module=cities');
  const found = (files.items ?? []).some((item) => item.filename === uploaded.filename);
  record(results, 'media', 'list', found, uploaded.filename);

  await request(`/admin/upload/files/${encodeURIComponent(uploaded.filename)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  record(results, 'media', 'delete', true, uploaded.filename);
}

async function testBookings(token, results) {
  const booking = await request('/public/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Booking',
      contact: 'e2e-booking@example.com',
      city: 'Zhanjiang',
      serviceDate: '2026-06-18',
      supportMode: 'Story route guided support',
      groupSize: '1-2',
      routeOrNeed: 'Need route guidance',
      fastTrack: false,
    }),
  });
  record(results, 'bookings', 'create', true, booking.id);

  const detail = await getAdmin(token, `/admin/bookings/${booking.id}`);
  record(results, 'bookings', 'read', detail.id === booking.id, detail.status);

  await sendAdmin(token, `/admin/bookings/${booking.id}/status`, 'PUT', { status: 'read' });
  const updated = await getAdmin(token, `/admin/bookings/${booking.id}`);
  record(results, 'bookings', 'update-status', updated.status === 'read', updated.status);
}

async function testOrders(token, results) {
  const products = await getAdmin(token, '/admin/shop/products?page=1&limit=1');
  const product = products.items?.[0];
  ensure(product?.id, 'No product available for order test');

  const order = await request('/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestEmail: 'e2e-order@example.com',
      items: [{ productId: product.id, quantity: 1, unitPrice: Number(product.price || 1) }],
      shippingAddress: {
        recipientName: 'E2E Order',
        street: '1 Test Street',
        city: 'Singapore',
        state: 'Singapore',
        postalCode: '018989',
        country: 'Singapore',
        phone: '+65 9000 0000',
      },
      paymentMethod: 'stripe',
    }),
  });
  record(results, 'orders', 'create', true, order.orderId);

  const detail = await getAdmin(token, `/admin/orders/${order.orderId}`);
  record(results, 'orders', 'read', detail.id === order.orderId, detail.status);

  await request(`/admin/orders/${order.orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const updated = await getAdmin(token, `/admin/orders/${order.orderId}`);
  record(results, 'orders', 'update-status', updated.status === 'confirmed', updated.status);
}

async function main() {
  const results = [];
  const token = await login();

  const tests = [
    () => testCities(token, results),
    () => testRoutes(token, results),
    () => testCollections(token, results),
    () => testProducts(token, results),
    () => testEvents(token, results),
    () => testModes(token, results),
    () => testProfiles(token, results),
    () => testFaqs(token, results),
    () => testCommunityPosts(token, results),
    () => testCommunityBriefs(token, results),
    () => testUsers(token, results),
    () => testHome(token, results),
    () => testSettings(token, results),
    () => testMedia(token, results),
    () => testBookings(token, results),
    () => testOrders(token, results),
  ];

  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      record(results, test.name || 'unknown', 'fatal', false, {
        message: error.message,
        status: error.status,
        body: error.body ?? error.detail ?? null,
      });
    }
  }

  const failed = results.filter((item) => !item.ok);
  console.log(
    JSON.stringify(
      {
        base,
        failedCount: failed.length,
        results,
      },
      null,
      2,
    ),
  );

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
