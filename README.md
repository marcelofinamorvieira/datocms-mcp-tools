# DatoCMS MCP Tools

This project provides a Model Context Protocol (MCP) server that enables Claude AI models to interact with DatoCMS. It includes tools for managing DatoCMS content, collaborators, environments, projects, records, roles, API tokens, schema (item types, fieldsets, etc.), and uploads through a standardized interface.

## Features

- **Content Management**: Query, create, read, update, and delete DatoCMS records
- **Publication Management**: Publish, unpublish, and schedule content publications
- **Collaborator Management**: Manage users and roles in your DatoCMS project
- **API Token Management**: Create, retrieve, update, delete, and rotate API tokens
- **Environment Management**: Create, fork, promote, and maintain DatoCMS environments
- **Schema Management**: Manage item types (models), fieldsets, and related schema components
- **Upload Management**: Manage media assets, collections, and tags
- **Project Configuration**: Retrieve and update project settings
- **UI Customization**: Manage menu items, schema menu items, model filters, uploads filters, and plugins

## Architecture

The codebase follows a modular architecture organized around domain-specific routers. This design provides a clean separation of concerns while maintaining consistency across different resource types. Related functionalities are grouped together (e.g., collaborators, roles, and API tokens) for better organization.

### Router Architecture

The server implements a router-based architecture with a uniform pattern:

1. **Router Tool**: Each domain has a main router tool that handles all operations for that resource type
   - Example: `RecordsRouterTool.ts`, `ProjectRouterTool.ts`

2. **Domain-Specific Organization**: Each router organizes operations into subdirectories by type
   - Example: `Records/Read/`, `Records/Publication/`, `Records/Delete/`, `CollaboratorsRolesAndAPITokens/Collaborators/`, `CollaboratorsRolesAndAPITokens/Roles/`

3. **Handler Implementation**: Individual operation handlers are implemented in their own files
   - Example: `getRecordByIdHandler.ts`, `publishRecordHandler.ts`

4. **Schema Validation**: Each domain defines Zod schemas for parameter validation in a `schemas.ts` file

### Router Tools

All operations are coordinated through these main router tools:

| Router Tool | Description | Examples |
|-------------|-------------|----------|
| `RecordsRouterTool` | Manages record CRUD, publication, and versioning | Query records, create/update records, publish/unpublish, manage versions |
| `ProjectRouterTool` | Handles project-level operations | Get project info, update site settings |
| `EnvironmentRouterTool` | Manages DatoCMS environments | List environments, retrieve environment details |
| `CollaboratorsRolesAndAPITokensRouterTool` | Manages users, roles, invitations, and API tokens | Create/delete users, manage invitations, create/update/delete roles, create/rotate API tokens |
| `UploadsRouterTool` | Manages media assets | Query uploads, manage upload collections |
| `SchemaRouterTool` | Manages schema components | Create/read/update/delete item types and fieldsets |
| `WebhookAndBuildTriggerCallsAndDeploysRouterTool` | Manages webhooks, build triggers, deploy events, and webhook calls | Create/update/delete webhooks, list webhook calls, manage build triggers, view deploy events |
| `MenuItemRouterTool` | Manages menu items in the UI | Create/read/update/delete menu items |
| `SchemaMenuItemRouterTool` | Manages schema menu items | Create/read/update/delete schema menu items |
| `ModelFilterRouterTool` | Manages model filters | Create/read/update/delete model filters |
| `UploadsFilterRouterTool` | Manages upload filters | Create/read/update/delete upload filters | 
| `PluginsRouterTool` | Manages plugins | Create/read/update/delete plugins, retrieve plugin fields |

### Parameter Description System

The architecture includes a sophisticated parameter description system:

1. **Documentation Tool** (`DocumentationTool.ts`): Provides detailed parameter information
   - Exposes the `datocms_parameters` tool to Claude
   - Formats Zod schemas into user-friendly documentation

2. **Parameter-First Workflow**: 
   - Users must first call `datocms_parameters` to understand required parameters
   - Then use the appropriate router tool with the correct parameters

3. **Schema Validation**:
   - All router tools validate parameters against Zod schemas
   - Detailed error messages direct users back to the parameters tool

## Records Router Actions

The `RecordsRouterTool` provides comprehensive management for DatoCMS records:

### Read Actions
- **query**: Query multiple records with filtering, pagination, and locale options
- **get**: Retrieve a specific record by ID
- **references**: Get records that reference a specific record
- **editor_url_from_type**: Build a URL to view/edit a specific record in the DatoCMS UI

### Create Actions
- **create**: Create a new record with support for all field types (Text, Rich Text, Media, Links, SEO, etc.)
- **duplicate**: Duplicate an existing record

### Update Actions
- **update**: Update an existing record with partial updates and optimistic locking

### Delete Actions
- **destroy**: Delete a specific record
- **bulk_destroy**: Delete multiple records in a single operation

### Publication Actions
- **publish**: Publish a record
- **bulk_publish**: Publish multiple records in a single operation
- **unpublish**: Unpublish a record
- **bulk_unpublish**: Unpublish multiple records in a single operation

### Publication Scheduling Actions
- **schedule_publication**: Schedule a record to be published at a specific time
- **cancel_scheduled_publication**: Cancel a scheduled publication
- **schedule_unpublication**: Schedule a record to be unpublished at a specific time
- **cancel_scheduled_unpublication**: Cancel a scheduled unpublication

### Version Actions
- **versions_list**: List all versions of a record
- **version_get**: Get a specific version of a record
- **version_restore**: Restore a record to a previous version

## WebhookAndBuildTriggerCallsAndDeploys Router Actions

The `WebhookAndBuildTriggerCallsAndDeploysRouterTool` provides comprehensive management for webhooks, build triggers, webhook calls, and deploy events:

### Webhook Actions
- **list**: List all webhooks
- **retrieve**: Get a specific webhook
- **create**: Create a new webhook
- **update**: Update an existing webhook
- **delete**: Delete a webhook

### Webhook Call Actions
- **list**: List webhook call logs for a specific webhook
- **retrieve**: Get detailed information about a webhook call
- **resend**: Resend a webhook call

### Build Trigger Actions
- **list**: List all build triggers
- **retrieve**: Get a specific build trigger
- **create**: Create a new build trigger
- **update**: Update an existing build trigger
- **delete**: Delete a build trigger
- **trigger**: Manually trigger a build

### Deploy Event Actions
- **list**: List deploy events for a specific build trigger
- **retrieve**: Get detailed information about a deploy event

## UI Tools Actions

### Plugins Router Actions
- **list**: List all plugins
- **retrieve**: Get a specific plugin
- **create**: Create a new plugin
- **update**: Update an existing plugin
- **delete**: Delete a plugin
- **fields**: Retrieve fields using the plugin

### Model Filter Router Actions
- **list**: List all model filters
- **retrieve**: Get a specific model filter
- **create**: Create a new model filter
- **update**: Update an existing model filter
- **delete**: Delete a model filter

### Menu Item Router Actions
- **list**: List all menu items
- **retrieve**: Get a specific menu item
- **create**: Create a new menu item
- **update**: Update an existing menu item
- **delete**: Delete a menu item

## Usage Flow

1. **Get Parameters**: Call `datocms_parameters` with a resource and action
   ```json
   {
     "resource": "records",
     "action": "query"
   }
   ```

2. **Execute Action**: Call the appropriate router tool with validated parameters
   ```json
   {
     "action": "query",
     "args": {
       "apiToken": "your-api-token",
       "textSearch": "content management"
     }
   }
   ```

### Example: Creating a Record

1. **Get Parameters for Record Creation**:
   ```json
   {
     "resource": "records",
     "action": "create"
   }
   ```

2. **Create a New Record**:
   ```json
   {
     "action": "create",
     "args": {
       "apiToken": "your-api-token",
       "itemType": "12345",
       "data": {
         "title": "My New Article",
         "content": "This is the article content",
         "category": {
           "type": "item",
           "id": "category-id"
         },
         "image": {
           "upload_id": "upload-id",
           "alt": "Featured image",
           "title": "Featured image title"
         }
       }
     }
   }
   ```

### Example: Updating a Record

1. **Get Parameters for Record Update**:
   ```json
   {
     "resource": "records",
     "action": "update"
   }
   ```

2. **Update an Existing Record**:
   ```json
   {
     "action": "update",
     "args": {
       "apiToken": "your-api-token",
       "itemId": "record-id",
       "data": {
         "title": "Updated Article Title",
         "is_featured": true
       },
       "version": "current-version-id"
     }
   }
   ```

## Development Guidelines

When extending this codebase:

1. **Follow Router Patterns**: Add new functionality by following the existing router/handler pattern
2. **Schema Definitions**: Define parameter schemas using Zod in domain-specific schema files
3. **Handler Implementation**: Implement operation handlers in subdirectories by operation type
4. **Tool Registration**: Register new tools in `src/index.ts` within the `createServer` function

## Commands

### Build and Run

- Build the TypeScript project: `npm run build`
- Start the MCP server: `npm run start` or `./start-server.sh`
- Start the server with HTTP transport: `npm run start:http`
- Watch mode for development: `npm run dev`

## Prerequisites

- Node.js (v16+)
- npm or yarn
- A DatoCMS account and API token
- Claude AI with MCP capabilities (Claude 3 Opus/Sonnet/Haiku)

## Installation

1. Clone this repository:

```bash
git clone https://github.com/marcelofinamorvieira/datocms-mcp-tools.git
cd datocms-mcp-tools
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Build the TypeScript project:

```bash
npm run build
# or
yarn build
```

## Running the MCP Server

Start the server using the provided shell script:

```bash
./start-server.sh
```

Alternatively, you can use the npm script:

```bash
npm run start
# or
yarn start
```

## Detailed Guide: Using with Claude Desktop

### Setting Up the DatoCMS MCP Server Locally

1. **Clone and Install Dependencies**

   ```bash
   git clone https://github.com/marcelofinamorvieira/datocms-mcp-tools.git
   cd datocms-mcp-tools
   npm install
   ```

2. **Build the TypeScript Project**

   ```bash
   npm run build
   ```

3. **Obtain a DatoCMS API Token**

   - Log in to your DatoCMS account
   - Go to Settings > API tokens
   - Create a new full-access API token or use an existing one
   - Copy the token for later use

4. **Start the MCP Server**

   You can start the server using one of these methods:

   ```bash
   # Using the shell script
   ./start-server.sh

   # Using npm
   npm run start

   # For development with auto-restart on code changes
   npm run dev
   ```

   The server will start and listen for connections from Claude. By default, it uses a Unix socket for communication, but you can also use HTTP transport with `npm run start:http`.

### Configuring Claude Desktop

You can configure Claude Desktop to work with the DatoCMS MCP server using either the GUI or by directly editing the configuration file.

#### Method 1: Using the GUI (Recommended for Beginners)

1. **Install Claude Desktop**

   - Download Claude Desktop from the [Anthropic website](https://www.anthropic.com/claude)
   - Install and launch the application

2. **Add the DatoCMS MCP Connection**

   - Open Claude Desktop
   - Click on the settings icon (⚙️) in the bottom left corner
   - Select "Claude Tools" from the menu
   - Click "Add Tool"
   - Fill in the following details:
     - **Name**: DatoCMS Tools (or any descriptive name)
     - **Command**: Provide the full path to your start-server.sh script or use npm:
       ```
       /path/to/your/datocms-mcp-server/start-server.sh
       ```
       OR
       ```
       cd /path/to/your/datocms-mcp-server && npm run start
       ```
   - Click "Save"

#### Method 2: Direct JSON Configuration (Advanced)

1. **Locate the Claude Desktop Configuration File**

   The configuration file is typically located at:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Edit the Configuration File**

   Open the file in a text editor and add the DatoCMS MCP server to the `mcpServers` section:

   ```json
   {
     "globalShortcut": "Ctrl+Space",
     "mcpServers": {
       "datocms": {
         "name": "DatoCMS Tools",
         "command": "/path/to/your/datocms-mcp-server/start-server.sh",
         "auto_start": true,
         "enabled": true
       }
     }
   }
   ```

   **Configuration Options:**
   - `name`: Display name for the tool
   - `command`: Full path to the start script or command
   - `auto_start`: Set to `true` to automatically start the server when Claude Desktop launches
   - `enabled`: Set to `true` to enable the tool

3. **Multiple Environment Support**

   You can configure multiple DatoCMS environments by adding multiple entries:

   ```json
   {
     "globalShortcut": "Ctrl+Space",
     "mcpServers": {
       "datocms_production": {
         "name": "DatoCMS Production",
         "command": "/path/to/your/datocms-mcp-server/start-server.sh",
         "env": {
           "DATOCMS_ENV": "production"
         },
         "auto_start": true,
         "enabled": true
       },
       "datocms_staging": {
         "name": "DatoCMS Staging",
         "command": "/path/to/your/datocms-mcp-server/start-server.sh",
         "env": {
           "DATOCMS_ENV": "staging"
         },
         "auto_start": true,
         "enabled": true
       }
     }
   }
   ```

4. **Using HTTP Transport**

   If you prefer to use HTTP transport instead of Unix sockets:

   ```json
   {
     "globalShortcut": "Ctrl+Space",
     "mcpServers": {
       "datocms": {
         "name": "DatoCMS Tools",
         "command": "/path/to/your/datocms-mcp-server/start-server.sh",
         "env": {
           "MCP_TRANSPORT": "http",
           "MCP_HTTP_PORT": "3000"
         },
         "auto_start": true,
         "enabled": true
       }
     }
   }
   ```

5. **Save the File and Restart Claude Desktop**

   After making changes to the configuration file, save it and restart Claude Desktop for the changes to take effect.

### Verifying the Connection

- Start a new conversation in Claude Desktop
- Type a message like: "Can you help me manage my DatoCMS content?"
- Claude should respond that it has access to DatoCMS tools
- If Claude doesn't recognize the tools, check the console output from your MCP server for any errors

### Using the DatoCMS MCP Tools

1. **Two-Step Execution Flow**

   Always use the two-step pattern with DatoCMS tools:

   - First, ask Claude to get information about the required parameters
   - Then, provide those parameters to execute the action

2. **Example: Querying Records**

   ```
   User: I want to query records in my DatoCMS project. What parameters do I need?

   Claude: Let me check what parameters are needed for querying records.
   [Claude uses datocms_parameters tool]

   To query records, you'll need these parameters:
   - apiToken (required): Your DatoCMS API token
   - skip (optional): Number of records to skip
   - first (optional): Maximum number of records to return
   - ...other parameters

   User: Great, please query my blog posts using this API token: [your-api-token]

   Claude: [Claude executes the query and returns the results]
   ```

3. **Common Operations**

   - **List Item Types**: Ask Claude to list all available item types in your project
   - **Query Records**: Request records with filtering and sorting options
   - **Create/Update Records**: Create or modify content with Claude's assistance
   - **Manage Collaborators**: Add, remove, or update user permissions
   - **Work with Environments**: Fork, promote, or manage environments

4. **Troubleshooting**

   If you encounter issues:

   - Check the MCP server console output for error messages
   - Verify your API token has the necessary permissions
   - Ensure the MCP server is running when you start a Claude conversation
   - Try restarting both the MCP server and Claude Desktop

### Advanced Configuration

1. **Using Environment Variables**

   You can configure the server using environment variables:

   ```bash
   # Set the transport type (unix or http)
   export MCP_TRANSPORT=http

   # Set the HTTP port (if using HTTP transport)
   export MCP_HTTP_PORT=3000

   # Start the server
   npm run start
   ```

2. **Setting Up as a Background Service**

   For convenience, you can set up the MCP server as a background service:

   **macOS (using launchd):**

   Create a file named `com.datocms.mcp-server.plist` in `~/Library/LaunchAgents/`:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.datocms.mcp-server</string>
       <key>ProgramArguments</key>
       <array>
           <string>/bin/bash</string>
           <string>/path/to/your/datocms-mcp-server/start-server.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
       <key>StandardOutPath</key>
       <string>/tmp/datocms-mcp-server.log</string>
       <key>StandardErrorPath</key>
       <string>/tmp/datocms-mcp-server.error.log</string>
   </dict>
   </plist>
   ```

   Load the service:

   ```bash
   launchctl load ~/Library/LaunchAgents/com.datocms.mcp-server.plist
   ```

3. **Using with Claude Web**

   While primarily designed for Claude Desktop, you can also use this server with Claude web by:

   - Running the server with HTTP transport: `npm run start:http`
   - Using a tunneling service like ngrok to expose your local server to the internet
   - Configuring the Claude web MCP settings to connect to your tunneled URL

## License

MIT