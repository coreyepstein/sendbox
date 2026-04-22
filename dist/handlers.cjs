"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }





var _chunkI6ABYSIVcjs = require('./chunk-I6ABYSIV.cjs');

// src/handlers/send.ts
function createSendHandler(options) {
  return async function POST(request) {
    try {
      if (_optionalChain([options, 'optionalAccess', _ => _.authorize])) {
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
      const { data, error } = await _chunkI6ABYSIVcjs.getResend.call(void 0, ).emails.send({
        from,
        to,
        ...ccList.length > 0 ? { cc: ccList } : {},
        subject,
        html: body_html
      });
      if (error || !data) {
        return Response.json(
          { error: _nullishCoalesce(_optionalChain([error, 'optionalAccess', _2 => _2.message]), () => ( "Failed to send email")) },
          { status: 500 }
        );
      }
      const resendId = data.id;
      let activeThreadId = thread_id;
      if (!activeThreadId) {
        const existingThreads = await _chunkI6ABYSIVcjs.getThreads.call(void 0, identity_id);
        const match = existingThreads.find(
          (t) => t.subject === subject && t.status === "open"
        );
        if (match) {
          activeThreadId = match.id;
        } else {
          const thread = await _chunkI6ABYSIVcjs.createThread.call(void 0, {
            subject,
            identity_id
          });
          activeThreadId = thread.id;
        }
      }
      const message = await _chunkI6ABYSIVcjs.createMessage.call(void 0, {
        thread_id: activeThreadId,
        resend_id: resendId,
        direction: "outbound",
        from_email: from,
        to_email: to,
        cc: ccList,
        subject,
        body_html
      });
      if (_optionalChain([options, 'optionalAccess', _3 => _3.onMessageSent])) {
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
      if (_optionalChain([options, 'optionalAccess', _4 => _4.authorize])) {
        await options.authorize(request);
      }
      const event = await request.json();
      if (event.type !== "email.received") {
        return Response.json({ ok: true, skipped: event.type }, { status: 200 });
      }
      const { data } = event;
      if (!data.email_id || !data.from || !_optionalChain([data, 'access', _5 => _5.to, 'optionalAccess', _6 => _6.length]) || !data.subject) {
        return Response.json(
          { error: "Missing required fields in webhook data" },
          { status: 400 }
        );
      }
      const resend = _chunkI6ABYSIVcjs.getResend.call(void 0, );
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
        headers: _nullishCoalesce(fullEmail.headers, () => ( {})),
        attachments: (_nullishCoalesce(fullEmail.attachments, () => ( []))).map((a) => ({
          id: a.id,
          filename: _nullishCoalesce(a.filename, () => ( "attachment")),
          content_type: a.content_type,
          size: 0,
          content_disposition: _nullishCoalesce(a.content_disposition, () => ( "attachment")),
          content_id: _nullishCoalesce(a.content_id, () => ( void 0))
        })),
        message_id: fullEmail.message_id
      };
      const result = await _chunkI6ABYSIVcjs.processInboundEmail.call(void 0, payload);
      if (_optionalChain([options, 'optionalAccess', _7 => _7.onMessageReceived])) {
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



exports.createSendHandler = createSendHandler; exports.createWebhookHandler = createWebhookHandler;
