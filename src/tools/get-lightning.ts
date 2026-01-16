import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { ValidationError } from '@/lib/errors';

export const getLightningInputSchema = {
  date: z
    .string()
    .describe(
      "Date to query in YYYY-MM-DD format, or 'latest' for most recent available data. " +
        'Lightning data is typically available with 1-day delay. Example: 2026-01-15 or latest',
    ),
  latitude: z
    .number()
    .min(55)
    .max(69)
    .optional()
    .describe('Filter strikes near this latitude (WGS84). Must be used with longitude. Example: 59.33'),
  longitude: z
    .number()
    .min(11)
    .max(24)
    .optional()
    .describe('Filter strikes near this longitude (WGS84). Must be used with latitude. Example: 18.07'),
  radiusKm: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .default(50)
    .describe('Radius in km for point filter. Default: 50km. Only used when latitude/longitude provided.'),
};

export const getLightningTool = {
  name: 'smhi_get_lightning',
  description:
    'Get lightning strike data for a specific date in Sweden. ' +
    'Critical for crane operations, height work safety, and construction planning. ' +
    'Returns strikes with timestamp, location, peak current, and cloud/ground indicator. ' +
    'Can filter by location to check recent lightning activity near a work site. ' +
    "Example: date='latest', latitude=59.33, longitude=18.07, radiusKm=50",
  inputSchema: getLightningInputSchema,
};

type GetLightningInput = {
  date: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
};

export const getLightningHandler = withErrorHandling(async (args: GetLightningInput) => {
  // Validate that latitude and longitude are either both provided or both omitted
  if ((args.latitude !== undefined) !== (args.longitude !== undefined)) {
    throw new ValidationError('Both latitude and longitude must be provided together, or both omitted');
  }

  let date: Date;
  if (args.date.toLowerCase() === 'latest') {
    date = await smhiClient.getLatestLightningDate();
  } else {
    // Parse YYYY-MM-DD format
    const match = args.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD or 'latest'", 'date');
    }
    date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  return smhiClient.getLightning(date, args.latitude, args.longitude, args.radiusKm);
});
