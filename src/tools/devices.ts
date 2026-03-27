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

export const deviceTools: ToolDefinition[] = [
  {
    name: 'get-device',
    description: 'Get device details by device UID',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getDevice(args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-device-by-id',
    description: 'Get device details by numeric device ID',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Numeric device ID' },
      },
      required: ['deviceId'],
    },
    handler: async (args) => {
      const result = await api.getDeviceById(args.deviceId);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-device-by-mac',
    description: 'Get device details by MAC address (format: XXXXXXXXXXXX, no separators)',
    inputSchema: {
      type: 'object',
      properties: {
        macAddress: { type: 'string', description: 'MAC address without separators (e.g. AABBCCDDEEFF)' },
      },
      required: ['macAddress'],
    },
    handler: async (args) => {
      const result = await api.getDeviceByMac(args.macAddress);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-device-open-alerts',
    description: 'List open alerts for a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getDeviceOpenAlerts(args.deviceUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'list-device-resolved-alerts',
    description: 'List resolved alerts for a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
        muted: { type: 'string', description: 'Filter muted alerts (true/false)' },
      },
      required: ['deviceUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max', 'muted']);
      const result = await api.getDeviceResolvedAlerts(args.deviceUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'move-device',
    description: 'Move a device to a different site',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID to move' },
        siteUid: { type: 'string', description: 'Destination site UID' },
      },
      required: ['deviceUid', 'siteUid'],
    },
    handler: async (args) => {
      const result = await api.moveDevice(args.deviceUid, args.siteUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'create-quick-job',
    description: 'Create and run a quick job on a device. Pass job data as JSON string with fields: jobName (required), jobComponent (required object with componentUid and variables).',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        jobData: { type: 'string', description: 'JSON string with job data: {"jobName":"My Job","jobComponent":{"componentUid":"abc-123","variables":{"var1":"val1"}}}' },
      },
      required: ['deviceUid', 'jobData'],
    },
    handler: async (args) => {
      const body = JSON.parse(args.jobData);
      const result = await api.createQuickJob(args.deviceUid, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'set-device-udf',
    description: 'Set user defined fields (UDF) on a device. Pass UDF data as JSON string with fields udf1 through udf30.',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        udfData: { type: 'string', description: 'JSON string with UDF data: {"udf1":"value1","udf2":"value2",...,"udf30":"value30"}' },
      },
      required: ['deviceUid', 'udfData'],
    },
    handler: async (args) => {
      const body = JSON.parse(args.udfData);
      const result = await api.setDeviceUdf(args.deviceUid, body);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'set-device-warranty',
    description: 'Set warranty date on a device (ISO 8601 format: yyyy-mm-dd)',
    inputSchema: {
      type: 'object',
      properties: {
        deviceUid: { type: 'string', description: 'Device UID' },
        warrantyDate: { type: 'string', description: 'Warranty expiry date in ISO 8601 format (yyyy-mm-dd)' },
      },
      required: ['deviceUid', 'warrantyDate'],
    },
    handler: async (args) => {
      const result = await api.setDeviceWarranty(args.deviceUid, { warrantyDate: args.warrantyDate });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
