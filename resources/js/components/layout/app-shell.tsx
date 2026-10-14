import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const pageProps = usePage().props as { sidebarOpen?: boolean };

    const isOpen =
        typeof document !== 'undefined'
            ? (() => {
                  const match = document.cookie.match(
                      /(?:^|; )sidebar_state=([^;]*)/,
                  );
                  return match
                      ? match[1] === 'true'
                      : (pageProps.sidebarOpen ?? true);
              })()
            : (pageProps.sidebarOpen ?? true);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
