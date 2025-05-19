# DatoCMS MCP Server

A Model Context Protocol (MCP) server that enables Claude AI models to interact with DatoCMS through a standardized interface.

## Overview

This project provides tools for Claude to manage all aspects of DatoCMS including:

- Content records (create, read, update, delete, publish)
- Media uploads and collections
- Schema definition (models, fields, fieldsets)
- Project settings and configuration
- User management and permissions
- Environments and deployment
- Webhooks and build triggers

## Architecture

The server follows a modular router-based architecture:

- **Router Tools**: Domain-specific routers handle operations for each resource type
- **Handler Pattern**: Each operation has dedicated handler functions
- **Schema Validation**: Zod schemas validate all parameters
- **Two-Step Execution**: Parameters discovery followed by action execution

### Main Router Tools

| Router Tool | Description |
|-------------|-------------|
| `RecordsRouterTool` | Record CRUD, publication, versioning |
| `SchemaRouterTool` | Schema components management |
| `UploadsRouterTool` | Media asset management |
| `EnvironmentRouterTool` | Environment management |
| `CollaboratorsRolesAndAPITokensRouterTool` | User, role, token management |
| `WebhookAndBuildTriggerCallsAndDeploysRouterTool` | Webhook and build management |
| `UIRouterTool` | UI customization tools |

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- DatoCMS account and API token
- Claude AI with MCP capabilities

### Installation

```bash
git clone https://github.com/datocms/datocms-mcp-tools.git
cd datocms-mcp-tools
npm install
npm run build
```

### Running the Server

```bash
# Using the shell script
./start-server.sh

# Using npm
npm run start

# Development mode with auto-restart
npm run dev

# HTTP transport mode
npm run start:http
```

## Usage with Claude

### Basic Workflow

1. **Get Parameters**:
   ```
   User: What parameters do I need to query records?
   Claude: [uses datocms_parameters to show required parameters]
   ```

2. **Execute Action**:
   ```
   User: Query blog posts with this token: [API_TOKEN]
   Claude: [executes query and returns results]
   ```

### Field Creation Guidelines

When creating fields in DatoCMS, follow these critical requirements:

1. All field appearances must include an `addons` array (even if empty)
2. For location fields, use `"editor": "map"` (not "lat_lon_editor")
3. String fields with radio or select appearance require matching enum validator values
4. JSON fields with checkbox group must use the "options" parameter

See `docs/FIELD_CREATION_GUIDE.md` for detailed examples and requirements.

### Configuration

Configure Claude Desktop to work with the server:

1. Open Claude Desktop settings
2. Add tool with command: `/path/to/datocms-mcp-tools/start-server.sh`
3. Set auto-start and enable the tool

For advanced configuration options and integrations, see the [detailed documentation](https://docs.datocms.com/claude-integration).

## Development

When extending this codebase:

1. Follow the router/handler pattern for new tools
2. Define parameter schemas using Zod
3. Implement handlers in domain-specific directories
4. Register new tools in `src/index.ts`

## License

MIT
