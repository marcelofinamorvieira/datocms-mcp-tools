/**
 * Utility for exhaustiveness checking in TypeScript
 * Ensures all cases in a union are handled at compile time
 * 
 * Example usage:
 * ```typescript
 * type Action = 'create' | 'read' | 'update' | 'delete';
 * 
 * function handleAction(action: Action) {
 *   switch (action) {
 *     case 'create': return doCreate();
 *     case 'read': return doRead();
 *     case 'update': return doUpdate();
 *     case 'delete': return doDelete();
 *     default: return assertNever(action); // TypeScript error if case missing
 *   }
 * }
 * ```
 */

/**
 * Assert that a code path should never be reached
 * If this function is called, it means there's an unhandled case
 * 
 * @param value - The value that should be of type `never`
 * @param message - Optional custom error message
 * @throws Error always - this function never returns normally
 */
export function assertNever(value: never, message?: string): never {
  const errorMessage = message ?? `Unhandled case: ${JSON.stringify(value)}`;
  throw new Error(errorMessage);
}

/**
 * Type guard that checks if all cases have been handled
 * This is a compile-time check - if TypeScript compiles, all cases are handled
 * 
 * @param value - The value that should be of type `never`
 */
export function exhaustiveCheck(value: never): void {
  // This function should never be called if all cases are handled
  // TypeScript will error at compile time if there are unhandled cases
  throw new Error(`Exhaustive check failed: ${JSON.stringify(value)}`);
}

/**
 * Create a type-safe exhaustive switch handler
 * Ensures all cases are handled at compile time
 * 
 * @param value - The discriminated union value
 * @param handlers - Object mapping each case to a handler function
 * @returns The result of the matched handler
 * 
 * @example
 * ```typescript
 * type Status = 'pending' | 'active' | 'completed';
 * 
 * const result = createExhaustiveSwitch(status, {
 *   pending: () => 'Task is pending',
 *   active: () => 'Task is active',
 *   completed: () => 'Task is completed'
 * });
 * ```
 */
export function createExhaustiveSwitch<T extends string | number | symbol, R>(
  value: T,
  handlers: Record<T, () => R>
): R {
  if (value in handlers) {
    return handlers[value]();
  }
  return assertNever(value as never);
}

/**
 * Create an exhaustive matcher for discriminated unions
 * Provides a fluent API for pattern matching
 * 
 * @example
 * ```typescript
 * type Result<T> = { type: 'success'; value: T } | { type: 'error'; error: Error };
 * 
 * const message = exhaustiveMatch(result)
 *   .when('success', (r) => `Success: ${r.value}`)
 *   .when('error', (r) => `Error: ${r.error.message}`)
 *   .exhaustive();
 * ```
 */
export class ExhaustiveMatcher<T extends { type: string }, R = unknown> {
  private cases: Map<string, (value: any) => R> = new Map();

  constructor(private value: T) {}

  when<K extends T['type'], V extends Extract<T, { type: K }>>(
    type: K,
    handler: (value: V) => R
  ): ExhaustiveMatcher<Exclude<T, { type: K }>, R> {
    this.cases.set(type, handler);
    return this as any;
  }

  exhaustive(): R {
    const handler = this.cases.get(this.value.type);
    if (!handler) {
      throw new Error(`No handler for case: ${this.value.type}`);
    }
    return handler(this.value);
  }

  default(handler: (value: T) => R): R {
    const specificHandler = this.cases.get(this.value.type);
    if (specificHandler) {
      return specificHandler(this.value);
    }
    return handler(this.value);
  }
}

/**
 * Create an exhaustive matcher for discriminated unions
 */
export function exhaustiveMatch<T extends { type: string }>(value: T): ExhaustiveMatcher<T> {
  return new ExhaustiveMatcher(value);
}

/**
 * Utility type to extract the discriminant values from a discriminated union
 */
export type DiscriminantValues<T extends { type: string }> = T['type'];

/**
 * Ensure a list of cases covers all possibilities
 * This is a compile-time check
 * 
 * @example
 * ```typescript
 * type Action = { type: 'create' } | { type: 'read' } | { type: 'update' };
 * 
 * // TypeScript error if any action is missing
 * ensureAllCases<Action>()(['create', 'read', 'update']);
 * ```
 */
export function ensureAllCases<T extends { type: string }>() {
  return <K extends DiscriminantValues<T>[]>(
    cases: K & (DiscriminantValues<T> extends K[number] ? K : never)
  ): K => cases;
}