import { H as HandlerOptions } from './types-B0GlFYYF.cjs';

/**
 * Create a Next.js POST route handler for sending emails.
 *
 * Usage:
 * ```ts
 * // app/api/emails/send/route.ts
 * import { createSendHandler } from 'sendbox/handlers'
 * export const POST = createSendHandler()
 * ```
 */
declare function createSendHandler(options?: HandlerOptions): (request: Request) => Promise<Response>;

/**
 * Create a Next.js POST route handler for receiving Resend inbound webhooks.
 *
 * Usage:
 * ```ts
 * // app/api/webhooks/email/route.ts
 * import { createWebhookHandler } from 'sendbox/handlers'
 * export const POST = createWebhookHandler()
 * ```
 */
declare function createWebhookHandler(options?: HandlerOptions): (request: Request) => Promise<Response>;

export { createSendHandler, createWebhookHandler };
