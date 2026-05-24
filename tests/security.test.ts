import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  DESTRUCTIVE_TOOLS,
  confirmTokenFor,
  isReadonly,
  parseJsonBody,
  jobDataSchema,
  createSiteSchema,
  updateSiteSchema,
  proxyDataSchema,
  udfDataSchema,
} from '../src/security.js';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('DESTRUCTIVE_TOOLS', () => {
  it('contains exactly the 10 destructive tool names', () => {
    expect(DESTRUCTIVE_TOOLS.size).toBe(10);
    for (const name of [
      'reset-api-keys',
      'create-quick-job',
      'move-device',
      'resolve-alert',
      'delete-account-variable',
      'delete-site-variable',
      'delete-site-proxy',
      'set-site-proxy',
      'set-device-udf',
      'set-device-warranty',
    ]) {
      expect(DESTRUCTIVE_TOOLS.has(name)).toBe(true);
    }
  });
});

describe('confirmTokenFor', () => {
  it('uppercases and converts kebab to snake', () => {
    expect(confirmTokenFor('reset-api-keys')).toBe('RESET_API_KEYS');
    expect(confirmTokenFor('move-device')).toBe('MOVE_DEVICE');
    expect(confirmTokenFor('set-device-warranty')).toBe('SET_DEVICE_WARRANTY');
  });
});

describe('isReadonly', () => {
  beforeEach(() => {
    delete process.env.DATTO_MCP_READONLY;
  });

  it('returns false when env unset', () => {
    expect(isReadonly()).toBe(false);
  });

  it('returns true only for exact string "true"', () => {
    process.env.DATTO_MCP_READONLY = 'true';
    expect(isReadonly()).toBe(true);
  });

  it('returns false for any other truthy string', () => {
    process.env.DATTO_MCP_READONLY = '1';
    expect(isReadonly()).toBe(false);
    process.env.DATTO_MCP_READONLY = 'TRUE';
    expect(isReadonly()).toBe(false);
    process.env.DATTO_MCP_READONLY = 'yes';
    expect(isReadonly()).toBe(false);
  });
});

describe('parseJsonBody', () => {
  const schema = jobDataSchema;

  it('parses and validates valid JSON', () => {
    const result = parseJsonBody(
      '{"jobName":"X","jobComponent":{"componentUid":"u"}}',
      schema,
      'jobData',
    );
    expect(result).toEqual({ jobName: 'X', jobComponent: { componentUid: 'u' } });
  });

  it('throws with field name on malformed JSON', () => {
    expect(() => parseJsonBody('{not json', schema, 'jobData')).toThrow(/Invalid JSON in jobData/);
  });

  it('throws with field name and path on schema failure', () => {
    expect(() => parseJsonBody('{"jobName":""}', schema, 'jobData')).toThrow(
      /Validation failed for jobData/,
    );
  });

  it('rejects unknown fields (strict)', () => {
    expect(() =>
      parseJsonBody(
        '{"jobName":"X","jobComponent":{"componentUid":"u"},"unknownField":1}',
        schema,
        'jobData',
      ),
    ).toThrow(/Validation failed for jobData/);
  });
});

describe('jobDataSchema', () => {
  it('accepts minimal valid payload', () => {
    expect(jobDataSchema.parse({ jobName: 'J', jobComponent: { componentUid: 'c' } })).toBeTruthy();
  });

  it('accepts variables record', () => {
    expect(
      jobDataSchema.parse({
        jobName: 'J',
        jobComponent: { componentUid: 'c', variables: { a: '1', b: '2' } },
      }),
    ).toBeTruthy();
  });

  it('rejects missing jobComponent', () => {
    expect(() => jobDataSchema.parse({ jobName: 'J' })).toThrow();
  });

  it('rejects empty jobName', () => {
    expect(() =>
      jobDataSchema.parse({ jobName: '', jobComponent: { componentUid: 'c' } }),
    ).toThrow();
  });
});

describe('createSiteSchema', () => {
  it('requires name', () => {
    expect(() => createSiteSchema.parse({})).toThrow();
  });

  it('accepts name only', () => {
    expect(createSiteSchema.parse({ name: 'Acme' })).toEqual({ name: 'Acme' });
  });

  it('accepts full payload', () => {
    const payload = {
      name: 'Acme',
      description: 'd',
      notes: 'n',
      onDemand: false,
      splashtopAutoInstall: true,
    };
    expect(createSiteSchema.parse(payload)).toEqual(payload);
  });
});

describe('updateSiteSchema', () => {
  it('rejects empty object', () => {
    expect(() => updateSiteSchema.parse({})).toThrow(/at least one field/);
  });

  it('accepts partial update', () => {
    expect(updateSiteSchema.parse({ description: 'new' })).toEqual({ description: 'new' });
  });
});

describe('proxyDataSchema', () => {
  it('requires host/port/type', () => {
    expect(() => proxyDataSchema.parse({ host: 'x' })).toThrow();
  });

  it('rejects out-of-range port', () => {
    expect(() => proxyDataSchema.parse({ host: 'x', port: 70000, type: 'HTTP' })).toThrow();
    expect(() => proxyDataSchema.parse({ host: 'x', port: 0, type: 'HTTP' })).toThrow();
  });

  it('accepts valid payload', () => {
    expect(proxyDataSchema.parse({ host: 'p.example', port: 8080, type: 'HTTP' })).toBeTruthy();
  });
});

describe('udfDataSchema', () => {
  it('rejects empty object', () => {
    expect(() => udfDataSchema.parse({})).toThrow(/at least one udf field/);
  });

  it('accepts a subset of udf fields', () => {
    expect(udfDataSchema.parse({ udf1: 'a', udf30: 'b' })).toEqual({ udf1: 'a', udf30: 'b' });
  });

  it('rejects unknown udf-like keys', () => {
    expect(() => udfDataSchema.parse({ udf31: 'x' })).toThrow();
    expect(() => udfDataSchema.parse({ random: 'x' })).toThrow();
  });
});
