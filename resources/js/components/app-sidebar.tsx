import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileQuestion, FileText, FolderGit2, History, LayoutGrid, Shield, Sparkles, Target, ListChecks } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as examsIndex } from '@/routes/exams';
import { index as historyIndex } from '@/routes/history';
import { index as drillsIndex } from '@/routes/drills';
import { index as questionsIndex, drafts as questionsDrafts } from '@/routes/questions';

import type { NavItem } from '@/types';

const generalNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Mock Exam',
        href: examsIndex(),
        icon: ClipboardList,
    },
    {
        title: 'Practice Drill',
        href: drillsIndex(),
        icon: Target,
    },
    {
        title: 'History',
        href: historyIndex(),
        icon: History,
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
        href: questionsIndex(),
        icon: FileQuestion,
    },
    {
        title: 'Drafts Review',
        href: questionsDrafts(),
        icon: ListChecks,
    }
];


const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    // const sidebarItems = isAdmin ? [...generalNavItems, ...adminNavItems] : generalNavItems;
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
