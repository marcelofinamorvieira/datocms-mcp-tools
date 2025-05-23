/**
 * Type definitions for the CollaboratorsRolesAndAPITokens module.
 * This file contains type definitions for collaborators, roles, API tokens, and related entities.
 */
// Type Guards
export function isCollaboratorsError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        typeof error.type === 'string' &&
        error.type.startsWith('collaborators_') &&
        'message' in error &&
        typeof error.message === 'string');
}
export function isCollaboratorsValidationError(error) {
    return (isCollaboratorsError(error) &&
        error.type === 'collaborators_validation_error' &&
        'validationErrors' in error &&
        Array.isArray(error.validationErrors));
}
export function isCollaboratorsAuthError(error) {
    return isCollaboratorsError(error) && error.type === 'collaborators_auth_error';
}
