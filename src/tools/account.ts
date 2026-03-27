import { ToolDefinition } from '../types.js';
import { api } from '../datto-api.js';

function buildQuery(args: Record<string, string>, keys: string[]): string {
  const params = new URLSearchParams();
  for (const k of keys) {
    if (args[k]) params.set(k, args[k]);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const accountTools: ToolDefinition[] = [
  {
    name: 'get-account',
    description: 'Get account details including name, device counts, and subscription info',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await api.getAccount();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-sites',
    description: 'List all sites in the account. Supports pagination and name filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        siteName: { type: 'string', description: 'Filter by site name' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'siteName']);
      const result = await api.getAccountSites(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-devices',
    description: 'List all devices in the account. Supports pagination and filtering by hostname, deviceType, operatingSystem, siteName, and filterId.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        filterId: { type: 'string', description: 'Device filter ID' },
        hostname: { type: 'string', description: 'Filter by hostname' },
        deviceType: { type: 'string', description: 'Filter by device type' },
        operatingSystem: { type: 'string', description: 'Filter by operating system' },
        siteName: { type: 'string', description: 'Filter by site name' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'filterId', 'hostname', 'deviceType', 'operatingSystem', 'siteName']);
      const result = await api.getAccountDevices(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-open-alerts',
    description: 'List all open alerts in the account',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getAccountOpenAlerts(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-resolved-alerts',
    description: 'List all resolved alerts in the account',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getAccountResolvedAlerts(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-users',
    description: 'List all users in the account',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getAccountUsers(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-components',
    description: 'List all available components (scripts/monitors) in the account',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getAccountComponents(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-account-variables',
    description: 'List all account-level variables',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getAccountVariables(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'create-account-variable',
    description: 'Create a new account-level variable',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Variable name' },
        value: { type: 'string', description: 'Variable value' },
        masked: { type: 'string', description: 'Whether the variable is masked (true/false)' },
      },
      required: ['name', 'value'],
    },
    handler: async (args) => {
      const body: Record<string, unknown> = { name: args.name, value: args.value };
      if (args.masked) body.masked = args.masked === 'true';
      const result = await api.createAccountVariable(body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'update-account-variable',
    description: 'Update an existing account-level variable',
    inputSchema: {
      type: 'object',
      properties: {
        variableId: { type: 'string', description: 'Variable ID' },
        name: { type: 'string', description: 'New variable name' },
        value: { type: 'string', description: 'New variable value' },
      },
      required: ['variableId'],
    },
    handler: async (args) => {
      const body: Record<string, unknown> = {};
      if (args.name) body.name = args.name;
      if (args.value) body.value = args.value;
      const result = await api.updateAccountVariable(args.variableId, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'delete-account-variable',
    description: 'Delete an account-level variable',
    inputSchema: {
      type: 'object',
      properties: {
        variableId: { type: 'string', description: 'Variable ID to delete' },
      },
      required: ['variableId'],
    },
    handler: async (args) => {
      const result = await api.deleteAccountVariable(args.variableId);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-dnet-site-mappings',
    description: 'List sites with mapped Datto Networking (dnet) network IDs',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getDnetSiteMappings(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'reset-api-keys',
    description: 'Reset the authenticated user API keys. WARNING: This will invalidate current credentials.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await api.resetApiKeys();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
