import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { dataTypeSchema, periodSchema } from '@/types/common-schemas';

export const getObservationsInputSchema = {
  dataType: dataTypeSchema,
  stationId: z.number().optional().describe('Station ID. If not provided, finds nearest station to the given coordinates.'),
  latitude: z
    .number()
    .min(55)
    .max(69)
    .optional()
    .describe('Latitude (WGS84) for finding nearest station. Required if stationId not provided. Example: 59.33'),
  longitude: z
    .number()
    .min(11)
    .max(24)
    .optional()
    .describe('Longitude (WGS84) for finding nearest station. Required if stationId not provided. Example: 18.07'),
  parameter: z
    .string()
    .describe(
      'Parameter to query. For meteorological: temperature, wind_speed, wind_direction, precipitation, humidity, pressure. ' +
        'For hydrological: water_level, water_flow.',
    ),
  period: periodSchema
    .default('latest-hour')
    .describe('Time period: latest-hour (last hour), latest-day (last 24h), latest-months (last 3-4 months).'),
};

export const getObservationsTool = {
  name: 'smhi_get_observations',
  description:
    'Get current or historical weather/water observations from SMHI stations. ' +
    'For meteorological data: temperature, wind, precipitation, humidity, pressure. ' +
    'For hydrological data: water levels and flows (useful for excavation near waterways). ' +
    'Either provide a stationId directly, or provide latitude/longitude to find the nearest station. ' +
    'Example: dataType=meteorological, latitude=59.33, longitude=18.07, parameter=temperature, period=latest-hour',
  inputSchema: getObservationsInputSchema,
};

type GetObservationsInput = {
  dataType: 'meteorological' | 'hydrological';
  stationId?: number;
  latitude?: number;
  longitude?: number;
  parameter: string;
  period: string;
};

export const getObservationsHandler = withErrorHandling(async (args: GetObservationsInput) => {
  let stationId = args.stationId;

  // If no stationId, find nearest station using unified API
  if (!stationId) {
    if (args.latitude === undefined || args.longitude === undefined) {
      throw new ValidationError('Either stationId or both latitude and longitude must be provided');
    }

    const station = await smhiClient.findNearestObservationStation(
      args.dataType,
      args.latitude,
      args.longitude,
      args.parameter,
    );
    if (!station) {
      throw new NotFoundError(`${args.dataType} station`, `near ${args.latitude},${args.longitude} for ${args.parameter}`);
    }
    stationId = station.id;
  }

  // Fetch observation data using unified API
  const result = await smhiClient.getObservation(args.dataType, stationId, args.parameter, args.period);

  if (!result) {
    throw new NotFoundError('Observation data', `station ${stationId}, parameter ${args.parameter}`);
  }

  return result;
});
