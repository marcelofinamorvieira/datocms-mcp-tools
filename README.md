# DatoCMS MCP Server

<div align="center">
  <img src="https://www.datocms.com/images/brand/positive-full-logo.svg" alt="DatoCMS" width="300" />
  
  <h3>Model Context Protocol server for seamless DatoCMS integration with Claude AI</h3>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Field Creation Guide](#field-creation-guide)
- [Known Limitations](#known-limitations)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The DatoCMS MCP Server enables Claude AI to interact with DatoCMS through the Model Context Protocol (MCP), providing a standardized interface for content management operations. This allows you to use natural language to manage your DatoCMS content, schema, media, and more.

### What is MCP?

Model Context Protocol (MCP) is an open protocol that enables secure, controlled interactions between AI models and external systems. It provides:

- 🔒 **Secure API Integration** - Your API tokens stay local
- 🎯 **Structured Tool Access** - Well-defined operations with validation
- 📊 **Transparent Operations** - See exactly what actions are performed
- 🔄 **Two-Step Confirmation** - Preview parameters before execution

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/marcelofinamorvieira/datocms-mcp-server.git
cd datocms-mcp-server
npm install
npm run build

# Start the server
npm run start

# Configure Claude Desktop (see Configuration section)
```

## ✨ Features

### Content Management
- 📝 **Records** - Create, read, update, delete, publish/unpublish records
- 🏷️ **Versioning** - Access and restore previous versions
- 🌍 **Localization** - Full support for multi-locale content
- 🔗 **References** - Find where records are referenced

### Schema Management
- 🏗️ **Models** - Create and manage content models
- 🎨 **Fields** - Add fields with proper validation and appearance
- 📦 **Fieldsets** - Group related fields together
- 🔧 **Field Helpers** - Get field type information and examples

### Media Management
- 📤 **Uploads** - Upload and manage media assets
- 📁 **Collections** - Organize uploads into collections
- 🏷️ **Tagging** - Tag and categorize uploads
- 🔍 **Smart Tags** - Auto-generated tags for images

### Project Configuration
- ⚙️ **Settings** - Manage project settings
- 🌐 **Environments** - Create, fork, and promote environments
- 🔧 **Maintenance Mode** - Toggle maintenance mode
- 📊 **Project Info** - Access project metadata

### Team Management
- 👥 **Collaborators** - Invite and manage team members
- 🔐 **Roles** - Define custom roles and permissions
- 🔑 **API Tokens** - Create and manage API access tokens
- 📧 **Invitations** - Send and manage invitations

### Automation
- 🔗 **Webhooks** - Configure webhook endpoints
- 🏗️ **Build Triggers** - Set up deployment triggers
- 📡 **Webhook Calls** - Monitor and resend webhook calls
- 🚀 **Deploy Events** - Track deployment history

### UI Customization
- 📋 **Menu Items** - Customize navigation menu
- 🔌 **Plugins** - Install and configure plugins
- 🎯 **Filters** - Create custom content filters
- 🎨 **Schema Menu** - Organize schema navigation

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Claude AI     │────▶│   MCP Server     │────▶│  DatoCMS API    │
│                 │     │                  │     │                 │
│  Natural Lang   │     │  ┌────────────┐ │     │  Content Mgmt   │
│   Requests      │     │  │Router Tools│ │     │    Platform     │
└─────────────────┘     │  └─────┬──────┘ │     └─────────────────┘
                        │        │         │
                        │  ┌─────▼──────┐  │
                        │  │  Handlers  │  │
                        │  └─────┬──────┘  │
                        │        │         │
                        │  ┌─────▼──────┐  │
                        │  │Zod Schemas │  │
                        │  └────────────┘  │
                        └──────────────────┘
```

### Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Router Tools** | Route operations to handlers | `src/tools/*/RouterTool.ts` |
| **Handlers** | Execute specific operations | `src/tools/*/handlers/` |
| **Schemas** | Validate input parameters | `src/tools/*/schemas.ts` |
| **Utilities** | Shared functionality | `src/utils/` |

### Router Tools Reference

| Router | Domain | Key Operations |
|--------|--------|----------------|
| `RecordsRouterTool` | Content records | CRUD, publish, versions, references |
| `SchemaRouterTool` | Schema management | Models, fields, fieldsets |
| `UploadsRouterTool` | Media assets | Upload, organize, tag |
| `EnvironmentRouterTool` | Environments | Create, fork, promote |
| `ProjectRouterTool` | Project config | Settings, info |
| `CollaboratorsRolesAndAPITokensRouterTool` | Team | Users, roles, tokens |
| `WebhookAndBuildTriggerCallsAndDeploysRouterTool` | Automation | Webhooks, builds |
| `UIRouterTool` | UI customization | Menus, plugins, filters |

## 📦 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **DatoCMS account** with API access
- **Claude Desktop** or Claude AI with MCP support

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/marcelofinamorvieira/datocms-mcp-server.git
   cd datocms-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Verify installation**
   ```bash
   npm run validate  # Validates directory structure
   ```

## ⚙️ Configuration

### Claude Desktop Configuration

1. **Open Claude Desktop settings**
   - Mac: `Claude` → `Settings` → `Developer`
   - Windows: `File` → `Settings` → `Developer`

2. **Add the MCP server**
   ```json
   {
     "mcpServers": {
       "datocms": {
         "command": "/absolute/path/to/datocms-mcp-server/start-server.sh",
         "autoStart": true,
         "alwaysAllow": true
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### Environment Variables (Optional)

```bash
# .env file
DEBUG=true           # Enable debug responses
NODE_ENV=production  # Set environment
```

## 💬 Usage

### Two-Step Execution Pattern

The MCP server uses a two-step pattern for safety:

1. **Parameter Discovery** - Check what parameters are needed
2. **Action Execution** - Execute with the correct parameters

### Basic Examples

#### Query Records
```
User: "Show me how to query blog posts"
Claude: I'll show you the parameters needed for querying records...

User: "Query all blog posts using this token: [YOUR_TOKEN]"
Claude: I'll query the blog posts for you...
```

#### Create a Model
```
User: "Create a new model called 'Product' with title and price fields"
Claude: I'll help you create a Product model. First, let me check the required parameters...
```

#### Upload Media
```
User: "Upload this image URL as a media asset: https://example.com/image.jpg"
Claude: I'll upload that image to your DatoCMS media library...
```

### Advanced Examples

#### Complex Field Creation
```
User: "Add a structured text field to the blog model that allows headings, lists, and links to other articles"
Claude: I'll add a structured text field with those specifications...
```

#### Environment Management
```
User: "Fork the main environment to create a staging environment"
Claude: I'll fork your main environment to create a staging environment...
```

#### Bulk Operations
```
User: "Publish all draft blog posts from the last week"
Claude: I'll find and publish all draft blog posts from the last week...
```

## 📚 API Reference

### Common Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `api_token` | string | DatoCMS API token | ✅ |
| `environment` | string | Target environment (default: "main") | ❌ |
| `locale` | string | Content locale | ❌ |

### Response Format

All responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  meta?: {
    total_count?: number;
    page_count?: number;
  };
}
```

## 📝 Field Creation Guide

### Critical Requirements

1. **Appearances must include `addons`**
   ```javascript
   appearance: {
     editor: "single_line",
     addons: []  // Required even if empty
   }
   ```

2. **Field-Specific Rules**
   - **Location**: Use `"editor": "map"` (not `"lat_lon_editor"`)
   - **String with radio/select**: Enum validator must match options
   - **Rich text**: Requires `rich_text_blocks` validator
   - **Structured text**: Needs both `structured_text_blocks` and `structured_text_links`
   - **Slug**: Requires `slug_title_field` validator

3. **Unsupported Validators**
   - The `required` validator doesn't work on: `gallery`, `links`, `rich_text`

For detailed examples, see [Field Creation Guide](docs/FIELD_CREATION_GUIDE.md).

## ⚠️ Known Limitations

| Feature | Limitation | Workaround |
|---------|------------|------------|
| **Record Creation** | May fail with complex fields (structured text, blocks) | Create with simple fields first, then update |
| **Record Updates** | Complex field updates may fail | Update fields individually |
| **Role Management** | Complex parameter sets fail | Use minimal parameters, update incrementally |
| **Field Creation** | Some validator combinations unsupported | Check field creation guide |

## 🛠️ Development

### Development Workflow

```bash
# Start TypeScript compiler in watch mode
npm run dev

# In another terminal, start the server
npm run start

# Run tests
npm test

# Validate structure
npm run validate
```

### Adding New Features

1. **Create domain structure**
   ```
   src/tools/YourDomain/
   ├── Create/
   │   ├── handlers/
   │   └── index.ts
   ├── Read/
   ├── Update/
   ├── Delete/
   ├── YourDomainRouterTool.ts
   ├── schemas.ts
   └── index.ts
   ```

2. **Define schemas** using Zod
3. **Implement handlers** using factory functions
4. **Create router tool**
5. **Register in** `src/index.ts`

See [Contributing Guide](docs/CONTRIBUTING.md) for detailed instructions.

## 🔧 Troubleshooting

### Common Issues

#### Server won't start
- Check Node.js version (must be v16+)
- Verify all dependencies installed: `npm install`
- Ensure build completed: `npm run build`

#### Claude can't connect
- Verify absolute path in Claude settings
- Check server is running: `ps aux | grep datocms-mcp`
- Restart Claude Desktop after configuration

#### API errors
- Validate API token has necessary permissions
- Check environment name is correct
- Verify rate limits haven't been exceeded

#### Field creation fails
- Review [Field Creation Guide](docs/FIELD_CREATION_GUIDE.md)
- Ensure all appearances include `addons: []`
- Check validator compatibility

### Debug Mode

Enable debug responses:
```typescript
// In your handler
return createStandardSuccessResponse({
  message: "Success",
  data: result,
  debug: { params, query, timing }
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for:

- Code style guidelines
- Development setup
- Testing requirements
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [DatoCMS Documentation](https://www.datocms.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Issue Tracker](https://github.com/marcelofinamorvieira/datocms-mcp-server/issues)
- [DatoCMS Community](https://community.datocms.com)