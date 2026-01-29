import { z } from 'zod';

/**
 * Common Zod schemas for SMHI MCP tools
 * These are raw shapes (not wrapped in z.object()) for use with mcp-handler
 */

/**
 * WGS84 coordinate validation
 * Sweden bounds: roughly 55-69°N latitude, 11-24°E longitude
 */
export const latitudeSchema = z
  .number()
  .min(55)
  .max(69)
  .describe('Latitude in WGS84 (decimal degrees). Sweden range: 55-69. Example: 59.33 for Stockholm');

export const longitudeSchema = z
  .number()
  .min(11)
  .max(24)
  .describe('Longitude in WGS84 (decimal degrees). Sweden range: 11-24. Example: 18.07 for Stockholm');

/**
 * Data type enumeration for observations
 */
export const dataTypeSchema = z
  .enum(['meteorological', 'hydrological'])
  .describe('Type of observation data: meteorological (weather) or hydrological (water levels/flows)');

/**
 * Observation period
 * - latest-hour: Last hour of data
 * - latest-day: Last 24 hours
 * - latest-months: Last 3-4 months
 * - corrected-archive: Full historical data (quality-controlled, some stations back to 1960s)
 */
export const periodSchema = z
  .enum(['latest-hour', 'latest-day', 'latest-months', 'corrected-archive'])
  .describe(
    'Time period: latest-hour, latest-day, latest-months, or corrected-archive (full historical data, some stations back to 1960s)',
  );

/**
 * Data types for describe_data tool
 */
export const describeDataTypeSchema = z
  .enum([
    'forecast_parameters',
    'met_stations',
    'hydro_stations',
    'met_parameters',
    'hydro_parameters',
    'warning_districts',
    'radar_products',
    'kommuner',
    'lan',
  ])
  .describe('Type of metadata to retrieve');

/**
 * Swedish kommun (municipality) code
 * 4-digit code, e.g., "0180" for Stockholm
 */
export const kommunSchema = z
  .string()
  .regex(/^\d{4}$/)
  .describe('Swedish kommun (municipality) code. 4-digit code, e.g., "0180" for Stockholm, "1480" for Göteborg');

/**
 * Swedish län (county) code
 * 1-2 letter code, e.g., "AB" for Stockholms län
 */
export const lanSchema = z
  .string()
  .regex(/^[A-Za-z]{1,2}$/)
  .describe('Swedish län (county) code. 1-2 letters, e.g., "AB" for Stockholms län, "O" for Västra Götalands län');
