import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { radarProductSchema, radarAreaSchema, radarFormatSchema } from '@/types/common-schemas';

export const getRadarInputSchema = {
  product: radarProductSchema
    .default('comp')
    .describe("Radar product type: 'comp' (composite precipitation) or 'pcappi' (constant altitude PPI)."),
  area: radarAreaSchema.default('sweden').describe("Coverage area: 'sweden' for full country coverage."),
  format: radarFormatSchema.default('png').describe('Image format: png (viewable), tif (GeoTiff for GIS), or h5 (HDF5).'),
};

export const getRadarTool = {
  name: 'smhi_get_radar',
  description:
    'Get the latest precipitation radar image for Sweden. ' +
    'Returns an image URL showing current precipitation (rain/snow). ' +
    'Use for nowcasting: "Will it rain in the next hour?" decisions for concrete pouring, paving. ' +
    'The composite (comp) product shows merged data from all Swedish radars. ' +
    'Example: product=comp, area=sweden, format=png',
  inputSchema: getRadarInputSchema,
};

type GetRadarInput = {
  product: string;
  area: string;
  format: string;
};

export const getRadarHandler = withErrorHandling(async (args: GetRadarInput) => {
  return smhiClient.getRadarImage(args.product, args.area, args.format);
});
