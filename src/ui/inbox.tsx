"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────

interface ThreadPreview {
  id: string;
  subject: string;
  identity_id: string;
  last_message_at: string;
  status: string;
  labels: string[];
  created_at: string;
  identity_name: string;
  identity_email: string;
  last_from_email: string | null;
  last_from_name: string | null;
  last_direction: "inbound" | "outbound" | null;
  preview: string | null;
}

interface IdentityOption {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Sub-components ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isOpen = status === "open";
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2 py-0.5
        text-[10px] tracking-wider uppercase font-medium
        ${isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/30"}
      `}
    >
      <span className={`h-1 w-1 rounded-full ${isOpen ? "bg-emerald-400" : "bg-white/25"}`} />
      {status}
    </span>
  );
}

function IdentityFilter({
  identities,
  selected,
  onChange,
}: {
  identities: IdentityOption[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="
        appearance-none bg-white/[0.04] border border-white/[0.08]
        rounded-lg px-3 py-1.5 text-[13px] text-white/70
        focus:outline-none focus:border-white/20
        transition-colors cursor-pointer
      "
    >
      <option value="" className="bg-[#0a0a0a] text-white/70">
        All identities
      </option>
      {identities.map((identity) => (
        <option key={identity.id} value={identity.id} className="bg-[#0a0a0a] text-white/70">
          {identity.name}
        </option>
      ))}
    </select>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <p className="text-white/40 text-sm">No conversations yet</p>
      <p className="text-white/20 text-xs mt-1">
        Threads will appear here when emails are sent or received.
      </p>
    </div>
  );
}

function ThreadRow({
  thread,
  onClick,
}: {
  thread: ThreadPreview;
  onClick?: (threadId: string) => void;
}) {
  const senderDisplay = thread.last_from_name || thread.last_from_email || "Unknown";
  const isInbound = thread.last_direction === "inbound";

  const content = (
    <div className="flex items-start gap-4 px-6 py-4">
      <div className="mt-1.5 shrink-0">
        <div className={`h-1.5 w-1.5 rounded-full ${isInbound ? "bg-blue-400/80" : "bg-white/15"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-medium text-white/90 truncate">
            {senderDisplay}
          </span>
          <StatusBadge status={thread.status} />
        </div>
        <p className="text-[13px] text-white/70 truncate leading-snug">
          {thread.subject}
        </p>
        {thread.preview && (
          <p className="text-[12px] text-white/30 truncate mt-0.5 leading-relaxed">
            {thread.preview}
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
        <span className="text-[11px] text-white/25 tabular-nums">
          {relativeTime(thread.last_message_at)}
        </span>
        <span className="text-[10px] text-white/15 tracking-wide truncate max-w-[120px]">
          {thread.identity_name}
        </span>
      </div>
    </div>
  );

  return (
    <button
      onClick={() => onClick?.(thread.id)}
      className="
        group block w-full text-left border-b border-white/[0.04]
        hover:bg-white/[0.03] transition-colors duration-150
      "
    >
      {content}
    </button>
  );
}

function ComposeModal({
  identities,
  apiBase,
  onClose,
  onSent,
}: {
  identities: IdentityOption[];
  apiBase: string;
  onClose: () => void;
  onSent: (threadId: string) => void;
}) {
  const [fromId, setFromId] = useState(identities[0]?.id ?? "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = identities.find((i) => i.id === fromId);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!fromId || !to.trim() || !subject.trim() || !body.trim()) return;

    setSending(true);
    setError(null);

    try {
      const fromEmail = selected ? `${selected.name} <${selected.email}>` : "";

      const res = await fetch(`${apiBase}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: to.trim(),
          subject: subject.trim(),
          body_html: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
          identity_id: fromId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      onSent(data.thread_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl mx-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-[14px] font-medium text-white/80 tracking-wide">
            New Message
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-[12px] text-white/30 w-14 shrink-0 text-right">From</label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="flex-1 appearance-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                {identities.map((identity) => (
                  <option key={identity.id} value={identity.id} className="bg-[#0a0a0a] text-white/70">
                    {identity.name} &lt;{identity.email}&gt;
                    {identity.role ? ` — ${identity.role}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[12px] text-white/30 w-14 shrink-0 text-right">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                required
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[12px] text-white/30 w-14 shrink-0 text-right">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                required
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="pt-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                required
                rows={8}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5">
                <p className="text-red-400/80 text-[12px]">{error}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[12px] tracking-wide text-white/40 hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !fromId || !to.trim() || !subject.trim() || !body.trim()}
              className="rounded-lg bg-white/[0.08] px-5 py-2 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export interface InboxProps {
  /** Base URL for API calls. Defaults to "". */
  apiBase?: string;
  /** Called when a thread is clicked. Receives thread ID. */
  onThreadClick?: (threadId: string) => void;
  className?: string;
}

/**
 * Email inbox — thread list with identity filter, compose button, and search.
 */
export function Inbox({
  apiBase = "",
  onThreadClick,
  className,
}: InboxProps) {
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [identities, setIdentities] = useState<IdentityOption[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  const fetchThreads = useCallback(
    async (identityId?: string) => {
      setLoading(true);
      try {
        const url = identityId
          ? `${apiBase}/api/threads?identity_id=${identityId}`
          : `${apiBase}/api/threads`;
        const res = await fetch(url);
        const data = await res.json();
        setThreads(data.threads ?? []);
      } catch {
        console.error("Failed to fetch threads");
      } finally {
        setLoading(false);
      }
    },
    [apiBase]
  );

  const fetchIdentities = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/identities`);
      const data = await res.json();
      setIdentities(data.identities ?? []);
    } catch {
      // Identities endpoint may not exist yet
    }
  }, [apiBase]);

  useEffect(() => {
    fetchIdentities();
    fetchThreads();
  }, [fetchIdentities, fetchThreads]);

  const handleIdentityChange = (identityId: string) => {
    setSelectedIdentity(identityId);
    fetchThreads(identityId || undefined);
  };

  const handleComposeSent = (threadId: string) => {
    setShowCompose(false);
    onThreadClick?.(threadId);
  };

  return (
    <div className={`h-full flex flex-col ${className ?? ""}`}>
      <header className="shrink-0 border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-white/90 tracking-tight">Inbox</h1>
          <p className="text-[11px] text-white/25 mt-0.5 tracking-wide">
            {threads.length} conversation{threads.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {identities.length > 0 && (
            <IdentityFilter
              identities={identities}
              selected={selectedIdentity}
              onChange={handleIdentityChange}
            />
          )}

          <button
            onClick={() => setShowCompose(true)}
            disabled={identities.length === 0}
            className="
              flex items-center gap-2 rounded-lg bg-white/[0.08]
              px-4 py-1.5 text-[12px] tracking-[0.08em] uppercase
              text-white/70 font-light
              hover:bg-white/[0.12] hover:text-white/90
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
            Compose
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-white/20 text-sm">Loading...</div>
          </div>
        ) : threads.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {threads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} onClick={onThreadClick} />
            ))}
          </div>
        )}
      </div>

      {showCompose && (
        <ComposeModal
          identities={identities}
          apiBase={apiBase}
          onClose={() => setShowCompose(false)}
          onSent={handleComposeSent}
        />
      )}
    </div>
  );
}
