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

export const auditTools: ToolDefinition[] = [
  {
    name: 'get-device-audit',
    description: 'Get hardware and software audit data for a device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getDeviceAudit(args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-device-software',
    description: 'Get list of installed software for a device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getDeviceAuditSoftware(args.deviceUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-device-audit-by-mac',
    description: 'Get device audit data by MAC address (format: XXXXXXXXXXXX, no separators)',
    inputSchema: {
      type: 'object',
      properties: {
        macAddress: { type: 'string', description: 'MAC address without separators (e.g. AABBCCDDEEFF)' },
      },
      required: ['macAddress'],
    },
    handler: async (args) => {
      const result = await api.getDeviceAuditByMac(args.macAddress);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-esxi-audit',
    description: 'Get audit data for an ESXi host device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'ESXi host device UID' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getEsxiAudit(args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-printer-audit',
    description: 'Get audit data for a printer device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Printer device UID' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getPrinterAudit(args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
