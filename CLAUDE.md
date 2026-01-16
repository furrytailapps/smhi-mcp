# mcp-smhi - Claude Code Guide

> **Keep this file up to date.** When tools, API endpoints, or project structure change, update this file. For shared patterns and design decisions, see `../CLAUDE.md`.

MCP server wrapping SMHI (Swedish Meteorological and Hydrological Institute) APIs for weather forecasts, observations, warnings, radar, and lightning data.

## Production URL

```
https://mcp-smhi.vercel.app/mcp
```

## Target Audience

Construction/infrastructure companies using yesper.ai who need:

- Weather forecasts for work planning (concrete pouring, crane lifts, paving)
- Safety warnings (storms, lightning, flooding)
- Short-term precipitation radar for real-time decisions
- Water level data for excavation near waterways
- Lightning alerts for crane/height work safety

## Available Tools (6)

| Tool                    | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `smhi_get_forecast`     | 10-day point forecast for construction planning |
| `smhi_get_observations` | Station measurements (weather + water levels)   |
| `smhi_get_warnings`     | Impact-based weather warnings for safety        |
| `smhi_get_radar`        | Precipitation radar images for nowcasting       |
| `smhi_get_lightning`    | Lightning strike data for height work safety    |
| `smhi_describe_data`    | Discover stations, parameters, districts        |

## Project Structure

```
src/
├── app/[transport]/route.ts   # MCP endpoint
├── clients/smhi-client.ts     # Unified SMHI API client
├── lib/
│   ├── concurrency.ts         # Rate limiting (max 2 concurrent)
│   ├── errors.ts              # Error classes
│   ├── http-client.ts         # HTTP wrapper
│   └── response.ts            # Response formatting
├── tools/
│   ├── index.ts               # Tool registry (6 tools)
│   ├── get-forecast.ts        # SNOW1gv1 point forecast
│   ├── get-observations.ts    # Met + hydro station data
│   ├── get-warnings.ts        # IBW warnings
│   ├── get-radar.ts           # Precipitation radar
│   ├── get-lightning.ts       # Lightning archive
│   └── describe-data.ts       # Metadata discovery
└── types/
    ├── smhi-api.ts            # Raw API types + transforms
    └── common-schemas.ts      # Shared Zod schemas
```

## SMHI APIs

| API          | Base URL                              | Purpose                     |
| ------------ | ------------------------------------- | --------------------------- |
| Forecasts    | `opendata-download-metfcst.smhi.se`   | SNOW1gv1 point forecasts    |
| Observations | `opendata-download-metobs.smhi.se`    | Meteorological stations     |
| Hydrology    | `opendata-download-hydroobs.smhi.se`  | Water levels/flows          |
| Warnings     | `opendata-download-warnings.smhi.se`  | Impact-based warnings (IBW) |
| Radar        | `opendata-download-radar.smhi.se`     | Precipitation images        |
| Lightning    | `opendata-download-lightning.smhi.se` | Historical strikes          |

### Key Endpoints

```typescript
// Point forecast (SNOW1gv1)
GET / api / category / snow1g / version / 1 / geotype / point / lon / { lon } / lat / { lat } / data.json;

// Observations
GET / api / version / 1.0 / parameter / { param } / station / { id } / period / { period } / data.json;

// Warnings (IBW - Impact Based Warnings)
GET /ibww/api/version/1/warning.json

// Radar
GET / api / version / latest / area / sweden / product / comp / format / png;

// Lightning
GET / api / version / latest / year / { y } / month / { m } / day / { d } / data.csv;
```

## Coordinate System

- **Input:** WGS84 (lat/lon) - standard GPS coordinates
- **Sweden bounds:** 55-69°N latitude, 11-24°E longitude
- **Stockholm example:** latitude=59.33, longitude=18.07
- **Radar output:** Includes SWEREF99TM (EPSG:3006) bounding box

## Concurrency

SMHI API rate limits apply. Use `SMHI_API_CONCURRENCY = 2` from `@/lib/concurrency.ts`.

## Forecast Parameters

| Code     | Name               | Unit |
| -------- | ------------------ | ---- |
| t        | temperature        | °C   |
| ws       | windSpeed          | m/s  |
| gust     | windGust           | m/s  |
| wd       | windDirection      | °    |
| r        | humidity           | %    |
| tcc_mean | cloudCover         | %    |
| pmean    | precipitationMean  | mm/h |
| vis      | visibility         | km   |
| msl      | pressure           | hPa  |
| tstm     | thunderProbability | %    |

## Observation Parameters

### Meteorological

| ID  | Name           | Unit |
| --- | -------------- | ---- |
| 1   | temperature    | °C   |
| 3   | wind_direction | °    |
| 4   | wind_speed     | m/s  |
| 5   | precipitation  | mm   |
| 6   | humidity       | %    |
| 9   | pressure       | hPa  |

### Hydrological

| ID  | Name        | Unit |
| --- | ----------- | ---- |
| 1   | water_level | m    |
| 2   | water_flow  | m³/s |

## Warning Levels (SMHI Color-Coded)

- **Yellow** - Be aware
- **Orange** - Be prepared
- **Red** - Take action

## Development

```bash
npm run dev          # Start dev server (localhost:3000)
npm run typecheck    # Type check
npm run lint         # Lint
npm run prettier:fix # Format code
```

## Testing

```bash
# Basic connectivity
~/.claude/scripts/test-mcp.sh https://mcp-smhi.vercel.app/mcp

# All tools with verbose output
node ~/.claude/scripts/mcp-test-runner.cjs https://mcp-smhi.vercel.app/mcp --all -v

# LLM compatibility simulation
node ~/.claude/scripts/mcp-test-runner.cjs https://mcp-smhi.vercel.app/mcp --all --llm-sim -v
```

## Sample Tool Inputs

```json
// smhi_get_forecast - Stockholm weather
{ "latitude": 59.33, "longitude": 18.07 }

// smhi_get_observations - temperature near Stockholm
{ "dataType": "meteorological", "latitude": 59.33, "longitude": 18.07, "parameter": "temperature", "period": "latest-hour" }

// smhi_get_warnings - all yellow+ warnings
{ "warningLevel": "yellow" }

// smhi_get_radar - current precipitation
{ "product": "comp", "area": "sweden", "format": "png" }

// smhi_get_lightning - recent strikes near Stockholm
{ "date": "latest", "latitude": 59.33, "longitude": 18.07, "radiusKm": 50 }

// smhi_describe_data - list forecast parameters
{ "dataType": "forecast_parameters" }
```
