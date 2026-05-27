import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileQuestion, FileText, History, LayoutGrid, Shield, Sparkles, Target, ListChecks, Users, Compass } from 'lucide-react';
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
    SidebarSeparator
} from '@/components/ui/sidebar';
import { dashboard, guide } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminLearnIndex, drafts as adminLearnDrafts } from '@/routes/admin/learn';
import { index as adminUsersIndex } from '@/routes/admin/users';
import { index as drillsIndex } from '@/routes/drills';
import { index as examsIndex } from '@/routes/exams';
import { index as historyIndex } from '@/routes/history';
import { index as learnIndex } from '@/routes/learn';
import { index as questionsIndex, drafts as questionsDrafts } from '@/routes/questions';

import type { NavItem } from '@/types';

const generalNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Learn',
        href: learnIndex(),
        icon: BookOpen,
    },
    {
        title: 'Practice Drill',
        href: drillsIndex(),
        icon: Target,
    },
    {
        title: 'Mock Exam',
        href: examsIndex(),
        icon: ClipboardList,
    },
    {
        title: 'History',
        href: historyIndex(),
        icon: History,
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
        icon: Shield,
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
            }
        ]
    },
    {
        title: 'Learn',
        icon: BookOpen,
        items: [
            {
                title: 'Learn Management',
                href: adminLearnIndex(),
                icon: Sparkles,
            },
            {
                title: 'Drafts Review',
                href: adminLearnDrafts(),
                icon: ListChecks,
            }
        ]
    },
    {
        title: 'Users',
        icon: Users,
        items: [
            {
                title: 'User Management',
                href: adminUsersIndex(),
                icon: ListChecks,
            }
        ]
    }
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden">
                <NavMain items={generalNavItems} />

                {isAdmin && <>
                    <SidebarSeparator className='my-2' />
                    <NavMain items={adminNavItems} label='Administrator' />
                </>}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
