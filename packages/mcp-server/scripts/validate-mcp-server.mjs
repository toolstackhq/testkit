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

async function main() {
  const client = new Client({
    name: 'qa-patterns-mcp-validator',
    version: '1.0.0'
  });

  const command = process.env.QA_PATTERNS_MCP_COMMAND || process.execPath;
  const args = process.env.QA_PATTERNS_MCP_ARGS
    ? JSON.parse(process.env.QA_PATTERNS_MCP_ARGS)
    : [path.resolve('src/index.mjs')];
  const cwd = process.env.QA_PATTERNS_MCP_CWD || process.cwd();

  const transport = new StdioClientTransport({
    command,
    args,
    cwd,
    stderr: 'pipe'
  });

  let stderr = '';
  transport.stderr?.on('data', (chunk) => {
    stderr += chunk.toString();
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
          stderr: stderr.trim()
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
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exit(1);
});
