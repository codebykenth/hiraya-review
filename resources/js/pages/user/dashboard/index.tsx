import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { AnnouncementsBanner } from '@/components/domain/announcements-banner';
import { PageContainer } from '@/components/layout/page-container';
import { AiReadinessBentoCard } from '@/pages/user/dashboard/components/ai-readiness-bento-card';
import { DailyGoalStreakCard } from '@/pages/user/dashboard/components/daily-goal-streak-card';
import { DashboardHero } from '@/pages/user/dashboard/components/dashboard-hero';
import { SmartStudyLaunchers } from '@/pages/user/dashboard/components/smart-study-launchers';
import { StudyScheduleActivityCard } from '@/pages/user/dashboard/components/study-schedule-activity-card';
import type { Auth } from '@/types';
import type { DashboardProps } from './types';

export default function Dashboard({
    stats,
    aiAnalysis,
    dailyGoal,
    todayTasks = [],
    recentAttempts = [],
    nextModule,
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    useEffect(() => {
        const pendingExam = localStorage.getItem('pending_free_exam');

        if (pendingExam) {
            window.location.href = '/exams';
        }
    }, []);

    const primaryWeakness = aiAnalysis?.data?.critical_weaknesses?.[0];

    return (
        <PageContainer className="gap-5 sm:gap-6">
            <Head title="Dashboard" />

            {/* Global Announcements Banner */}
            <AnnouncementsBanner />

            {/* High-Impact Integrated Hero Banner */}
            <DashboardHero
                firstName={firstName}
                stats={stats}
                motivationText={aiAnalysis?.data?.encouragement}
                streak={dailyGoal?.streak}
            />

            {/* Bento Grid: 4 Core Modules */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 sm:gap-6">
                {/* Card 1: AI Readiness & Coaching */}
                <AiReadinessBentoCard aiAnalysis={aiAnalysis} />

                {/* Card 2: Daily Study Streak & Goal Progress */}
                <DailyGoalStreakCard dailyGoal={dailyGoal} />

                {/* Card 3: Smart Contextual Study Launchers */}
                <SmartStudyLaunchers
                    nextModule={nextModule}
                    primaryWeakness={primaryWeakness}
                />

                {/* Card 4: Today's Tasks & Recent Exam Runs */}
                <StudyScheduleActivityCard
                    todayTasks={todayTasks}
                    recentAttempts={recentAttempts}
                />
            </div>
        </PageContainer>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};

