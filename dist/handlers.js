import {
  createMessage,
  createThread,
  getResend,
  getThreads,
  processInboundEmail
} from "./chunk-AHGGZMMT.js";

// src/handlers/send.ts
function createSendHandler(options) {
  return async function POST(request) {
    try {
      if (options?.authorize) {
        await options.authorize(request);
      }
      const body = await request.json();
      const { from, to, cc, subject, body_html, identity_id, thread_id } = body;
      if (!from || !to || !subject || !body_html || !identity_id) {
        return Response.json(
          { error: "Missing required fields: from, to, subject, body_html, identity_id" },
          { status: 400 }
        );
      }
      const ccList = Array.isArray(cc) ? cc.filter((s) => typeof s === "string" && s.length > 0) : typeof cc === "string" && cc.length > 0 ? [cc] : [];
      const { data, error } = await getResend().emails.send({
        from,
        to,
        ...ccList.length > 0 ? { cc: ccList } : {},
        subject,
        html: body_html
      });
      if (error || !data) {
        return Response.json(
          { error: error?.message ?? "Failed to send email" },
          { status: 500 }
        );
      }
      const resendId = data.id;
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
            identity_id
          });
          activeThreadId = thread.id;
        }
      }
      const message = await createMessage({
        thread_id: activeThreadId,
        resend_id: resendId,
        direction: "outbound",
        from_email: from,
        to_email: to,
        cc: ccList,
        subject,
        body_html
      });
      if (options?.onMessageSent) {
        await options.onMessageSent({
          threadId: activeThreadId,
          messageId: message.id,
          resendId
        });
      }
      return Response.json({
        success: true,
        resend_id: resendId,
        thread_id: activeThreadId,
        message_id: message.id
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

// src/handlers/webhook.ts
function createWebhookHandler(options) {
  return async function POST(request) {
    try {
      if (options?.authorize) {
        await options.authorize(request);
      }
      const event = await request.json();
      if (event.type !== "email.received") {
        console.log(
          "[sendbox] Webhook skipped: non-received event type",
          JSON.stringify({ type: event.type ?? null })
        );
        return Response.json({ ok: true, skipped: event.type }, { status: 200 });
      }
      const { data } = event;
      if (!data?.email_id || !data?.from || !data?.to?.length || !data?.subject) {
        console.error(
          "[sendbox] Webhook rejected: missing required fields",
          JSON.stringify({
            email_id: data?.email_id ?? null,
            from: data?.from ?? null,
            to_count: data?.to?.length ?? 0,
            subject_present: Boolean(data?.subject)
          })
        );
        return Response.json(
          { error: "Missing required fields in webhook data" },
          { status: 400 }
        );
      }
      const resend = getResend();
      const { data: fullEmail, error: fetchError } = await resend.emails.receiving.get(data.email_id);
      if (fetchError || !fullEmail) {
        console.error("[sendbox] Failed to fetch full email:", fetchError);
        return Response.json(
          { error: "Failed to fetch email content from Resend" },
          { status: 502 }
        );
      }
      const payload = {
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
          content_id: a.content_id ?? void 0
        })),
        message_id: fullEmail.message_id
      };
      const result = await processInboundEmail(payload);
      if (options?.onMessageReceived) {
        await options.onMessageReceived(result);
      }
      return Response.json(
        {
          ok: true,
          threadId: result.threadId,
          messageId: result.messageId,
          isNewThread: result.isNewThread
        },
        { status: 200 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.startsWith("No identity found")) {
        console.warn("[sendbox] Webhook skipped: no matching identity:", message);
        return Response.json({ ok: true, skipped: message }, { status: 200 });
      }
      console.error("[sendbox] Error processing inbound:", message);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
export {
  createSendHandler,
  createWebhookHandler
};
