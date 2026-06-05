import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, FileQuestion } from 'lucide-react';
import type { TableColumn } from '@/components/domain/admin-table';
import {
    CurationIndexShell,
    getCategoryStyles,
} from '@/components/domain/curation-index-shell';
import type { CategoryItem } from '@/components/domain/drafts-review-shell';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    index as questionsIndex,
    create as questionsCreate,
    edit as questionsEdit,
    destroy as questionsDestroy,
    show as questionsShow,
} from '@/routes/questions';

interface QuestionItem {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    status: 'ACTIVE' | 'DRAFT';
}

interface QuestionsIndexProps {
    questions?: QuestionItem[];
    categories?: CategoryItem[];
}

export default function QuestionsIndex({
    questions = [],
    categories = [],
}: QuestionsIndexProps) {
    const columns = (
        confirmDelete: (item: QuestionItem) => void,
    ): TableColumn<QuestionItem>[] => [
        {
            header: 'Question ID',
            render: (q) => (
                <span className="font-bold text-muted-foreground">#{q.id}</span>
            ),
        },
        {
            header: 'Question Details',
            render: (q) => (
                <>
                    <span className="line-clamp-1 block text-xs leading-snug font-black text-foreground">
                        {q.stem}
                    </span>
                    <span className="mt-1 line-clamp-1 block text-[10px] leading-relaxed font-bold text-muted-foreground">
                        CSE Practice Question
                    </span>
                </>
            ),
        },
        {
            header: 'Category',
            render: (q) => (
                <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(q.category)}`}
                >
                    {q.category}
                </span>
            ),
        },
        {
            header: 'Subcategory',
            render: (q) => (
                <span className="font-bold text-foreground capitalize">
                    {q.subcategory}
                </span>
            ),
        },
        {
            header: 'Status',
            render: (q) =>
                q.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Active
                    </span>
                ) : (
                    <span className="text-blue-650 inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold uppercase dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400">
                        Draft
                    </span>
                ),
        },
        {
            header: 'Actions',
            className: 'w-28 text-right pr-8',
            render: (q) => (
                <div className="flex items-center justify-end gap-1.5">
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={questionsShow(q.id).url}
                                    className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                >
                                    <Eye className="size-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={questionsEdit(q.id).url}
                                    className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                >
                                    <Edit2 className="size-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Edit question</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => confirmDelete(q)}
                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete question</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Question Management" />

            <CurationIndexShell<QuestionItem>
                items={questions}
                categories={categories}
                columns={columns}
                searchPlaceholder="Search questions (stem, ID, topic)..."
                searchMatcher={(q, search) =>
                    q.stem.toLowerCase().includes(search.toLowerCase()) ||
                    q.category.toLowerCase().includes(search.toLowerCase()) ||
                    q.subcategory
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    String(q.id).includes(search)
                }
                statusMatcher={(q, status) => q.status === status}
                aiGenerator={{
                    title: 'AI Question Generator',
                    description:
                        'Instantly create high-quality civil service questions from source documents or topics using our tuned LLM.',
                    href: questionsCreate({ query: { type: 'ai' } }).url,
                }}
                manualEntry={{
                    title: 'Manual Question Entry',
                    description:
                        'Precision-craft questions with custom distractors, detailed explanations, and specific syllabus mapping.',
                    href: questionsCreate({ query: { type: 'manual' } }).url,
                }}
                tableTitle="CSE Practice Questions"
                tableLegend={[
                    { icon: Eye, label: 'View Details', variant: 'slate' },
                    { icon: Edit2, label: 'Edit Question', variant: 'blue' },
                    { icon: Trash2, label: 'Delete Question', variant: 'rose' },
                ]}
                tableEmptyState={{
                    icon: FileQuestion,
                    title: 'No Questions Found',
                    description:
                        "We couldn't find any questions matching your active filters. Clear filters or launch the AI Generator to create fresh ones.",
                }}
                onDeleteConfirm={(q) => {
                    router.delete(questionsDestroy(q.id).url, {
                        preserveScroll: true,
                    });
                }}
                getDeleteTitle={() => 'Delete Question?'}
                getDeleteMessage={() =>
                    'Are you sure you want to delete this question? This action cannot be undone and will permanently remove it from all database records.'
                }
                deleteConfirmLabel="Delete Question"
                onBulkDeleteConfirm={(ids) => {
                    router.post(
                        '/questions/bulk-delete',
                        { ids },
                        {
                            preserveScroll: true,
                        },
                    );
                }}
            />
        </>
    );
}

QuestionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex(),
        },
    ],
};
