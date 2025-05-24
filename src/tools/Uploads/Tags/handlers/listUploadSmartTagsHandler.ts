import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

export const listUploadSmartTagsHandler = createListHandler<any, SimpleSchemaTypes.UploadSmartTag>({
  domain: "uploads",
  schemaName: "list_smart_tags",
  schema: uploadsSchemas.list_smart_tags,
  entityName: "Upload Smart Tag",
  clientAction: async (client, args) => {
    const opts: any = {};
    
    // Add tag filter if provided
    if (args.filter) {
      opts.filter = {
        fields: {
          tag: {
            matches: {
              pattern: args.filter,
              case_sensitive: false
            }
          }
        }
      };
    }
    
    // Add pagination if provided
    if (args.page) {
      opts.page = args.page;
    }
    
    return await client.uploadSmartTags.list(opts);
  }
});