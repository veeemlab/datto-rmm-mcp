import { api } from './datto-api.js';

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceTemplateDefinition {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

export const staticResources: ResourceDefinition[] = [
  {
    uri: 'datto://account',
    name: 'Account Overview',
    description: 'Account overview with device counts and subscription info',
    mimeType: 'application/json',
  },
  {
    uri: 'datto://sites',
    name: 'All Sites',
    description: 'List of all managed sites',
    mimeType: 'application/json',
  },
  {
    uri: 'datto://alerts/open',
    name: 'Open Alerts',
    description: 'Currently open alerts across all sites',
    mimeType: 'application/json',
  },
];

export const resourceTemplates: ResourceTemplateDefinition[] = [
  {
    uriTemplate: 'datto://sites/{siteUid}',
    name: 'Site Details',
    description: 'Details for a specific site',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'datto://sites/{siteUid}/devices',
    name: 'Site Devices',
    description: 'Devices in a specific site',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'datto://devices/{deviceUid}',
    name: 'Device Details',
    description: 'Details for a specific device',
    mimeType: 'application/json',
  },
];

export async function handleResource(uri: string): Promise<string> {
  if (uri === 'datto://account') {
    const result = await api.getAccount();
    return JSON.stringify(result, null, 2);
  }

  if (uri === 'datto://sites') {
    const result = await api.getAccountSites();
    return JSON.stringify(result, null, 2);
  }

  if (uri === 'datto://alerts/open') {
    const result = await api.getAccountOpenAlerts();
    return JSON.stringify(result, null, 2);
  }

  const siteDevicesMatch = uri.match(/^datto:\/\/sites\/([^/]+)\/devices$/);
  if (siteDevicesMatch) {
    const result = await api.getSiteDevices(siteDevicesMatch[1]);
    return JSON.stringify(result, null, 2);
  }

  const siteMatch = uri.match(/^datto:\/\/sites\/([^/]+)$/);
  if (siteMatch) {
    const result = await api.getSite(siteMatch[1]);
    return JSON.stringify(result, null, 2);
  }

  const deviceMatch = uri.match(/^datto:\/\/devices\/([^/]+)$/);
  if (deviceMatch) {
    const result = await api.getDevice(deviceMatch[1]);
    return JSON.stringify(result, null, 2);
  }

  throw new Error(`Unknown resource: ${uri}`);
}
