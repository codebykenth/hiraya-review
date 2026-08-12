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
    avgScore: number;
    totalExams: number;
    strongestArea: string;
    weakestArea: string;
    chartData: ChartDataPoint[];
    categories: DashboardCategory[];
    passingRate: number;
    totalDuration: string;
    avgDuration: string;
    totalQuestionsSolved: number;
    daysUntilExam?: number | null;
    examDate?: string | null;
    examDateRaw?: string | null;
    examDescription?: string | null;
    filters?: {
        track: string;
        runs: string;
    };
}

export interface DashboardProps {
    stats?: DashboardStats | null;
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed';
        data: any | null;
    };
}
