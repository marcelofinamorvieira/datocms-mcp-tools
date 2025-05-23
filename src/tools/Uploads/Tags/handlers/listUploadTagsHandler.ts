import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const listUploadTagsHandler = createListHandler({
  domain: "uploads",
  schemaName: "list_tags",
  schema: uploadsSchemas.list_tags,
  entityName: "Upload Tag",
  listGetter: async (client, args) => {
    const opts: any = {};
    if (args.filter) opts.filter = { query: args.filter };
    return await client.uploadTags.list(opts);
  }
});