import { Link, usePage } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[], label?: string }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { url } = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    let active = isCurrentUrl(item.href);

                    // Strict 1-liner comment: Highlight History sidebar tab if viewing past attempt details or reviewing answers
                    const hasAttemptId = url.includes('attempt_id=');
                    if (hasAttemptId) {
                        if (item.title === 'History') {
                            active = true;
                        } else if (item.title === 'Exam' || item.title === 'Practice') {
                            active = false;
                        }
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    "transition-all duration-200",
                                    active && "bg-blue-100/70 text-blue-700 font-bold shadow-xs dark:bg-blue-950/60 dark:text-blue-300 border-l-3 border-blue-600 pl-1.5 rounded-l-none"
                                )}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className={cn(active && "text-blue-700 dark:text-blue-400")} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
