/**
 * Centralized error codes used in API error responses.
 *
 * Every error response from the API includes a `code` field. Frontend
 * and integration clients should match against these codes (not against
 * the human-readable `message`, which may change).
 *
 * Conventions:
 *   - SCREAMING_SNAKE_CASE
 *   - Specific enough to be actionable on the client side
 *   - Stable: do not rename existing codes (add new ones, deprecate old)
 *
 * When adding a new code:
 *   1. Add it here
 *   2. Document when it's thrown
 *   3. Update the frontend's error handling if it needs special UI
 */

export const ErrorCodes = {
    // ============================================================
    // State machine violations
    // ============================================================
  
    /**
     * The requested status transition is not allowed by the entity's
     * state machine. Thrown by `assertTransition`.
     *
     * Example: trying to send a proposal that's already SENT.
     */
    INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",
  
    /**
     * The entity cannot be modified in its current status. Thrown by
     * `assertMutable`. This is distinct from INVALID_STATE_TRANSITION:
     * the client tried to edit content, not transition state.
     *
     * Example: trying to PATCH a SENT proposal.
     */
    RESOURCE_IMMUTABLE: "RESOURCE_IMMUTABLE",
  
    // ============================================================
    // Resource lookup
    // ============================================================
  
    /**
     * The requested entity was not found, or the caller does not have
     * access to it (we don't distinguish to avoid leaking existence).
     */
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  
    // ============================================================
    // Validation
    // ============================================================
  
    /**
     * Request body or query parameters failed validation. Thrown by
     * the global validation pipe.
     */
    VALIDATION_ERROR: "VALIDATION_ERROR",
  
    // ============================================================
    // Auth & permissions
    // ============================================================
  
    /**
     * No valid authentication credentials were provided.
     */
    UNAUTHENTICATED: "UNAUTHENTICATED",
  
    /**
     * The authenticated user does not have permission for this action.
     */
    FORBIDDEN: "FORBIDDEN",
  
    /**
     * Tenant context could not be resolved. Usually indicates a misconfigured
     * client or a user who hasn't been provisioned.
     */
    TENANT_RESOLUTION_FAILED: "TENANT_RESOLUTION_FAILED",
  
    // ============================================================
    // Business rule violations
    // ============================================================
  
    /**
     * A required precondition for the operation was not met.
     * Examples: creating an agreement from a non-ACCEPTED proposal,
     * creating an invoice from a non-SIGNED agreement.
     */
    PRECONDITION_NOT_MET: "PRECONDITION_NOT_MET",
  
    /**
     * Attempt to create or update a resource that conflicts with an
     * existing one (e.g., duplicate email, duplicate invoice number).
     */
    RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  
    // ============================================================
    // Integration errors
    // ============================================================
  
    /**
     * An external integration (Stripe, Dropbox Sign, etc.) returned
     * an error or could not be reached.
     */
    INTEGRATION_ERROR: "INTEGRATION_ERROR",
  
    /**
     * Webhook signature verification failed. Could be malicious or
     * a misconfigured integration.
     */
    WEBHOOK_SIGNATURE_INVALID: "WEBHOOK_SIGNATURE_INVALID",
  
    // ============================================================
    // Fallback
    // ============================================================
  
    /**
     * Catch-all for unexpected errors. The exception filter uses this
     * when an error doesn't match any known type. These should be
     * investigated and given a more specific code.
     */
    INTERNAL_ERROR: "INTERNAL_ERROR",
  } as const;
  
  export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];