# Directory Structure Standards

This document outlines the standard directory structure for the DatoCMS MCP server codebase to ensure consistency across all domains.

## Core Principles

1. **Consistency** - All domains should follow the same structural pattern
2. **Clarity** - Directory and file names should clearly communicate purpose
3. **DRY (Don't Repeat Yourself)** - Common patterns should be standardized
4. **Operation-centric** - Organize by operation type, then by entity

## Standard Directory Structure

```
src/
├── tools/
│   ├── <Domain>/                                 # Domain name in PascalCase (e.g., Records)
│   │   ├── <Operation>/                          # Operation name in PascalCase (e.g., Create, Read)
│   │   │   ├── handlers/                         # All handlers for this operation
│   │   │   │   ├── <action><Entity>Handler.ts    # Handler files: verb + entity
│   │   │   │   ├── ...                           # Additional handlers
│   │   │   │   └── index.ts                      # Exports all handlers
│   │   │   └── index.ts                          # Operation exports
│   │   ├── <Domain>RouterTool.ts                 # Router for this domain
│   │   ├── <domain>Client.ts                     # Domain client (camelCase)
│   │   ├── <domain>Types.ts                      # Domain type definitions (camelCase)
│   │   ├── schemas.ts                            # All schemas for this domain
│   │   └── index.ts                              # Domain exports
│   └── index.ts                                  # Tools exports
└── utils/                                        # Shared utilities
    └── ...
```

## Standard Operation Directories

Domains should use these standard operation directory names:

- **Create** - Creating new resources (e.g., createRecord, createUpload)
- **Read** - Reading or retrieving resources (e.g., getRecord, listRecords)
- **Update** - Updating existing resources (e.g., updateRecord, updateField)
- **Delete** - Deleting resources (e.g., destroyRecord, deleteField)

For specialized operations that don't fit the CRUD pattern:

- Use descriptive, action-oriented names in PascalCase
- Examples: **Publication**, **Import**, **Export**, **Duplicate**

## Standard File Naming

### Handler Files

Handler files should follow this pattern:
- `<verb><Entity>Handler.ts` - e.g., `createRecordHandler.ts`, `getRecordByIdHandler.ts`

Use consistent verbs:
- **create** - For creation operations
- **get** - For single resource retrieval
- **list** - For retrieving multiple resources
- **update** - For updating resources
- **destroy** / **delete** - For deletion operations

### Router Files

Router files should follow this pattern:
- `<Domain>RouterTool.ts` - e.g., `RecordsRouterTool.ts`

### Client Files

Client files should follow this pattern:
- `<domain>Client.ts` - e.g., `recordsClient.ts` (camelCase)

### Type Definition Files

Type definition files should follow this pattern:
- `<domain>Types.ts` - e.g., `recordsTypes.ts` (camelCase)

## Implementation Steps

1. First, fix the Environments domain which has the most inconsistencies:
   - Merge `Maintenence Mode` into `Maintenance`
   - Standardize folder names (List → Read, Retrieve → Read, etc.)
   - Move direct implementation files to handler pattern

2. Then standardize Records and Schema domains:
   - Ensure consistent handler file naming
   - Move any direct implementation to handler pattern
   - Standardize index.ts exports

3. Finally address remaining domains:
   - Ensure all follow the same pattern
   - Fix any remaining inconsistencies

## Exceptions

Some specialized tools may require slight deviations from this pattern. Any exceptions must be documented explicitly with reasoning in the relevant README files.

## Migration Strategy

This is a gradual migration. Follow these steps:

1. Create new standardized structure
2. Migrate files with minimal changes
3. Update imports to point to new locations
4. Deprecate old file locations
5. Remove deprecated files once all references are updated

## Directory Structure Validation

A validation script will be created to ensure all domains follow this structure. The script will:
- Check for proper directory naming
- Verify presence of required index.ts files
- Validate router and type definition file naming