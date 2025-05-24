/**
 * @file schemas.ts
 * @description Zod schemas for Locales operations
 */

import { z } from 'zod';
import { baseToolSchema } from '../../utils/sharedSchemas.js';

// Base locale code pattern (e.g., en, en-US, zh-Hans)
const localeCodeSchema = z.string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?(-[A-Za-z]{4})?$/, 
    'Locale code must be in format: xx, xx-XX, or xx-Xxxx (e.g., en, en-US, zh-Hans)')
  .describe('Locale code in ISO format');

// Create locale schema
const createLocaleSchema = baseToolSchema.extend({
  name: z.string().min(1).describe('Human-readable name for the locale (e.g., "English", "Español")'),
  code: localeCodeSchema,
  fallback_locale: z.string().optional().describe('ID of the fallback locale for missing translations'),
});

// Update locale schema
const updateLocaleSchema = baseToolSchema.extend({
  localeId: z.string().describe('The ID of the locale to update'),
  name: z.string().min(1).optional().describe('Human-readable name for the locale'),
  fallback_locale: z.string().nullable().optional().describe('ID of the fallback locale (null to remove)'),
});

// Delete locale schema
const deleteLocaleSchema = baseToolSchema.extend({
  localeId: z.string().describe('The ID of the locale to delete'),
});

// List locales schema
const listLocalesSchema = baseToolSchema;

// Get locale schema
const getLocaleSchema = baseToolSchema.extend({
  localeId: z.string().describe('The ID of the locale to retrieve'),
});

// Reorder locales schema
const reorderLocalesSchema = baseToolSchema.extend({
  localeIds: z.array(z.string())
    .min(1)
    .describe('Array of locale IDs in the desired order'),
});

export const localeSchemas = {
  create: createLocaleSchema,
  update: updateLocaleSchema,
  delete: deleteLocaleSchema,
  list: listLocalesSchema,
  get: getLocaleSchema,
  reorder: reorderLocalesSchema,
};