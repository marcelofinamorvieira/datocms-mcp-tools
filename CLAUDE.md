# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a Model Context Protocol (MCP) server that enables Claude AI models to interact with DatoCMS. It provides tools for querying and managing DatoCMS content, collaborators, environments, projects, records, roles, API tokens, schema (item types, fieldsets, etc.), and uploads through a standardized interface.

## Commands

### Build and Run

- Build the TypeScript project: `npm run build`
- Start the MCP server: `npm run start` or `./start-server.sh`
- Start the server with HTTP transport: `npm run start:http`
- Watch mode for development: `npm run dev`
- Validate directory structure: `npm run validate`

### Development Workflow

1. Run the TypeScript compiler in watch mode: `npm run dev`
2. In a separate terminal, start the server: `npm run start` or `./start-server.sh`
3. Make changes to the codebase and the server will automatically reload

## Project Structure

The codebase follows a modular architecture organized by domain:

- `src/index.ts` - Entry point that initializes the MCP server
- `src/tools/` - Contains all MCP tools organized by domain
  - `Records/` - Tools for record CRUD operations, publication, and versioning
  - `Schema/` - Tools for schema operations (item types, fieldsets, fields)
  - `Project/` - Project configuration tools
  - `Uploads/` - Media asset management tools
  - `Environments/` - Environment management tools
  - `CollaboratorsRolesAndAPITokens/` - Collaborator, role, and API token management
  - `WebhookAndBuildTriggerCallsAndDeploys/` - Webhook and delivery management
  - `UI/` - UI customization tools (menu items, plugins, filters)

## Architecture

### Core Components

1. **MCP Server** - Uses `@modelcontextprotocol/sdk` to handle communication between Claude and DatoCMS
2. **Router Tools** - Organize related tools into domain-specific routers:
   - `RecordsRouterTool` - Handles record operations
   - `ProjectRouterTool` - Manages project settings
   - `UploadsRouterTool` - Controls media assets
   - `EnvironmentRouterTool` - Manages environments
   - `SchemaRouterTool` - Handles schema operations
   - `CollaboratorsRolesAndAPITokensRouterTool` - Manages users, roles, and API tokens
   - `WebhookAndBuildTriggerCallsAndDeploysRouterTool` - Manages webhooks and build triggers
   - `UIRouterTool` - Manages UI customization components

### Key Design Patterns

1. **Router Pattern** - Domain-specific router tools group related functionality
   - Example: `src/tools/Records/RecordsRouterTool.ts` routes record operations to appropriate handlers

2. **Handler Pattern** - Implementations are separated into handler functions
   - Example: `src/tools/Records/Read/handlers/` contains specific record read operation handlers

3. **Schema Validation** - Uses Zod for input validation
   - Schemas defined in domain-specific schema files (e.g., `schemas.ts`)

4. **Two-Step Execution Flow**:
   - First call the `datocms_parameters` tool to get information about required parameters
   - Then use the `datocms_execute` tool with the proper parameters

5. **Handler Factory Pattern** - Factory functions create handlers with consistent error handling and response formatting
   - `createRetrieveHandler` - For getting single entities
   - `createListHandler` - For listing multiple entities
   - `createCreateHandler` - For creating new entities
   - `createUpdateHandler` - For updating existing entities
   - `createDeleteHandler` - For deleting entities

6. **Middleware Composition** - Functionality is layered through middleware:
   - Schema validation middleware
   - Error handling middleware
   - Client management middleware

7. **Standardized Response Format** - All handlers return responses in a consistent format:
   ```typescript
   interface StandardResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
     message?: string;
     meta?: ResponseMetadata;
   }
   ```

### Communication Flow

1. Claude sends a tool request to the MCP server
2. The server routes the request to the appropriate domain router
3. The router delegates to specific handlers
4. Handlers interact with the DatoCMS API via `@datocms/cma-client-node`
5. Results are returned to Claude through the MCP protocol

## Development Guidelines

When modifying or extending this codebase:

1. Follow the existing router/handler pattern for organizing new tools
2. Create appropriate Zod schemas for parameter validation in domain-specific schema files
3. Implement error handling using the utility functions in `src/utils/errorHandlers.ts`
4. Register new tools in `src/index.ts` within the `createServer` function
5. Use handler factory functions for common operations:
   ```typescript
   export const getResourceHandler = createRetrieveHandler({
     domain: "resources",
     schemaName: "get",
     schema: resourceSchemas.get,
     entityName: "Resource",
     idParam: "resourceId",
     clientAction: async (client, args) => {
       return await client.resources.find(args.resourceId);
     }
   });
   ```
6. Follow the standardized directory structure:
   ```
   src/
   ├── tools/
   │   ├── <Domain>/                                 # Domain name in PascalCase (e.g., Records)
   │   │   ├── <Operation>/                          # Operation name in PascalCase (e.g., Create, Read)
   │   │   │   ├── handlers/                         # All handlers for this operation
   │   │   │   │   ├── <action><Entity>Handler.ts    # Handler files: verb + entity
   │   │   │   │   └── index.ts                      # Exports all handlers
   │   │   │   └── index.ts                          # Operation exports
   │   │   ├── <Domain>RouterTool.ts                 # Router for this domain
   │   │   ├── schemas.ts                            # All schemas for this domain
   │   │   └── index.ts                              # Domain exports
   ```

## API Client

The project uses `@datocms/cma-client-node` to interact with the DatoCMS Content Management API. Refer to the [DatoCMS CMA documentation](https://www.datocms.com/docs/content-management-api) for API details.

## Client Management

The project uses a unified client manager to handle client initialization and reuse:

```typescript
// Get a default client
const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

// Get a typed records client
const recordsClient = UnifiedClientManager.getRecordsClient(apiToken, environment);

// Get a collaborators client
const collaboratorsClient = UnifiedClientManager.getCollaboratorsClient(apiToken, environment);
```

## Known Limitations

Be aware of these current limitations when working with the codebase:

- **Record operations**: Creation and update may fail for complex field types such as structured text or block fields
- **Role operations**: Creation and update fail for complex parameter sets

## Field Creation Requirements

When creating fields in DatoCMS, follow these critical requirements:

1. All field appearances must include an `addons` array (even if empty)
2. For location fields, use `"editor": "map"` (not "lat_lon_editor") 
3. String fields with radio or select appearance require matching enum validator values
4. JSON fields with checkbox group must use the "options" parameter
5. Rich text fields require a `rich_text_blocks` validator specifying allowed block item type IDs
6. Structured text fields require both `structured_text_blocks` and `structured_text_links` validators
7. Slug fields need a `slug_title_field` validator referencing the title field
8. Single block fields use the `single_block_blocks` validator
9. The `required` validator is **not** supported on `gallery`, `links`, or `rich_text` fields

See `docs/FIELD_CREATION_GUIDE.md` for detailed examples.

## Configuration with Claude Desktop

To configure Claude Desktop to work with this server:

1. Open Claude Desktop settings
2. Add tool with command: `/path/to/datocms-mcp-tools/start-server.sh`
3. Set auto-start and enable the tool

## Debugging Guidelines

When debugging issues in this codebase, follow these important guidelines:

1. **NEVER use console.log statements** - These will not be visible to users of Claude Code, and there's no way to access server-side logs during an interactive session

2. **Use response objects for debugging** - Include debug information directly in the response object that will be sent back to the client:
   ```typescript
   return createResponse(JSON.stringify({
     message: "Operation result message",
     debug: {
       // Include relevant debug information here
       params: requestParams,
       filter: appliedFilters
     },
     data: actualData
   }, null, 2));
   ```

3. **Create explicit validation checks** - When input validation fails, be specific about which parameters are incorrect and what the expected format is

4. **Use tool responses for debugging** - Remember that tool responses are the only way to communicate information back to the user, so make them informative and complete

5. **Error handling with context** - Always include context in error messages to help identify where and why the error occurred:
   ```typescript
   return createErrorResponse(`Error in ${domain}.${operation}: ${detailedErrorInfo}`);
   ```

6. **Remove debugging after issue resolution** - Once issues are fixed and validated, remember to remove any debug information from production code to keep responses clean and efficient

7. **Document debugging additions** - When adding debugging code, use comments to mark it clearly so it can be easily identified and removed later:
   ```typescript
   // DEBUG: Added to troubleshoot field filtering issues - remove after fixing
   return createResponse(JSON.stringify({
     message: "Operation result",
     debug: { /* debug info */ },  // DEBUG: Remove this before production
     data: actualData
   }, null, 2));
   ```
