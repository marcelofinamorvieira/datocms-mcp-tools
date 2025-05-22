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

| Router Tool | Description | Handlers |
|-------------|-------------|----------|
| `RecordsRouterTool` | Record CRUD, publication, versioning | `query`, `get`, `references`, `record_url`, `create`, `update`, `duplicate`, `destroy`, `bulk_destroy`, `publish`, `bulk_publish`, `unpublish`, `bulk_unpublish`, `schedule_publication`, `cancel_scheduled_publication`, `schedule_unpublication`, `cancel_scheduled_unpublication`, `versions_list`, `version_get`, `version_restore` |
| `SchemaRouterTool` | Schema components management | `create_item_type`, `duplicate_item_type`, `get_item_type`, `list_item_types`, `update_item_type`, `delete_item_type`, `create_fieldset`, `get_fieldset`, `list_fieldsets`, `update_fieldset`, `delete_fieldset`, `create_field`, `get_field`, `list_fields`, `update_field`, `delete_field`, `get_field_type_info` |
| `UploadsRouterTool` | Media asset management | `get`, `query`, `references`, `create`, `update`, `destroy`, `bulk_destroy`, `bulk_tag`, `bulk_set_collection`, `list_tags`, `create_tag`, `list_smart_tags`, `get_collection`, `query_collections`, `create_collection`, `update_collection`, `delete_collection` |
| `EnvironmentRouterTool` | Environment management | `retrieve`, `list`, `delete`, `rename`, `promote`, `fork`, `maintenance_status`, `maintenance_activate`, `maintenance_deactivate` |
| `CollaboratorsRolesAndAPITokensRouterTool` | User, role, token management | `invitation_create`, `invitation_list`, `invitation_retrieve`, `invitation_destroy`, `invitation_resend`, `user_list`, `user_retrieve`, `user_update`, `user_destroy`, `user_invite`, `create_role`, `list_roles`, `retrieve_role`, `update_role`, `destroy_role`, `duplicate_role`, `create_token`, `list_tokens`, `retrieve_token`, `update_token`, `destroy_token`, `rotate_token` |
| `WebhookAndBuildTriggerCallsAndDeploysRouterTool` | Webhook and build management | Webhook actions: `list`, `retrieve`, `create`, `update`, `delete`; Webhook call actions: `list`, `retrieve`, `resend`; Build trigger actions: `list`, `retrieve`, `create`, `update`, `delete`, `trigger`, `abort`, `abortIndexing`, `reindex`; Deploy event actions: `list`, `retrieve` |
| `UIRouterTool` | UI customization tools | `menu_item_list`, `menu_item_retrieve`, `menu_item_create`, `menu_item_update`, `menu_item_delete`, `schema_menu_item_list`, `schema_menu_item_retrieve`, `schema_menu_item_create`, `schema_menu_item_update`, `schema_menu_item_delete`, `uploads_filter_list`, `uploads_filter_retrieve`, `uploads_filter_create`, `uploads_filter_update`, `uploads_filter_delete`, `model_filter_list`, `model_filter_retrieve`, `model_filter_create`, `model_filter_update`, `model_filter_delete`, `plugin_list`, `plugin_retrieve`, `plugin_create`, `plugin_update`, `plugin_delete` |

The records router includes a `record_url` action for building the editor URL of a specific record.

### Router Handler Reference

All handlers require an `apiToken` parameter and also accept an optional
`environment` parameter to specify which DatoCMS environment to operate on.
For brevity, these base parameters are omitted from the tables below unless no
other parameters are present for a given handler.

#### RecordsRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `query` | `apiToken`, `environment`, filter options like `ids`, `modelId`, `fields`, `page` | List of matching records |
| `get` | `apiToken`, `itemId`, optional `version` and locale flags | Single record |
| `references` | `apiToken`, `itemId` | Array of referencing records or IDs |
| `record_url` | `projectUrl`, `itemTypeId`, `itemId`, `environment` | Editor URL string |
| `create` | `apiToken`, `itemType`, `data`, optional `meta` | Newly created record |
| `update` | `apiToken`, `itemId`, `data`, optional `version` | Updated record |
| `duplicate` | `apiToken`, `itemId` | Duplicated record |
| `destroy` | `apiToken`, `itemId` | Confirmation message |
| `bulk_destroy` | `apiToken`, `itemIds[]` | Confirmation message |
| `publish` | `apiToken`, `itemId`, locale options | Publication result |
| `bulk_publish` | `apiToken`, `itemIds[]`, locale options | Bulk publication result |
| `unpublish` | `apiToken`, `itemId` | Unpublish result |
| `bulk_unpublish` | `apiToken`, `itemIds[]` | Bulk unpublish result |
| `schedule_publication` | `apiToken`, `itemId`, `publication_scheduled_at` | Scheduled publication result |
| `cancel_scheduled_publication` | `apiToken`, `itemId` | Cancellation result |
| `schedule_unpublication` | `apiToken`, `itemId`, `unpublishing_scheduled_at` | Scheduled unpublication result |
| `cancel_scheduled_unpublication` | `apiToken`, `itemId` | Cancellation result |
| `versions_list` | `apiToken`, `itemId` | List of versions |
| `version_get` | `apiToken`, `itemId`, `versionId` | Specific version data |
| `version_restore` | `apiToken`, `itemId`, `versionId` | Restore result |

#### SchemaRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `create_item_type` | `apiToken`, name and settings for the item type | Created item type |
| `duplicate_item_type` | `apiToken`, `itemTypeId` | Duplicated item type |
| `get_item_type` | `apiToken`, `itemTypeId` | Item type details |
| `list_item_types` | `apiToken` | All item types |
| `update_item_type` | `apiToken`, `itemTypeId`, updated settings | Updated item type |
| `delete_item_type` | `apiToken`, `itemTypeId` | Confirmation message |
| `create_fieldset` | `apiToken`, `itemTypeId`, fieldset data | Created fieldset |
| `get_fieldset` | `apiToken`, `fieldsetId` | Fieldset details |
| `list_fieldsets` | `apiToken`, optional `itemTypeId` | All fieldsets |
| `update_fieldset` | `apiToken`, `fieldsetId`, updates | Updated fieldset |
| `delete_fieldset` | `apiToken`, `fieldsetId` | Confirmation message |
| `create_field` | `apiToken`, `itemTypeId`, field definition | Created field |
| `get_field` | `apiToken`, `fieldId` | Field details |
| `list_fields` | `apiToken`, `itemTypeId` | All fields for a model |
| `update_field` | `apiToken`, `fieldId`, updates | Updated field |
| `delete_field` | `apiToken`, `fieldId` | Confirmation message |
| `get_field_type_info` | `fieldTypeId` | Field type documentation |

#### UploadsRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `get` | `apiToken`, `uploadId` | Upload information |
| `query` | `apiToken`, filter options, pagination | List of uploads |
| `references` | `apiToken`, `uploadId` | Records referencing the upload |
| `create` | `apiToken`, file data or URL | Created upload |
| `update` | `apiToken`, `uploadId`, updates | Updated upload |
| `destroy` | `apiToken`, `uploadId` | Confirmation message |
| `bulk_destroy` | `apiToken`, `uploadIds[]` | Confirmation message |
| `bulk_tag` | `apiToken`, `uploadIds[]`, tags | Updated uploads |
| `bulk_set_collection` | `apiToken`, `uploadIds[]`, collection ID | Updated uploads |
| `list_tags` | `apiToken` | Upload tags |
| `create_tag` | `apiToken`, tag name | Created tag |
| `list_smart_tags` | `apiToken` | Smart tag suggestions |
| `get_collection` | `apiToken`, `collectionId` | Collection details |
| `query_collections` | `apiToken`, filters | List of collections |
| `create_collection` | `apiToken`, name and settings | Created collection |
| `update_collection` | `apiToken`, `collectionId`, updates | Updated collection |
| `delete_collection` | `apiToken`, `collectionId` | Confirmation message |

#### EnvironmentRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `retrieve` | `apiToken`, `environmentId` | Environment details |
| `list` | `apiToken` | All environments |
| `delete` | `apiToken`, `environmentId` | Confirmation message |
| `rename` | `apiToken`, `environmentId`, new name | Updated environment |
| `promote` | `apiToken`, `environmentId` | Promotion result |
| `fork` | `apiToken`, source and target environment names | New environment |
| `maintenance_status` | `apiToken` | Maintenance mode status |
| `maintenance_activate` | `apiToken` | Activation result |
| `maintenance_deactivate` | `apiToken` | Deactivation result |

#### CollaboratorsRolesAndAPITokensRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `invitation_create` | `apiToken`, `email`, `role` | Created invitation |
| `invitation_list` | `apiToken` | List of invitations |
| `invitation_retrieve` | `apiToken`, `invitationId` | Invitation details |
| `invitation_destroy` | `apiToken`, `invitationId` | Confirmation message |
| `invitation_resend` | `apiToken`, `invitationId` | Resent invitation |
| `user_list` | `apiToken` | List of users |
| `user_retrieve` | `apiToken`, `userId` | User details |
| `user_update` | `apiToken`, `userId`, updates | Updated user |
| `user_destroy` | `apiToken`, `userId` | Confirmation message |
| `user_invite` | `apiToken`, `email`, `role_id` | Invitation result |
| `create_role` | `apiToken`, role properties | Created role |
| `list_roles` | `apiToken` | List of roles |
| `retrieve_role` | `apiToken`, `roleId` | Role details |
| `update_role` | `apiToken`, `roleId`, updates | Updated role |
| `destroy_role` | `apiToken`, `roleId` | Confirmation message |
| `duplicate_role` | `apiToken`, `roleId` | Duplicated role |
| `create_token` | `apiToken`, token properties | Created API token |
| `list_tokens` | `apiToken` | List of tokens |
| `retrieve_token` | `apiToken`, `tokenId` | Token details |
| `update_token` | `apiToken`, `tokenId`, updates | Updated token |
| `destroy_token` | `apiToken`, `tokenId` | Confirmation message |
| `rotate_token` | `apiToken`, `tokenId` | Rotated token |

#### WebhookAndBuildTriggerCallsAndDeploysRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `list` (webhooks) | `apiToken` | Array of webhooks |
| `retrieve` (webhooks) | `apiToken`, `webhookId` | Webhook details |
| `create` (webhooks) | `apiToken`, webhook settings | Created webhook |
| `update` (webhooks) | `apiToken`, `webhookId`, updates | Updated webhook |
| `delete` (webhooks) | `apiToken`, `webhookId` | Confirmation message |
| `list` (webhook calls) | `apiToken`, `webhookId` | Webhook call logs |
| `retrieve` (webhook calls) | `apiToken`, `webhookId`, `callId` | Call details |
| `resend` (webhook calls) | `apiToken`, `webhookId`, `callId` | Resent webhook call |
| `list` (build triggers) | `apiToken` | Build trigger list |
| `retrieve` (build triggers) | `apiToken`, `buildTriggerId` | Build trigger details |
| `create` (build triggers) | `apiToken`, settings | Created build trigger |
| `update` (build triggers) | `apiToken`, `buildTriggerId`, updates | Updated build trigger |
| `delete` (build triggers) | `apiToken`, `buildTriggerId` | Confirmation message |
| `trigger` | `apiToken`, `buildTriggerId` | Trigger response |
| `abort` | `apiToken`, `buildTriggerId` | Abort response |
| `abortIndexing` | `apiToken`, `buildTriggerId` | Abort indexing result |
| `reindex` | `apiToken`, `buildTriggerId` | Reindex result |
| `list` (deploy events) | `apiToken`, `buildTriggerId` | Deploy events list |
| `retrieve` (deploy events) | `apiToken`, `buildTriggerId`, `eventId` | Deploy event details |

#### UIRouterTool

| Handler | Parameters | Returns |
|---------|------------|---------|
| `menu_item_list` | `apiToken` | Menu items |
| `menu_item_retrieve` | `apiToken`, `menuItemId` | Menu item details |
| `menu_item_create` | `apiToken`, menu item data | Created menu item |
| `menu_item_update` | `apiToken`, `menuItemId`, updates | Updated menu item |
| `menu_item_delete` | `apiToken`, `menuItemId` | Confirmation message |
| `schema_menu_item_list` | `apiToken` | Schema menu items |
| `schema_menu_item_retrieve` | `apiToken`, `menuItemId` | Schema menu item details |
| `schema_menu_item_create` | `apiToken`, data | Created schema menu item |
| `schema_menu_item_update` | `apiToken`, `menuItemId`, updates | Updated schema menu item |
| `schema_menu_item_delete` | `apiToken`, `menuItemId` | Confirmation message |
| `uploads_filter_list` | `apiToken` | Upload filter list |
| `uploads_filter_retrieve` | `apiToken`, `filterId` | Upload filter details |
| `uploads_filter_create` | `apiToken`, filter data | Created upload filter |
| `uploads_filter_update` | `apiToken`, `filterId`, updates | Updated upload filter |
| `uploads_filter_delete` | `apiToken`, `filterId` | Confirmation message |
| `model_filter_list` | `apiToken` | Model filter list |
| `model_filter_retrieve` | `apiToken`, `filterId` | Model filter details |
| `model_filter_create` | `apiToken`, filter data | Created model filter |
| `model_filter_update` | `apiToken`, `filterId`, updates | Updated model filter |
| `model_filter_delete` | `apiToken`, `filterId` | Confirmation message |
| `plugin_list` | `apiToken` | Plugins list |
| `plugin_retrieve` | `apiToken`, `pluginId` | Plugin details |
| `plugin_create` | `apiToken`, plugin data | Created plugin |
| `plugin_update` | `apiToken`, `pluginId`, updates | Updated plugin |
| `plugin_delete` | `apiToken`, `pluginId` | Confirmation message |

## Current Limitations

Record creation and update can fail when working with complex field types such as structured text or block fields. Role creation and update also fail for complex parameter sets.

| Operation | Limitation |
|-----------|------------|
| Record creation | May fail for complex fields such as structured text or block fields |
| Record update | May fail for complex fields such as structured text or block fields |
| Role creation | Fails for complex parameter sets |
| Role update | Fails for complex parameter sets |

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
5. Rich text fields require a `rich_text_blocks` validator specifying the allowed block item type IDs. The `item_types` array can contain one or more block model IDs
6. Structured text fields require both `structured_text_blocks` and `structured_text_links` validators
7. Slug fields need a `slug_title_field` validator referencing the title field
8. Single block fields use the `single_block_blocks` validator
9. The `required` validator is **not** supported on `gallery`, `links`, or `rich_text` fields

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

## Directory Structure Validation

Run `npm run validate` to verify that all domain folders follow the
expected pattern. The script checks operation directory names and ensures
each operation and its `handlers` folder contain the required `index.ts`.

## License

MIT
