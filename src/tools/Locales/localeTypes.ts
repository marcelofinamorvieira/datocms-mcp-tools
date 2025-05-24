/**
 * @file localeTypes.ts
 * @description Type definitions for DatoCMS Locales
 */

export type LocaleIdentity = string;

export interface Locale {
  id: LocaleIdentity;
  type: 'site_locale';
  attributes: {
    name: string;
    code: string;
    fallback_locale?: LocaleIdentity | null;
    created_at: string;
    updated_at: string;
  };
}

export interface LocaleCreateParams {
  name: string;
  code: string;
  fallback_locale?: string;
}

export interface LocaleUpdateParams {
  name?: string;
  fallback_locale?: string | null;
}

// Type guards
export function isLocale(value: unknown): value is Locale {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    (value as any).type === 'site_locale'
  );
}