import { Head, router } from '@inertiajs/react';
import { Cpu, Sparkles, Zap, Clock, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PageProps = {
    analysisMode: 'ai' | 'instant';
    aiAvailable: boolean;
};

const modes = [
    {
        value: 'instant' as const,
        title: 'Instant Analysis',
        icon: Zap,
        color: 'emerald',
        description:
            'Get your performance report immediately after every exam.',
        features: [
            {
                icon: RefreshCw,
                text: 'Updates every time you complete an exam or drill',
            },
            {
                icon: Zap,
                text: 'Loads instantly — no waiting, no loading spinner',
            },
            {
                icon: Cpu,
                text: 'Uses smart algorithms to calculate your readiness score',
            },
            {
                icon: Shield,
                text: 'Works offline — no external service dependency',
            },
        ],
        badge: 'Fast',
    },
    {
        value: 'ai' as const,
        title: 'AI-Powered Analysis',
        icon: Sparkles,
        color: 'indigo',
        description: 'Get a richer, AI-written coaching report powered by AI.',
        features: [
            {
                icon: Clock,
                text: 'Regenerates automatically whenever you complete an exam',
            },
            {
                icon: Sparkles,
                text: 'Natural-language coaching feedback from AI',
            },
            {
                icon: RefreshCw,
                text: 'Shows a loading spinner while AI generates your report',
            },
            {
                icon: Shield,
                text: 'Requires active AI service — falls back to Instant if unavailable',
            },
        ],
        badge: 'Recommended',
    },
];

export default function Preferences({ analysisMode, aiAvailable }: PageProps) {
    const [selected, setSelected] = useState<'ai' | 'instant'>(analysisMode);
    const [processing, setProcessing] = useState(false);
    const hasChanged = selected !== analysisMode;

    function handleSave() {
        setProcessing(true);
        router.patch(
            '/settings/preferences',
            { analysis_mode: selected },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Preferences" />

            <h1 className="sr-only">Preferences</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Analysis mode"
                    description="Choose how your performance reports are generated after each exam"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    {modes.map((mode) => {
                        const isSelected = selected === mode.value;
                        const isDisabled = mode.value === 'ai' && !aiAvailable;
                        const Icon = mode.icon;

                        const colorMap = {
                            emerald: {
                                ring: 'ring-emerald-500 dark:ring-emerald-400',
                                border: 'border-emerald-300 dark:border-emerald-600',
                                iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
                                badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
                                glow: 'shadow-emerald-500/10',
                            },
                            indigo: {
                                ring: 'ring-indigo-500 dark:ring-indigo-400',
                                border: 'border-indigo-300 dark:border-indigo-600',
                                iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
                                badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
                                glow: 'shadow-indigo-500/10',
                            },
                        };
                        const colors =
                            colorMap[mode.color as keyof typeof colorMap];

                        return (
                            <button
                                key={mode.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setSelected(mode.value)}
                                aria-label={`Select ${mode.title} mode`}
                                className={cn(
                                    'group relative flex cursor-pointer flex-col rounded-xl border p-5 text-left transition-all duration-200',
                                    isSelected
                                        ? `ring-2 ${colors.ring} ${colors.border} shadow-lg ${colors.glow}`
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700',
                                    isDisabled &&
                                        'cursor-not-allowed opacity-50',
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'flex size-10 items-center justify-center rounded-lg transition-colors',
                                                isSelected
                                                    ? colors.iconBg
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {mode.title}
                                            </h3>
                                            <span
                                                className={cn(
                                                    'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                    isSelected
                                                        ? colors.badge
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                                )}
                                            >
                                                {mode.badge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Radio indicator */}
                                    <div
                                        className={cn(
                                            'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                                            isSelected
                                                ? `${colors.ring.replace('ring-', 'border-')} bg-current`
                                                : 'border-slate-300 dark:border-slate-600',
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="size-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {mode.description}
                                </p>

                                {/* Feature list */}
                                <ul className="mt-4 space-y-2.5">
                                    {mode.features.map((feature, i) => {
                                        const FeatureIcon = feature.icon;

                                        return (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2.5"
                                            >
                                                <FeatureIcon
                                                    className={cn(
                                                        'mt-0.5 size-3.5 shrink-0',
                                                        isSelected
                                                            ? 'text-slate-700 dark:text-slate-300'
                                                            : 'text-slate-400 dark:text-slate-500',
                                                    )}
                                                />
                                                <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                                    {feature.text}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Disabled overlay */}
                                {isDisabled && (
                                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                                        AI analysis is not available on this
                                        server. Contact admin to enable it.
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* What changes info box */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        What happens when you switch?
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        <li>
                            • Switching to{' '}
                            <strong className="text-emerald-700 dark:text-emerald-400">
                                Instant
                            </strong>{' '}
                            immediately generates a fresh report based on all
                            your exam history.
                        </li>
                        <li>
                            • Switching to{' '}
                            <strong className="text-indigo-700 dark:text-indigo-400">
                                AI-Powered
                            </strong>{' '}
                            queues an AI analysis — you&apos;ll see a loading
                            indicator until it completes (a few seconds).
                        </li>
                        <li>
                            • Your existing report remains visible until the new
                            one is ready.
                        </li>
                    </ul>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanged || processing}
                    >
                        {processing ? 'Saving...' : 'Save preference'}
                    </Button>
                    {!hasChanged && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Currently using{' '}
                            <strong>
                                {analysisMode === 'ai'
                                    ? 'AI-Powered'
                                    : 'Instant'}
                            </strong>{' '}
                            analysis
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}

Preferences.layout = {
    breadcrumbs: [
        {
            title: 'Preferences',
            href: '/settings/preferences',
        },
    ],
};
