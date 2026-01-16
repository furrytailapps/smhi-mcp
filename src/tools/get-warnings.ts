import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { warningLevelSchema } from '@/types/common-schemas';

export const getWarningsInputSchema = {
  warningLevel: warningLevelSchema
    .optional()
    .describe(
      'Minimum warning level to include. Options: yellow (be aware), orange (be prepared), red (take action). ' +
        'If omitted, all warnings are returned.',
    ),
};

export const getWarningsTool = {
  name: 'smhi_get_warnings',
  description:
    'Get active weather warnings for Sweden. ' +
    'Returns impact-based warnings (IBW) including storms, flooding, lightning, extreme temperatures. ' +
    'Critical for construction safety: stop-work decisions, crane operations, height work. ' +
    "Example: warningLevel='yellow' to get all yellow+ warnings.",
  inputSchema: getWarningsInputSchema,
};

type GetWarningsInput = {
  warningLevel?: string;
};

export const getWarningsHandler = withErrorHandling(async (args: GetWarningsInput) => {
  return smhiClient.getWarnings(args.warningLevel);
});
