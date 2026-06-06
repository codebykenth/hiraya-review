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
    Compass,
    Database,
    Calendar as CalendarIcon,
    TrendingUp,
    Activity,
    Eye,
    Megaphone,
    MessageSquareWarning,
} from 'lucide-react';
import AppLogo from '@/components/layout/app-logo';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
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

import type { NavItem } from '@/types';

const generalNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboardIndex(),
        icon: LayoutDashboard,
    },
    {
        title: 'Reviewer Guide',
        href: guide(),
        icon: Compass,
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
];

const adminCoreItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: Gauge,
    },
    {
        title: 'Users',
        href: adminUsersIndex(),
        icon: Users,
    },
    {
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Megaphone,
    },
    {
        title: 'Flagged Content',
        href: '/admin/feedbacks',
        icon: MessageSquareWarning,
    },
    {
        title: 'Legal Content',
        href: '/admin/legal-content/edit',
        icon: FileText,
    },
];

const adminContentItems: NavItem[] = [
    {
        title: 'Syllabus Scope',
        href: '/admin/syllabus',
        icon: Database,
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
        title: 'Exam Dates',
        href: '/admin/exam-dates',
        icon: CalendarIcon,
    },
];

const adminSystemItems: NavItem[] = [
    {
        title: 'View Management',
        href: '/admin/view-management',
        icon: Eye,
    },
    {
        title: 'System Actions',
        href: '/admin/system',
        icon: Activity,
    },
];

const viewMap: Record<string, string> = {
    Dashboard: 'dashboard',
    'Reviewer Guide': 'reviewer-guide',
    'Study Plan': 'study-plan',
    Learn: 'learn',
    'Practice Drills': 'practice-drills',
    'Mock Exams': 'mock-exams',
    History: 'history',
    Analytics: 'analytics',
};

export function AppSidebar() {
    const { auth } = usePage<{ auth: any }>().props;
    const isAdmin = auth.user?.role === 'admin';
    const rolePermissions = auth.permissions?.[auth.user?.role || 'user'] || {};

    const visibleGeneralItems = generalNavItems.filter((item) => {
        const viewId = viewMap[item.title];

        if (viewId && rolePermissions[viewId] !== undefined) {
            const val = String(rolePermissions[viewId]);

            if (val === 'false' || val === '0') {
                return false;
            }
        }

        return true;
    });

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
                <NavMain items={visibleGeneralItems} />

                {isAdmin && (
                    <>
                        {visibleGeneralItems.length > 0 && (
                            <SidebarSeparator className="my-2" />
                        )}
                        <NavMain
                            items={adminCoreItems}
                            label="Administration"
                        />
                        <NavMain
                            items={adminContentItems}
                            label="Curriculum & Content"
                        />
                        <NavMain
                            items={adminSystemItems}
                            label="System & Security"
                        />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
