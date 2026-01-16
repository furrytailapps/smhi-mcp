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
 */
export const periodSchema = z
  .enum(['latest-hour', 'latest-day', 'latest-months'])
  .describe('Time period for observations: latest-hour, latest-day, or latest-months');

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
  ])
  .describe('Type of metadata to retrieve');
