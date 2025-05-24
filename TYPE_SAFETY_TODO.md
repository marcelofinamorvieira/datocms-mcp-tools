# Type Safety Improvement TODO List

## 🏗️ Phase 1: Foundation Setup ✅ COMPLETED

### Infrastructure Creation
- [x] Create `src/types/index.ts` with DatoCMS type exports
- [x] Create `src/types/zod-helpers.ts` with type inference utilities
- [x] Create `src/types/guards.ts` for common type guard functions
- [x] Create `src/types/client.ts` with properly typed client wrapper
- [x] Update `tsconfig.json` to enable strict mode
- [x] Add `type-check` npm script to package.json

### Documentation
- [ ] Create `docs/TYPE_PATTERNS.md` with usage examples
- [ ] Document DatoCMS type import patterns
- [ ] Document Zod to TypeScript conversion patterns
- [ ] Create type migration checklist template

### Type Mapping
- [ ] Create `src/types/responseTypes.ts` with domain-to-type mapping
- [ ] Map all domains to their SimpleSchemaTypes equivalents
- [ ] Define collection response interfaces
- [ ] Define error response types

## 🔧 Phase 2: Core System Updates ✅ PARTIALLY COMPLETED

### Enhanced Handler Factory
- [x] Replace `DatoCMSClient = any` with proper Client type (REVISED: Kept as `any` due to multiple client types)
- [x] Add generic constraints to handler creation functions
- [x] Type the middleware chain properly
- [x] Update `ClientActionFn` with proper generics
- [x] Fix parameter extraction (remove `as any` casts)
- [x] Add return type inference

**Note**: Due to the existence of three different client types (Client, TypedRecordsClient, CollaboratorsClient), 
we decided to keep `DatoCMSClient` as `any` but require handlers to cast to their specific client type. 
This is a pragmatic decision that balances type safety with implementation complexity.

### Client Managers ✅ COMPLETED
- [x] Fix `typedClient.ts` - remove `private client: any`
- [x] Type all client manager methods
- [x] Add proper return types to all methods
- [x] Create type-safe wrappers for common operations

### Additional Phase 2 Work Completed
- [x] Fixed collaboratorsClient.ts adapter functions (changed from `any` to `RawAPIResponse`)
- [x] Created comprehensive migration examples for handlers
- [x] Documented key patterns for handler migration

### Utility Functions
- [ ] Type all parameters in `errorHandlers.ts`
- [ ] Fix response handler types
- [ ] Type debug utility functions
- [ ] Update pagination utilities with proper types

## 📝 Phase 3: Handler Migration

### Records Domain
- [ ] `createRecordHandler.ts` - Remove any types, add SimpleSchemaTypes.Item
- [ ] `updateRecordHandler.ts` - Type update payload properly
- [ ] `queryRecordsHandler.ts` - Type filter conditions
- [ ] `enhancedQueryRecordsHandler.ts` - Complex query typing
- [ ] `bulkDestroyRecordsHandler.ts` - Type bulk operations
- [ ] `duplicateRecordHandler.ts` - Type duplication logic
- [ ] All publication handlers - Type scheduling parameters
- [ ] Version handlers - Type version responses

### Schema Domain
- [ ] `createFieldHandler.ts` - Fix validator type assertions
- [ ] `updateFieldHandler.ts` - Type appearance parameters
- [ ] `createItemTypeHandler.ts` - Remove any casts
- [ ] `listItemTypesHandler.ts` - Type collection responses
- [ ] All fieldset handlers - Add proper types
- [ ] Field template files - Type all templates

### Uploads Domain
- [ ] `createUploadHandler.ts` - Type file upload parameters
- [ ] `queryUploadsHandler.ts` - Type query filters
- [ ] `bulkTagUploadsHandler.ts` - Type bulk operations
- [ ] Upload collection handlers - Add proper types
- [ ] Smart tag handlers - Type AI-generated tags

### Collaborators Domain
- [ ] Fix adapter functions accepting `rawData: any`
- [ ] Type all role permission objects
- [ ] Type invitation responses
- [ ] Fix API token handlers

### UI Domain
- [ ] Menu item handlers - Type positioning
- [ ] Plugin handlers - Type configuration objects
- [ ] Filter handlers - Type filter conditions
- [ ] Schema menu handlers - Type hierarchy

### Other Domains
- [ ] Environment handlers - Type fork/promote operations
- [ ] Webhook handlers - Type event payloads
- [ ] Build trigger handlers - Type trigger conditions
- [ ] Project handlers - Type settings objects

## 🔗 Phase 4: Schema Alignment

### Zod Schema Updates
- [ ] Add `satisfies` checks to all Zod schemas
- [ ] Ensure schemas match DatoCMS types
- [ ] Export inferred types from all schemas
- [ ] Create schema validation tests
- [ ] Document any schema deviations

### Schema Registry
- [ ] Type the schema registry properly
- [ ] Add compile-time schema validation
- [ ] Create schema type exports
- [ ] Add schema compatibility checks

## 🚀 Phase 5: Advanced Features

### Router Tools
- [ ] `RecordsRouterTool.ts` - Add operation type map
- [ ] `SchemaRouterTool.ts` - Remove any from execute
- [ ] `UploadsRouterTool.ts` - Type all operations
- [ ] `CollaboratorsRouterTool.ts` - Fix method signatures
- [ ] All other routers - Add proper generics

### Type Utilities
- [ ] Create relationship type helpers
- [ ] Add nullable field utilities
- [ ] Create type-safe query builders
- [ ] Add response transformation types

### Testing
- [ ] Add type tests for critical paths
- [ ] Create type regression tests
- [ ] Add compilation tests
- [ ] Test IDE autocomplete

## 📋 Phase 6: Cleanup & Documentation

### Final Cleanup
- [ ] Remove all TODO comments about types
- [ ] Ensure no `any` remains (audit with ESLint)
- [ ] Update all imports to use proper types
- [ ] Remove redundant type assertions

### Documentation Updates
- [ ] Update CLAUDE.md with type safety guidelines
- [ ] Add type examples to handler creation guide
- [ ] Document common type patterns
- [ ] Create troubleshooting guide

### Tooling
- [ ] Configure ESLint no-explicit-any rule
- [ ] Add pre-commit type checking
- [ ] Create type coverage report
- [ ] Set up continuous type checking in CI

## 🎯 Quick Wins (Can do anytime)

- [ ] Replace obvious `any` types with `unknown`
- [ ] Add return types to all exported functions
- [ ] Fix simple type assertions (e.g., `as any` to proper types)
- [ ] Import missing types from DatoCMS client
- [ ] Add TODO comments for complex type fixes

## 📊 Progress Tracking

### Metrics to Track
- [ ] Number of `any` types remaining
- [ ] TypeScript error count
- [ ] Type coverage percentage
- [ ] Build time impact
- [ ] IDE performance

### Weekly Goals
- **Week 1**: Complete Phase 1 (Foundation)
- **Week 2**: Complete Phase 2 (Core Updates)
- **Week 3-4**: Complete 50% of handlers
- **Week 5**: Complete remaining handlers + Phase 4
- **Week 6**: Advanced features + cleanup

## ⚠️ Blockers & Dependencies

### Known Blockers
- [ ] Need to understand DatoCMS response formats fully
- [ ] Some validators have dynamic structures
- [ ] Middleware typing is complex
- [ ] Some operations return varying types

### Dependencies
- [ ] Latest @datocms/cma-client-node version
- [ ] TypeScript 5.x for better inference
- [ ] Proper test environment setup
- [ ] Team agreement on type conventions

## 🔍 Type Safety Validation

### For Each Completed Task
1. Run `npm run type-check`
2. Verify no new `any` types introduced
3. Test in IDE for autocomplete
4. Check runtime behavior unchanged
5. Update documentation if needed

Remember: Each TODO item should result in ZERO new `any` types!