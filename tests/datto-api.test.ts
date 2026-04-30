import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function importFreshApi() {
  vi.resetModules();
  return await import('../src/datto-api.js');
}

type MockResponse = { status: number; body: unknown; headers?: Record<string, string> };

function mockFetchSequence(responses: Array<MockResponse>) {
  const mock = vi.fn();
  for (const r of responses) {
    const isString = typeof r.body === 'string';
    const text = isString ? (r.body as string) : JSON.stringify(r.body);
    const headers = r.headers ?? {};
    mock.mockResolvedValueOnce({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      text: async () => text,
      json: async () => (isString ? JSON.parse(text || '{}') : r.body),
      headers: { get: (name: string) => headers[name] ?? null },
    });
  }
  vi.stubGlobal('fetch', mock);
  return mock;
}

beforeEach(() => {
  process.env.DATTO_API_KEY = 'test-key';
  process.env.DATTO_API_SECRET = 'test-secret';
  process.env.DATTO_PLATFORM = 'merlot';
  // Make backoff instant — assertions verify call order, not timing.
  vi.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
    fn();
    return 0;
  }) as unknown as typeof setTimeout);
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DattoApi.getToken', () => {
  it('requests an OAuth token with password grant', async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { access_token: 'tok-1', expires_in: 3600 } },
      { status: 200, body: { hello: 'world' } },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await api.apiCall('GET', '/v2/account');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [authUrl, authInit] = fetchMock.mock.calls[0];
    expect(authUrl).toBe('https://merlot-api.centrastage.net/auth/oauth/token');
    expect(authInit.method).toBe('POST');
    expect(authInit.body).toContain('grant_type=password');
    expect(authInit.body).toContain('username=test-key');
    expect(authInit.body).toContain('password=test-secret');
    expect(authInit.headers.Authorization).toMatch(/^Basic /);
  });

  it('reuses a cached token within TTL', async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { access_token: 'tok-cache', expires_in: 3600 } },
      { status: 200, body: { call: 1 } },
      { status: 200, body: { call: 2 } },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await api.apiCall('GET', '/v2/account');
    await api.apiCall('GET', '/v2/account');

    const tokenRequests = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith('/auth/oauth/token'),
    );
    expect(tokenRequests).toHaveLength(1);
  });

  it('throws when auth fails', async () => {
    mockFetchSequence([{ status: 401, body: 'invalid credentials' }]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await expect(api.apiCall('GET', '/v2/account')).rejects.toThrow(/Auth failed \(401\)/);
  });
});

describe('DattoApi.apiCall', () => {
  it('targets the platform-specific base URL with /api prefix', async () => {
    process.env.DATTO_PLATFORM = 'pinotage';
    const fetchMock = mockFetchSequence([
      { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
      { status: 200, body: { ok: true } },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await api.apiCall('GET', '/v2/account');

    const apiCallUrl = fetchMock.mock.calls[1][0];
    expect(apiCallUrl).toBe('https://pinotage-api.centrastage.net/api/v2/account');
  });

  it('falls back to merlot for unknown platform', async () => {
    process.env.DATTO_PLATFORM = 'nonexistent';
    const fetchMock = mockFetchSequence([
      { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
      { status: 200, body: {} },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await api.apiCall('GET', '/v2/account');

    const apiCallUrl = fetchMock.mock.calls[1][0];
    expect(apiCallUrl).toMatch(/^https:\/\/merlot-api\.centrastage\.net\//);
  });

  it('returns success object on 204 No Content', async () => {
    mockFetchSequence([
      { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
      { status: 204, body: '' },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    const result = await api.apiCall('DELETE', '/v2/account/variable/123');
    expect(result).toEqual({ success: true });
  });

  it('serialises body as JSON for write requests', async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
      { status: 200, body: { id: 'new' } },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await api.apiCall('PUT', '/v2/account/variable', { name: 'foo', value: 'bar' });

    const init = fetchMock.mock.calls[1][1];
    expect(init.method).toBe('PUT');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ name: 'foo', value: 'bar' });
  });

  it('throws with status code on 4xx errors', async () => {
    mockFetchSequence([
      { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
      { status: 404, body: 'Not Found' },
    ]);

    const { DattoApi } = await importFreshApi();
    const api = new DattoApi();
    await expect(api.apiCall('GET', '/v2/site/missing')).rejects.toThrow(/API error \(404\)/);
  });
});

describe('DattoApi reliability', () => {
  describe('getToken concurrency', () => {
    it('coalesces parallel requests into a single auth fetch', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok-shared', expires_in: 3600 } },
        { status: 200, body: { call: 1 } },
        { status: 200, body: { call: 2 } },
        { status: 200, body: { call: 3 } },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await Promise.all([
        api.apiCall('GET', '/v2/account'),
        api.apiCall('GET', '/v2/account'),
        api.apiCall('GET', '/v2/account'),
      ]);

      const tokenRequests = fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/auth/oauth/token'),
      );
      expect(tokenRequests).toHaveLength(1);
    });
  });

  describe('401 retry', () => {
    it('invalidates the token and retries once on 401', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok-old', expires_in: 3600 } },
        { status: 401, body: 'token expired' },
        { status: 200, body: { access_token: 'tok-new', expires_in: 3600 } },
        { status: 200, body: { ok: true } },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      const result = await api.apiCall('GET', '/v2/account');

      expect(result).toEqual({ ok: true });
      const authCalls = fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/auth/oauth/token'),
      );
      expect(authCalls).toHaveLength(2);
      expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe('Bearer tok-new');
    });

    it('does not retry 401 a second time', async () => {
      mockFetchSequence([
        { status: 200, body: { access_token: 'tok-1', expires_in: 3600 } },
        { status: 401, body: 'token expired' },
        { status: 200, body: { access_token: 'tok-2', expires_in: 3600 } },
        { status: 401, body: 'still bad' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await expect(api.apiCall('GET', '/v2/account')).rejects.toThrow(/API error \(401\)/);
    });
  });

  describe('429 retry', () => {
    it('honours Retry-After header before retrying', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 429, body: 'rate limited', headers: { 'Retry-After': '2' } },
        { status: 200, body: { ok: true } },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      const result = await api.apiCall('GET', '/v2/account');

      expect(result).toEqual({ ok: true });
      const setTimeoutMock = vi.mocked(global.setTimeout);
      expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), 2000);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('retries POST on 429 (server did not act)', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 429, body: 'rate limited' },
        { status: 200, body: { resolved: true } },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      const result = await api.apiCall('POST', '/v2/alert/abc/resolve');

      expect(result).toEqual({ resolved: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('gives up after MAX_RETRIES on persistent 429', async () => {
      mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 429, body: 'rate limited' },
        { status: 429, body: 'rate limited' },
        { status: 429, body: 'rate limited' },
        { status: 429, body: 'rate limited' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await expect(api.apiCall('GET', '/v2/account')).rejects.toThrow(/API error \(429\)/);
    });
  });

  describe('5xx retry', () => {
    it('retries 5xx on GET with backoff', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 503, body: 'unavailable' },
        { status: 502, body: 'bad gateway' },
        { status: 200, body: { ok: true } },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      const result = await api.apiCall('GET', '/v2/account');

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('retries 5xx on DELETE (idempotent)', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 503, body: 'unavailable' },
        { status: 204, body: '' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      const result = await api.apiCall('DELETE', '/v2/account/variable/123');

      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not retry 5xx on POST (could duplicate side effects)', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 503, body: 'unavailable' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await expect(
        api.apiCall('POST', '/v2/device/abc/quickjob', { jobName: 'restart' }),
      ).rejects.toThrow(/API error \(503\)/);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not retry 5xx on PUT (could duplicate resource)', async () => {
      const fetchMock = mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 502, body: 'bad gateway' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await expect(api.apiCall('PUT', '/v2/site', { name: 'New' })).rejects.toThrow(
        /API error \(502\)/,
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('gives up after MAX_RETRIES on persistent 5xx GET', async () => {
      mockFetchSequence([
        { status: 200, body: { access_token: 'tok', expires_in: 3600 } },
        { status: 503, body: 'down' },
        { status: 503, body: 'down' },
        { status: 503, body: 'down' },
        { status: 503, body: 'down' },
      ]);

      const { DattoApi } = await importFreshApi();
      const api = new DattoApi();
      await expect(api.apiCall('GET', '/v2/account')).rejects.toThrow(/API error \(503\)/);
    });
  });
});
