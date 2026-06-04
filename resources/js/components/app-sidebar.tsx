import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    FileQuestion,
    FileText,
    History,
    LayoutDashboard,
    Gauge,
    Sparkles,
    Target,
    ListChecks,
    Users,
    Settings,
    Compass,
    Database,
    Calendar as CalendarIcon,
    TrendingUp,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { guide } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    index as adminLearnIndex,
    drafts as adminLearnDrafts,
} from '@/routes/admin/learn';
import { index as adminUsersIndex } from '@/routes/admin/users';
import { index as analyticsIndex } from '@/routes/analytics';
import { index as dashboardIndex } from '@/routes/dashboard';
import { index as drillsIndex } from '@/routes/drills';
import { index as examsIndex } from '@/routes/exams';
import { index as historyIndex } from '@/routes/history';
import { index as learnIndex } from '@/routes/learn';
import {
    index as questionsIndex,
    drafts as questionsDrafts,
} from '@/routes/questions';
import { index as calendarIndex } from '@/routes/study-schedules/index';

import type { NavItem, Auth } from '@/types';

const generalNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboardIndex(),
        icon: LayoutDashboard,
    },
    {
        title: 'Study Plan',
        href: calendarIndex(),
        icon: CalendarIcon,
    },
    {
        title: 'Learn',
        href: learnIndex(),
        icon: BookOpen,
    },
    {
        title: 'Practice Drills',
        href: drillsIndex(),
        icon: Target,
    },
    {
        title: 'Mock Exams',
        href: examsIndex(),
        icon: ClipboardList,
    },
    {
        title: 'History',
        href: historyIndex(),
        icon: History,
    },
    {
        title: 'Analytics',
        href: analyticsIndex(),
        icon: TrendingUp,
    },
    {
        title: 'Reviewer Guide',
        href: guide(),
        icon: Compass,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: Gauge,
    },
    {
        title: 'Questions',
        icon: FileQuestion,
        items: [
            {
                title: 'Question Management',
                href: questionsIndex(),
                icon: FileText,
            },
            {
                title: 'Drafts Review',
                href: questionsDrafts(),
                icon: ListChecks,
            },
        ],
    },
    {
        title: 'Modules',
        icon: BookOpen,
        items: [
            {
                title: 'Module Management',
                href: adminLearnIndex(),
                icon: Sparkles,
            },
            {
                title: 'Drafts Review',
                href: adminLearnDrafts(),
                icon: ListChecks,
            },
        ],
    },
    {
        title: 'Users',
        href: adminUsersIndex(),
        icon: Users,
    },
    {
        title: 'Settings',
        icon: Settings,
        items: [
            {
                title: 'Syllabus Scope',
                href: '/admin/syllabus',
                icon: Database,
            },
            {
                title: 'Exam Dates',
                href: '/admin/exam-dates',
                icon: CalendarIcon,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="xl" asChild>
                            <Link href={dashboardIndex()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden">
                <NavMain items={generalNavItems} />

                {isAdmin && (
                    <>
                        <SidebarSeparator className="my-2" />
                        <NavMain items={adminNavItems} label="Administrator" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
