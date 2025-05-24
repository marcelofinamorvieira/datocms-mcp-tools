import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

export const createUploadTagHandler = createCreateHandler({
  domain: "uploads",
  schemaName: "create_tag",
  schema: uploadsSchemas.create_tag,
  entityName: "Upload Tag",
  clientAction: async (client, args) => {
    return await client.uploadTags.create({ name: args.name });
  },
  successMessage: (result: SimpleSchemaTypes.UploadTag) => `Successfully created upload tag '${result.name}' with ID ${result.id}`
});