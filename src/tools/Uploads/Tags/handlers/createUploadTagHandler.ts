import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const createUploadTagHandler = createCreateHandler({
  domain: "uploads",
  schemaName: "create_tag",
  schema: uploadsSchemas.create_tag,
  entityName: "Upload Tag",
  clientAction: async (client, args) => {
    return await client.uploadTags.create({ name: args.name });
  },
  successMessage: (result: any) => `Successfully created upload tag '${result.name}' with ID ${result.id}`
});