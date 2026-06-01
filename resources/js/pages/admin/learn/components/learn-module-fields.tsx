import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LearnModuleFieldsProps {
    data: {
        title: string;
        topic: string;
        summary: string;
        content: string;
        estimated_minutes: number;
    };
    setData: any;
    errors: Record<string, string>;
    labelSize?: 'xs' | 'compact';
    mutedTextareas?: boolean;
}

export function LearnModuleFields({
    data,
    setData,
    errors,
    labelSize = 'xs',
    mutedTextareas = false,
}: LearnModuleFieldsProps) {
    const labelClass =
        labelSize === 'compact'
            ? 'mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase'
            : 'mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase';
    const textareaClass = mutedTextareas
        ? 'w-full rounded-xl border border-border bg-muted p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none'
        : 'w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white';
    const contentClass = mutedTextareas
        ? 'w-full rounded-xl border border-border bg-muted p-3 font-mono text-xs leading-relaxed font-semibold text-foreground focus:border-blue-500 focus:outline-none'
        : 'w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 font-mono text-xs leading-relaxed font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white';

    return (
        <>
            <div>
                <label className={labelClass}>Lesson Title</label>
                <Input
                    type="text"
                    placeholder="e.g. Indexing & Filing Rules for Clerical Puzzles"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    required
                />
                {errors.title && (
                    <span className="mt-1 block text-[10px] font-medium text-red-600">
                        {errors.title}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Focus Topic</label>
                    <Input
                        type="text"
                        placeholder="e.g. Filing"
                        value={data.topic}
                        onChange={(e) => setData('topic', e.target.value)}
                        required
                    />
                    {errors.topic && (
                        <span className="mt-1 block text-[10px] font-medium text-red-600">
                            {errors.topic}
                        </span>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Estimated Minutes Read</label>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="number"
                            min={1}
                            max={120}
                            value={data.estimated_minutes}
                            onChange={(e) =>
                                setData(
                                    'estimated_minutes',
                                    parseInt(e.target.value, 10) || 5,
                                )
                            }
                            className="pl-10"
                            required
                        />
                    </div>
                    {errors.estimated_minutes && (
                        <span className="mt-1 block text-[10px] font-medium text-red-600">
                            {errors.estimated_minutes}
                        </span>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>Short Preview Summary</label>
                <textarea
                    placeholder="Provide a concise 1-2 sentence overview of the lesson, visible on the study syllabus list..."
                    value={data.summary}
                    rows={2}
                    onChange={(e) => setData('summary', e.target.value)}
                    className={textareaClass}
                    required
                />
                {errors.summary && (
                    <span className="mt-1 block text-[10px] font-medium text-red-600">
                        {errors.summary}
                    </span>
                )}
            </div>

            <div>
                <label className={labelClass}>
                    Lesson Content (Markdown syntax supported)
                </label>
                <textarea
                    placeholder="Write detailed lesson summaries, structured lists, mental shortcuts, mathematical tables, or assessment self-checks using Markdown format..."
                    value={data.content}
                    rows={14}
                    onChange={(e) => setData('content', e.target.value)}
                    className={contentClass}
                    required
                />
                {errors.content && (
                    <span className="mt-1 block text-[10px] font-medium text-red-600">
                        {errors.content}
                    </span>
                )}
            </div>
        </>
    );
}
