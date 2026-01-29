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

## Available Tools (4)

| Tool                         | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `smhi_get_forecast`          | 10-day point forecast for construction planning          |
| `smhi_get_observations`      | Station measurements (weather + water levels)            |
| `smhi_get_current_conditions`| Warnings, radar, lightning (via `conditionType` param)   |
| `smhi_describe_data`         | Discover stations, parameters, districts                 |

### Tool Consolidation Pattern (Reference)

This MCP demonstrates how to consolidate multiple related tools into one using enum parameters.

**Before (6 tools):**
- `smhi_get_warnings` - Weather warnings
- `smhi_get_radar` - Radar images
- `smhi_get_lightning` - Lightning strikes

**After (1 tool):**
```typescript
// smhi_get_current_conditions with conditionType enum
conditionType: z.enum(['warnings', 'radar', 'lightning'])

// Usage:
{ "conditionType": "warnings", "warningLevel": "yellow" }
{ "conditionType": "radar", "format": "png" }
{ "conditionType": "lightning", "date": "latest" }
```

**When to consolidate:** Tools that share a semantic category (e.g., "current conditions") or have similar use patterns. Each option can have its own optional parameters.

## Project Structure

```
src/
├── app/[transport]/route.ts   # MCP endpoint
├── clients/smhi-client.ts     # Unified SMHI API client
├── data/
│   ├── kommuner.json          # 290 Swedish municipalities
│   └── lan.json               # 21 Swedish counties with centroids
├── lib/
│   ├── concurrency.ts         # Rate limiting (max 2 concurrent)
│   ├── errors.ts              # Error classes
│   ├── http-client.ts         # HTTP wrapper
│   ├── location-resolver.ts   # Kommun/län → coordinates mapping
│   └── response.ts            # Response formatting
├── tools/
│   ├── index.ts                  # Tool registry (4 tools)
│   ├── get-forecast.ts           # SNOW1gv1 point forecast
│   ├── get-observations.ts       # Met + hydro station data
│   ├── get-current-conditions.ts # Warnings, radar, lightning
│   └── describe-data.ts          # Metadata discovery
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

## Location Input Options

Tools accept location in three formats:

| Format | Example | Description |
|--------|---------|-------------|
| **WGS84 coordinates** | `latitude=59.33, longitude=18.07` | Decimal degrees |
| **Kommun code/name** | `kommun="0180"` or `kommun="Stockholm"` | 4-digit municipality code or name |
| **Län code/name** | `lan="AB"` or `lan="Stockholms län"` | 1-2 letter county code or name |

- **Sweden bounds:** 55-69°N latitude, 11-24°E longitude
- **Kommun codes:** 4-digit (e.g., "0180" = Stockholm, "1480" = Göteborg)
- **Län codes:** 1-2 letters (e.g., "AB" = Stockholms län, "O" = Västra Götalands län)
- **Radar output:** Includes SWEREF99TM (EPSG:3006) bounding box

Use `smhi_describe_data` with `dataType="kommuner"` or `dataType="lan"` to list available codes.

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
// smhi_get_forecast - by coordinates
{ "latitude": 59.33, "longitude": 18.07 }

// smhi_get_forecast - by kommun code
{ "kommun": "0180" }

// smhi_get_forecast - by kommun name
{ "kommun": "Stockholm" }

// smhi_get_forecast - by län code
{ "lan": "AB" }

// smhi_get_observations - temperature in Göteborg
{ "dataType": "meteorological", "kommun": "Göteborg", "parameter": "temperature", "period": "latest-hour" }

// smhi_get_current_conditions - weather warnings
{ "conditionType": "warnings", "warningLevel": "yellow" }

// smhi_get_current_conditions - precipitation radar
{ "conditionType": "radar", "format": "png" }

// smhi_get_current_conditions - lightning near Malmö
{ "conditionType": "lightning", "date": "latest", "kommun": "Malmö", "radiusKm": 50 }

// smhi_describe_data - list all kommuner
{ "dataType": "kommuner" }

// smhi_describe_data - list kommuner in Stockholms län
{ "dataType": "kommuner", "lanFilter": "AB" }

// smhi_describe_data - list all län
{ "dataType": "lan" }
```
