import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

export const listUploadTagsHandler = createListHandler<any, SimpleSchemaTypes.UploadTag>({
  domain: "uploads",
  schemaName: "list_tags",
  schema: uploadsSchemas.list_tags,
  entityName: "Upload Tag",
  clientAction: async (client, args) => {
    const opts: SimpleSchemaTypes.UploadTagInstancesHrefSchema = {};
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
    return await client.uploadTags.list(opts);
  }
});