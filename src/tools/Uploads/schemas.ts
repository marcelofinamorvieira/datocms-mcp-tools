import { z } from "zod";
import { baseToolSchema } from "../../utils/sharedSchemas.js";

/**
 * Zod schemas for every uploads-related action.
 *
 * Key design decisions
 * ────────────────────
 * • All mandatory strings are checked with `.min(1)` to forbid empty values.
 * • Enumerations are used wherever the API admits a finite set of literals.
 * • `.describe()` is filled with human-readable help based on the official
 *   DatoCMS CMA documentation (Uploads, Upload Collections, Tags, Smart Tags).
 * • Helper factories keep the schemas DRY.
 * • All schemas extend baseToolSchema to support debug parameter.
 */

const uploadId = z
  .string()
  .min(1)
  .describe("Unique Upload ID (Base-64 URL-safe string).");

const collectionId = z
  .string()
  .min(1)
  .describe("Upload Collection ID.");

const page = z
  .object({
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Zero-based index of the first result (default 0)."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("Maximum number of results to return (default 30, max 500)."),
  })
  .describe("Pagination parameters.");

export const uploadsSchemas = {
  /* ─────────────────────────────── READ ──────────────────────────────── */
  get: baseToolSchema.extend({
      uploadId: uploadId,
    }),

  query: baseToolSchema.extend({
      ids: z
        .union([
          z
            .string()
            .describe(
              'Comma-separated Upload IDs, e.g. "abc123,def456".',
            ),
          z.array(uploadId).nonempty(),
        ])
        .optional(),
      query: z
        .string()
        .min(1)
        .optional()
        .describe(
          "Free-text search within filename/metadata (case-insensitive).",
        ),
      fields: z
        .record(z.record(z.unknown()))
        .optional()
        .describe(
          "Advanced field filters (same structure as GraphQL filters).",
        ),
      locale: z
        .string()
        .length(2)
        .optional()
        .describe(
          "Locale code used for `query`/`fields` (defaults to primary).",
        ),
      order_by: z
        .string()
        .regex(/^[a-z0-9_]+_(ASC|DESC)$/i, {
          message: "Use `<field>_ASC` or `<field>_DESC`.",
        })
        .optional()
        .describe("Sorting clause."),
      page: page.optional(),
      returnOnlyIds: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "If true, return only an array of IDs instead of full objects.",
        ),
    }),

  references: baseToolSchema.extend({
      uploadId: uploadId,
      nested: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "When true, includes nested records for Modular/Structured Text links.",
        ),
      version: z
        .enum(["current", "published", "published-or-current"])
        .optional()
        .default("current")
        .describe(
          "Record version visibility to inspect: current, published, or both.",
        ),
      returnOnlyIds: z
        .boolean()
        .optional()
        .default(false)
        .describe("Return only IDs instead of full records."),
    }),

  /* ─────────────────────────────── CREATE ─────────────────────────────── */
  create: baseToolSchema.extend({
      url: z
        .string()
        .url()
        .optional()
        .describe("Remote URL of the file to import."),
      path: z
        .string()
        .optional()
        .describe("Local file path to upload."),
      id: z.string().optional().describe("Override ID for the new upload."),
      filename: z
        .string()
        .optional()
        .describe("Override filename inferred from `url`/`path`."),
      skipCreationIfAlreadyExists: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "If true, resolves with an existing identical upload instead of duplicating it.",
        ),
      author: z.string().nullable().optional().describe("Author metadata."),
      copyright: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      tags: z
        .array(z.string())
        .optional()
        .describe("Manual tags to attach on creation."),
      default_field_metadata: z
        .record(
          z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
          z.record(z.unknown()),
        )
        .optional()
        .describe(
          "Default field metadata keyed by locale (title, alt, custom_data...).",
        ),
      upload_collection: z
        .object({
          type: z.literal("upload_collection"),
          id: collectionId,
        })
        .nullable()
        .optional()
        .describe("Assign the upload to a collection."),
    })
    .refine((v) => v.url || v.path, {
      message: "Either `url` or `path` must be provided.",
    }),

  /* ─────────────────────────────── UPDATE ─────────────────────────────── */
  update: baseToolSchema.extend({
      uploadId: uploadId,
      path: z
        .string()
        .optional()
        .describe("Local path to a replacement file."),
      basename: z
        .string()
        .optional()
        .describe("Rename basename (filename without extension)."),
      copyright: z.string().nullable().optional(),
      author: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      tags: z.array(z.string()).optional().describe("Replace manual tags."),
      default_field_metadata: z
        .record(z.unknown())
        .optional()
        .describe("Replace default field metadata object."),
      upload_collection: z
        .object({
          type: z.literal("upload_collection"),
          id: collectionId,
        })
        .nullable()
        .optional(),
    }),

  /* ─────────────────────────────── DELETE ─────────────────────────────── */
  destroy: baseToolSchema.extend({
      uploadId: uploadId,
      returnOnlyConfirmation: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "If true, returns only a confirmation string, not the deleted object.",
        ),
    }),

  bulk_destroy: baseToolSchema.extend({
      uploadIds: z
        .array(uploadId)
        .min(1)
        .max(200)
        .describe("IDs to delete (max 200)."),
    }),

  /* ─────────────────────────────── BULK OPS ───────────────────────────── */
  bulk_tag: baseToolSchema.extend({
      uploadIds: z.array(uploadId).min(1),
      tags: z.array(z.string()).min(1).describe("Tag names to add."),
    }),

  bulk_set_collection: baseToolSchema.extend({
      uploadIds: z.array(uploadId).min(1),
      collectionId: collectionId
        .nullable()
        .describe("Destination collection ID, or null to remove from any."),
    }),

  /* ─────────────────────────────── TAGS ───────────────────────────────── */
  list_tags: baseToolSchema.extend({
      filter: z
        .string()
        .optional()
        .describe("Substring to match tag names (case-insensitive)."),
    }),

  create_tag: baseToolSchema.extend({
      name: z.string().min(1).describe("New manual tag name."),
    }),

  list_smart_tags: baseToolSchema.extend({
      filter: z.object({ query: z.string().optional() }).optional(),
      page: page.optional(),
    }),

  /* ─────────────────────── UPLOAD COLLECTIONS ─────────────────────────── */
  get_collection: baseToolSchema.extend({
      uploadCollectionId: collectionId,
    }),

  query_collections: baseToolSchema.extend({
      ids: z.union([collectionId, z.array(collectionId).nonempty()]).optional(),
    }),

  create_collection: baseToolSchema.extend({
      label: z.string().min(1).describe("Collection label."),
      id: collectionId.optional(),
      position: z.number().int().min(0).optional(),
      parent: z
        .object({
          type: z.literal("upload_collection"),
          id: collectionId,
        })
        .optional()
        .describe("Parent collection reference."),
    }),

  update_collection: baseToolSchema.extend({
      uploadCollectionId: collectionId,
      label: z.string().optional(),
      position: z.number().int().min(0).optional(),
      parent: z
        .union([
          z.object({ type: z.literal("upload_collection"), id: collectionId }),
          z.null(),
        ])
        .optional()
        .describe("Move collection or set null for top-level."),
      children: z
        .array(
          z.object({ type: z.literal("upload_collection"), id: collectionId }),
        )
        .optional()
        .describe("Re-order child collections."),
    })
    .refine((obj) => Object.keys(obj).length > 3, {
      message: "At least one updatable field must be provided.",
    }),

  delete_collection: baseToolSchema.extend({
      uploadCollectionId: collectionId,
    }),
} as const;

/** Union of all action names for uploads router convenience */
export const uploadsActionsList = Object.keys(
  uploadsSchemas,
) as Array<keyof typeof uploadsSchemas>;