import { processInboundEmail } from "../email.js";
import { getResend } from "../resend.js";
import type { HandlerOptions, InboundEmailPayload } from "../types.js";

// Resend email.received webhook envelope
interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    bcc: string[];
    cc: string[];
    message_id: string;
    subject: string;
    attachments: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition: string;
      content_id?: string;
    }>;
  };
}

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
export function createWebhookHandler(options?: HandlerOptions) {
  return async function POST(request: Request): Promise<Response> {
    try {
      // Auth check (e.g. webhook signature verification)
      if (options?.authorize) {
        await options.authorize(request);
      }

      const event = (await request.json()) as ResendWebhookEvent;

      // Only handle email.received events
      if (event.type !== "email.received") {
        return Response.json({ ok: true, skipped: event.type }, { status: 200 });
      }

      const { data } = event;
      if (!data.email_id || !data.from || !data.to?.length || !data.subject) {
        return Response.json(
          { error: "Missing required fields in webhook data" },
          { status: 400 }
        );
      }

      // Fetch full email content from Resend API
      const resend = getResend();
      const { data: fullEmail, error: fetchError } =
        await resend.emails.receiving.get(data.email_id);

      if (fetchError || !fullEmail) {
        console.error("[sendbox] Failed to fetch full email:", fetchError);
        return Response.json(
          { error: "Failed to fetch email content from Resend" },
          { status: 502 }
        );
      }

      // Map to InboundEmailPayload
      const payload: InboundEmailPayload = {
        from: fullEmail.from,
        to: fullEmail.to.join(", "),
        subject: fullEmail.subject,
        html: fullEmail.html,
        text: fullEmail.text,
        headers: fullEmail.headers ?? {},
        attachments: (fullEmail.attachments ?? []).map((a) => ({
          id: a.id,
          filename: a.filename ?? "attachment",
          content_type: a.content_type,
          size: 0,
          content_disposition: a.content_disposition ?? "attachment",
          content_id: a.content_id ?? undefined,
        })),
        message_id: fullEmail.message_id,
      };

      const result = await processInboundEmail(payload);

      // Hook
      if (options?.onMessageReceived) {
        await options.onMessageReceived(result);
      }

      return Response.json(
        {
          ok: true,
          threadId: result.threadId,
          messageId: result.messageId,
          isNewThread: result.isNewThread,
        },
        { status: 200 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      // Identity-not-found is a client-ish error (unknown recipient)
      if (message.startsWith("No identity found")) {
        return Response.json({ error: message }, { status: 422 });
      }

      console.error("[sendbox] Error processing inbound:", message);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
