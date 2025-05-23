import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const queryUploadCollectionsHandler = createListHandler({
  domain: "uploads",
  schemaName: "query_collections",
  schema: uploadsSchemas.query_collections,
  entityName: "Upload Collection",
  listGetter: async (client, args) => {
    const opts = args.ids
      ? { filter: { ids: Array.isArray(args.ids) ? args.ids.join(",") : args.ids } }
      : {};
    return await client.uploadCollections.list(opts);
  }
});