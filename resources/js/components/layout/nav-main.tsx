import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { useIsTutorThinking } from '@/pages/user/tutor/services/tutor-chat-service';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl, currentUrl, setOptimisticUrl } = useCurrentUrl();
    const { url } = usePage();
    const { isMobile, setOpenMobile } = useSidebar();
    const isTutorThinking = useIsTutorThinking();

    // effectivePath updates immediately on click / navigation start
    const effectivePath = currentUrl;

    const handleNavClick = useCallback(
        (href?: string | NonNullable<InertiaLinkProps['href']>) => {
            if (href && href !== '#') {
                setOptimisticUrl(toUrl(href));
            }

            if (isMobile) {
                setOpenMobile(false);
            }
        },
        [isMobile, setOpenMobile, setOptimisticUrl],
    );

    const isSubActive = useCallback(
        (sub: NavItem, siblingItems: NavItem[]) => {
            const cleanSubHref = sub.href ? toUrl(sub.href).split('?')[0] : '';

            if (effectivePath === cleanSubHref) {
                return true;
            }

            const isParentOfCurrent =
                cleanSubHref && effectivePath.startsWith(cleanSubHref + '/');

            if (isParentOfCurrent) {
                const hasBetterExactMatch = siblingItems.some(
                    (sibling) =>
                        sibling.href !== sub.href &&
                        sibling.href &&
                        effectivePath === toUrl(sibling.href).split('?')[0],
                );

                return !hasBetterExactMatch;
            }

            return false;
        },
        [effectivePath],
    );

    // Smart auto-expansion: sections with an active sub-item are expanded by
    // default, while manual toggles are tracked in openItems.
    const activeSectionTitle = items.find((item) =>
        item.items?.some((sub) => isSubActive(sub, item.items || [])),
    )?.title;

    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const isItemOpen = (title: string) =>
        openItems[title] ?? title === activeSectionTitle;

    const toggleItem = (title: string) => {
        setOpenItems({ [title]: !isItemOpen(title) });
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
                        const isOpen = isItemOpen(item.title);
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
                                                        <Link
                                                            href={sub.href}
                                                            prefetch="hover"
                                                            onClick={() =>
                                                                handleNavClick(
                                                                    sub.href,
                                                                )
                                                            }
                                                        >
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
                    const hasAttemptId = (effectivePath || url).includes(
                        'attempt_id=',
                    );

                    if (hasAttemptId) {
                        if (item.title === 'History') {
                            active = true;
                        } else {
                            active = false;
                        }
                    }

                    // Support highlighting Learn when on Study Tutorial page
                    if (
                        item.title === 'Learn' &&
                        effectivePath.startsWith('/learn/')
                    ) {
                        active = true;
                    }

                    // Support highlighting Dashboard when on AI Diagnostic Report page (/ai-analysis)
                    if (
                        item.title === 'Dashboard' &&
                        item.href === '/dashboard' &&
                        effectivePath === '/ai-analysis'
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
                                <Link
                                    href={item.href || '#'}
                                    prefetch={
                                        item.href && item.href !== '#'
                                            ? 'hover'
                                            : false
                                    }
                                    onClick={() => handleNavClick(item.href)}
                                >
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                active &&
                                                    'text-blue-700 dark:text-blue-400',
                                            )}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                    {item.title === 'AI Tutor' &&
                                        isTutorThinking && (
                                            <span className="shadow-3xs ml-auto flex items-center gap-1 rounded-full bg-blue-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                <Sparkles className="size-2.5 animate-spin" />
                                                <span className="animate-pulse">
                                                    Thinking...
                                                </span>
                                            </span>
                                        )}
                                    {item.badge &&
                                        item.badge > 0 &&
                                        !isTutorThinking && (
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
