import { z } from "zod";

/**
 * Field validator schemas for DatoCMS fields
 * 
 * These schemas provide specific validation for different field types in DatoCMS
 * and their associated validator configurations.
 * 
 * @see https://www.datocms.com/docs/content-management-api/resources/field
 */

/**
 * Required validator
 * Can be applied to many but not all field types (for example, not compatible with rich_text)
 */
export const requiredValidatorSchema = z.object({
  required: z.object({}).describe("Required field validator. Not compatible with all field types (e.g., not compatible with rich_text).")
});

/**
 * Unique validator
 * Can be applied to string, integer, float, boolean, date fields
 */
export const uniqueValidatorSchema = z.object({
  unique: z.object({}).describe("Whether the field value must be unique across records.")
});

/**
 * Format validator
 * For string fields
 */
export const formatValidatorSchema = z.object({
  format: z.enum([
    "email",
    "url",
    "slug",
    "code"
  ]).describe("Format validation to apply to string field. Example: \"email\"")
});

/**
 * Length validator
 * For string and text fields
 */
export const lengthValidatorSchema = z.object({
  length: z.object({
    min: z.number().int().min(0).optional().describe("Minimum length"),
    max: z.number().int().min(1).optional().describe("Maximum length"),
    exact: z.number().int().min(0).optional().describe("Exact length required")
  }).refine(
    data => !!(data.min || data.max || data.exact),
    { message: "At least one of min, max, or exact must be specified" }
  ).describe("Length validation for text fields. Example: { \"min\": 3, \"max\": 100 }")
});

/**
 * Number range validator
 * For integer and float fields
 */
export const numberRangeValidatorSchema = z.object({
  range: z.object({
    min: z.number().optional().describe("Minimum value"),
    max: z.number().optional().describe("Maximum value")
  }).refine(
    data => !!(data.min || data.max),
    { message: "At least one of min or max must be specified" }
  ).describe("Range validation for number fields. Example: { \"min\": 0, \"max\": 100 }")
});

/**
 * Enum validator
 * For string, integer, float fields
 */
export const enumValidatorSchema = z.object({
  enum: z.object({
    values: z.array(z.union([z.string(), z.number()])).min(1)
      .describe("Array of allowed values. Example: [\"option1\", \"option2\"]"),
    multiple: z.boolean().optional().default(false)
      .describe("Whether multiple values can be selected")
  }).describe("Enumeration validator to limit field to specific values.")
});

/**
 * Pattern validator
 * For string fields
 */
export const patternValidatorSchema = z.object({
  pattern: z.object({
    predefined: z.enum(["email", "url", "customPattern"]).optional()
      .describe("Predefined pattern to use"),
    regex: z.string().optional()
      .describe("Custom regex pattern (used when predefined is 'customPattern')"),
    error_message: z.string().optional()
      .describe("Custom error message to show when validation fails")
  }).refine(
    data => data.predefined !== "customPattern" || !!data.regex,
    { message: "When using customPattern, regex must be provided" }
  ).describe("Pattern validator for applying regex or predefined patterns.")
});

/**
 * File size validator
 * For file and gallery fields
 */
export const fileSizeValidatorSchema = z.object({
  file_size: z.object({
    max_size: z.number().int().min(0)
      .describe("Maximum file size in bytes. Example: 1000000 (1MB)")
  }).describe("File size validator to limit uploaded file sizes.")
});

/**
 * File type validator
 * For file and gallery fields
 */
export const fileTypeValidatorSchema = z.object({
  file_type: z.object({
    allowed_file_types: z.array(z.string()).min(1)
      .describe("Array of allowed MIME types. Example: [\"image/jpeg\", \"image/png\"]"),
    error_message: z.string().optional()
      .describe("Custom error message to show when validation fails")
  }).describe("File type validator to restrict uploads to specific formats.")
});

/**
 * Image dimension validator
 * For file and gallery fields with image files
 */
export const imageDimensionValidatorSchema = z.object({
  image_dimension: z.object({
    width: z.object({
      min: z.number().int().min(1).optional().describe("Minimum width in pixels"),
      max: z.number().int().min(1).optional().describe("Maximum width in pixels")
    }).optional().describe("Width constraints"),
    height: z.object({
      min: z.number().int().min(1).optional().describe("Minimum height in pixels"),
      max: z.number().int().min(1).optional().describe("Maximum height in pixels")
    }).optional().describe("Height constraints"),
    ratio: z.union([
      z.number().positive().describe("Exact aspect ratio (width/height)"),
      z.object({
        min: z.number().positive().optional().describe("Minimum aspect ratio"),
        max: z.number().positive().optional().describe("Maximum aspect ratio")
      }).describe("Aspect ratio range")
    ]).optional().describe("Aspect ratio constraints")
  }).refine(
    data => !!(data.width || data.height || data.ratio),
    { message: "At least one dimension constraint must be specified" }
  ).describe("Image dimension validator to ensure proper image sizes and proportions.")
});

/**
 * Item item type validator
 * For link and links fields
 */
export const itemItemTypeValidatorSchema = z.object({
  item_item_type: z.object({
    item_types: z.array(z.string()).min(1)
      .describe("Array of allowed item type IDs. Example: [\"blog_post\", \"page\"]")
  }).describe("Item type validator to restrict which record types can be linked.")
});

/**
 * Items number validator
 * For gallery and links fields
 */
export const itemsNumberValidatorSchema = z.object({
  items_number: z.object({
    min: z.number().int().min(0).optional()
      .describe("Minimum number of items"),
    max: z.number().int().min(1).optional()
      .describe("Maximum number of items"),
    exact: z.number().int().min(0).optional()
      .describe("Exact number of items required")
  }).refine(
    data => !!(data.min || data.max || data.exact),
    { message: "At least one of min, max, or exact must be specified" }
  ).describe("Items number validator to control how many items can be selected.")
});

/**
 * Single block blocks validator
 * For single_block fields - REQUIRED for single_block fields
 */
export const singleBlockBlocksValidatorSchema = z.object({
  single_block_blocks: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed block model IDs. Can be empty array: []")
  }).describe(
    "REQUIRED validator for single_block fields. Example: { \"item_types\": [] }"
  )
});

/**
 * Rich text blocks validator
 * For rich_text fields - REQUIRED for rich_text fields
 */
export const richTextBlocksValidatorSchema = z.object({
  rich_text_blocks: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed block item type IDs (one or more).")
  }).describe("REQUIRED validator for rich_text fields. Example: { \"item_types\": [\"block_model_id1\", \"block_model_id2\"] }")
});

/**
 * Structured text blocks validator
 * For structured_text fields - REQUIRED for structured_text fields
 */
export const structuredTextBlocksValidatorSchema = z.object({
  structured_text_blocks: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed block item type IDs. Can be empty array: []")
  }).describe("REQUIRED validator for structured_text fields. Example: { \"item_types\": [] }")
});

/**
 * Structured text links validator
 * For structured_text fields
 */
export const structuredTextLinksValidatorSchema = z.object({
  structured_text_links: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed link item type IDs. Example: [\"blog_post\", \"page\"]")
  }).describe("Structured text links validator to restrict which record types can be linked.")
});

/**
 * Structured text marks validator
 * For structured_text fields
 */
export const structuredTextMarksValidatorSchema = z.object({
  structured_text_marks: z.object({
    allowed_marks: z.array(z.enum([
      "strong", "italic", "underline", "code", "strikethrough", "highlight"
    ])).describe("Array of allowed mark types. Example: [\"strong\", \"italic\"]")
  }).describe("Structured text marks validator to control text formatting options.")
});

/**
 * Structured text nodes validator
 * For structured_text fields
 */
export const structuredTextNodesValidatorSchema = z.object({
  structured_text_nodes: z.object({
    allowed_blocks: z.array(z.enum([
      "heading", "paragraph", "blockquote", "code", "list", "thematicBreak"
    ])).describe("Array of allowed node types. Example: [\"heading\", \"paragraph\"]")
  }).describe("Structured text nodes validator to control block types.")
});

/**
 * Date time validator
 * For date and date_time fields
 */
export const dateTimeValidatorSchema = z.object({
  date_time_range: z.object({
    min: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/).optional()
      .describe("Minimum date(time) in ISO format. Example: \"2023-01-01\""),
    max: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/).optional()
      .describe("Maximum date(time) in ISO format. Example: \"2023-12-31\"")
  }).refine(
    data => !!(data.min || data.max),
    { message: "At least one of min or max must be specified" }
  ).describe("Date/time range validator to set allowed date boundaries.")
});

/**
 * Video URL validator
 * For video fields
 */
export const videoUrlValidatorSchema = z.object({
  video_url: z.object({
    providers: z.array(z.enum([
      "youtube", "vimeo", "mux"
    ])).min(1).describe("Array of allowed video providers. Example: [\"youtube\", \"vimeo\"]")
  }).describe("Video URL validator to restrict which video services can be embedded.")
});

/**
 * Mappings of field types to their valid validators
 */
type ValidatorMapping = {
  [key: string]: z.ZodType[];
};

/**
 * Map of required validators for specific field types
 */
const requiredValidatorsMap: Record<string, string[]> = {
  rich_text: ['rich_text_blocks'],
  structured_text: ['structured_text_blocks'],
  link: ['item_item_type'],
  links: ['items_item_type'],
  single_block: ['single_block_blocks'],
  video: ['video_url']
};

/**
 * Map of field types to their valid validators
 */
const validatorsMap: ValidatorMapping = {
  // Base validators for all field types
  '*': [requiredValidatorSchema],

  // Text-based fields
  string: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    formatValidatorSchema,
    lengthValidatorSchema,
    enumValidatorSchema,
    patternValidatorSchema
  ],
  text: [
    requiredValidatorSchema,
    lengthValidatorSchema
  ],
  
  // Numeric fields
  integer: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    numberRangeValidatorSchema,
    enumValidatorSchema
  ],
  float: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    numberRangeValidatorSchema,
    enumValidatorSchema
  ],
  
  // Boolean fields
  boolean: [
    requiredValidatorSchema,
    uniqueValidatorSchema
  ],
  
  // Date fields
  date: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    dateTimeValidatorSchema
  ],
  date_time: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    dateTimeValidatorSchema
  ],
  
  // Media fields
  file: [
    requiredValidatorSchema,
    fileSizeValidatorSchema,
    fileTypeValidatorSchema,
    imageDimensionValidatorSchema
  ],
  gallery: [
    fileSizeValidatorSchema,
    fileTypeValidatorSchema,
    imageDimensionValidatorSchema,
    itemsNumberValidatorSchema
  ],
  
  // Reference fields
  link: [
    requiredValidatorSchema,
    itemItemTypeValidatorSchema
  ],
  links: [
    itemItemTypeValidatorSchema,
    itemsNumberValidatorSchema
  ],
  
  // Rich text fields
  rich_text: [
    richTextBlocksValidatorSchema
  ],
  structured_text: [
    requiredValidatorSchema,
    structuredTextBlocksValidatorSchema,
    structuredTextLinksValidatorSchema,
    structuredTextMarksValidatorSchema,
    structuredTextNodesValidatorSchema
  ],
  
  // Other specialized fields
  slug: [
    requiredValidatorSchema,
    uniqueValidatorSchema,
    lengthValidatorSchema
  ],
  color: [
    requiredValidatorSchema
  ],
  json: [
    requiredValidatorSchema
  ],
  lat_lon: [
    requiredValidatorSchema
  ],
  seo: [
    requiredValidatorSchema
  ],
  single_block: [
    requiredValidatorSchema,
    singleBlockBlocksValidatorSchema
  ],
  video: [
    requiredValidatorSchema,
    videoUrlValidatorSchema
  ]
};

/**
 * Creates a complete validators schema based on field type
 */
export function createValidatorsSchema(fieldType: string) {
  // Get validators for this field type, falling back to base validators
  const fieldValidators = validatorsMap[fieldType] || validatorsMap['*'] || [];
  
  // Create a schema with more descriptive information including required validators
  const requiredValidator = requiredValidatorsMap[fieldType] 
    ? `Required validators: ${requiredValidatorsMap[fieldType].join(', ')}` 
    : 'No specific validators required';
  
  const description = `Validators for ${fieldType} fields. ${requiredValidator}. Each field type has specific valid validators. Example: ${getExampleValidator(fieldType)}`;
  
  return z.record(z.any()).describe(description);
}

/**
 * Gets a simple example for a field type's validators
 */
function getExampleValidator(fieldType: string): string {
  switch (fieldType) {
    case 'string':
      return '{ "required": {} }';
    case 'text':
      return '{ "required": {}, "length": { "max": 1000 } }';
    case 'rich_text':
      return '{ "rich_text_blocks": { "item_types": ["block_model_id1", "block_model_id2"] } }';
    case 'link':
      return '{ "required": {}, "item_item_type": { "item_types": ["blog_post"] } }';
    case 'file':
      return '{ "required": {}, "file_size": { "max_size": 1000000 } }';
    default:
      return '{ "required": {} }';
  }
}

export default {
  createValidatorsSchema,
  // Export individual validators for direct use
  requiredValidatorSchema,
  uniqueValidatorSchema,
  formatValidatorSchema,
  lengthValidatorSchema,
  numberRangeValidatorSchema,
  enumValidatorSchema,
  patternValidatorSchema,
  fileSizeValidatorSchema,
  fileTypeValidatorSchema,
  imageDimensionValidatorSchema,
  itemItemTypeValidatorSchema,
  itemsNumberValidatorSchema,
  richTextBlocksValidatorSchema,
  structuredTextBlocksValidatorSchema,
  structuredTextLinksValidatorSchema,
  structuredTextMarksValidatorSchema,
  structuredTextNodesValidatorSchema,
  dateTimeValidatorSchema,
  videoUrlValidatorSchema,
  singleBlockBlocksValidatorSchema
};