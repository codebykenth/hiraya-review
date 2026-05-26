import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Sparkles, 
    PenLine, 
    ArrowLeft, 
    UploadCloud, 
    FileText, 
    AlertCircle,
    ChevronDown,
    Save,
    RotateCcw,
    Sparkle,
    Cpu,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { index as questionsIndex, store as questionsStore, drafts as questionsDrafts, generate as questionsGenerate } from '@/routes/questions';

// Dynamic Subcategory Lists mapped to the main CSE Categories
const CSE_CATEGORIES: Record<string, string[]> = {
    'General Information': [
        'Philippine Constitution',
        'Code of Conduct and Ethical Standards (R.A. 6713)',
        'Peace and Human Rights Issues and Concepts',
        'Environment Management and Protection'
    ],
    'Verbal Ability': [
        'Word meaning',
        'Sentence completion',
        'Error recognition',
        'Sentence structure',
        'Paragraph organization',
        'Reading comprehension'
    ],
    'Analytical Ability': [
        'Word analogy',
        'Symbolic logic / abstract reasoning',
        'Identifying assumptions and drawing conclusions',
        'Data interpretation'
    ],
    'Numerical Ability': [
        'Basic operations',
        'Number sequence',
        'Word problems'
    ],
    'Clerical Ability': [
        'Filing',
        'Spelling'
    ]
};

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: SubcategoryItem[];
}

interface SubcategoryItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    language: string;
    sort_order: number;
}

interface CreateProps {
    type?: 'ai' | 'manual';
    categories?: CategoryItem[];
}

export default function CreateQuestion({ type = 'ai', categories = [] }: CreateProps) {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(type === 'manual' ? 'manual' : 'ai');

    // Strict 1-liner comment: Build categories tree dynamically with robust static CSC fallback
    const cseCategoriesTree: Record<string, string[]> = {};
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(sub => sub.name);
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection'
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension'
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation'
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems'
        ];
        cseCategoriesTree['Clerical Ability'] = [
            'Filing',
            'Spelling'
        ];
    }

    const defaultCategory = Object.keys(cseCategoriesTree)[0] || 'Analytical Ability';
    const defaultSubcategory = cseCategoriesTree[defaultCategory]?.[0] || 'Word analogy';

    // ----------------------------------------------------
    // STATE FOR AI GENERATOR
    // ----------------------------------------------------
    const [aiCategory, setAiCategory] = useState<string>(defaultCategory);
    const [aiSubcategory, setAiSubcategory] = useState<string>(defaultSubcategory);
    const [aiCount, setAiCount] = useState<number>(3);
    const [aiLanguage, setAiLanguage] = useState<string>('English');
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Sync subcategory options when Category changes in AI view
    useEffect(() => {
        if (cseCategoriesTree[aiCategory]) {
            setAiSubcategory(cseCategoriesTree[aiCategory][0]);
        }
    }, [aiCategory]);

    // ----------------------------------------------------
    // STATE & FORM FOR MANUAL ENTRY
    // ----------------------------------------------------
    const { data, setData, post, processing, errors, reset } = useForm({
        stem: '',
        category: defaultCategory,
        subcategory: defaultSubcategory,
        language: 'English',
        options: ['', '', '', '', ''],
        correct_option: 0,
        explanation: '',
        status: 'active' as 'active' | 'draft',
    });

    // Sync subcategory options when Category changes in Manual view
    useEffect(() => {
        if (cseCategoriesTree[data.category]) {
            setData('subcategory', cseCategoriesTree[data.category][0]);
        }
    }, [data.category]);

    // Handle Option Value Change
    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...data.options];
        newOptions[idx] = val;
        setData('options', newOptions);
    };

    // Submit Manual Entry Form
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.stem.trim()) return;
        if (data.options.some(opt => !opt.trim())) return;

        post(questionsStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    };

    // AI GENERATION HANDLERS (GEMINI 2.5 FLASH API)
    const handleGenerateAI = async () => {
        setIsGenerating(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(questionsGenerate().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    category: aiCategory,
                    subcategory: aiSubcategory,
                    count: aiCount,
                    language: aiLanguage,
                    prompt: aiPrompt,
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || 'Failed to generate questions. Please try again.');
            }

            setSuccessMsg('Questions generated successfully! They are saved as drafts and ready for review.');

        } catch (err: any) {
            setErrorMsg(err.message || 'An error occurred while generating questions.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <Head title="Create Question" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">
                
                {/* 1. TOP HEADER & NAVIGATION */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link 
                            href={questionsIndex().url} 
                            className="flex w-fit items-center gap-1 text-xs font-black text-slate-850 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition cursor-pointer focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            Back to Question Management
                        </Link>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                            {activeTab === 'ai' ? 'AI Question Generator' : 'Manual Question Entry'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {activeTab === 'ai' 
                                ? 'Configure parameters to generate new exam questions.' 
                                : 'Create high-quality exam items with structured metadata and clear rationales.'}
                        </p>
                    </div>

                    {/* Segment switcher */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                activeTab === 'ai' 
                                    ? 'bg-white text-slate-950 shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                             }`}
                        >
                            <Sparkles className="size-4 text-blue-600" />
                            AI Generator
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                activeTab === 'manual' 
                                    ? 'bg-white text-slate-950 shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <PenLine className="size-4 text-emerald-600" />
                            Manual Entry
                        </button>
                    </div>
                </div>

                {/* 2. DYNAMIC WORKSPACE CONTENT */}
                {activeTab === 'ai' ? (
                    /* AI QUESTION GENERATOR WORKSPACE */
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                        
                        {/* LEFT COLUMN - CONFIGURATION PANEL (7/12 cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="rounded-2xl border border-slate-250 bg-white p-6 shadow-xs relative overflow-hidden">
                                
                                {/* Background Accent Glow */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                    <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-950">
                                        <Sparkles className="size-4 text-blue-600 animate-pulse" />
                                        Configuration Options
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Category Select */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                                        <div className="relative">
                                            <select
                                                value={aiCategory}
                                                disabled={isGenerating}
                                                onChange={(e) => setAiCategory(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none disabled:opacity-55"
                                            >
                                                {Object.keys(cseCategoriesTree).map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Subcategory Select */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Subcategory</label>
                                        <div className="relative">
                                            <select
                                                value={aiSubcategory}
                                                disabled={isGenerating}
                                                onChange={(e) => setAiSubcategory(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none disabled:opacity-55"
                                            >
                                                {cseCategoriesTree[aiCategory]?.map(sub => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Count Select */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Count</label>
                                            <div className="relative">
                                                <select
                                                    value={aiCount}
                                                    disabled={isGenerating}
                                                    onChange={(e) => setAiCount(Number(e.target.value))}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none disabled:opacity-55"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                                                        <option key={c} value={c}>{c} Question{c > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Language Select */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Language</label>
                                            <div className="relative">
                                                <select
                                                    value={aiLanguage}
                                                    disabled={isGenerating}
                                                    onChange={(e) => setAiLanguage(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none disabled:opacity-55"
                                                >
                                                    <option value="English">English</option>
                                                    <option value="Tagalog">Tagalog</option>
                                                </select>
                                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Prompting Context */}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Additional AI Context (Optional)</label>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max 250 Chars</span>
                                        </div>
                                        <textarea
                                            value={aiPrompt}
                                            disabled={isGenerating}
                                            onChange={(e) => setAiPrompt(e.target.value.slice(0, 250))}
                                            placeholder="E.g., Focus on recent Republic Acts, make options highly tricky, or emphasize logical fallacies..."
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition duration-150 disabled:opacity-55"
                                        />
                                    </div>

                                    {successMsg && (
                                         <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-3 shadow-3xs border-l-4 border-l-emerald-500">
                                             <CheckCircle2 className="size-4.5 text-emerald-650 shrink-0 mt-0.5" />
                                             <div className="flex flex-col gap-1.5 flex-1">
                                                 <span className="font-extrabold text-emerald-950">Questions Generated!</span>
                                                 <span className="text-slate-600 leading-relaxed font-semibold">
                                                     Your questions have been successfully created and stored as drafts. You can review and publish them on the Drafts Review page.
                                                 </span>
                                                 <Link
                                                     href={questionsDrafts().url}
                                                     className="inline-flex items-center gap-1 mt-1 text-emerald-700 hover:text-emerald-900 font-extrabold underline transition"
                                                 >
                                                     Go to Drafts Review &rarr;
                                                 </Link>
                                             </div>
                                         </div>
                                     )}

                                    {errorMsg && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5">
                                            <AlertCircle className="size-4 text-red-650 shrink-0 mt-0.5" />
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}

                                    {/* Generate button with skeleton in-place when processing */}
                                    <div className="pt-2">
                                        {isGenerating ? (
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-3.5 animate-pulse shadow-3xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-5.5 rounded-full border-2 border-blue-650 border-t-transparent animate-spin shrink-0" />
                                                    <span className="text-sm font-bold text-slate-700">Synthesizing CSE questions via Gemini...</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-slate-200 rounded-sm w-5/6" />
                                                    <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleGenerateAI}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition duration-200"
                                            >
                                                <Sparkle className="size-4.5" />
                                                Generate Questions
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - INFORMATIONAL & DOCUMENTATION CARD (5/12 cols) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            
                            {/* Premium AI Info Card */}
                            <div className="rounded-2xl border border-slate-250 bg-gradient-to-br from-blue-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
                                
                                {/* Geometric Gradient Mesh */}
                                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
                                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

                                <h2 className="text-base font-extrabold tracking-tight inline-flex items-center gap-2 border-b border-white/10 pb-4.5 mb-4 w-full">
                                    <Cpu className="size-4.5 text-blue-400" />
                                    Gemini Question Synthesizer
                                </h2>

                                <div className="space-y-4 text-xs font-semibold text-slate-305 leading-relaxed">
                                    <div className="flex gap-3.5">
                                        <BookOpen className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-200 font-bold mb-1">Standardized Exam Blueprint</h4>
                                            <p className="text-slate-400">Questions are synthesized directly against civil service exam guidelines, mapping to key cognitive difficulty standards (Recall, Application, Analysis).</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3.5">
                                        <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-200 font-bold mb-1">Contextual Prompting</h4>
                                            <p className="text-slate-400">Use the Additional Context block to hone in on specific review modules—e.g. Philippine Constitutional amendments, fractions, or paragraph ordering puzzles.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3.5">
                                        <HelpCircle className="size-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-200 font-bold mb-1">Interactive Review Queue</h4>
                                            <p className="text-slate-400 font-medium">Once questions are generated, they flow straight into the <strong>Drafts Review Center</strong>, allowing you to edit and batch-approve them in a unified dashboard.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* VIEW B: MANUAL QUESTION ENTRY */
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                        
                        {/* LEFT COLUMN - CONTENT EDITORS (8/12 cols) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            
                            {/* Question Content Editor */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 inline-flex items-center gap-2">
                                    <FileText className="size-4.5 text-emerald-600" />
                                    Question Content
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="stem" className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Stem (Rich Text)</label>
                                        
                                        {/* Mock Formatting toolbar for premium aesthetics */}
                                        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1">
                                            <button type="button" className="px-2 py-0.5 text-xs font-black text-slate-600 hover:bg-white rounded transition select-none">B</button>
                                            <button type="button" className="px-2 py-0.5 text-xs italic text-slate-600 hover:bg-white rounded transition select-none">I</button>
                                            <button type="button" className="px-2 py-0.5 text-xs text-slate-600 hover:bg-white rounded transition select-none font-mono">List</button>
                                            <button type="button" className="px-2 py-0.5 text-xs text-slate-600 hover:bg-white rounded transition select-none">Link</button>
                                        </div>
                                    </div>

                                    <textarea
                                        id="stem"
                                        value={data.stem}
                                        onChange={(e) => setData('stem', e.target.value)}
                                        rows={6}
                                        placeholder="Enter the main question text, scenario, or analytical passage here..."
                                        className={`w-full rounded-xl border p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition ${
                                            errors.stem ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                                        }`}
                                        required
                                    />
                                    {errors.stem && (
                                        <p className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 mt-1">
                                            <AlertCircle className="size-3.5" />
                                            {errors.stem}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Answer Options Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                    <h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                                        <CheckCircle2 className="size-4.5 text-emerald-600" />
                                        Answer Options
                                    </h2>
                                    <span className="inline-flex rounded-md bg-blue-550/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider uppercase">
                                        Mark 1 Correct Answer
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {data.options.map((option, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center gap-4 rounded-xl border p-3.5 transition duration-200 ${
                                                data.correct_option === idx 
                                                    ? 'border-emerald-250 bg-emerald-50/20' 
                                                    : 'border-slate-200'
                                            }`}
                                        >
                                            {/* Correct Option Radio */}
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="correct_option"
                                                    checked={data.correct_option === idx}
                                                    onChange={() => setData('correct_option', idx)}
                                                    className="size-5 accent-emerald-600 cursor-pointer"
                                                />
                                            </label>

                                            {/* Option Label Letter */}
                                            <span className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                                                data.correct_option === idx
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>

                                            {/* Option Text Input */}
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Enter option ${String.fromCharCode(65 + idx)} content`}
                                                className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Explanation & Rationale Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                                    Explanation & Rationale
                                </h2>

                                <div className="space-y-2">
                                    <label htmlFor="explanation" className="text-xs font-bold uppercase tracking-wider text-slate-400">Provide the reasoning behind the correct answer</label>
                                    <textarea
                                        id="explanation"
                                        value={data.explanation}
                                        onChange={(e) => setData('explanation', e.target.value)}
                                        rows={4}
                                        placeholder="Why is this the correct answer? Provide logic constraints, solution steps, or constitutional references..."
                                        className={`w-full rounded-xl border p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition ${
                                            errors.explanation ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                                        }`}
                                        required
                                    />
                                    {errors.explanation && (
                                        <p className="inline-flex items-center gap-1 text-xs font-semibold text-red-650 mt-1">
                                            <AlertCircle className="size-3.5" />
                                            {errors.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - METADATA, ATTACHMENT & SUBMISSIONS (4/12 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            
                            {/* Metadata Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                                    Metadata
                                </h2>

                                <div className="space-y-4">
                                    {/* Category Select */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                                        <div className="relative">
                                            <select
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none"
                                            >
                                                {Object.keys(cseCategoriesTree).map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Subcategory Select */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Subcategory</label>
                                        <div className="relative">
                                            <select
                                                value={data.subcategory}
                                                onChange={(e) => setData('subcategory', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none"
                                            >
                                                {cseCategoriesTree[data.category]?.map(sub => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Language Select */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Language</label>
                                        <div className="relative">
                                            <select
                                                value={data.language}
                                                onChange={(e) => setData('language', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white focus:outline-none appearance-none"
                                            >
                                                <option value="English">English</option>
                                                <option value="Tagalog">Tagalog</option>
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Status Toggles */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Default Status</label>
                                        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'active')}
                                                className={`py-2 text-xs font-bold rounded-lg transition ${
                                                    data.status === 'active'
                                                        ? 'bg-white text-slate-900 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                Active / Live
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'draft')}
                                                className={`py-2 text-xs font-bold rounded-lg transition ${
                                                    data.status === 'draft'
                                                        ? 'bg-white text-slate-900 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons panel */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-800 transition duration-200 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving question...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4.5" />
                                            Save Question
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        router.visit(questionsIndex().url);
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-955 transition duration-200"
                                >
                                    <RotateCcw className="size-4" />
                                    Cancel Entry
                                </button>
                            </div>

                        </div>

                    </form>
                )}

            </div>
        </>
    );
}

CreateQuestion.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Create Question',
        },
    ],
};
