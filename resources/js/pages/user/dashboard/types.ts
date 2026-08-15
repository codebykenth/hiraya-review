export interface CategoryScore {
    name: string;
    correct: number;
    total: number;
    percentage: number;
}

export interface ChartDataPoint {
    score: number;
    label: string;
    date: string;
    track: string;
    detail: string;
    categoryScores?: CategoryScore[];
}

export interface DashboardCategory {
    name: string;
    percentage: number;
    color: string;
    correct: number;
    total: number;
}

export interface DashboardStats {
    daysUntilExam?: number | null;
    examDate?: string | null;
    examDateRaw?: string | null;
    examDescription?: string | null;
    avgScore?: number;
    totalExams?: number;
    strongestArea?: string;
    weakestArea?: string;
    chartData?: ChartDataPoint[];
    categories?: DashboardCategory[];
    passingRate?: number;
    totalDuration?: string;
    avgDuration?: string;
    totalQuestionsSolved?: number;
    filters?: {
        track: string;
        runs: string;
    };
}

export interface DailyGoalStats {
    streak: number;
    questionsToday: number;
    goalTarget: number;
}

export interface TodayTaskItem {
    id: number;
    title: string;
    description?: string | null;
    study_time?: string | null;
    is_done: boolean;
    subcategory_name?: string | null;
    category_name?: string | null;
}

export interface RecentAttemptItem {
    id: number;
    title: string;
    score_percentage: number;
    passed: boolean;
    is_mock: boolean;
    total_questions: number;
    duration_text: string;
    created_at_human: string;
}

export interface NextModuleItem {
    id: number;
    title: string;
    slug: string;
    topic: string;
    category_name?: string | null;
    estimated_minutes: number;
}

export interface AiAnalysisData {
    pass_probability: number;
    verdict: string;
    trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
    strengths: string[];
    critical_weaknesses: string[];
    priority_action: string;
    recommended_modules: string[];
    encouragement: string;
    subject_mastery?: Array<{
        subject: string;
        rating: string;
        color: 'rose' | 'amber' | 'emerald' | 'sky';
        insight: string;
        recommended_action: string;
    }>;
    remediation_topics?: Array<{
        subtopic: string;
        difficulty_level: 'Hard' | 'Medium' | 'Easy';
        reason_for_struggle: string;
        coaching_tip: string;
    }>;
}

export interface DashboardProps {
    stats?: DashboardStats | null;
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed' | 'no_exam_date';
        data: AiAnalysisData | null;
    };
    dailyGoal?: DailyGoalStats;
    todayTasks?: TodayTaskItem[];
    recentAttempts?: RecentAttemptItem[];
    nextModule?: NextModuleItem | null;
}

