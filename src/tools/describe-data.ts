import { z } from 'zod';
import { smhiClient } from '@/clients/smhi-client';
import { withErrorHandling } from '@/lib/response';
import { describeDataTypeSchema } from '@/types/common-schemas';

export const describeDataInputSchema = {
  dataType: describeDataTypeSchema,
};

export const describeDataTool = {
  name: 'smhi_describe_data',
  description:
    'Discover available SMHI data sources, parameters, and stations. ' +
    'Use this to find station IDs, understand available parameters, or list warning districts. ' +
    'Options: forecast_parameters, met_stations, hydro_stations, met_parameters, hydro_parameters, ' +
    'warning_districts, radar_products. ' +
    'Example: dataType=met_stations to list all active meteorological stations.',
  inputSchema: describeDataInputSchema,
};

type DescribeDataInput = {
  dataType:
    | 'forecast_parameters'
    | 'met_stations'
    | 'hydro_stations'
    | 'met_parameters'
    | 'hydro_parameters'
    | 'warning_districts'
    | 'radar_products';
};

export const describeDataHandler = withErrorHandling(async (args: DescribeDataInput) => {
  switch (args.dataType) {
    case 'forecast_parameters':
      return {
        description: 'Parameters available in point forecasts',
        parameters: await smhiClient.getForecastParameters(),
      };

    case 'met_stations': {
      const stations = await smhiClient.listMetStations();
      return {
        description: 'Active meteorological observation stations',
        count: stations.length,
        stations: stations.map((s) => ({
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          height: s.height,
        })),
      };
    }

    case 'hydro_stations': {
      const stations = await smhiClient.listHydroStations();
      return {
        description: 'Active hydrological observation stations',
        count: stations.length,
        stations: stations.map((s) => ({
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          waterCourse: s.waterCourse,
          riverBasin: s.riverBasin,
        })),
      };
    }

    case 'met_parameters':
      return {
        description: 'Meteorological observation parameters',
        parameters: await smhiClient.getMetParameters(),
      };

    case 'hydro_parameters':
      return {
        description: 'Hydrological observation parameters',
        parameters: await smhiClient.getHydroParameters(),
      };

    case 'warning_districts': {
      const districts = await smhiClient.getWarningDistricts();
      return {
        description: 'Warning districts for filtering alerts',
        count: districts.length,
        districts,
      };
    }

    case 'radar_products': {
      const products = await smhiClient.getRadarProducts();
      return {
        description: 'Available radar products',
        products: products?.map((p) => ({
          key: p.key,
          title: p.title,
          summary: p.summary,
        })),
      };
    }
  }
});
