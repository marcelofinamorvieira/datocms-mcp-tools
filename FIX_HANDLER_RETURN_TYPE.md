# Fix for Handler Return Type Compatibility

## Problem
The middleware composition in `enhancedHandlerFactory.ts` has type incompatibility:
- Handlers can return either `Response` or `HandlerResponse<unknown>`
- Middleware functions return union types like `Promise<Result | Response>`
- This causes TypeScript errors when composing middleware

## Root Cause
The `withErrorHandling` middleware returns `Promise<Result | Response>` instead of consistently returning `Promise<Response>`. This creates a type mismatch in the middleware composition.

## Solution

### Option 1: Ensure all middleware returns Response (Recommended)
Modify the middleware to always return Response type:

```typescript
// In errorHandlerWrapper.ts
export function withErrorHandling<Args>(
  handlerFn: (args: Args) => Promise<Response>,
  context?: ErrorContext
): (args: Args) => Promise<Response> {
  return async function(args: Args): Promise<Response> {
    try {
      return await handlerFn(args);
    } catch (error: unknown) {
      // Always return Response type
      return createStandardMcpResponse(
        createStandardErrorResponse(error, { 
          error_code: getErrorCode(error),
          debug: debugData 
        }, requestDebug)
      );
    }
  };
}
```

### Option 2: Update composeMiddleware to handle union types
Make the middleware composition more flexible:

```typescript
function composeMiddleware<T>(
  baseHandler: Handler<T, Response>,
  middleware: Array<(handler: Handler<unknown, any>) => Handler<unknown, any>>
): Handler<unknown, Response> {
  // Cast the final result to ensure Response type
  const composed = middleware.reduceRight(
    (handler, applyMiddleware) => applyMiddleware(handler),
    baseHandler as Handler<unknown, any>
  );
  
  // Ensure the final handler returns Response
  return async (args: unknown): Promise<Response> => {
    const result = await composed(args);
    // If result is already a Response, return it
    if (result && typeof result === 'object' && 'content' in result) {
      return result as Response;
    }
    // Otherwise, wrap it in a Response
    return createResponse(JSON.stringify(result, null, 2));
  };
}
```

### Option 3: Fix types at the factory level
Update the factory functions to handle the type conversion:

```typescript
// In createBaseHandler
const wrappedHandler: Handler<unknown, Response> = async (args: unknown): Promise<Response> => {
  // Type-safe wrapper ensures Response return type
  const result = await composedHandler(args);
  if (result && typeof result === 'object' && 'content' in result) {
    return result as Response;
  }
  throw new Error('Handler must return Response type');
};
```

## Implementation Steps

1. **Immediate Fix**: Add type assertions to suppress errors while we implement proper fix
2. **Proper Fix**: Implement Option 1 - ensure all middleware returns Response
3. **Test**: Verify all handlers work correctly with the new types
4. **Document**: Update handler creation documentation

## Temporary Workaround
While implementing the proper fix, we can suppress the errors:

```typescript
// @ts-expect-error - Middleware type compatibility issue being fixed
return composeMiddleware(baseHandler, middleware);
```