import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { latitudeSchema, longitudeSchema } from '@/types/common-schemas';

export const getForecastInputSchema = {
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  parameters: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of parameters to include (e.g., 'temperature,windSpeed,precipitationMean'). " +
        'Available: temperature, windSpeed, windGust, windDirection, humidity, cloudCover, ' +
        'precipitationCategory, precipitationMean, visibility, pressure, thunderProbability. ' +
        'If omitted, all parameters are returned.',
    ),
};

export const getForecastTool = {
  name: 'smhi_get_forecast',
  description:
    'Get weather forecast for a specific location in Sweden. ' +
    'Returns 10-day forecast with hourly data for the first 2 days, then 6-hour intervals. ' +
    'Use for planning outdoor construction work, concrete pouring conditions, crane operations. ' +
    'Coordinates must be in WGS84 (decimal degrees). Example: latitude=59.33, longitude=18.07 for Stockholm.',
  inputSchema: getForecastInputSchema,
};

type GetForecastInput = {
  latitude: number;
  longitude: number;
  parameters?: string;
};

export const getForecastHandler = withErrorHandling(async (args: GetForecastInput) => {
  const params = args.parameters?.split(',').map((p) => p.trim());
  return smhiClient.getForecast(args.latitude, args.longitude, params);
});
