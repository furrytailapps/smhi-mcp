/**
 * Types for SMHI API responses
 * SMHI Open Data APIs: https://opendata.smhi.se/
 */

// ============================================================================
// FORECASTS (SNOW1gv1 - Point Forecasts)
// ============================================================================

/**
 * Raw SMHI forecast response
 * Endpoint: GET /api/category/snow1g/version/1/geotype/point/lon/{lon}/lat/{lat}/data.json
 */
export interface SmhiForecastResponse {
  approvedTime: string;
  referenceTime: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  timeSeries: SmhiForecastTimeSeries[];
}

export interface SmhiForecastTimeSeries {
  validTime: string;
  parameters: SmhiForecastParameter[];
}

export interface SmhiForecastParameter {
  name: string;
  levelType: string;
  level: number;
  unit: string;
  values: number[];
}

/**
 * Transformed forecast for tool response
 */
export interface ForecastPoint {
  validTime: string;
  temperature?: number;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  humidity?: number;
  cloudCover?: number;
  precipitationCategory?: number;
  precipitationMean?: number;
  visibility?: number;
  pressure?: number;
  thunderProbability?: number;
}

export interface ForecastResponse {
  approvedTime: string;
  referenceTime: string;
  latitude: number;
  longitude: number;
  timeSeries: ForecastPoint[];
}

// ============================================================================
// OBSERVATIONS (Meteorological & Hydrological)
// ============================================================================

/**
 * Raw SMHI station list response
 */
export interface SmhiStationListResponse {
  key: string;
  updated: number;
  title: string;
  summary: string;
  link: SmhiLink[];
  station: SmhiStation[];
}

export interface SmhiStation {
  name: string;
  id: number;
  height: number;
  latitude: number;
  longitude: number;
  active: boolean;
  from: number;
  to: number;
  key?: string;
  owner?: string;
  ownerCategory?: string;
  measuringStations?: string;
}

export interface SmhiLink {
  type: string;
  href: string;
  rel?: string;
}

/**
 * Raw SMHI observation data response
 */
export interface SmhiObservationResponse {
  value: SmhiObservationValue[];
  updated: number;
  parameter: {
    key: string;
    name: string;
    summary: string;
    unit: string;
  };
  station: SmhiStation;
  period: {
    key: string;
    from: number;
    to: number;
    summary: string;
    sampling: string;
  };
  position: SmhiPosition[];
  link: SmhiLink[];
}

export interface SmhiObservationValue {
  date: number;
  value: string;
  quality: string;
}

export interface SmhiPosition {
  from: number;
  to: number;
  height: number;
  latitude: number;
  longitude: number;
}

/**
 * Transformed observation for tool response
 */
export interface Observation {
  timestamp: string;
  value: number;
  quality: string;
}

export interface ObservationResponse {
  station: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    height: number;
    active: boolean;
  };
  parameter: {
    name: string;
    unit: string;
  };
  period: {
    from: string;
    to: string;
    sampling: string;
  };
  observations: Observation[];
}

// ============================================================================
// HYDROLOGY OBSERVATIONS
// ============================================================================

export interface SmhiHydroStationListResponse {
  key: string;
  updated: number;
  title: string;
  summary: string;
  link: SmhiLink[];
  station: SmhiHydroStation[];
}

export interface SmhiHydroStation {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  active: boolean;
  from: number;
  to: number;
  key?: string;
  waterCourse?: string;
  riverBasin?: string;
  stationType?: string;
}

// ============================================================================
// WARNINGS (Impact-Based Warnings - IBW)
// ============================================================================

/**
 * Raw SMHI warnings response (CAP format)
 * Endpoint: GET /api/alerts.json
 */
export interface SmhiWarningsResponse {
  alert: SmhiAlert[];
}

export interface SmhiAlert {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  code: string[];
  info: SmhiAlertInfo[];
}

export interface SmhiAlertInfo {
  language: string;
  category: string[];
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  effective: string;
  expires: string;
  senderName: string;
  headline: string;
  description: string;
  instruction?: string;
  web?: string;
  contact?: string;
  parameter: SmhiAlertParameter[];
  area: SmhiAlertArea[];
}

export interface SmhiAlertParameter {
  valueName: string;
  value: string;
}

export interface SmhiAlertArea {
  areaDesc: string;
  polygon?: string;
  geocode?: {
    valueName: string;
    value: string;
  }[];
}

/**
 * Transformed warning for tool response
 */
export interface Warning {
  id: string;
  sent: string;
  event: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  certainty: 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';
  effective: string;
  expires: string;
  headline: string;
  description: string;
  instruction?: string;
  areas: string[];
}

export interface WarningsResponse {
  count: number;
  warnings: Warning[];
}

// ============================================================================
// WARNING DISTRICTS
// ============================================================================

export interface SmhiDistrictResponse {
  id: string;
  name: string;
  sortorder: number;
  parentid?: string;
}

export interface District {
  id: string;
  name: string;
  parentId?: string;
}

// ============================================================================
// RADAR
// ============================================================================

/**
 * Raw SMHI radar products response
 */
export interface SmhiRadarProductsResponse {
  key: string;
  updated: number;
  title: string;
  summary: string;
  link: SmhiLink[];
  product?: SmhiRadarProduct[];
  format?: SmhiRadarFormat[];
  file?: SmhiRadarFile[];
}

export interface SmhiRadarProduct {
  key: string;
  updated: number;
  title: string;
  summary: string;
  link: SmhiLink[];
}

export interface SmhiRadarFormat {
  key: string;
  updated: number;
  title: string;
  summary: string;
  link: SmhiLink[];
  file?: SmhiRadarFile[];
}

export interface SmhiRadarFile {
  key: string;
  updated: number;
  valid: number;
  formats: string[];
  link: SmhiLink[];
}

/**
 * Transformed radar for tool response
 */
export interface RadarImage {
  product: string;
  area: string;
  format: string;
  validTime: string;
  updatedTime: string;
  imageUrl: string;
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    crs: string;
  };
}

// ============================================================================
// LIGHTNING
// ============================================================================

/**
 * Raw lightning strike from CSV
 * CSV columns: year, month, day, hour, min, sec, lat, lon, peakCurrent, cloudIndicator
 */
export interface LightningStrike {
  timestamp: string;
  latitude: number;
  longitude: number;
  peakCurrent: number;
  cloudIndicator: number;
}

export interface LightningResponse {
  date: string;
  count: number;
  filterApplied?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  strikes: LightningStrike[];
}

// ============================================================================
// PARAMETER METADATA
// ============================================================================

export interface SmhiParameterResponse {
  key: string;
  updated: number;
  title: string;
  summary: string;
  valueType?: string;
  link: SmhiLink[];
  stationSet?: SmhiLink[];
}

/**
 * Forecast parameter metadata
 */
export interface ForecastParameter {
  name: string;
  description: string;
  unit: string;
}

/**
 * Observation parameter metadata
 */
export interface ObservationParameter {
  id: number;
  name: string;
  description: string;
  unit: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * SMHI API base URLs
 */
export const SMHI_API_BASES = {
  forecast: 'https://opendata-download-metfcst.smhi.se',
  metobs: 'https://opendata-download-metobs.smhi.se',
  hydroobs: 'https://opendata-download-hydroobs.smhi.se',
  warnings: 'https://opendata-download-warnings.smhi.se',
  radar: 'https://opendata-download-radar.smhi.se',
  lightning: 'https://opendata-download-lightning.smhi.se',
} as const;

/**
 * Forecast parameter mapping (SNOW1gv1 parameter names to our names)
 */
export const FORECAST_PARAMS: Record<string, { name: string; unit: string }> = {
  t: { name: 'temperature', unit: '°C' },
  ws: { name: 'windSpeed', unit: 'm/s' },
  gust: { name: 'windGust', unit: 'm/s' },
  wd: { name: 'windDirection', unit: '°' },
  r: { name: 'humidity', unit: '%' },
  tcc_mean: { name: 'cloudCover', unit: '%' },
  pcat: { name: 'precipitationCategory', unit: 'category' },
  pmean: { name: 'precipitationMean', unit: 'mm/h' },
  vis: { name: 'visibility', unit: 'km' },
  msl: { name: 'pressure', unit: 'hPa' },
  tstm: { name: 'thunderProbability', unit: '%' },
};

/**
 * Meteorological observation parameters (ID -> name mapping)
 */
export const MET_OBS_PARAMS: Record<number, { name: string; description: string; unit: string }> = {
  1: { name: 'temperature', description: 'Lufttemperatur momentanvärde', unit: '°C' },
  3: { name: 'wind_direction', description: 'Vindriktning momentanvärde', unit: '°' },
  4: { name: 'wind_speed', description: 'Vindhastighet momentanvärde', unit: 'm/s' },
  5: { name: 'precipitation', description: 'Nederbördsmängd', unit: 'mm' },
  6: { name: 'humidity', description: 'Relativ luftfuktighet momentanvärde', unit: '%' },
  9: { name: 'pressure', description: 'Lufttryck reducerat havsytans nivå', unit: 'hPa' },
  21: { name: 'wind_gust', description: 'Byvind', unit: 'm/s' },
};

/**
 * Hydrological observation parameters
 */
export const HYDRO_OBS_PARAMS: Record<number, { name: string; description: string; unit: string }> = {
  1: { name: 'water_level', description: 'Vattenstånd', unit: 'm' },
  2: { name: 'water_flow', description: 'Vattenföring', unit: 'm³/s' },
};

/**
 * Observation periods
 */
export const OBS_PERIODS = {
  'latest-hour': 'latest-hour',
  'latest-day': 'latest-day',
  'latest-months': 'latest-months',
} as const;
