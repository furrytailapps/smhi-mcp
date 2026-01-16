import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { warningSeveritySchema } from '@/types/common-schemas';

export const getWarningsInputSchema = {
  districts: z
    .string()
    .optional()
    .default('all')
    .describe(
      "Comma-separated district codes to filter by, or 'all' for all districts. " +
        'Use smhi_describe_data with dataType=warning_districts to get district codes.',
    ),
  severity: warningSeveritySchema
    .optional()
    .describe(
      'Minimum severity level to include. Options: moderate, severe, extreme. ' +
        'If omitted, all warnings are returned including minor ones.',
    ),
};

export const getWarningsTool = {
  name: 'smhi_get_warnings',
  description:
    'Get active weather warnings for Sweden. ' +
    'Returns impact-based warnings (IBW) including storms, flooding, lightning, extreme temperatures. ' +
    'Critical for construction safety: stop-work decisions, crane operations, height work. ' +
    "Example: districts='all', severity='moderate' to get all moderate+ warnings.",
  inputSchema: getWarningsInputSchema,
};

type GetWarningsInput = {
  districts?: string;
  severity?: string;
};

export const getWarningsHandler = withErrorHandling(async (args: GetWarningsInput) => {
  const result = await smhiClient.getWarnings(args.severity);

  // Filter by districts if specified (and not 'all')
  if (args.districts && args.districts.toLowerCase() !== 'all') {
    const districtSet = new Set(args.districts.split(',').map((d) => d.trim().toLowerCase()));
    result.warnings = result.warnings.filter((w) => w.areas.some((a) => districtSet.has(a.toLowerCase())));
    result.count = result.warnings.length;
  }

  return result;
});
