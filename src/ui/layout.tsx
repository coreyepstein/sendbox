"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface InboxLayoutProps {
  children: React.ReactNode;
  /** Base path for inbox routes. Defaults to "/inbox". */
  basePath?: string;
  className?: string;
}

/**
 * Inbox layout with tab navigation (Threads / Identities).
 * Wrap your inbox pages with this component.
 */
export function InboxLayout({
  children,
  basePath = "/inbox",
  className,
}: InboxLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Threads", href: basePath },
    { label: "Identities", href: `${basePath}/identities` },
  ];

  return (
    <div className={`h-full flex flex-col ${className ?? ""}`}>
      <div className="shrink-0 border-b border-white/[0.06] px-6 pt-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === basePath
                ? pathname === basePath ||
                  (pathname.startsWith(`${basePath}/`) &&
                    !pathname.startsWith(`${basePath}/identities`))
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  px-3 py-2 text-[12px] tracking-wide rounded-t-md
                  transition-colors duration-200 border-b-2
                  ${
                    isActive
                      ? "border-white/40 text-white/80"
                      : "border-transparent text-white/30 hover:text-white/50"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
