import { z } from "zod";

/**
 * Specific adapter type schemas for build triggers
 * These provide type-safe validation for adapter-specific settings
 */

/**
 * Custom adapter settings schema
 * For custom integrations where you provide your own webhook URL
 */
export const customAdapterSettingsSchema = z.object({
  url: z.string().url()
    .describe("The URL that will be called when a build is triggered."),
  headers: z.record(z.string()).optional()
    .describe("Optional HTTP headers to be sent with the webhook request."),
  payload: z.record(z.unknown()).optional()
    .describe("Optional custom payload to be sent with the webhook request.")
}).describe("Settings for custom webhook integrations");

/**
 * Netlify adapter settings schema
 * For Netlify-specific integrations
 */
export const netlifyAdapterSettingsSchema = z.object({
  site_id: z.string()
    .describe("The ID of the Netlify site to deploy."),
  build_hook_id: z.string()
    .describe("The ID of the Netlify build hook to trigger."),
  deploy_hook_url: z.string().url().optional()
    .describe("Optional custom deploy hook URL to override the default."),
  auth_token: z.string().optional()
    .describe("Optional Netlify authentication token for API access.")
}).describe("Settings for Netlify integrations");

/**
 * Vercel adapter settings schema
 * For Vercel-specific integrations
 */
export const vercelAdapterSettingsSchema = z.object({
  project_id: z.string()
    .describe("The ID of the Vercel project to deploy."),
  team_id: z.string().optional()
    .describe("The ID of the Vercel team, if applicable."),
  deploy_hook_url: z.string().url()
    .describe("The Vercel deploy hook URL."),
  auth_token: z.string().optional()
    .describe("Optional Vercel authentication token for API access.")
}).describe("Settings for Vercel integrations");

/**
 * CircleCI adapter settings schema
 * For CircleCI-specific integrations
 */
export const circleCiAdapterSettingsSchema = z.object({
  project_slug: z.string()
    .describe("The project slug in CircleCI (e.g., 'github/org/repo')."),
  branch: z.string().optional()
    .describe("The branch to build. Defaults to the default branch."),
  circle_token: z.string()
    .describe("CircleCI API token for authentication.")
}).describe("Settings for CircleCI integrations");

/**
 * GitLab adapter settings schema
 * For GitLab-specific integrations
 */
export const gitlabAdapterSettingsSchema = z.object({
  project_id: z.string()
    .describe("The ID or path of the GitLab project."),
  token: z.string()
    .describe("GitLab API token for authentication."),
  ref: z.string().optional().default("main")
    .describe("The branch or tag to build. Defaults to 'main'."),
  variables: z.record(z.string()).optional()
    .describe("Optional variables to pass to the pipeline.")
}).describe("Settings for GitLab integrations");

/**
 * Travis CI adapter settings schema
 * For Travis CI-specific integrations
 */
export const travisAdapterSettingsSchema = z.object({
  repo_slug: z.string()
    .describe("The repository slug in Travis CI (e.g., 'org/repo')."),
  branch: z.string().optional()
    .describe("The branch to build. Defaults to the default branch."),
  token: z.string()
    .describe("Travis CI API token for authentication.")
}).describe("Settings for Travis CI integrations");

/**
 * Combined adapter settings discriminated union
 * This allows for type-safe validation based on the adapter type
 */
export const adapterSettingsSchema = z.discriminatedUnion("adapter", [
  z.object({
    adapter: z.literal("custom"),
    settings: customAdapterSettingsSchema
  }),
  z.object({
    adapter: z.literal("netlify"),
    settings: netlifyAdapterSettingsSchema
  }),
  z.object({
    adapter: z.literal("vercel"),
    settings: vercelAdapterSettingsSchema
  }),
  z.object({
    adapter: z.literal("circle_ci"),
    settings: circleCiAdapterSettingsSchema
  }),
  z.object({
    adapter: z.literal("gitlab"),
    settings: gitlabAdapterSettingsSchema
  }),
  z.object({
    adapter: z.literal("travis"),
    settings: travisAdapterSettingsSchema
  })
]);

// Export commonly used subtypes
export const adapterTypeSchema = z.enum(["custom", "netlify", "vercel", "circle_ci", "gitlab", "travis"])
  .describe("The type of build integration to use.");

// Fallback for backward compatibility
export const genericAdapterSettingsSchema = z.record(z.unknown())
  .describe("Settings specific to the chosen adapter. For type-safe validation, use the specific adapter settings schemas.");

export default adapterSettingsSchema;