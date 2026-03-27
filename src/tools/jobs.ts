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

export const jobTools: ToolDefinition[] = [
  {
    name: 'get-job',
    description: 'Get job details by job UID',
    inputSchema: {
      type: 'object',
      properties: {
        jobUid: { type: 'string', description: 'Job UID' },
      },
      required: ['jobUid'],
    },
    handler: async (args) => {
      const result = await api.getJob(args.jobUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-job-components',
    description: 'List components of a job',
    inputSchema: {
      type: 'object',
      properties: {
        jobUid: { type: 'string', description: 'Job UID' },
        page: { type: 'string', description: 'Page number (0-based)' },
        max: { type: 'string', description: 'Items per page (default 50)' },
      },
      required: ['jobUid'],
    },
    handler: async (args) => {
      const query = buildQuery(args, ['page', 'max']);
      const result = await api.getJobComponents(args.jobUid, query);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-job-results',
    description: 'Get job execution results for a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        jobUid: { type: 'string', description: 'Job UID' },
        deviceUid: { type: 'string', description: 'Device UID' },
      },
      required: ['jobUid', 'deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getJobResults(args.jobUid, args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-job-stdout',
    description: 'Get standard output (stdout) of a job for a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        jobUid: { type: 'string', description: 'Job UID' },
        deviceUid: { type: 'string', description: 'Device UID' },
      },
      required: ['jobUid', 'deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getJobStdout(args.jobUid, args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
  {
    name: 'get-job-stderr',
    description: 'Get standard error (stderr) of a job for a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        jobUid: { type: 'string', description: 'Job UID' },
        deviceUid: { type: 'string', description: 'Device UID' },
      },
      required: ['jobUid', 'deviceUid'],
    },
    handler: async (args) => {
      const result = await api.getJobStderr(args.jobUid, args.deviceUid);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },
];
