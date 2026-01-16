import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getForecastTool, getForecastHandler } from './get-forecast';
import { getObservationsTool, getObservationsHandler } from './get-observations';
import { getWarningsTool, getWarningsHandler } from './get-warnings';
import { getRadarTool, getRadarHandler } from './get-radar';
import { getLightningTool, getLightningHandler } from './get-lightning';
import { describeDataTool, describeDataHandler } from './describe-data';

// Tool registry: 6 tools for SMHI weather and hydrology data
const tools = [
  { definition: getForecastTool, handler: getForecastHandler },
  { definition: getObservationsTool, handler: getObservationsHandler },
  { definition: getWarningsTool, handler: getWarningsHandler },
  { definition: getRadarTool, handler: getRadarHandler },
  { definition: getLightningTool, handler: getLightningHandler },
  { definition: describeDataTool, handler: describeDataHandler },
];

/**
 * Register all SMHI tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  for (const { definition, handler } of tools) {
    server.tool(definition.name, definition.description, definition.inputSchema, handler);
  }
}
