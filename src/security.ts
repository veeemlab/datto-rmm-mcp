import { z } from 'zod';

export const CONFIRM_REQUIRED_TOOLS: ReadonlySet<string> = new Set([
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
]);

export const DESTRUCTIVE_TOOLS: ReadonlySet<string> = new Set([
  ...CONFIRM_REQUIRED_TOOLS,
  'create-account-variable',
  'update-account-variable',
  'create-site',
  'update-site',
  'create-site-variable',
  'update-site-variable',
]);

export function confirmTokenFor(toolName: string): string {
  return toolName.toUpperCase().replace(/-/g, '_');
}

export function isReadonly(): boolean {
  return (process.env.DATTO_MCP_READONLY || '').toLowerCase() === 'true';
}

export function parseJsonBody<T>(raw: string, schema: z.ZodType<T>, fieldName: string): T {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${fieldName}: ${(e as Error).message}`);
  }
  const result = schema.safeParse(obj);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new Error(`Validation failed for ${fieldName}: ${issues}`);
  }
  return result.data;
}

export const jobDataSchema = z
  .object({
    jobName: z.string().min(1),
    jobComponent: z
      .object({
        componentUid: z.string().min(1),
        variables: z.record(z.string(), z.string()).optional(),
      })
      .strict(),
  })
  .strict();

export const createSiteSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    notes: z.string().optional(),
    onDemand: z.boolean().optional(),
    splashtopAutoInstall: z.boolean().optional(),
  })
  .strict();

export const updateSiteSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    onDemand: z.boolean().optional(),
    splashtopAutoInstall: z.boolean().optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, { message: 'at least one field required' });

export const proxyDataSchema = z
  .object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    type: z.string().min(1),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .strict();

const udfShape: Record<string, z.ZodOptional<z.ZodString>> = {};
for (let i = 1; i <= 30; i++) udfShape[`udf${i}`] = z.string().optional();
export const udfDataSchema = z
  .object(udfShape)
  .strict()
  .refine((o) => Object.keys(o).length > 0, { message: 'at least one udf field required' });
