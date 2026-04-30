# Datto RMM MCP Server

[![Release](https://github.com/veeemlab/datto-rmm-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/veeemlab/datto-rmm-mcp/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/@veeemlab/datto-rmm-mcp?color=blue&label=npm)](https://www.npmjs.com/package/@veeemlab/datto-rmm-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@veeemlab/datto-rmm-mcp?color=blue)](https://www.npmjs.com/package/@veeemlab/datto-rmm-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A Model Context Protocol (MCP) server that provides **55 tools** for the Datto RMM API. All tool schemas are **Copilot Studio compatible** (flat schemas, no `$ref`, no `anyOf`, no nested objects).

## Features

- **55 Tools** covering the complete Datto RMM API v2
- **6 MCP Resources** (account, sites, alerts, site details, site devices, device)
- **Copilot Studio compatible** — flat input schemas (`string` / `integer` only)
- **STDIO transport** — works with Claude Desktop, MetaMCP, and any MCP client
- **OAuth2 token management** with automatic refresh
- **All 6 Datto RMM platforms** supported

## Prerequisites

- **Node.js 20+**
- **Datto RMM API Key & Secret** — Setup → Global Settings → API in Datto RMM

## Installation

There are three ways to use this server.

### 1. Run via `npx` (recommended)

No install needed — `npx` fetches the latest published version every time:

```bash
npx -y @veeemlab/datto-rmm-mcp
```

### 2. Run from GitHub (bleeding edge)

```bash
npx -y github:veeemlab/datto-rmm-mcp
```

### 3. Install globally

```bash
npm install -g @veeemlab/datto-rmm-mcp
datto-rmm-mcp
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datto-rmm": {
      "command": "npx",
      "args": ["-y", "@veeemlab/datto-rmm-mcp"],
      "env": {
        "DATTO_API_KEY": "your-api-key",
        "DATTO_API_SECRET": "your-api-secret",
        "DATTO_PLATFORM": "merlot"
      }
    }
  }
}
```

## MetaMCP Setup

```
Command:   npx
Arguments: -y @veeemlab/datto-rmm-mcp
Env:       DATTO_API_KEY=..., DATTO_API_SECRET=..., DATTO_PLATFORM=merlot
```

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx -y @veeemlab/datto-rmm-mcp
```

## Environment Variables

| Variable           | Required | Default  | Description                                                              |
| ------------------ | -------- | -------- | ------------------------------------------------------------------------ |
| `DATTO_API_KEY`    | Yes      | —        | Datto RMM API Key                                                        |
| `DATTO_API_SECRET` | Yes      | —        | Datto RMM API Secret                                                     |
| `DATTO_PLATFORM`   | No       | `merlot` | Platform: `pinotage`, `merlot`, `concord`, `vidal`, `zinfandel`, `syrah` |

## Datto API Setup

1. Log into your Datto RMM portal
2. Go to **Setup → Global Settings → API**
3. Generate an **API Key** and **API Secret**
4. Note your **platform** (pinotage, merlot, concord, vidal, zinfandel, or syrah)

## Tools (55)

### Account (13 tools)

| Tool                           | Description                             |
| ------------------------------ | --------------------------------------- |
| `get-account`                  | Get account details and device summary  |
| `list-account-sites`           | List all sites in the account           |
| `list-account-devices`         | List all devices with filtering         |
| `list-account-open-alerts`     | List open alerts                        |
| `list-account-resolved-alerts` | List resolved alerts                    |
| `list-account-users`           | List account users                      |
| `list-account-components`      | List available components               |
| `list-account-variables`       | List account-level variables            |
| `create-account-variable`      | Create an account variable              |
| `update-account-variable`      | Update an account variable              |
| `delete-account-variable`      | Delete an account variable              |
| `list-dnet-site-mappings`      | List Datto Networking site mappings     |
| `reset-api-keys`               | Reset the authenticated user's API keys |

### Sites (15 tools)

| Tool                        | Description                              |
| --------------------------- | ---------------------------------------- |
| `get-site`                  | Get site details                         |
| `create-site`               | Create a new site                        |
| `update-site`               | Update a site                            |
| `list-site-devices`         | List devices in a site                   |
| `list-site-devices-network` | List devices with network interface info |
| `list-site-open-alerts`     | List open alerts for a site              |
| `list-site-resolved-alerts` | List resolved alerts for a site          |
| `get-site-settings`         | Get site settings                        |
| `set-site-proxy`            | Set proxy settings                       |
| `delete-site-proxy`         | Delete proxy settings                    |
| `get-site-variables`        | List site variables                      |
| `create-site-variable`      | Create a site variable                   |
| `update-site-variable`      | Update a site variable                   |
| `delete-site-variable`      | Delete a site variable                   |
| `list-site-device-filters`  | List device filters for a site           |

### Devices (9 tools)

| Tool                          | Description                       |
| ----------------------------- | --------------------------------- |
| `get-device`                  | Get device details by UID         |
| `get-device-by-id`            | Get device by numeric ID          |
| `get-device-by-mac`           | Get device by MAC address         |
| `list-device-open-alerts`     | List open alerts for a device     |
| `list-device-resolved-alerts` | List resolved alerts for a device |
| `move-device`                 | Move device to another site       |
| `create-quick-job`            | Run a quick job on a device       |
| `set-device-udf`              | Set user defined fields           |
| `set-device-warranty`         | Set warranty date                 |

### Alerts (2 tools)

| Tool            | Description           |
| --------------- | --------------------- |
| `get-alert`     | Get alert details     |
| `resolve-alert` | Resolve an open alert |

### Jobs (5 tools)

| Tool                 | Description                  |
| -------------------- | ---------------------------- |
| `get-job`            | Get job details              |
| `get-job-components` | List job components          |
| `get-job-results`    | Get job results for a device |
| `get-job-stdout`     | Get job stdout               |
| `get-job-stderr`     | Get job stderr               |

### Audit (5 tools)

| Tool                      | Description                   |
| ------------------------- | ----------------------------- |
| `get-device-audit`        | Get device audit data         |
| `get-device-software`     | List installed software       |
| `get-device-audit-by-mac` | Get audit data by MAC address |
| `get-esxi-audit`          | Get ESXi host audit data      |
| `get-printer-audit`       | Get printer audit data        |

### Activity (1 tool)

| Tool                | Description                      |
| ------------------- | -------------------------------- |
| `get-activity-logs` | Get activity logs with filtering |

### System & Filters (5 tools)

| Tool                    | Description                  |
| ----------------------- | ---------------------------- |
| `get-system-status`     | Get API system status        |
| `get-rate-limit`        | Get rate limit status        |
| `get-pagination-config` | Get pagination configuration |
| `list-default-filters`  | List default device filters  |
| `list-custom-filters`   | List custom device filters   |

## Resources (6)

| URI                               | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `datto://account`                 | Account overview with device counts and subscription info |
| `datto://sites`                   | List of all managed sites                                 |
| `datto://sites/{siteUid}`         | Details for a specific site                               |
| `datto://sites/{siteUid}/devices` | Devices in a specific site                                |
| `datto://devices/{deviceUid}`     | Details for a specific device                             |

## Local Development

```bash
git clone https://github.com/veeemlab/datto-rmm-mcp.git
cd datto-rmm-mcp
npm install
npm run build
npm start
```

### Quality checks

```bash
npm run lint           # ESLint
npm run lint:fix       # auto-fix lint issues
npm run format         # Prettier write
npm run format:check   # Prettier check (CI-friendly)
npm test               # Vitest one-shot
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with v8 coverage
```

## Troubleshooting

**No tools visible in Copilot Studio?**
All schemas are flat by design. If tools still don't appear, check that the MCP client supports STDIO transport.

**Authentication errors?**
Verify `DATTO_API_KEY`, `DATTO_API_SECRET`, and `DATTO_PLATFORM` are correct. API keys are generated in Datto RMM under Setup → Global Settings → API.

**Rate limiting?**
The Datto API allows 600 GET requests and 100 write requests per 60 seconds. Use `get-rate-limit` to check current status.

## License

MIT
