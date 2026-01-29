import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { resolveKommun, resolveLan } from '@/lib/location-resolver';
import { dataTypeSchema, periodSchema } from '@/types/common-schemas';

export const getObservationsInputSchema = {
  dataType: dataTypeSchema,
  stationId: z
    .number()
    .optional()
    .describe('Station ID. If not provided, finds nearest station to the given location.'),
  latitude: z
    .number()
    .min(55)
    .max(69)
    .optional()
    .describe(
      'Latitude (WGS84) for finding nearest station. Example: 59.33. ' +
        'Optional if stationId, kommun, or lan is provided.'
    ),
  longitude: z
    .number()
    .min(11)
    .max(24)
    .optional()
    .describe(
      'Longitude (WGS84) for finding nearest station. Example: 18.07. ' +
        'Optional if stationId, kommun, or lan is provided.'
    ),
  kommun: z
    .string()
    .optional()
    .describe(
      'Swedish kommun (municipality) code or name for finding nearest station. ' +
        'Examples: "0180" or "Stockholm". Alternative to coordinates.'
    ),
  lan: z
    .string()
    .optional()
    .describe(
      'Swedish län (county) code or name for finding nearest station. ' +
        'Examples: "AB" or "Stockholms län". Alternative to coordinates.'
    ),
  parameter: z
    .string()
    .describe(
      'Parameter to query. For meteorological: temperature, wind_speed, wind_direction, precipitation, humidity, pressure. ' +
        'For hydrological: water_level, water_flow.'
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
    'Provide stationId directly, or specify location by: coordinates, kommun code/name, or län code/name. ' +
    'Examples: stationId=98210 | latitude=59.33, longitude=18.07 | kommun="Stockholm" | lan="AB"',
  inputSchema: getObservationsInputSchema,
};

type GetObservationsInput = {
  dataType: 'meteorological' | 'hydrological';
  stationId?: number;
  latitude?: number;
  longitude?: number;
  kommun?: string;
  lan?: string;
  parameter: string;
  period: string;
};

export const getObservationsHandler = withErrorHandling(async (args: GetObservationsInput) => {
  let stationId = args.stationId;
  let { latitude, longitude } = args;

  // If no stationId, find nearest station
  if (!stationId) {
    // Resolve coordinates from kommun or län if not provided directly
    if (latitude === undefined || longitude === undefined) {
      if (args.kommun) {
        const resolved = resolveKommun(args.kommun);
        if (!resolved) {
          throw new ValidationError(`Unknown kommun: ${args.kommun}`);
        }
        latitude = resolved.latitude;
        longitude = resolved.longitude;
      } else if (args.lan) {
        const resolved = resolveLan(args.lan);
        if (!resolved) {
          throw new ValidationError(`Unknown län: ${args.lan}`);
        }
        latitude = resolved.latitude;
        longitude = resolved.longitude;
      } else {
        throw new ValidationError(
          'Location required. Provide stationId, latitude/longitude, kommun, or lan parameter.'
        );
      }
    }

    const station = await smhiClient.findNearestObservationStation(
      args.dataType,
      latitude,
      longitude,
      args.parameter
    );
    if (!station) {
      throw new NotFoundError(
        `${args.dataType} station`,
        `near ${latitude},${longitude} for ${args.parameter}`
      );
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
