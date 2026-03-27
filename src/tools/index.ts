import { ToolDefinition } from '../types.js';
import { accountTools } from './account.js';
import { siteTools } from './sites.js';
import { deviceTools } from './devices.js';
import { alertTools } from './alerts.js';
import { jobTools } from './jobs.js';
import { auditTools } from './audit.js';
import { activityTools } from './activity.js';
import { systemTools } from './system.js';

export const allTools: ToolDefinition[] = [
  ...accountTools,
  ...siteTools,
  ...deviceTools,
  ...alertTools,
  ...jobTools,
  ...auditTools,
  ...activityTools,
  ...systemTools,
];
