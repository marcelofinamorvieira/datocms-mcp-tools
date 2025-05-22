# AGENTS.md

This file provides guidance for ChatGPT when contributing to the **datocms-mcp-tools** repository.

## How to Build and Run

- **Build the project**: `npm run build`
- **Run the server**: `npm run start` or `./start-server.sh`
- **Run with HTTP transport**: `npm run start:http`
- **Development watch mode**: `npm run dev`
- **Validate directory structure**: `npm run validate`

Always run `npm run build` before committing changes. The build step compiles the TypeScript sources and executes the validation script.

## Project Organization

The codebase is modular and split by domain. Each domain lives under `src/tools/<Domain>` and follows this structure:

```
src/tools/<Domain>/
  <Operation>/
    handlers/
      <action><Entity>Handler.ts
      index.ts
    index.ts
  <Domain>RouterTool.ts
  schemas.ts
  index.ts
```

Utilities shared across domains reside in `src/utils/`.

## DatoCMS API Reference

- The primary reference for all functionality is the [DatoCMS Content Management API documentation](https://www.datocms.com/docs/content-management-api).
- Consult these docs whenever adding or updating a handler to confirm available endpoints, parameters, and error codes.
- API calls are made through the `@datocms/cma-client-node` library. Examine its type definitions to understand request and response shapes.
- The `UnifiedClientManager` in `src/utils/` wraps these typed clients and caches them for reuse.

## Key Patterns

- **Router Tools** route incoming MCP requests to the appropriate handlers.
- **Handlers** implement domain logic and return standardized responses.
- **Schema Validation** uses Zod; schemas live in each domain's `schemas.ts` file.
- **Handler Factories** (`createRetrieveHandler`, `createListHandler`, `createCreateHandler`, `createUpdateHandler`, `createDeleteHandler`) standardize common operations.
- **Middleware Composition** adds layers such as schema validation and error handling around handlers.
- **Standard Response Format**: handlers must return objects that implement `StandardResponse` from `RESPONSE_FORMAT_STANDARDS.md`.

## Development Guidelines

1. Follow the router/handler pattern when adding functionality.
2. Use the unified client manager (`UnifiedClientManager`) for creating DatoCMS clients.
3. Document all files and functions with JSDoc as described in `DOCUMENTATION_STANDARDS.md`.
4. Never use `console.log` for debugging. Include debug info in the response object if needed and remove it after resolving issues. See `CLAUDE.md` for detailed debugging guidelines.
5. When creating or updating fields, read `docs/FIELD_CREATION_GUIDE.md` for strict requirements (e.g., always include `appearance.addons`, use `editor: "map"` for location fields, etc.).
6. Keep code consistent with the directory and naming conventions defined in `DIRECTORY_STRUCTURE_STANDARDS.md`.
7. Consult the official DatoCMS Content Management API docs whenever implementing or updating an endpoint.
8. Use the typed clients from `@datocms/cma-client-node` and refer to their definitions for parameter and response shapes.

## Contribution Workflow

1. Make changes following the standards above.
2. Run `npm run build` to compile and validate the project.
3. Update or add documentation as necessary.
4. Commit your work and create a pull request with a clear description of your changes.

Refer to `docs/CONTRIBUTING.md` for more detail on design patterns, code review criteria, and how to add new domains or operations.

