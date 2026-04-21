"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui.ts
var ui_exports = {};
__export(ui_exports, {
  Identities: () => Identities,
  Inbox: () => Inbox,
  InboxLayout: () => InboxLayout,
  Thread: () => Thread
});
module.exports = __toCommonJS(ui_exports);

// src/ui/inbox.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function relativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1e3);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
function StatusBadge({ status }) {
  const isOpen = status === "open";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "span",
    {
      className: `
        inline-flex items-center gap-1.5 rounded-full px-2 py-0.5
        text-[10px] tracking-wider uppercase font-medium
        ${isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/30"}
      `,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1 w-1 rounded-full ${isOpen ? "bg-emerald-400" : "bg-white/25"}` }),
        status
      ]
    }
  );
}
function IdentityFilter({
  identities,
  selected,
  onChange
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "select",
    {
      value: selected,
      onChange: (e) => onChange(e.target.value),
      className: "\n        appearance-none bg-white/[0.04] border border-white/[0.08]\n        rounded-lg px-3 py-1.5 text-[13px] text-white/70\n        focus:outline-none focus:border-white/20\n        transition-colors cursor-pointer\n      ",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", className: "bg-[#0a0a0a] text-white/70", children: "All identities" }),
        identities.map((identity) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: identity.id, className: "bg-[#0a0a0a] text-white/70", children: identity.name }, identity.id))
      ]
    }
  );
}
function EmptyState() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center justify-center h-[60vh] text-center", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-white/20", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-white/40 text-sm", children: "No conversations yet" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-white/20 text-xs mt-1", children: "Threads will appear here when emails are sent or received." })
  ] });
}
function ThreadRow({
  thread,
  onClick
}) {
  const senderDisplay = thread.last_from_name || thread.last_from_email || "Unknown";
  const isInbound = thread.last_direction === "inbound";
  const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start gap-4 px-6 py-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1.5 shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 w-1.5 rounded-full ${isInbound ? "bg-blue-400/80" : "bg-white/15"}` }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 mb-0.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[13px] font-medium text-white/90 truncate", children: senderDisplay }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: thread.status })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-[13px] text-white/70 truncate leading-snug", children: thread.subject }),
      thread.preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-[12px] text-white/30 truncate mt-0.5 leading-relaxed", children: thread.preview })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "shrink-0 flex flex-col items-end gap-1.5 pt-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-white/25 tabular-nums", children: relativeTime(thread.last_message_at) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-white/15 tracking-wide truncate max-w-[120px]", children: thread.identity_name })
    ] })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      onClick: () => onClick?.(thread.id),
      className: "\n        group block w-full text-left border-b border-white/[0.04]\n        hover:bg-white/[0.03] transition-colors duration-150\n      ",
      children: content
    }
  );
}
function ComposeModal({
  identities,
  apiBase,
  apiPrefix,
  onClose,
  onSent
}) {
  const [fromId, setFromId] = (0, import_react.useState)(identities[0]?.id ?? "");
  const [to, setTo] = (0, import_react.useState)("");
  const [subject, setSubject] = (0, import_react.useState)("");
  const [body, setBody] = (0, import_react.useState)("");
  const [sending, setSending] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const selected = identities.find((i) => i.id === fromId);
  async function handleSend(e) {
    e.preventDefault();
    if (!fromId || !to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const fromEmail = selected ? `${selected.name} <${selected.email}>` : "";
      const res = await fetch(`${apiBase}${apiPrefix}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: to.trim(),
          subject: subject.trim(),
          body_html: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
          identity_id: fromId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      onSent(data.thread_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      setSending(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative w-full max-w-xl mx-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-6 py-4 border-b border-white/[0.06]", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-[14px] font-medium text-white/80 tracking-wide", children: "New Message" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: onClose,
            className: "rounded-md p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { onSubmit: handleSend, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "px-6 py-4 space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-[12px] text-white/30 w-14 shrink-0 text-right", children: "From" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "select",
              {
                value: fromId,
                onChange: (e) => setFromId(e.target.value),
                className: "flex-1 appearance-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 focus:outline-none focus:border-white/20 transition-colors cursor-pointer",
                children: identities.map((identity) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: identity.id, className: "bg-[#0a0a0a] text-white/70", children: [
                  identity.name,
                  " <",
                  identity.email,
                  ">",
                  identity.role ? ` \u2014 ${identity.role}` : ""
                ] }, identity.id))
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-[12px] text-white/30 w-14 shrink-0 text-right", children: "To" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "email",
                value: to,
                onChange: (e) => setTo(e.target.value),
                placeholder: "recipient@example.com",
                required: true,
                className: "flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-[12px] text-white/30 w-14 shrink-0 text-right", children: "Subject" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "text",
                value: subject,
                onChange: (e) => setSubject(e.target.value),
                placeholder: "Email subject",
                required: true,
                className: "flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pt-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "textarea",
            {
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Write your message...",
              required: true,
              rows: 8,
              className: "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-[13px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
            }
          ) }),
          error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-red-400/80 text-[12px]", children: error }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "rounded-lg px-4 py-2 text-[12px] tracking-wide text-white/40 hover:text-white/60 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "submit",
              disabled: sending || !fromId || !to.trim() || !subject.trim() || !body.trim(),
              className: "rounded-lg bg-white/[0.08] px-5 py-2 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200",
              children: sending ? "Sending..." : "Send"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function Inbox({
  apiBase = "",
  apiPrefix = "/api",
  onThreadClick,
  className
}) {
  const [threads, setThreads] = (0, import_react.useState)([]);
  const [identities, setIdentities] = (0, import_react.useState)([]);
  const [selectedIdentity, setSelectedIdentity] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [showCompose, setShowCompose] = (0, import_react.useState)(false);
  const fetchThreads = (0, import_react.useCallback)(
    async (identityId) => {
      setLoading(true);
      try {
        const url = identityId ? `${apiBase}${apiPrefix}/threads?identity_id=${identityId}` : `${apiBase}${apiPrefix}/threads`;
        const res = await fetch(url);
        const data = await res.json();
        setThreads(data.threads ?? []);
      } catch {
        console.error("Failed to fetch threads");
      } finally {
        setLoading(false);
      }
    },
    [apiBase, apiPrefix]
  );
  const fetchIdentities = (0, import_react.useCallback)(async () => {
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/identities`);
      const data = await res.json();
      setIdentities(data.identities ?? []);
    } catch {
    }
  }, [apiBase, apiPrefix]);
  (0, import_react.useEffect)(() => {
    fetchIdentities();
    fetchThreads();
  }, [fetchIdentities, fetchThreads]);
  const handleIdentityChange = (identityId) => {
    setSelectedIdentity(identityId);
    fetchThreads(identityId || void 0);
  };
  const handleComposeSent = (threadId) => {
    setShowCompose(false);
    onThreadClick?.(threadId);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `h-full flex flex-col ${className ?? ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "shrink-0 border-b border-white/[0.06] px-6 py-5 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-lg font-medium text-white/90 tracking-tight", children: "Inbox" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-[11px] text-white/25 mt-0.5 tracking-wide", children: [
          threads.length,
          " conversation",
          threads.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
        identities.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          IdentityFilter,
          {
            identities,
            selected: selectedIdentity,
            onChange: handleIdentityChange
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            onClick: () => setShowCompose(true),
            disabled: identities.length === 0,
            className: "\n              flex items-center gap-2 rounded-lg bg-white/[0.08]\n              px-4 py-1.5 text-[12px] tracking-[0.08em] uppercase\n              text-white/70 font-light\n              hover:bg-white/[0.12] hover:text-white/90\n              disabled:opacity-30 disabled:cursor-not-allowed\n              transition-all duration-200\n            ",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 20h9" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" })
              ] }),
              "Compose"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-white/20 text-sm", children: "Loading..." }) }) : threads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: threads.map((thread) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadRow, { thread, onClick: onThreadClick }, thread.id)) }) }),
    showCompose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ComposeModal,
      {
        identities,
        apiBase,
        apiPrefix,
        onClose: () => setShowCompose(false),
        onSent: handleComposeSent
      }
    )
  ] });
}

// src/ui/thread.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 6e4);
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
    minute: "2-digit"
  });
}
function MessageCard({ message }) {
  const isOutbound = message.direction === "outbound";
  const senderDisplay = message.from_name || message.from_email;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `flex ${isOutbound ? "justify-end" : "justify-start"} mb-4`, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: `
          max-w-[75%] rounded-xl px-5 py-4
          ${isOutbound ? "bg-white/[0.06] border border-white/[0.08]" : "bg-blue-500/[0.06] border border-blue-400/[0.1]"}
        `,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `text-[12px] font-medium ${isOutbound ? "text-white/60" : "text-blue-300/70"}`, children: senderDisplay }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-[10px] text-white/20", children: message.from_email })
        ] }),
        message.body_html ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: "text-[13px] text-white/75 leading-relaxed [&_a]:text-blue-400/80 [&_a]:underline [&_p]:mb-2 [&_br]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-white/50",
            dangerouslySetInnerHTML: { __html: message.body_html }
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-[13px] text-white/75 leading-relaxed whitespace-pre-wrap", children: message.body_text || "No content" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `mt-3 flex ${isOutbound ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-[10px] text-white/20 tabular-nums", children: formatTime(message.received_at) }) })
      ]
    }
  ) });
}
function ReplyComposer({
  thread,
  lastInboundEmail,
  apiBase,
  apiPrefix,
  onSent
}) {
  const [to, setTo] = (0, import_react2.useState)(lastInboundEmail ?? "");
  const [subject, setSubject] = (0, import_react2.useState)(
    thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`
  );
  const [body, setBody] = (0, import_react2.useState)("");
  const [sending, setSending] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  async function handleSend(e) {
    e.preventDefault();
    if (!to.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: thread.identity_email,
          to: to.trim(),
          subject: subject.trim(),
          body_html: `<p>${body.replace(/\n/g, "<br>")}</p>`,
          identity_id: thread.identity_id,
          thread_id: thread.id
        })
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("form", { onSubmit: handleSend, className: "border-t border-white/[0.06] bg-white/[0.01] px-6 py-5", children: [
    error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-red-400/80 text-[12px]", children: error }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "text-[11px] tracking-wide text-white/30 w-14 shrink-0", children: "To" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "email",
            value: to,
            onChange: (e) => setTo(e.target.value),
            placeholder: "recipient@example.com",
            required: true,
            className: "flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "text-[11px] tracking-wide text-white/30 w-14 shrink-0", children: "Subject" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "text",
            value: subject,
            onChange: (e) => setSubject(e.target.value),
            required: true,
            className: "flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "textarea",
        {
          value: body,
          onChange: (e) => setBody(e.target.value),
          placeholder: "Write your reply...",
          rows: 4,
          required: true,
          className: "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors resize-none leading-relaxed"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-[10px] text-white/15", children: [
          "Sending as",
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-white/30", children: thread.identity_name }),
          " ",
          "<",
          thread.identity_email,
          ">"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "submit",
            disabled: sending || !to.trim() || !body.trim(),
            className: "rounded-lg bg-white/[0.08] px-6 py-2.5 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200",
            children: sending ? "Sending..." : "Send"
          }
        )
      ] })
    ] })
  ] });
}
function Thread({
  threadId,
  apiBase = "",
  apiPrefix = "/api",
  onBack,
  className
}) {
  const [thread, setThread] = (0, import_react2.useState)(null);
  const [messages, setMessages] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const messagesEndRef = (0, import_react2.useRef)(null);
  const fetchThread = (0, import_react2.useCallback)(async () => {
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/threads/${threadId}`);
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
  }, [apiBase, apiPrefix, threadId]);
  (0, import_react2.useEffect)(() => {
    fetchThread();
  }, [fetchThread]);
  (0, import_react2.useEffect)(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const lastInbound = [...messages].reverse().find((m) => m.direction === "inbound");
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-white/20 text-[13px] tracking-wide", children: "Loading..." }) });
  }
  if (error || !thread) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "h-full flex flex-col items-center justify-center gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-white/40 text-sm", children: error || "Thread not found" }),
      onBack && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          onClick: onBack,
          className: "text-[12px] text-white/30 hover:text-white/50 transition-colors",
          children: "Back to inbox"
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `h-full flex flex-col ${className ?? ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "shrink-0 border-b border-white/[0.06] px-6 py-4 flex items-center gap-4", children: [
      onBack && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          onClick: onBack,
          className: "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200",
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m15 18-6-6 6-6" }) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { className: "text-[15px] font-medium text-white/90 tracking-tight truncate", children: thread.subject }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mt-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-[11px] text-white/25", children: thread.identity_name }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-white/10", children: "|" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "span",
            {
              className: `
                inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-medium
                ${thread.status === "open" ? "text-emerald-400" : "text-white/30"}
              `,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `h-1 w-1 rounded-full ${thread.status === "open" ? "bg-emerald-400" : "bg-white/25"}` }),
                thread.status
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-white/10", children: "|" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-[11px] text-white/15 tabular-nums", children: [
            messages.length,
            " message",
            messages.length !== 1 ? "s" : ""
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-1 overflow-y-auto px-6 py-6", children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex flex-col items-center justify-center h-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-white/25 text-[13px]", children: "No messages yet" }) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "max-w-3xl mx-auto", children: [
      messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MessageCard, { message: msg }, msg.id)),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: messagesEndRef })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "shrink-0 max-w-3xl mx-auto w-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      ReplyComposer,
      {
        thread,
        lastInboundEmail: lastInbound?.from_email ?? null,
        apiBase,
        apiPrefix,
        onSent: fetchThread
      }
    ) })
  ] });
}

// src/ui/identities.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function Identities({
  apiBase = "",
  apiPrefix = "/api",
  domain,
  className
}) {
  const [identities, setIdentities] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [error, setError] = (0, import_react3.useState)(null);
  const [name, setName] = (0, import_react3.useState)("");
  const [email, setEmail] = (0, import_react3.useState)("");
  const [role, setRole] = (0, import_react3.useState)("");
  const [submitting, setSubmitting] = (0, import_react3.useState)(false);
  const [deletingId, setDeletingId] = (0, import_react3.useState)(null);
  const fetchIdentities = (0, import_react3.useCallback)(async () => {
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/identities`);
      if (!res.ok) throw new Error("Failed to fetch identities");
      const data = await res.json();
      setIdentities(data.identities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load identities");
    } finally {
      setLoading(false);
    }
  }, [apiBase, apiPrefix]);
  (0, import_react3.useEffect)(() => {
    fetchIdentities();
  }, [fetchIdentities]);
  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/identities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: role.trim() || void 0
        })
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
  async function handleDelete(id) {
    try {
      const res = await fetch(`${apiBase}${apiPrefix}/identities/${id}`, { method: "DELETE" });
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: `max-w-3xl mx-auto px-8 py-12 ${className ?? ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mb-10", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "text-2xl text-white/90 font-medium tracking-wide", children: "Identities" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "mt-2 text-[13px] text-white/30 tracking-wide", children: "Manage email identities your app can send and receive as." })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-red-400/80 text-[13px]", children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          onClick: () => setError(null),
          className: "mt-1 text-[11px] text-red-400/50 hover:text-red-400/70 transition-colors",
          children: "Dismiss"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "form",
      {
        onSubmit: handleCreate,
        className: "mb-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-[13px] tracking-[0.15em] uppercase text-white/40 font-light mb-5", children: "Add Identity" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-[11px] tracking-wide text-white/30 mb-1.5", children: "Name" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "input",
                {
                  type: "text",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  placeholder: "Jane Smith",
                  required: true,
                  className: "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-[11px] tracking-wide text-white/30 mb-1.5", children: "Email" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "input",
                {
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: domain ? `jane@${domain}` : "jane@example.com",
                  required: true,
                  className: "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-[11px] tracking-wide text-white/30 mb-1.5", children: "Role" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "input",
                {
                  type: "text",
                  value: role,
                  onChange: (e) => setRole(e.target.value),
                  placeholder: "Support, Sales, etc.",
                  className: "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "mt-5 flex justify-end", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "submit",
              disabled: submitting || !name.trim() || !email.trim(),
              className: "rounded-lg bg-white/[0.08] px-5 py-2.5 text-[12px] tracking-[0.1em] uppercase text-white/70 font-light hover:bg-white/[0.12] hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200",
              children: submitting ? "Adding..." : "Add Identity"
            }
          ) })
        ]
      }
    ),
    loading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-white/20 text-[13px] tracking-wide", children: "Loading..." }) }) : identities.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-col items-center justify-center py-20", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-12 h-12 rounded-full border border-white/[0.06] flex items-center justify-center mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "svg",
        {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "text-white/20",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "9", cy: "7", r: "4" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { x1: "19", y1: "8", x2: "19", y2: "14" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { x1: "22", y1: "11", x2: "16", y2: "11" })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-white/25 text-[13px] tracking-wide", children: "No identities yet" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-white/15 text-[12px] mt-1", children: "Add your first email identity above." })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-2", children: identities.map((identity) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: "group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-200",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[13px] text-white/50 font-light", children: identity.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-[14px] text-white/80", children: identity.name }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-3 mt-0.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[12px] text-white/30", children: identity.email }),
                identity.role && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-white/10", children: "|" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[12px] text-white/20", children: identity.role })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex items-center", children: deletingId === identity.id ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-red-400/60 mr-2", children: "Delete?" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                onClick: () => handleDelete(identity.id),
                className: "rounded-md bg-red-500/10 px-3 py-1.5 text-[11px] text-red-400/80 hover:bg-red-500/20 transition-colors",
                children: "Confirm"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                onClick: () => setDeletingId(null),
                className: "rounded-md px-3 py-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors",
                children: "Cancel"
              }
            )
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              onClick: () => setDeletingId(identity.id),
              className: "opacity-0 group-hover:opacity-100 rounded-md px-3 py-1.5 text-[11px] text-white/20 hover:text-red-400/60 transition-all duration-200",
              children: "Delete"
            }
          ) })
        ]
      },
      identity.id
    )) })
  ] });
}

// src/ui/layout.tsx
var import_link = __toESM(require("next/link"), 1);
var import_navigation = require("next/navigation");
var import_jsx_runtime4 = require("react/jsx-runtime");
function InboxLayout({
  children,
  basePath = "/inbox",
  className
}) {
  const pathname = (0, import_navigation.usePathname)();
  const tabs = [
    { label: "Threads", href: basePath },
    { label: "Identities", href: `${basePath}/identities` }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `h-full flex flex-col ${className ?? ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "shrink-0 border-b border-white/[0.06] px-6 pt-4", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex items-center gap-1", children: tabs.map((tab) => {
      const isActive = tab.href === basePath ? pathname === basePath || pathname.startsWith(`${basePath}/`) && !pathname.startsWith(`${basePath}/identities`) : pathname.startsWith(tab.href);
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_link.default,
        {
          href: tab.href,
          className: `
                  px-3 py-2 text-[12px] tracking-wide rounded-t-md
                  transition-colors duration-200 border-b-2
                  ${isActive ? "border-white/40 text-white/80" : "border-transparent text-white/30 hover:text-white/50"}
                `,
          children: tab.label
        },
        tab.href
      );
    }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex-1 overflow-hidden", children })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Identities,
  Inbox,
  InboxLayout,
  Thread
});
