import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const listUploadSmartTagsHandler = createListHandler({
  domain: "uploads",
  schemaName: "list_smart_tags",
  schema: uploadsSchemas.list_smart_tags,
  entityName: "Upload Smart Tag",
  clientAction: async (client, args) => {
    const opts: any = {};
    if (args.filter) opts.filter = args.filter;
    if (args.page) opts.page = args.page;
    return await client.uploadSmartTags.list(opts);
  }
});