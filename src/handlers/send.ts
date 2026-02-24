import { getResend } from "../resend.js";
import { createThread, createMessage, getThreads } from "../db.js";
import type { HandlerOptions } from "../types.js";

interface SendEmailBody {
  from: string;
  to: string;
  subject: string;
  body_html: string;
  identity_id: string;
  thread_id?: string;
}

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
export function createSendHandler(options?: HandlerOptions) {
  return async function POST(request: Request): Promise<Response> {
    try {
      // Auth check
      if (options?.authorize) {
        await options.authorize(request);
      }

      const body = (await request.json()) as SendEmailBody;

      const { from, to, subject, body_html, identity_id, thread_id } = body;
      if (!from || !to || !subject || !body_html || !identity_id) {
        return Response.json(
          { error: "Missing required fields: from, to, subject, body_html, identity_id" },
          { status: 400 }
        );
      }

      // Send email via Resend
      const { data, error } = await getResend().emails.send({
        from,
        to,
        subject,
        html: body_html,
      });

      if (error || !data) {
        return Response.json(
          { error: error?.message ?? "Failed to send email" },
          { status: 500 }
        );
      }

      const resendId = data.id;

      // Resolve or create thread
      let activeThreadId = thread_id;

      if (!activeThreadId) {
        const existingThreads = await getThreads(identity_id);
        const match = existingThreads.find(
          (t) => t.subject === subject && t.status === "open"
        );

        if (match) {
          activeThreadId = match.id;
        } else {
          const thread = await createThread({
            subject,
            identity_id,
          });
          activeThreadId = thread.id;
        }
      }

      // Log outbound message
      const message = await createMessage({
        thread_id: activeThreadId,
        resend_id: resendId,
        direction: "outbound",
        from_email: from,
        to_email: to,
        subject,
        body_html,
      });

      // Hook
      if (options?.onMessageSent) {
        await options.onMessageSent({
          threadId: activeThreadId,
          messageId: message.id,
          resendId,
        });
      }

      return Response.json({
        success: true,
        resend_id: resendId,
        thread_id: activeThreadId,
        message_id: message.id,
      });
    } catch (err) {
      console.error("[sendbox] Error sending email:", err);
      return Response.json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        { status: 500 }
      );
    }
  };
}
