/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";

/**
 * Define a query in this Convex app's public API.
 *
 * This function is used to define query functions in convex/ directory.
 * Use public query to expose a query to the client.
 * @public
 */
export const query = queryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function is used to define mutation functions in convex/ directory.
 * Use public mutation to expose a mutation to the client.
 * @public
 */
export const mutation = mutationGeneric;

/**
 * Define an action in this Convex app's public API.
 *
 * This function is used to define action functions in convex/ directory.
 * Use public action to expose an action to the client.
 * @public
 */
export const action = actionGeneric;

/**
 * Define an HTTP action.
 *
 * This function is used to define http endpoint handlers in convex/ directory.
 * @public
 */
export const httpAction = httpActionGeneric;

/**
 * Define a query for internal use in this Convex app's implementation.
 */
export const internalQuery = internalQueryGeneric;

/**
 * Define a mutation for internal use in this Convex app's implementation.
 */
export const internalMutation = internalMutationGeneric;

/**
 * Define an action for internal use in this Convex app's implementation.
 */
export const internalAction = internalActionGeneric;
