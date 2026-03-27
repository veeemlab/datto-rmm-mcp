import { ToolDefinition } from '../types.js';
import { api } from '../datto-api.js';

export const alertTools: ToolDefinition[] = [
  {
    name: 'get-alert',
    description: 'Get alert details by alert UID',
    inputSchema: {
      type: 'object',
      properties: {
        alertUid: { type: 'string', description: 'Alert UID' },
      },
      required: ['alertUid'],
    },
    handler: async (args) => {
      const result = await api.getAlert(args.alertUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'resolve-alert',
    description: 'Resolve an open alert',
    inputSchema: {
      type: 'object',
      properties: {
        alertUid: { type: 'string', description: 'Alert UID to resolve' },
      },
      required: ['alertUid'],
    },
    handler: async (args) => {
      const result = await api.resolveAlert(args.alertUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
