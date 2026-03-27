# CLAUDE.md

## Build & Run
npm install && npm run build && npm start

## Test
npm run inspect

## Environment
DATTO_API_KEY, DATTO_API_SECRET, DATTO_PLATFORM (default: merlot)

## Key Design Decision
All tool schemas are FLAT (no $ref, no anyOf, no nested objects) for Copilot Studio compatibility.
Complex inputs use JSON-encoded strings parsed in handlers.

## API Reference
- OpenAPI Spec: https://merlot-api.centrastage.net/api/v3/api-docs/Datto-RMM
- Swagger UI: https://merlot-api.centrastage.net/api/swagger-ui/index.html
- Docs: https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm
