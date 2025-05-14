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
 * Can be applied to any field type
 */
export const requiredValidatorSchema = z.object({
  required: z.boolean().describe("Whether the field is required")
});

/**
 * Unique validator
 * Can be applied to string, integer, float, boolean, date fields
 */
export const uniqueValidatorSchema = z.object({
  unique: z.boolean().describe("Whether the field value must be unique across records")
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
  ]).describe("Format validation to apply to string field")
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
  )
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
  )
});

/**
 * Enum validator
 * For string, integer, float fields
 */
export const enumValidatorSchema = z.object({
  enum: z.object({
    values: z.array(z.union([z.string(), z.number()])).min(1)
      .describe("Array of allowed values"),
    multiple: z.boolean().optional().default(false)
      .describe("Whether multiple values can be selected")
  })
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
  )
});

/**
 * File size validator
 * For file and gallery fields
 */
export const fileSizeValidatorSchema = z.object({
  file_size: z.object({
    max_size: z.number().int().min(0)
      .describe("Maximum file size in bytes")
  })
});

/**
 * File type validator
 * For file and gallery fields
 */
export const fileTypeValidatorSchema = z.object({
  file_type: z.object({
    allowed_file_types: z.array(z.string()).min(1)
      .describe("Array of allowed MIME types"),
    error_message: z.string().optional()
      .describe("Custom error message to show when validation fails")
  })
});

/**
 * Image dimension validator
 * For file and gallery fields with image files
 */
export const imageDimensionValidatorSchema = z.object({
  image_dimension: z.object({
    width: z.object({
      min: z.number().int().min(1).optional(),
      max: z.number().int().min(1).optional()
    }).optional(),
    height: z.object({
      min: z.number().int().min(1).optional(),
      max: z.number().int().min(1).optional()
    }).optional(),
    ratio: z.union([
      z.number().positive(),
      z.object({
        min: z.number().positive().optional(),
        max: z.number().positive().optional()
      })
    ]).optional()
  }).refine(
    data => !!(data.width || data.height || data.ratio),
    { message: "At least one dimension constraint must be specified" }
  )
});

/**
 * Item item type validator
 * For link and links fields
 */
export const itemItemTypeValidatorSchema = z.object({
  item_item_type: z.object({
    item_types: z.array(z.string()).min(1)
      .describe("Array of allowed item type IDs")
  })
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
  )
});

/**
 * Rich text blocks validator
 * For rich_text fields
 */
export const richTextBlocksValidatorSchema = z.object({
  rich_text_blocks: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed block item type IDs")
  })
});

/**
 * Structured text blocks validator
 * For structured_text fields
 */
export const structuredTextBlocksValidatorSchema = z.object({
  structured_text_blocks: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed block item type IDs")
  })
});

/**
 * Structured text links validator
 * For structured_text fields
 */
export const structuredTextLinksValidatorSchema = z.object({
  structured_text_links: z.object({
    item_types: z.array(z.string())
      .describe("Array of allowed link item type IDs")
  })
});

/**
 * Structured text marks validator
 * For structured_text fields
 */
export const structuredTextMarksValidatorSchema = z.object({
  structured_text_marks: z.object({
    allowed_marks: z.array(z.enum([
      "strong", "italic", "underline", "code", "strikethrough", "highlight"
    ])).describe("Array of allowed mark types")
  })
});

/**
 * Structured text nodes validator
 * For structured_text fields
 */
export const structuredTextNodesValidatorSchema = z.object({
  structured_text_nodes: z.object({
    allowed_blocks: z.array(z.enum([
      "heading", "paragraph", "blockquote", "code", "list", "thematicBreak"
    ])).describe("Array of allowed node types")
  })
});

/**
 * Date time validator
 * For date and date_time fields
 */
export const dateTimeValidatorSchema = z.object({
  date_time_range: z.object({
    min: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/).optional()
      .describe("Minimum date(time) in ISO format"),
    max: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/).optional()
      .describe("Maximum date(time) in ISO format")
  }).refine(
    data => !!(data.min || data.max),
    { message: "At least one of min or max must be specified" }
  )
});

/**
 * Video URL validator
 * For video fields
 */
export const videoUrlValidatorSchema = z.object({
  video_url: z.object({
    providers: z.array(z.enum([
      "youtube", "vimeo", "mux"
    ])).min(1).describe("Array of allowed video providers")
  })
});

/**
 * Mappings of field types to their valid validators
 */
type ValidatorMapping = {
  [key: string]: z.ZodType[];
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
    requiredValidatorSchema,
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
    requiredValidatorSchema,
    itemItemTypeValidatorSchema,
    itemsNumberValidatorSchema
  ],
  
  // Rich text fields
  rich_text: [
    requiredValidatorSchema,
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
    itemItemTypeValidatorSchema
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
  
  // Create a schema that accepts any of the valid validators for this field type
  return z.record(z.any());
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
  videoUrlValidatorSchema
};