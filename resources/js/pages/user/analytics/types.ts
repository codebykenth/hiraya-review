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

export interface SubtestThreshold {
    category: string;
    score: number;
    passed: boolean;
}

export interface SubcategoryAnalytics {
    id?: number;
    name: string;
    percentage: number;
    correct: number;
    total: number;
}

export interface PacingTrend {
    name: string;
    date: string;
    secondsPerQuestion: number;
    accuracy: number;
}

export interface AttemptBreakdown {
    name: string;
    date: string;
    Verbal: number;
    Clerical: number;
    General: number;
    Numerical: number;
    Analytical: number;
}

export interface AnalyticsCategory {
    name: string;
    percentage: number;
    color: string;
    correct: number;
    total: number;
    subcategories?: SubcategoryAnalytics[];
}

export interface AnalyticsStats {
    avgScore: number;
    totalExams: number;
    strongestArea: string;
    weakestArea: string;
    chartData: ChartDataPoint[];
    categories: AnalyticsCategory[];
    passingRate: number;
    totalDuration: string;
    avgDuration: string;
    totalQuestionsSolved: number;
    daysUntilExam?: number | null;
    examDate?: string | null;
    examDateRaw?: string | null;
    cseReadinessIndex?: number;
    subtestThresholds?: SubtestThreshold[];
    hasSubtestRisk?: boolean;
    percentileRank?: number;
    isIncompleteSyllabus?: boolean;
    coveredCategoriesCount?: number;
    mockExamCount?: number;
    filters?: {
        track: string;
        runs: string;
    };
    pacingTrend?: PacingTrend[];
    attemptBreakdowns?: AttemptBreakdown[];
}

export interface AnalyticsProps {
    stats?: AnalyticsStats | null;
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed' | 'no_exam_date';
        data: any | null;
    };
}

