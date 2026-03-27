import { ToolDefinition } from '../types.js';
import { api } from '../datto-api.js';

export const activityTools: ToolDefinition[] = [
  {
    name: 'get-activity-logs',
    description: 'Get activity logs with optional filtering by date range, entities, categories, actions, sites, and users',
    inputSchema: {
      type: 'object',
      properties: {
        size: { type: 'string', description: 'Number of records to return' },
        order: { type: 'string', description: 'Sort order: asc or desc' },
        from: { type: 'string', description: 'Start date in UTC (yyyy-MM-ddTHH:mm:ssZ)' },
        until: { type: 'string', description: 'End date in UTC (yyyy-MM-ddTHH:mm:ssZ)' },
        entities: { type: 'string', description: 'Comma-separated entity types to filter (e.g. device,user)' },
        categories: { type: 'string', description: 'Comma-separated categories to filter' },
        actions: { type: 'string', description: 'Comma-separated actions to filter' },
        siteIds: { type: 'string', description: 'Comma-separated site IDs to filter' },
        userIds: { type: 'string', description: 'Comma-separated user IDs to filter' },
        page: { type: 'string', description: 'Pagination direction: next or previous' },
        searchAfter: { type: 'string', description: 'Pagination pointer (comma-separated values from previous response)' },
      },
    },
    handler: async (args) => {
      const params = new URLSearchParams();
      if (args.size) params.set('size', args.size);
      if (args.order) params.set('order', args.order);
      if (args.from) params.set('from', args.from);
      if (args.until) params.set('until', args.until);
      if (args.page) params.set('page', args.page);
      if (args.entities) {
        for (const e of args.entities.split(',')) params.append('entities', e.trim());
      }
      if (args.categories) {
        for (const c of args.categories.split(',')) params.append('categories', c.trim());
      }
      if (args.actions) {
        for (const a of args.actions.split(',')) params.append('actions', a.trim());
      }
      if (args.siteIds) {
        for (const s of args.siteIds.split(',')) params.append('siteIds', s.trim());
      }
      if (args.userIds) {
        for (const u of args.userIds.split(',')) params.append('userIds', u.trim());
      }
      if (args.searchAfter) {
        for (const v of args.searchAfter.split(',')) params.append('searchAfter', v.trim());
      }
      const qs = params.toString();
      const query = qs ? `?${qs}` : '';
      const result = await api.getActivityLogs(query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
