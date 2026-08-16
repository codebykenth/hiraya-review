import {
    Sparkles,
    Clock,
    CheckCircle2,
    BookOpen,
    Layers,
    Zap,
    Scale,
    Calculator,
    AlertCircle,
    Brain,
    FileText,
    FolderCheck,
    CalendarCheck,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface StudyPlanTemplate {
    id: string;
    title: string;
    subtitle: string;
    category: 'comprehensive' | 'verbal' | 'numerical' | 'analytical' | 'gen_info' | 'clerical';
    duration_days: number;
    badge: string;
    description: string;
    topics: string[];
}

const DEFAULT_TEMPLATES: StudyPlanTemplate[] = [
    {
        id: '60_day_deep_mastery',
        title: '60-Day Deep Mastery Track',
        subtitle: 'Thorough 2-month pace covering all syllabus concepts',
        category: 'comprehensive',
        duration_days: 60,
        badge: 'Complete Mastery',
        description:
            'A relaxed, in-depth daily pace (1 topic per day) with foundational reviews, weekly skill checkpoints, and bi-weekly full mock exams.',
        topics: [
            'Days 1-15: Verbal Ability & English Mechanics (Grammar, Vocab, Reading)',
            'Days 16-30: Numerical Ability & Problem Solving (Fractions, Algebra, Word Problems)',
            'Days 31-45: Analytical Ability & Deductive Logic (Analogies, Syllogisms, Series)',
            'Days 46-52: General Information, Philippine Constitution & RA 6713 Ethics',
            'Days 53-60: Comprehensive Mock Exam Marathon & Weakness Targeted Drills',
        ],
    },
    {
        id: '30_day_comprehensive',
        title: '30-Day Complete CSE Sprint',
        subtitle: 'Full syllabus coverage with weekly mock checkpoints',
        category: 'comprehensive',
        duration_days: 30,
        badge: 'Most Popular',
        description:
            'A balanced daily study regimen covering Verbal, Numerical, Analytical, and General Information with built-in review checkpoints.',
        topics: [
            'Days 1-7: Verbal Ability & Grammar Mastery',
            'Days 8-14: Numerical Ability & Problem Solving',
            'Days 15-21: Analytical Ability & Logical Reasoning',
            'Days 22-26: Philippine Constitution & RA 6713',
            'Days 27-30: Full Mock Exam Simulations & Drills',
        ],
    },
    {
        id: '14_day_crash_course',
        title: '14-Day High-Yield Crash Course',
        subtitle: 'Accelerated high-frequency exam topics',
        category: 'comprehensive',
        duration_days: 14,
        badge: 'Fast Track',
        description:
            'Designed for busy examinees to quickly review top-tested formulas, vocabulary, logic patterns, and constitution essentials.',
        topics: [
            'Day 1-4: High-frequency Grammar, Vocabulary & Analogy',
            'Day 5-8: Math Shortcuts, Percentage, Ratio & Word Problems',
            'Day 9-11: Deductive Logic, Series & Data Interpretation',
            'Day 12-14: General Info, RA 6713 & Final Full Mock',
        ],
    },
    {
        id: '7_day_final_cram',
        title: '7-Day Final Cram & Mocks',
        subtitle: 'Intensive final week timed practice runs',
        category: 'comprehensive',
        duration_days: 7,
        badge: 'Exam Week',
        description:
            'Sharpen speed and accuracy with daily timed drills, full simulation tests, and rapid error analysis before exam day.',
        topics: [
            'Daily Timed Mock Exam Simulation (170 Items)',
            'Instant Review & Diagnostic Weak Area Drills',
            'Key Formula & Constitution Summary Sheet Review',
            'Test-taking Strategy & Time Management Prep',
        ],
    },
    {
        id: 'verbal_mastery',
        title: 'Verbal Ability & Grammar Mastery',
        subtitle: '14-day mastery of grammar, vocabulary & reading',
        category: 'verbal',
        duration_days: 14,
        badge: 'Subject Track',
        description:
            'Deep dive into English grammar, word meanings, contextual vocabulary, paragraph sequencing, and reading comprehension techniques.',
        topics: [
            'Days 1-3: Subject-Verb Agreement, Pronouns & Verb Tenses',
            'Days 4-6: High-Frequency Vocabulary, Synonyms & Antonyms',
            'Days 7-9: Identifying Sentence Errors & Idioms',
            'Days 10-12: Paragraph Organization & Logical Transitions',
            'Days 13-14: Reading Comprehension Speed Drills & Final Verbal Test',
        ],
    },
    {
        id: 'math_mastery',
        title: 'Numerical & Math Mastery Track',
        subtitle: '15-day step-by-step arithmetic & word problem mastery',
        category: 'numerical',
        duration_days: 15,
        badge: 'Subject Track',
        description:
            'Overcome math anxiety with guided practice on fractions, percentages, age/work problems, ratios, and number sequences.',
        topics: [
            'Days 1-3: Fractions, Decimals & Order of Operations (PEMDAS)',
            'Days 4-6: Percentages, Ratios & Partitive Proportions',
            'Days 7-10: Word Problems (Age, Distance, Work & Financial Math)',
            'Days 11-13: Basic Algebra & Number Series Shortcuts',
            'Days 14-15: Data Interpretation & Numerical Final Drill',
        ],
    },
    {
        id: 'analytical_mastery',
        title: 'Analytical Ability & Logic Track',
        subtitle: '14-day deductive logic, analogy & series mastery',
        category: 'analytical',
        duration_days: 14,
        badge: 'Subject Track',
        description:
            'Master logical patterns, word analogies, categorical syllogisms, Venn diagrams, assumptions, and data analysis.',
        topics: [
            'Days 1-3: Word Analogy Patterns & Relationship Types',
            'Days 4-6: Number, Letter & Figural Sequences',
            'Days 7-9: Categorical Syllogisms & Venn Diagram Analysis',
            'Days 10-12: Identifying Assumptions & Valid Inferences',
            'Days 13-14: Data Interpretation Charts & Logic Simulation Test',
        ],
    },
    {
        id: 'gen_info_fast_track',
        title: 'General Information & Constitution',
        subtitle: '10-day mastery of civil service legal essentials',
        category: 'gen_info',
        duration_days: 10,
        badge: 'Subject Track',
        description:
            'Targeted study plan for the 1987 Philippine Constitution, RA 6713 (Code of Conduct), Human Rights, and Environmental Protection.',
        topics: [
            'Days 1-3: Philippine Constitution: Preamble, State Policies & Bill of Rights',
            'Days 4-6: Legislative, Executive, Judiciary & Constitutional Commissions',
            'Days 7-8: RA 6713 Code of Conduct & Ethical Standards',
            'Days 9-10: Peace, Human Rights, Environmental Laws & Final Legal Quiz',
        ],
    },
    {
        id: 'clerical_mastery',
        title: 'Clerical Ability & Operations',
        subtitle: '7-day filing rules & clerical accuracy track',
        category: 'clerical',
        duration_days: 7,
        badge: 'SubProf Track',
        description:
            'Tailored for SubProfessional examinees covering standard alphabetical filing rules, numerical indexing, spelling, and error detection.',
        topics: [
            'Day 1-2: Alphabetical Filing Rules & Indexing Orders',
            'Day 3-4: Numerical, Geographic & Subject Filing Procedures',
            'Day 5: Spelling Verification & Commonly Confused Words',
            'Day 6: Clerical Error Checking & Document Proofreading',
            'Day 7: Timed 50-Item Clerical Ability Challenge Drill',
        ],
    },
];

interface StudyPlanTemplatesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    todayStr: string;
    onTemplateApplied: () => Promise<void>;
}

export function StudyPlanTemplatesModal({
    isOpen,
    onOpenChange,
    todayStr,
    onTemplateApplied,
}: StudyPlanTemplatesModalProps) {
    const [selectedCategoryTab, setSelectedCategoryTab] = useState<
        'all' | 'comprehensive' | 'subjects'
    >('all');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
        '30_day_comprehensive',
    );
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [preferredTime, setPreferredTime] = useState<string>('19:00');
    const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const filteredTemplates = useMemo(() => {
        if (selectedCategoryTab === 'comprehensive') {
            return DEFAULT_TEMPLATES.filter((t) => t.category === 'comprehensive');
        }

        if (selectedCategoryTab === 'subjects') {
            return DEFAULT_TEMPLATES.filter((t) => t.category !== 'comprehensive');
        }

        return DEFAULT_TEMPLATES;
    }, [selectedCategoryTab]);

    const selectedTemplate =
        DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
        DEFAULT_TEMPLATES[0];

    const getTemplateIcon = (id: string) => {
        switch (id) {
            case '60_day_deep_mastery':
                return <CalendarCheck className="size-4.5 text-indigo-500" />;
            case '14_day_crash_course':
                return <Zap className="size-4.5 text-amber-500" />;
            case '7_day_final_cram':
                return <AlertCircle className="size-4.5 text-rose-500" />;
            case 'verbal_mastery':
                return <FileText className="size-4.5 text-emerald-500" />;
            case 'math_mastery':
                return <Calculator className="size-4.5 text-blue-500" />;
            case 'analytical_mastery':
                return <Brain className="size-4.5 text-purple-500" />;
            case 'gen_info_fast_track':
                return <Scale className="size-4.5 text-amber-600" />;
            case 'clerical_mastery':
                return <FolderCheck className="size-4.5 text-cyan-500" />;
            default:
                return <Layers className="size-4.5 text-indigo-500" />;
        }
    };

    const handleApply = async () => {
        setIsApplying(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/study-suggestions/templates/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    template_id: selectedTemplateId,
                    start_date: startDate,
                    preferred_time: preferredTime || '19:00',
                    replace_existing: replaceExisting,
                }),
            });

            if (response.ok) {
                await onTemplateApplied();
                onOpenChange(false);
            } else {
                const data = await response.json();
                setErrorMessage(
                    data.message || 'Failed to apply study template.',
                );
            }
        } catch {
            setErrorMessage(
                'An error occurred while applying the template. Please check your connection.',
            );
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Ready-Made Curriculum
                        </span>
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                        Choose a Study Plan Template
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Select a comprehensive track or focused subject booster to auto-populate daily study tasks without manual entry.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                        {errorMessage}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 w-fit">
                    <button
                        type="button"
                        onClick={() => setSelectedCategoryTab('all')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedCategoryTab === 'all'
                                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        All Tracks ({DEFAULT_TEMPLATES.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedCategoryTab('comprehensive')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedCategoryTab === 'comprehensive'
                                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Full Prep (60D, 30D, 14D, 7D)
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedCategoryTab('subjects')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedCategoryTab === 'subjects'
                                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Subject Boosters (5 Tracks)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-2">
                    {/* Left: Template List */}
                    <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Available Tracks ({filteredTemplates.length})
                        </label>
                        <div className="space-y-2">
                            {filteredTemplates.map((tmpl) => {
                                const isSelected = tmpl.id === selectedTemplateId;

                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => setSelectedTemplateId(tmpl.id)}
                                        className={`w-full text-left rounded-2xl border p-3 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40 dark:ring-indigo-500/30'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    {getTemplateIcon(tmpl.id)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {tmpl.title}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-bold shrink-0 border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
                                            >
                                                {tmpl.duration_days} Days
                                            </Badge>
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                                            {tmpl.subtitle}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Selected Template Details & Configuration */}
                    <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                        {selectedTemplate.badge}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                                        <Clock className="size-3.5 text-slate-400" />
                                        {selectedTemplate.duration_days} Daily Sessions
                                    </span>
                                </div>
                                <h3 className="mt-1.5 text-base font-black text-slate-900 dark:text-white">
                                    {selectedTemplate.title}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedTemplate.description}
                                </p>
                            </div>

                            {/* Topics Breakdown */}
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 max-h-[160px] overflow-y-auto">
                                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky top-0 bg-white dark:bg-slate-900 pb-1">
                                    <BookOpen className="size-3.5 text-indigo-500" />
                                    <span>Curriculum Breakdown</span>
                                </h4>
                                <ul className="mt-1.5 space-y-1.5">
                                    {selectedTemplate.topics.map((topic, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                                        >
                                            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5 dark:text-emerald-400" />
                                            <span>{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Schedule Settings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Start Date
                                    </label>
                                    <div className="mt-1 relative">
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Daily Study Time
                                    </label>
                                    <div className="mt-1 relative">
                                        <Input
                                            type="time"
                                            value={preferredTime}
                                            onChange={(e) => setPreferredTime(e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Replace existing checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={replaceExisting}
                                    onChange={(e) => setReplaceExisting(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    Clear existing tasks from start date onward
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isApplying}
                                className="h-9 text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApply}
                                disabled={isApplying}
                                className="h-9 gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-sm active:scale-95"
                            >
                                <Sparkles className="size-3.5" />
                                <span>
                                    {isApplying
                                        ? 'Generating Schedule...'
                                        : `Apply ${selectedTemplate.duration_days}-Day Plan`}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
