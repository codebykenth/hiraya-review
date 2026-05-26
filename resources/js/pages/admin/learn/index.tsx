import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Eye, 
    Edit2, 
    Trash2, 
    FileText 
} from 'lucide-react';
import { 
    index as adminLearnIndex,
    create as adminLearnCreate,
    edit as adminLearnEdit
} from '@/routes/admin/learn';
import { show as learnShow } from '@/routes/learn';
import { CurationIndexShell, getCategoryStyles } from '@/components/curation-index-shell';
import { TableColumn } from '@/components/admin-table';
import { CategoryItem } from '@/components/drafts-review-shell';

interface LearnModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    estimated_minutes: number;
    is_published: boolean;
    category: string;
    subcategory: string;
    updated_at: string;
}

interface AdminLearnIndexProps {
    modules: LearnModule[];
    categories?: CategoryItem[];
}

export default function AdminLearnIndex({ modules = [], categories = [] }: AdminLearnIndexProps) {
    const columns = (confirmDelete: (item: LearnModule) => void): TableColumn<LearnModule>[] => [
        {
            header: 'Module ID',
            render: (mod) => <span className="font-bold text-muted-foreground">#{mod.id}</span>
        },
        {
            header: 'Lesson Details',
            render: (mod) => (
                <>
                    <span className="block text-xs font-black text-foreground leading-snug line-clamp-1">{mod.title}</span>
                    <span className="mt-1 block text-[10px] font-bold text-muted-foreground line-clamp-1 leading-relaxed">
                        {mod.summary || 'CSE Syllabus Study Module'}
                    </span>
                </>
            )
        },
        {
            header: 'Category',
            render: (mod) => (
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(mod.category)}`}>
                    {mod.category}
                </span>
            )
        },
        {
            header: 'Subcategory',
            render: (mod) => (
                <span className="text-[11px] font-bold text-muted-foreground capitalize">
                    {mod.subcategory}
                </span>
            )
        },
        {
            header: 'Status',
            render: (mod) => mod.is_published ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-100 uppercase">
                    Active
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-650 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 border border-blue-100 uppercase">
                    Draft
                </span>
            )
        },
        {
            header: 'Actions',
            className: 'w-28 text-right pr-8',
            render: (mod) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        href={learnShow(mod.slug).url}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        title="Student Preview"
                    >
                        <Eye className="size-4" />
                    </Link>
                    <Link
                        href={adminLearnEdit(mod.id).url}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-blue-600 transition"
                        title="Edit details"
                    >
                        <Edit2 className="size-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => confirmDelete(mod)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600 transition cursor-pointer"
                        title="Delete module"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Learn Curation" />

            <CurationIndexShell<LearnModule>
                items={modules}
                categories={categories}
                columns={columns}
                searchPlaceholder="Search modules (title, summary, topic)..."
                searchMatcher={(mod, search) =>
                    mod.title.toLowerCase().includes(search.toLowerCase()) ||
                    mod.topic.toLowerCase().includes(search.toLowerCase()) ||
                    mod.category.toLowerCase().includes(search.toLowerCase()) ||
                    mod.subcategory.toLowerCase().includes(search.toLowerCase()) ||
                    String(mod.id).includes(search)
                }
                statusMatcher={(mod, status) =>
                    (status === 'ACTIVE' && mod.is_published) ||
                    (status === 'DRAFT' && !mod.is_published)
                }
                aiGenerator={{
                    title: "AI Lesson Generator",
                    description: "Instantly create rich, syllabus-aligned study modules and interactive quick-checks using Gemini AI.",
                    href: adminLearnCreate({ query: { type: 'ai' } }).url
                }}
                manualEntry={{
                    title: "Manual Lesson Entry",
                    description: "Precision-craft detailed tutorials, study guides, and review materials manually with standard Markdown support.",
                    href: adminLearnCreate({ query: { type: 'manual' } }).url
                }}
                tableTitle="CSE Learning Modules"
                tableLegend={[
                    { icon: Eye, label: 'Student Preview', variant: 'slate' },
                    { icon: Edit2, label: 'Edit Module', variant: 'blue' },
                    { icon: Trash2, label: 'Delete Module', variant: 'rose' }
                ]}
                tableEmptyState={{
                    icon: FileText,
                    title: "No Modules Found",
                    description: "We couldn't find any learning modules matching your active filters. Clear filters or launch the AI Generator to create fresh ones."
                }}
                onDeleteConfirm={(mod) => {
                    router.delete(`/admin/learn/${mod.id}`);
                }}
                getDeleteTitle={() => 'Delete Study Module?'}
                getDeleteMessage={(mod) => `Are you sure you want to permanently delete the learning module "${mod.title}"? This action cannot be undone.`}
                deleteConfirmLabel="Delete Module"
            />
        </>
    );
}

// Register layout configuration with standard layout and breadcrumbs
AdminLearnIndex.layout = {
    breadcrumbs: [
        {
            title: 'Learn Management',
            href: adminLearnIndex().url,
        },
    ],
};
