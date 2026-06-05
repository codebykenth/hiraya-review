import {
    Brain,
    ChevronLeft,
    Check,
    Timer,
    Hourglass,
    CheckCircle2,
    ChevronRight,
    ListFilter,
    ListOrdered,
    Globe,
    RefreshCcw,
} from 'lucide-react';
import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import {
    categoryMeta,
    generateQuestionOptions,
} from '../hooks/use-drills-state';
import type { Category } from '../types';

interface ConfigViewProps {
    selectedCategory: Category;
    selectedSubcats: string[];
    questionCount: number | 'all';
    language: 'English' | 'Filipino' | 'Both';
    isTimed: boolean;
    isRetakeConfig: boolean;
    filteredQCount: number;
    hasFilipinoQuestions: boolean;
    setViewState: (view: 'hub' | 'config') => void;
    setIsRetakeConfig: (val: boolean) => void;
    toggleSubcat: (name: string) => void;
    setQuestionCount: (count: number | 'all') => void;
    setLanguage: (lang: 'English' | 'Filipino' | 'Both') => void;
    setIsTimed: (val: boolean) => void;
    startDrill: () => void;
}

export function ConfigView({
    selectedCategory,
    selectedSubcats,
    questionCount,
    language,
    isTimed,
    isRetakeConfig,
    filteredQCount,
    hasFilipinoQuestions,
    setViewState,
    setIsRetakeConfig,
    toggleSubcat,
    setQuestionCount,
    setLanguage,
    setIsTimed,
    startDrill,
}: ConfigViewProps) {
    const meta = categoryMeta[selectedCategory.name] || {
        icon: Brain,
        bgColor: 'bg-slate-600',
        description: 'Master your skills in this practice module.',
    };
    const CategoryIcon = meta.icon;

    return (
        <div className="flex flex-col gap-3 sm:gap-6">
            {/* Back Link */}
            <button
                onClick={() => {
                    setViewState('hub');
                    setIsRetakeConfig(false);
                }}
                className="flex w-fit cursor-pointer items-center gap-1 text-xs font-black text-foreground transition hover:text-blue-600 focus:outline-none dark:text-blue-400 dark:hover:text-blue-400"
            >
                <ChevronLeft className="size-4" />
                Back to Drill Hub
            </button>

            {/* Retake Mode Status Banner */}
            {isRetakeConfig && (
                <div className="dark:bg-amber-950/30/50 flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 shadow-2xs sm:flex-row sm:items-center dark:border-amber-900/30 dark:border-amber-900/50 dark:bg-amber-950/10 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                        <RefreshCcw className="size-4 shrink-0" />
                        <span>
                            <strong>Retake Mode Active:</strong> Settings have
                            been locked to match your historical attempt.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsRetakeConfig(false)}
                        className="shrink-0 cursor-pointer rounded-lg bg-amber-100 px-3 py-1.5 font-bold text-amber-900 transition hover:bg-amber-200 focus:outline-none dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
                    >
                        Unlock & Customize Settings
                    </button>
                </div>
            )}

            {/* Header Title Banner */}
            <div className="flex items-center gap-4">
                <div
                    className={`rounded-xl ${meta.bgColor} p-3 text-white shadow-xs`}
                >
                    <CategoryIcon className="size-6 transition-transform group-hover:scale-110" />
                </div>
                <PageHeader
                    title={`${selectedCategory.name} Practice`}
                    description="Configure your drill session parameters below."
                />
            </div>

            {/* Config Split Grid */}
            <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-3">
                {/* Left Params Pane */}
                <div className="flex flex-col gap-5 lg:col-span-2">
                    {/* 1. Subcategory Selector */}
                    <Card className="p-5 shadow-2xs">
                        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                            <ListFilter className="size-3" />
                            <span>Select Subcategories</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {selectedCategory.subcategory.map((sub) => {
                                const isSelected = selectedSubcats.includes(
                                    sub.name,
                                );

                                return (
                                    <button
                                        key={sub.name}
                                        disabled={isRetakeConfig}
                                        onClick={() => toggleSubcat(sub.name)}
                                        className={`flex items-center gap-1 rounded-full border px-4.5 py-2 text-xs font-bold transition focus:outline-none ${
                                            isRetakeConfig
                                                ? 'pointer-events-none opacity-60 select-none'
                                                : ''
                                        } ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/15 dark:bg-blue-950/30 dark:text-blue-400'
                                                : 'border-border bg-white text-muted-foreground hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {sub.name}
                                        {isSelected && (
                                            <Check className="size-3" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* 2. Question Count Selector */}
                    <Card className="p-5 shadow-2xs">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                <ListOrdered className="size-3" />
                                <span>Question Count</span>
                            </div>
                            <span className="dark:bg-blue-950/30/50 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                Total Questions:{' '}
                                {questionCount === 'all'
                                    ? filteredQCount
                                    : questionCount}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {generateQuestionOptions(filteredQCount).map(
                                (count) => {
                                    const isSelected = questionCount === count;

                                    return (
                                        <button
                                            key={count}
                                            type="button"
                                            disabled={isRetakeConfig}
                                            onClick={() =>
                                                setQuestionCount(count)
                                            }
                                            className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition focus:outline-none ${
                                                isRetakeConfig
                                                    ? 'pointer-events-none opacity-60 select-none'
                                                    : ''
                                            } ${
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                                    : 'border-border bg-slate-50/50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {count}
                                        </button>
                                    );
                                },
                            )}

                            <button
                                type="button"
                                disabled={isRetakeConfig}
                                onClick={() => setQuestionCount('all')}
                                className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition focus:outline-none ${
                                    isRetakeConfig
                                        ? 'pointer-events-none opacity-60 select-none'
                                        : ''
                                } ${
                                    questionCount === 'all'
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                        : 'border-border bg-slate-50/50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                                }`}
                            >
                                All
                            </button>

                            {/* Custom number input */}
                            <div
                                className={`flex items-center gap-2 rounded-lg border border-border bg-slate-50/20 px-3 py-1 text-xs transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-slate-900/30 ${
                                    isRetakeConfig
                                        ? 'pointer-events-none opacity-60 select-none'
                                        : ''
                                }`}
                            >
                                <span className="shrink-0 font-bold text-muted-foreground">
                                    Custom:
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    disabled={isRetakeConfig}
                                    max={filteredQCount}
                                    value={
                                        typeof questionCount === 'number' &&
                                        !generateQuestionOptions(
                                            filteredQCount,
                                        ).includes(questionCount)
                                            ? questionCount
                                            : ''
                                    }
                                    placeholder={`1-${filteredQCount}`}
                                    onChange={(e) => {
                                        const val =
                                            e.target.value === ''
                                                ? ''
                                                : Math.min(
                                                      filteredQCount,
                                                      Math.max(
                                                          1,
                                                          parseInt(
                                                              e.target.value,
                                                              10,
                                                          ),
                                                      ),
                                                  );

                                        if (
                                            typeof val === 'number' &&
                                            !isNaN(val)
                                        ) {
                                            setQuestionCount(val);
                                        }
                                    }}
                                    className="w-14 [appearance:textfield] bg-transparent font-bold text-foreground focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 3. Language Selector */}
                    <Card className="p-5 shadow-2xs">
                        <div className="mb-3.5 flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                            <Globe className="size-3" />
                            <span>Language</span>
                        </div>
                        <div className="flex flex-wrap gap-3 sm:gap-6">
                            {(hasFilipinoQuestions
                                ? ['English', 'Filipino', 'Both']
                                : ['English']
                            ).map((lang) => {
                                const isSelected = language === lang;

                                return (
                                    <label
                                        key={lang}
                                        className={`flex cursor-pointer items-center gap-2 text-xs font-bold text-foreground ${
                                            isRetakeConfig
                                                ? 'pointer-events-none opacity-60 select-none'
                                                : ''
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="drill-lang"
                                            disabled={isRetakeConfig}
                                            checked={isSelected}
                                            onChange={() =>
                                                setLanguage(
                                                    lang as
                                                        | 'English'
                                                        | 'Filipino'
                                                        | 'Both',
                                                )
                                            }
                                            className="size-4 border-border text-blue-600 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400"
                                        />
                                        {lang === 'Both'
                                            ? 'Both (Mixed)'
                                            : lang}
                                    </label>
                                );
                            })}
                        </div>
                    </Card>

                    {/* 4. Practice Mode Selector */}
                    <Card className="p-5 shadow-2xs">
                        <div className="mb-3.5 flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                            <Timer className="size-3" />
                            <span>Practice Mode</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                disabled={isRetakeConfig}
                                onClick={() => setIsTimed(true)}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                    isRetakeConfig
                                        ? 'pointer-events-none opacity-60 select-none'
                                        : ''
                                } ${
                                    isTimed
                                        ? 'dark:bg-blue-950/30/10 border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/10'
                                        : 'border-border bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                                }`}
                            >
                                <div
                                    className={`rounded-lg p-2 ${isTimed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-muted-foreground dark:bg-slate-900'}`}
                                >
                                    <Timer className="size-4" />
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-foreground">
                                        Timed Practice
                                    </span>
                                    <span className="mt-1 block text-[10px] leading-normal text-muted-foreground">
                                        Simulates exam pressure with a strict
                                        countdown timer (1 min per item) and
                                        auto-submits when time expires.
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                disabled={isRetakeConfig}
                                onClick={() => setIsTimed(false)}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                    isRetakeConfig
                                        ? 'pointer-events-none opacity-60 select-none'
                                        : ''
                                } ${
                                    !isTimed
                                        ? 'dark:bg-emerald-950/30/10 border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/10'
                                        : 'border-border bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                                }`}
                            >
                                <div
                                    className={`rounded-lg p-2 ${!isTimed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-muted-foreground dark:bg-slate-900'}`}
                                >
                                    <Hourglass className="size-4" />
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-foreground">
                                        Untimed Practice
                                    </span>
                                    <span className="mt-1 block text-[10px] leading-normal text-muted-foreground">
                                        Stress-free learning. Work at your own
                                        pace with a stopwatch tracker to monitor
                                        your overall time.
                                    </span>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right Summary Pane (Drill Summary Card) */}
                <div>
                    <Card className="flex h-fit flex-col justify-between p-4 sm:p-6">
                        <div>
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <span className="font-heading text-base font-bold text-foreground">
                                    Drill Summary
                                </span>
                                <CheckCircle2 className="size-5 text-emerald-500" />
                            </div>

                            <div className="mt-5 flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Category:
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {selectedCategory.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Questions:
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {questionCount === 'all'
                                            ? filteredQCount
                                            : questionCount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Language:
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {language}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Format:
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                            isTimed
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                                        }`}
                                    >
                                        {isTimed
                                            ? 'Timed Practice'
                                            : 'Untimed Practice'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={startDrill}
                                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition transition-all duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                            >
                                Start Drill
                                <ChevronRight className="size-4" />
                            </button>
                            <span className="mt-3 block text-center text-[10px] text-muted-foreground">
                                Session progress will be saved automatically.
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
