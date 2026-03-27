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

export const siteTools: ToolDefinition[] = [
  {
    name: 'get-site',
    description: 'Get site details including device count and description',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const result = await api.getSite(args.siteUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'create-site',
    description: 'Create a new site. Pass site data as JSON string with fields: name (required), description, notes, onDemand (boolean), splashtopAutoInstall (boolean).',
    inputSchema: {
      type: 'object',
      properties: {
        siteData: { type: 'string', description: 'JSON string with site creation data: {"name":"Site Name","description":"...","notes":"...","onDemand":false,"splashtopAutoInstall":false}' },
      },
      required: ['siteData'],
    },
    handler: async (args) => {
      const body = JSON.parse(args.siteData);
      const result = await api.createSite(body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'update-site',
    description: 'Update an existing site. Pass update data as JSON string with fields: name, description, notes, onDemand, splashtopAutoInstall.',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        siteData: { type: 'string', description: 'JSON string with site update data: {"name":"New Name","description":"..."}' },
      },
      required: ['siteUid', 'siteData'],
    },
    handler: async (args) => {
      const body = JSON.parse(args.siteData);
      const result = await api.updateSite(args.siteUid, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-site-devices',
    description: 'List all devices in a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        filterId: { type: 'string', description: 'Device filter ID' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'filterId']);
      const result = await api.getSiteDevices(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-site-devices-network',
    description: 'List devices in a site with network interface information',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getSiteDevicesNetwork(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-site-open-alerts',
    description: 'List open alerts for a specific site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getSiteOpenAlerts(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-site-resolved-alerts',
    description: 'List resolved alerts for a specific site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getSiteResolvedAlerts(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-site-settings',
    description: 'Get settings of a site including proxy configuration',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const result = await api.getSiteSettings(args.siteUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'set-site-proxy',
    description: 'Set or update proxy settings for a site. Pass proxy data as JSON string with fields: host, port, type, username, password.',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        proxyData: { type: 'string', description: 'JSON string with proxy settings: {"host":"proxy.example.com","port":8080,"type":"HTTP","username":"...","password":"..."}' },
      },
      required: ['siteUid', 'proxyData'],
    },
    handler: async (args) => {
      const body = JSON.parse(args.proxyData);
      const result = await api.setSiteProxy(args.siteUid, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'delete-site-proxy',
    description: 'Delete proxy settings from a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const result = await api.deleteSiteProxy(args.siteUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-site-variables',
    description: 'List variables for a specific site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getSiteVariables(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'create-site-variable',
    description: 'Create a new variable for a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        name: { type: 'string', description: 'Variable name' },
        value: { type: 'string', description: 'Variable value' },
        masked: { type: 'string', description: 'Whether the variable is masked (true/false)' },
      },
      required: ['siteUid', 'name', 'value'],
    },
    handler: async (args) => {
      const body: Record<string, unknown> = { name: args.name, value: args.value };
      if (args.masked) body.masked = args.masked === 'true';
      const result = await api.createSiteVariable(args.siteUid, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'update-site-variable',
    description: 'Update an existing site variable',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        variableId: { type: 'string', description: 'Variable ID' },
        name: { type: 'string', description: 'New variable name' },
        value: { type: 'string', description: 'New variable value' },
      },
      required: ['siteUid', 'variableId'],
    },
    handler: async (args) => {
      const body: Record<string, unknown> = {};
      if (args.name) body.name = args.name;
      if (args.value) body.value = args.value;
      const result = await api.updateSiteVariable(args.siteUid, args.variableId, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'delete-site-variable',
    description: 'Delete a site variable',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        variableId: { type: 'string', description: 'Variable ID to delete' },
      },
      required: ['siteUid', 'variableId'],
    },
    handler: async (args) => {
      const result = await api.deleteSiteVariable(args.siteUid, args.variableId);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-site-device-filters',
    description: 'List device filters for a specific site (administrator role required)',
    inputSchema: {
      type: 'object',
      properties: {
        siteUid: { type: 'string', description: 'Site UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
      required: ['siteUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getSiteDeviceFilters(args.siteUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
