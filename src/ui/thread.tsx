"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────

interface ThreadDetail {
  id: string;
  subject: string;
  identity_id: string;
  last_message_at: string;
  status: string;
  labels: string[];
  created_at: string;
  identity_name: string;
  identity_email: string;
}

interface MessageItem {
  id: string;
  thread_id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  received_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Sub-components ─────────────────────────────────────────────────

function MessageCard({ message }: { message: MessageItem }) {
  const isOutbound = message.direction === "outbound";
  const senderDisplay = message.from_name || message.from_email;

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
          max-w-[75%] rounded-xl px-5 py-4
          ${isOutbound
            ? "bg-white/[0.06] border border-white/[0.08]"
            : "bg-blue-500/[0.06] border border-blue-400/[0.1]"
          }
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[12px] font-medium ${isOutbound ? "text-white/60" : "text-blue-300/70"}`}>
            {senderDisplay}
          </span>
          <span className="text-[10px] text-white/20">{message.from_email}</span>
        </div>

        {message.body_html ? (
          <div
            className="text-[13px] text-white/75 leading-relaxed [&_a]:text-blue-400/80 [&_a]:underline [&_p]:mb-2 [&_br]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-white/50"
            dangerouslySetInnerHTML={{ __html: message.body_html }}
          />
        ) : (
          <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-wrap">
            {message.body_text || "No content"}
          </p>
        )}

        <div className={`mt-3 flex ${isOutbound ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-white/20 tabular-nums">
            {formatTime(message.received_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReplyComposer({
  thread,
  lastInboundEmail,
  apiBase,
  onSent,
}: {
  thread: ThreadDetail;
  lastInboundEmail: string | null;
  apiBase: string;
  onSent: () => void;
}) {
  const [to, setTo] = useState(lastInboundEmail ?? "");
  const [subject, setSubject] = useState(
    thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`
  );
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !body.trim()) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: thread.identity_email,
          to: to.trim(),
          subject: subject.trim(),
          body_html: `<p>${body.replace(/\n/g, "<br>")}</p>`,
          identity_id: thread.identity_id,
          thread_id: thread.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setBody("");
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="border-t border-white/[0.06] bg-white/[0.01] px-6 py-5">
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5">
          <p className="text-red-400/80 text-[12px]">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-[11px] tracking-wide text-white/30 w-14 shrink-0">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            required
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[11px] tracking-wide text-white/30 w-14 shrink-0">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply..."
          rows={4}
          required
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/15">
            Sending as{" "}
            <span className="text-white/30">{thread.identity_name}</span>{" "}
            &lt;{thread.identity_email}&gt;
          </span>
          <button
            type="submit"
            disabled={sending || !to.trim() || !body.trim()}
            className="rounded-lg bg-white/[0.08] px-6 py-2.5 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export interface ThreadProps {
  /** The thread ID to display. */
  threadId: string;
  /** Base URL for API calls. Defaults to "". */
  apiBase?: string;
  /** Called when the back button is clicked. */
  onBack?: () => void;
  className?: string;
}

/**
 * Thread conversation view — displays messages and reply composer.
 */
export function Thread({
  threadId,
  apiBase = "",
  onBack,
  className,
}: ThreadProps) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/threads/${threadId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Thread not found");
        throw new Error("Failed to load thread");
      }
      const data = await res.json();
      setThread(data.thread);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread");
    } finally {
      setLoading(false);
    }
  }, [apiBase, threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastInbound = [...messages].reverse().find((m) => m.direction === "inbound");

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/20 text-[13px] tracking-wide">Loading...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">{error || "Thread not found"}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-[12px] text-white/30 hover:text-white/50 transition-colors"
          >
            Back to inbox
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className ?? ""}`}>
      {/* Header */}
      <header className="shrink-0 border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-medium text-white/90 tracking-tight truncate">
            {thread.subject}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-white/25">{thread.identity_name}</span>
            <span className="text-white/10">|</span>
            <span
              className={`
                inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-medium
                ${thread.status === "open" ? "text-emerald-400" : "text-white/30"}
              `}
            >
              <span className={`h-1 w-1 rounded-full ${thread.status === "open" ? "bg-emerald-400" : "bg-white/25"}`} />
              {thread.status}
            </span>
            <span className="text-white/10">|</span>
            <span className="text-[11px] text-white/15 tabular-nums">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-white/25 text-[13px]">No messages yet</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageCard key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply composer */}
      <div className="shrink-0 max-w-3xl mx-auto w-full">
        <ReplyComposer
          thread={thread}
          lastInboundEmail={lastInbound?.from_email ?? null}
          apiBase={apiBase}
          onSent={fetchThread}
        />
      </div>
    </div>
  );
}
