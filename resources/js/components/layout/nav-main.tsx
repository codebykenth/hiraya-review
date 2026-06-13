import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { url } = usePage();

    const isSubActive = useCallback(
        (sub: NavItem, siblingItems: NavItem[]) => {
            const currentPath = url.split('?')[0];
            const cleanSubHref = sub.href ? toUrl(sub.href).split('?')[0] : '';

            if (currentPath === cleanSubHref) {
                return true;
            }

            const isParentOfCurrent =
                cleanSubHref && currentPath.startsWith(cleanSubHref + '/');

            if (isParentOfCurrent) {
                const hasBetterExactMatch = siblingItems.some(
                    (sibling) =>
                        sibling.href !== sub.href &&
                        sibling.href &&
                        currentPath === toUrl(sibling.href).split('?')[0],
                );

                return !hasBetterExactMatch;
            }

            return false;
        },
        [url],
    );

    // Smart auto-expansion state: automatically expand sections where a sub-item is active
    const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};

        for (const item of items) {
            if (item.items) {
                const hasActiveChild = item.items.some((sub) =>
                    isSubActive(sub, item.items || []),
                );

                if (hasActiveChild) {
                    initial[item.title] = true;
                    break;
                }
            }
        }

        return initial;
    });

    // Sync auto-expansion if the URL shifts externally
    useEffect(() => {
        const next: Record<string, boolean> = {};

        for (const item of items) {
            if (item.items) {
                const hasActiveChild = item.items.some((sub) =>
                    isSubActive(sub, item.items || []),
                );

                if (hasActiveChild) {
                    next[item.title] = true;
                    break;
                }
            }
        }

        const timer = setTimeout(() => {
            setOpenItems(next);
        }, 0);

        return () => clearTimeout(timer);
    }, [url, items, isSubActive]);

    const toggleItem = (title: string) => {
        setOpenItems((prev) => {
            const next: Record<string, boolean> = {};

            if (!prev[title]) {
                next[title] = true;
            }

            return next;
        });
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                className={cn(
                    'transition-all duration-200',
                    label === 'Administrator' &&
                        'text-blue-650/90 mt-4.5 mb-1.5 text-[9.5px] font-black tracking-widest uppercase dark:text-blue-400',
                )}
            >
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                        const isOpen = !!openItems[item.title];
                        const hasActiveChild = item.items!.some((sub) =>
                            isSubActive(sub, item.items || []),
                        );

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    onClick={() => toggleItem(item.title)}
                                    isActive={hasActiveChild && !isOpen}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center justify-between transition-all duration-200',
                                        hasActiveChild &&
                                            'font-bold text-blue-700 dark:text-blue-300',
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    hasActiveChild &&
                                                        'text-blue-700 dark:text-blue-400',
                                                )}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </div>
                                    <ChevronRight
                                        className={cn(
                                            'size-3.5 shrink-0 text-slate-400 transition-transform duration-200',
                                            isOpen &&
                                                'rotate-90 text-slate-700 dark:text-white',
                                        )}
                                    />
                                </SidebarMenuButton>

                                {/* Dropdown Sub-menu List */}
                                {isOpen && (
                                    <SidebarMenuSub className="mt-1 transition-all duration-200 ease-in-out">
                                        {item.items!.map((sub) => {
                                            const subActive = isSubActive(
                                                sub,
                                                item.items || [],
                                            );

                                            return (
                                                <SidebarMenuSubItem
                                                    key={sub.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subActive}
                                                        className={cn(
                                                            'cursor-pointer py-1.5 transition-all duration-200',
                                                            subActive &&
                                                                'text-blue-750 shadow-3xs bg-blue-100/50 font-normal dark:bg-blue-950/40 dark:text-blue-300',
                                                        )}
                                                    >
                                                        <Link href={sub.href}>
                                                            {sub.icon && (
                                                                <sub.icon className="size-3.5 shrink-0" />
                                                            )}
                                                            <span>
                                                                {sub.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        );
                    }

                    // Standard Flat Sidebar Item
                    let active = item.href ? isCurrentUrl(item.href) : false;

                    // Support highlighting History when drilling attempts are active
                    const hasAttemptId = url.includes('attempt_id=');

                    if (hasAttemptId) {
                        if (item.title === 'History') {
                            active = true;
                        } else {
                            active = false;
                        }
                    }

                    // Support highlighting Learn when on Study Tutorial page
                    const currentPath = url.split('?')[0];

                    if (
                        item.title === 'Learn' &&
                        currentPath.startsWith('/learn/')
                    ) {
                        active = true;
                    }

                    // Support highlighting Dashboard when on AI Diagnostic Report page (/ai-analysis)
                    if (
                        item.title === 'Dashboard' &&
                        item.href === '/dashboard' &&
                        currentPath === '/ai-analysis'
                    ) {
                        active = true;
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'transition-all duration-200',
                                    active &&
                                        'rounded-l-none border-l-3 border-blue-600 bg-blue-100/70 pl-1.5 font-bold text-blue-700 shadow-xs dark:bg-blue-950/60 dark:text-blue-300',
                                )}
                            >
                                <Link href={item.href || '#'}>
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                active &&
                                                    'text-blue-700 dark:text-blue-400',
                                            )}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
