/**
 * Standard error messages for schema validation
 * Provides consistent, helpful error messages for common validation errors
 */

export const errorMessages = {
  // General validation messages
  required: "This field is required and cannot be empty",
  invalidType: (type: string) => `Must be a valid ${type}`,
  minLength: (min: number) => `Must be at least ${min} character${min === 1 ? '' : 's'} long`,
  maxLength: (max: number) => `Must not exceed ${max} character${max === 1 ? '' : 's'}`,
  pattern: (pattern: string) => `Must match pattern: ${pattern}`,
  enum: (values: (string | number)[]) => `Must be one of: ${values.join(', ')}`,
  url: "Must be a valid URL",
  email: "Must be a valid email address",
  uuid: "Must be a valid UUID",

  // Number validation messages
  minValue: (min: number) => `Must be greater than or equal to ${min}`,
  maxValue: (max: number) => `Must be less than or equal to ${max}`,
  integer: "Must be an integer (no decimal places)",
  positive: "Must be a positive number",
  negative: "Must be a negative number",
  nonNegative: "Must be zero or a positive number",

  // Object validation messages
  invalidObject: "Must be a valid object",
  requiredKeys: (keys: string[]) => `Must include required fields: ${keys.join(', ')}`,
  extraKeys: "Contains unrecognized fields",

  // Array validation messages
  invalidArray: "Must be a valid array",
  minItems: (min: number) => `Must contain at least ${min} item${min === 1 ? '' : 's'}`,
  maxItems: (max: number) => `Must contain no more than ${max} item${max === 1 ? '' : 's'}`,
  uniqueItems: "All items must be unique",

  // API key validation messages
  apiKeyFormat: "Must start with a lowercase letter and contain only lowercase letters, numbers, and underscores",
  
  // Date validation messages
  invalidDate: "Must be a valid date in ISO 8601 format (YYYY-MM-DD)",
  invalidDateTime: "Must be a valid datetime in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ)",
  
  // ID validation messages
  invalidId: "Must be a valid identifier",
  
  // Custom field validation messages
  invalidFieldType: "Field type not recognized",
  invalidValidator: (fieldType: string) => `Validator not supported for field type '${fieldType}'`,
  invalidAppearance: (fieldType: string) => `Appearance configuration not valid for field type '${fieldType}'`,
  
  // Action validation messages
  noChangesSpecified: "At least one field to update must be specified",
  
  // Confirmation validation messages
  confirmationRequired: "Confirmation is required for this destructive action",
  
  // Environment validation messages
  invalidEnvironmentId: "Environment ID can only contain lowercase letters, numbers and dashes",
  
  // Relationship validation messages
  circularReference: "Circular reference detected",
  invalidReference: "Reference to non-existent resource",
  
  // API token validation messages
  invalidApiToken: "Invalid API token",
  
  // Boolean conversion messages
  trueValues: "Accepted values for true: true, 1, 'true', 'yes', 'y'",
  falseValues: "Accepted values for false: false, 0, 'false', 'no', 'n'",
  
  // Pagination validation messages
  invalidPagination: "Invalid pagination parameters",
  
  // File validation messages
  maxSize: (size: string) => `File size must not exceed ${size}`,
  invalidFileType: (types: string[]) => `File type must be one of: ${types.join(', ')}`,
  
  // Image validation messages
  minWidth: (width: number) => `Image width must be at least ${width}px`,
  maxWidth: (width: number) => `Image width must not exceed ${width}px`,
  minHeight: (height: number) => `Image height must be at least ${height}px`,
  maxHeight: (height: number) => `Image height must not exceed ${height}px`,
  aspectRatio: (ratio: string) => `Image must have aspect ratio ${ratio}`
};

export default errorMessages;