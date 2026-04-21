import * as react_jsx_runtime from 'react/jsx-runtime';

interface InboxProps {
    /** Base URL for API calls. Defaults to "". */
    apiBase?: string;
    /** Path prefix appended to apiBase before each resource. Defaults to "/api". */
    apiPrefix?: string;
    /** Called when a thread is clicked. Receives thread ID. */
    onThreadClick?: (threadId: string) => void;
    className?: string;
}
/**
 * Email inbox — thread list with identity filter, compose button, and search.
 */
declare function Inbox({ apiBase, apiPrefix, onThreadClick, className, }: InboxProps): react_jsx_runtime.JSX.Element;

interface ThreadProps {
    /** The thread ID to display. */
    threadId: string;
    /** Base URL for API calls. Defaults to "". */
    apiBase?: string;
    /** Path prefix appended to apiBase before each resource. Defaults to "/api". */
    apiPrefix?: string;
    /** Called when the back button is clicked. */
    onBack?: () => void;
    className?: string;
}
/**
 * Thread conversation view — displays messages and reply composer.
 */
declare function Thread({ threadId, apiBase, apiPrefix, onBack, className, }: ThreadProps): react_jsx_runtime.JSX.Element;

interface IdentitiesProps {
    /** Base URL for API calls. Defaults to "". */
    apiBase?: string;
    /** Path prefix appended to apiBase before each resource. Defaults to "/api". */
    apiPrefix?: string;
    /** Placeholder domain for the email field. */
    domain?: string;
    className?: string;
}
/**
 * Identity management component — list, create, and delete email identities.
 */
declare function Identities({ apiBase, apiPrefix, domain, className, }: IdentitiesProps): react_jsx_runtime.JSX.Element;

interface InboxLayoutProps {
    children: React.ReactNode;
    /** Base path for inbox routes. Defaults to "/inbox". */
    basePath?: string;
    className?: string;
}
/**
 * Inbox layout with tab navigation (Threads / Identities).
 * Wrap your inbox pages with this component.
 */
declare function InboxLayout({ children, basePath, className, }: InboxLayoutProps): react_jsx_runtime.JSX.Element;

export { Identities, type IdentitiesProps, Inbox, InboxLayout, type InboxLayoutProps, type InboxProps, Thread, type ThreadProps };
