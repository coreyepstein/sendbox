"use client";

import { useCallback, useEffect, useState } from "react";

interface IdentityItem {
  id: string;
  name: string;
  email: string;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface IdentitiesProps {
  /** Base URL for API calls. Defaults to "". */
  apiBase?: string;
  /** Placeholder domain for the email field. */
  domain?: string;
  className?: string;
}

/**
 * Identity management component — list, create, and delete email identities.
 */
export function Identities({
  apiBase = "",
  domain,
  className,
}: IdentitiesProps) {
  const [identities, setIdentities] = useState<IdentityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchIdentities = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/identities`);
      if (!res.ok) throw new Error("Failed to fetch identities");
      const data = await res.json();
      setIdentities(data.identities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load identities");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/identities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: role.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create identity");
      }

      setName("");
      setEmail("");
      setRole("");
      await fetchIdentities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create identity");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${apiBase}/api/identities/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete identity");
      }
      setDeletingId(null);
      await fetchIdentities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete identity");
      setDeletingId(null);
    }
  }

  return (
    <div className={`max-w-3xl mx-auto px-8 py-12 ${className ?? ""}`}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl text-white/90 font-medium tracking-wide">
          Identities
        </h1>
        <p className="mt-2 text-[13px] text-white/30 tracking-wide">
          Manage email identities your app can send and receive as.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-red-400/80 text-[13px]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-[11px] text-red-400/50 hover:text-red-400/70 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
      >
        <h2 className="text-[13px] tracking-[0.15em] uppercase text-white/40 font-light mb-5">
          Add Identity
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] tracking-wide text-white/30 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-wide text-white/30 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={domain ? `jane@${domain}` : "jane@example.com"}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-wide text-white/30 mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Support, Sales, etc."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !email.trim()}
            className="rounded-lg bg-white/[0.08] px-5 py-2.5 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? "Adding..." : "Add Identity"}
          </button>
        </div>
      </form>

      {/* Identity list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-white/20 text-[13px] tracking-wide">Loading...</p>
        </div>
      ) : identities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border border-white/[0.06] flex items-center justify-center mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/20"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p className="text-white/25 text-[13px] tracking-wide">
            No identities yet
          </p>
          <p className="text-white/15 text-[12px] mt-1">
            Add your first email identity above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {identities.map((identity) => (
            <div
              key={identity.id}
              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                  <span className="text-[13px] text-white/50 font-light">
                    {identity.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] text-white/80">{identity.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[12px] text-white/30">
                      {identity.email}
                    </span>
                    {identity.role && (
                      <>
                        <span className="text-white/10">|</span>
                        <span className="text-[12px] text-white/20">
                          {identity.role}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {deletingId === identity.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-red-400/60 mr-2">
                      Delete?
                    </span>
                    <button
                      onClick={() => handleDelete(identity.id)}
                      className="rounded-md bg-red-500/10 px-3 py-1.5 text-[11px] text-red-400/80 hover:bg-red-500/20 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="rounded-md px-3 py-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(identity.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-md px-3 py-1.5 text-[11px] text-white/20 hover:text-red-400/60 transition-all duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
