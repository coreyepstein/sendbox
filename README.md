# sendbox

Drop-in email inbox for Next.js. Unlimited identities on any verified domain. Powered by [Resend](https://resend.com) + Postgres.

```
npm install sendbox
```

## What You Get

- **Send email** from any `@yourdomain.com` address
- **Receive email** via Resend inbound webhooks
- **Thread management** — automatic threading by headers and subject
- **Inbox UI** — dark-themed React components (thread list, conversation view, compose, identity management)
- **Unlimited identities** — email aliases are just database rows, no per-seat cost

## Quick Start

### 1. Set Up Database

Run `schema.sql` against your Postgres database (Neon, Supabase, or any Postgres):

```sql
-- Copy from node_modules/sendbox/schema.sql
-- Creates: identities, threads, messages tables
```

### 2. Set Environment Variables

```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
```

### 3. Wire Up API Routes

```ts
// app/api/emails/send/route.ts
import { createSendHandler } from "sendbox/handlers";
export const POST = createSendHandler();

// app/api/webhooks/email/route.ts
import { createWebhookHandler } from "sendbox/handlers";
export const POST = createWebhookHandler();
```

You'll also need basic CRUD routes for the UI to call:

```ts
// app/api/identities/route.ts
import { getIdentities, createIdentity } from "sendbox";
import { NextResponse } from "next/server";

export async function GET() {
  const identities = await getIdentities();
  return NextResponse.json({ identities });
}

export async function POST(req: Request) {
  const body = await req.json();
  const identity = await createIdentity(body);
  return NextResponse.json({ identity });
}

// app/api/threads/route.ts
import { getThreadsWithPreview } from "sendbox";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const identityId = req.nextUrl.searchParams.get("identity_id") || undefined;
  const threads = await getThreadsWithPreview(identityId);
  return NextResponse.json({ threads });
}

// app/api/threads/[id]/route.ts
import { getThreadWithIdentity, getThreadMessages } from "sendbox";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const thread = await getThreadWithIdentity(params.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await getThreadMessages(params.id);
  return NextResponse.json({ thread, messages });
}
```

### 4. Drop In the UI

```tsx
// app/inbox/page.tsx
"use client";
import { Inbox } from "sendbox/ui";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const router = useRouter();
  return <Inbox onThreadClick={(id) => router.push(`/inbox/${id}`)} />;
}

// app/inbox/[threadId]/page.tsx
"use client";
import { Thread } from "sendbox/ui";
import { useRouter, useParams } from "next/navigation";

export default function ThreadPage() {
  const router = useRouter();
  const { threadId } = useParams();
  return <Thread threadId={threadId as string} onBack={() => router.push("/inbox")} />;
}

// app/inbox/identities/page.tsx
"use client";
import { Identities } from "sendbox/ui";

export default function IdentitiesPage() {
  return <Identities domain="yourdomain.com" />;
}

// app/inbox/layout.tsx
"use client";
import { InboxLayout } from "sendbox/ui";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <InboxLayout>{children}</InboxLayout>;
}
```

### 5. Configure Resend + DNS

1. Verify your domain in [Resend](https://resend.com/domains)
2. Add MX, SPF, DKIM records to your DNS
3. Set up an inbound webhook pointing to `https://yourdomain.com/api/webhooks/email`

## Exports

### `sendbox` (main)

**Types:** `Identity`, `Thread`, `ThreadWithPreview`, `Message`, `InboundEmailPayload`, `ProcessResult`, `SendboxConfig`, `HandlerOptions`

**Config:** `configureSendbox(config)` — set custom SQL executor, API keys, or database URL

**DB:** `getIdentities`, `createIdentity`, `deleteIdentity`, `getThreads`, `createThread`, `getThreadsWithPreview`, `getThread`, `getThreadWithIdentity`, `getThreadMessages`, `createMessage`

**Email:** `processInboundEmail`, `matchIdentity`, `matchThread`, `normalizeSubject`, `parseEmailAddress`

**Resend:** `getResend` — returns the Resend client singleton

### `sendbox/handlers`

**`createSendHandler(options?)`** — Next.js POST handler for outbound email

**`createWebhookHandler(options?)`** — Next.js POST handler for Resend inbound webhooks

Both accept `HandlerOptions`:
```ts
{
  authorize?: (req: Request) => Promise<void> | void;
  onMessageSent?: (data) => Promise<void> | void;
  onMessageReceived?: (data) => Promise<void> | void;
}
```

### `sendbox/ui`

**`<Inbox />`** — Thread list with identity filter and compose modal. Props: `apiBase?`, `onThreadClick?`, `className?`

**`<Thread />`** — Conversation view with reply composer. Props: `threadId`, `apiBase?`, `onBack?`, `className?`

**`<Identities />`** — Identity CRUD. Props: `apiBase?`, `domain?`, `className?`

**`<InboxLayout />`** — Tab navigation wrapper. Props: `basePath?`, `className?`

## Custom SQL Adapter

By default, sendbox uses `@neondatabase/serverless`. To use a different Postgres client:

```ts
import { configureSendbox } from "sendbox";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
configureSendbox({ sql: sql as any });
```

## Architecture

```
Inbound:  MX → Resend → webhook POST /api/webhooks/email → Postgres
Outbound: Compose UI → POST /api/emails/send → Resend API → Postgres
UI:       React components fetch from /api/* routes
```

## Requirements

- Next.js 14+
- React 18+
- PostgreSQL (Neon recommended for serverless)
- [Resend](https://resend.com) account with verified domain
- Tailwind CSS (for UI components)

## License

MIT
