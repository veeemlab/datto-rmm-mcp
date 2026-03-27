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

export const systemTools: ToolDefinition[] = [
  {
    name: 'get-system-status',
    description: 'Get API system status including start date, status, and version',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await api.getSystemStatus();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-rate-limit',
    description: 'Get current API rate limit status for the account',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await api.getRateLimit();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-pagination-config',
    description: 'Get API pagination configuration (default and maximum page sizes)',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await api.getPaginationConfig();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-default-filters',
    description: 'List default device filters',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getDefaultFilters(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-custom-filters',
    description: 'List custom device filters (administrator role required)',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getCustomFilters(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
