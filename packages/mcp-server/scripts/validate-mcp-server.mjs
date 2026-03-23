import path from 'node:path';
import process from 'node:process';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const EXPECTED_TOOLS = [
  'list_templates',
  'describe_template',
  'scaffold_template',
  'validate_project',
  'get_next_steps'
];
let capturedStderr = '';

async function main() {
  const client = new Client({
    name: 'testkit-mcp-validator',
    version: '1.0.0'
  });

  const command = process.env.TESTKIT_MCP_COMMAND || process.execPath;
  const args = process.env.TESTKIT_MCP_ARGS
    ? JSON.parse(process.env.TESTKIT_MCP_ARGS)
    : [path.resolve('src/index.mjs')];
  const cwd = process.env.TESTKIT_MCP_CWD || process.cwd();

  const transport = new StdioClientTransport({
    command,
    args,
    cwd,
    env: process.env.TESTKIT_MCP_DEBUG
      ? { TESTKIT_MCP_DEBUG: process.env.TESTKIT_MCP_DEBUG }
      : undefined,
    stderr: 'pipe'
  });

  transport.stderr?.on('data', (chunk) => {
    capturedStderr += chunk.toString();
  });

  try {
    await client.connect(transport);
    const result = await client.listTools();
    const toolNames = result.tools.map((tool) => tool.name);
    const missingTools = EXPECTED_TOOLS.filter(
      (tool) => !toolNames.includes(tool)
    );

    if (missingTools.length > 0) {
      throw new Error(`Missing expected MCP tools: ${missingTools.join(', ')}`);
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          tools: toolNames,
          stderr: capturedStderr.trim()
        },
        null,
        2
      )
    );
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stderr: capturedStderr.trim()
      },
      null,
      2
    )
  );
  process.exit(1);
});
