#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { allTools } from './tools/index.js';

const server = new McpServer({
  name: 'datto-rmm-mcp-server',
  version: '1.0.0',
});

for (const tool of allTools) {
  const shape: Record<string, z.ZodTypeAny> = {};
  const props = tool.inputSchema.properties;
  const required = tool.inputSchema.required || [];

  for (const [key, prop] of Object.entries(props)) {
    let zodType: z.ZodTypeAny;
    if (prop.type === 'integer') {
      zodType = z.string().describe(prop.description);
    } else {
      zodType = z.string().describe(prop.description);
    }

    if (!required.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  server.tool(
    tool.name,
    tool.description,
    shape,
    async (args: Record<string, unknown>) => {
      try {
        const stringArgs: Record<string, string> = {};
        for (const [k, v] of Object.entries(args)) {
          if (v !== undefined) stringArgs[k] = String(v);
        }
        const result = await tool.handler(stringArgs);
        return { ...result } as { content: Array<{ type: 'text'; text: string }>; isError?: boolean; [key: string]: unknown };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true } as { content: Array<{ type: 'text'; text: string }>; isError: boolean; [key: string]: unknown };
      }
    },
  );
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Datto RMM MCP Server running (${allTools.length} tools registered)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
