import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[], label?: string }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { url } = usePage();

    // Smart auto-expansion state: automatically expand sections where a sub-item is active
    const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        for (const item of items) {
            if (item.items) {
                const hasActiveChild = item.items.some(sub => isCurrentUrl(sub.href));
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
                const hasActiveChild = item.items.some(sub => isCurrentUrl(sub.href));
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
    }, [url, items, isCurrentUrl]);

    const toggleItem = (title: string) => {
        setOpenItems(prev => {
            const next: Record<string, boolean> = {};
            if (!prev[title]) {
                next[title] = true;
            }
            return next;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className={cn(
                "transition-all duration-200",
                label === 'Administrator' && "font-black tracking-widest text-blue-650/90 uppercase text-[9.5px] dark:text-blue-400 mt-4.5 mb-1.5"
            )}>
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                        const isOpen = !!openItems[item.title];
                        const hasActiveChild = item.items!.some(sub => isCurrentUrl(sub.href));

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    onClick={() => toggleItem(item.title)}
                                    isActive={hasActiveChild && !isOpen}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        "w-full transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 cursor-pointer flex items-center justify-between",
                                        hasActiveChild && "text-blue-700 font-bold dark:text-blue-300"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon className={cn(hasActiveChild && "text-blue-700 dark:text-blue-400")} />}
                                        <span>{item.title}</span>
                                    </div>
                                    <ChevronRight className={cn(
                                        "size-3.5 transition-transform duration-200 text-slate-400 shrink-0",
                                        isOpen && "rotate-90 text-slate-700 dark:text-white"
                                    )} />
                                </SidebarMenuButton>

                                {/* Dropdown Sub-menu List */}
                                {isOpen && (
                                    <SidebarMenuSub className="transition-all duration-200 ease-in-out mt-1">
                                        {item.items!.map((sub) => {
                                            const subActive = isCurrentUrl(sub.href);
                                            return (
                                                <SidebarMenuSubItem key={sub.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subActive}
                                                        className={cn(
                                                            "transition-all duration-200 cursor-pointer py-1.5",
                                                            subActive && "bg-blue-100/50 text-blue-750 font-normal shadow-3xs dark:bg-blue-950/40 dark:text-blue-300"
                                                        )}
                                                    >
                                                        <Link href={sub.href}>
                                                            {sub.icon && <sub.icon className="size-3.5 shrink-0" />}
                                                            <span>{sub.title}</span>
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
                                <Link href={item.href || '#'}>
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
