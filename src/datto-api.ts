import { TokenData } from './types.js';

const PLATFORMS: Record<string, string> = {
  pinotage: 'https://pinotage-api.centrastage.net',
  merlot: 'https://merlot-api.centrastage.net',
  concord: 'https://concord-api.centrastage.net',
  vidal: 'https://vidal-api.centrastage.net',
  zinfandel: 'https://zinfandel-api.centrastage.net',
  syrah: 'https://syrah-api.centrastage.net',
};

export class DattoApi {
  private apiUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private token: TokenData | null = null;

  constructor() {
    this.apiKey = process.env.DATTO_API_KEY || '';
    this.apiSecret = process.env.DATTO_API_SECRET || '';
    const platform = (process.env.DATTO_PLATFORM || 'merlot').toLowerCase();
    this.apiUrl = PLATFORMS[platform] || PLATFORMS['merlot'];

    if (!this.apiKey || !this.apiSecret) {
      console.error('WARNING: DATTO_API_KEY and DATTO_API_SECRET must be set');
    }
  }

  private async getToken(): Promise<string> {
    if (this.token) {
      const elapsed = (Date.now() - this.token.obtained_at) / 1000;
      const remaining = this.token.expires_in - elapsed;
      if (remaining > 300) {
        return this.token.access_token;
      }
    }

    const auth = Buffer.from('public-client:public').toString('base64');
    const resp = await fetch(`${this.apiUrl}/auth/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=password&username=${encodeURIComponent(this.apiKey)}&password=${encodeURIComponent(this.apiSecret)}`,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Auth failed (${resp.status}): ${text}`);
    }

    const data = await resp.json() as { access_token: string; expires_in: number };
    this.token = {
      access_token: data.access_token,
      expires_in: data.expires_in,
      obtained_at: Date.now(),
    };

    return this.token.access_token;
  }

  async apiCall(method: string, path: string, body?: unknown): Promise<unknown> {
    const token = await this.getToken();
    const url = `${this.apiUrl}/api${path}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = { method, headers };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const resp = await fetch(url, options);

    if (resp.status === 204) {
      return { success: true };
    }

    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`API error (${resp.status}): ${text}`);
    }

    if (!text) {
      return { success: true };
    }

    return JSON.parse(text);
  }

  // Account
  async getAccount() { return this.apiCall('GET', '/v2/account'); }
  async getAccountSites(params?: string) { return this.apiCall('GET', `/v2/account/sites${params || ''}`); }
  async getAccountDevices(params?: string) { return this.apiCall('GET', `/v2/account/devices${params || ''}`); }
  async getAccountOpenAlerts(params?: string) { return this.apiCall('GET', `/v2/account/alerts/open${params || ''}`); }
  async getAccountResolvedAlerts(params?: string) { return this.apiCall('GET', `/v2/account/alerts/resolved${params || ''}`); }
  async getAccountUsers(params?: string) { return this.apiCall('GET', `/v2/account/users${params || ''}`); }
  async getAccountComponents(params?: string) { return this.apiCall('GET', `/v2/account/components${params || ''}`); }
  async getAccountVariables(params?: string) { return this.apiCall('GET', `/v2/account/variables${params || ''}`); }
  async createAccountVariable(body: unknown) { return this.apiCall('PUT', '/v2/account/variable', body); }
  async updateAccountVariable(variableId: string, body: unknown) { return this.apiCall('POST', `/v2/account/variable/${variableId}`, body); }
  async deleteAccountVariable(variableId: string) { return this.apiCall('DELETE', `/v2/account/variable/${variableId}`); }
  async getDnetSiteMappings(params?: string) { return this.apiCall('GET', `/v2/account/dnet-site-mappings${params || ''}`); }

  // Sites
  async getSite(siteUid: string) { return this.apiCall('GET', `/v2/site/${siteUid}`); }
  async createSite(body: unknown) { return this.apiCall('PUT', '/v2/site', body); }
  async updateSite(siteUid: string, body: unknown) { return this.apiCall('POST', `/v2/site/${siteUid}`, body); }
  async getSiteDevices(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/devices${params || ''}`); }
  async getSiteDevicesNetwork(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/devices/network-interface${params || ''}`); }
  async getSiteOpenAlerts(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/alerts/open${params || ''}`); }
  async getSiteResolvedAlerts(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/alerts/resolved${params || ''}`); }
  async getSiteSettings(siteUid: string) { return this.apiCall('GET', `/v2/site/${siteUid}/settings`); }
  async setSiteProxy(siteUid: string, body: unknown) { return this.apiCall('POST', `/v2/site/${siteUid}/settings/proxy`, body); }
  async deleteSiteProxy(siteUid: string) { return this.apiCall('DELETE', `/v2/site/${siteUid}/settings/proxy`); }
  async getSiteVariables(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/variables${params || ''}`); }
  async createSiteVariable(siteUid: string, body: unknown) { return this.apiCall('PUT', `/v2/site/${siteUid}/variable`, body); }
  async updateSiteVariable(siteUid: string, variableId: string, body: unknown) { return this.apiCall('POST', `/v2/site/${siteUid}/variable/${variableId}`, body); }
  async deleteSiteVariable(siteUid: string, variableId: string) { return this.apiCall('DELETE', `/v2/site/${siteUid}/variable/${variableId}`); }
  async getSiteDeviceFilters(siteUid: string, params?: string) { return this.apiCall('GET', `/v2/site/${siteUid}/filters${params || ''}`); }

  // Devices
  async getDevice(deviceUid: string) { return this.apiCall('GET', `/v2/device/${deviceUid}`); }
  async getDeviceById(deviceId: string) { return this.apiCall('GET', `/v2/device/id/${deviceId}`); }
  async getDeviceByMac(macAddress: string) { return this.apiCall('GET', `/v2/device/macAddress/${macAddress}`); }
  async moveDevice(deviceUid: string, siteUid: string) { return this.apiCall('PUT', `/v2/device/${deviceUid}/site/${siteUid}`); }
  async setDeviceWarranty(deviceUid: string, body: unknown) { return this.apiCall('POST', `/v2/device/${deviceUid}/warranty`, body); }
  async setDeviceUdf(deviceUid: string, body: unknown) { return this.apiCall('POST', `/v2/device/${deviceUid}/udf`, body); }
  async createQuickJob(deviceUid: string, body: unknown) { return this.apiCall('PUT', `/v2/device/${deviceUid}/quickjob`, body); }
  async getDeviceOpenAlerts(deviceUid: string, params?: string) { return this.apiCall('GET', `/v2/device/${deviceUid}/alerts/open${params || ''}`); }
  async getDeviceResolvedAlerts(deviceUid: string, params?: string) { return this.apiCall('GET', `/v2/device/${deviceUid}/alerts/resolved${params || ''}`); }

  // Alerts
  async getAlert(alertUid: string) { return this.apiCall('GET', `/v2/alert/${alertUid}`); }
  async resolveAlert(alertUid: string) { return this.apiCall('POST', `/v2/alert/${alertUid}/resolve`); }

  // Jobs
  async getJob(jobUid: string) { return this.apiCall('GET', `/v2/job/${jobUid}`); }
  async getJobComponents(jobUid: string, params?: string) { return this.apiCall('GET', `/v2/job/${jobUid}/components${params || ''}`); }
  async getJobResults(jobUid: string, deviceUid: string) { return this.apiCall('GET', `/v2/job/${jobUid}/results/${deviceUid}`); }
  async getJobStdout(jobUid: string, deviceUid: string) { return this.apiCall('GET', `/v2/job/${jobUid}/results/${deviceUid}/stdout`); }
  async getJobStderr(jobUid: string, deviceUid: string) { return this.apiCall('GET', `/v2/job/${jobUid}/results/${deviceUid}/stderr`); }

  // Audit
  async getDeviceAudit(deviceUid: string) { return this.apiCall('GET', `/v2/audit/device/${deviceUid}`); }
  async getDeviceAuditSoftware(deviceUid: string, params?: string) { return this.apiCall('GET', `/v2/audit/device/${deviceUid}/software${params || ''}`); }
  async getDeviceAuditByMac(macAddress: string) { return this.apiCall('GET', `/v2/audit/device/macAddress/${macAddress}`); }
  async getEsxiAudit(deviceUid: string) { return this.apiCall('GET', `/v2/audit/esxihost/${deviceUid}`); }
  async getPrinterAudit(deviceUid: string) { return this.apiCall('GET', `/v2/audit/printer/${deviceUid}`); }

  // Activity
  async getActivityLogs(params?: string) { return this.apiCall('GET', `/v2/activity-logs${params || ''}`); }

  // Filters
  async getDefaultFilters(params?: string) { return this.apiCall('GET', `/v2/filter/default-filters${params || ''}`); }
  async getCustomFilters(params?: string) { return this.apiCall('GET', `/v2/filter/custom-filters${params || ''}`); }

  // System
  async getSystemStatus() { return this.apiCall('GET', '/v2/system/status'); }
  async getRateLimit() { return this.apiCall('GET', '/v2/system/request_rate'); }
  async getPaginationConfig() { return this.apiCall('GET', '/v2/system/pagination'); }

  // User
  async resetApiKeys() { return this.apiCall('POST', '/v2/user/resetApiKeys'); }
}

export const api = new DattoApi();
