import { Head, useForm } from '@inertiajs/react';
import { HelpCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { CurationEditShell } from '@/components/domain/curation-edit-shell';
import InputError from '@/components/shared/input-error';
import { SelectField } from '@/components/ui/select';
import { index as questionsIndex } from '@/routes/questions';

interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: Subcategory[];
}

interface QuestionItem {
    id: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    stem: string;
    category: string;
    subcategory: string;
    options: string[];
    correct_option: number;
    explanation: string;
    language: string;
    status: string;
}

interface BulkEditProps {
    questions: QuestionItem[];
    categories: Category[];
}

export default function BulkEditQuestions({
    questions = [],
    categories = [],
}: BulkEditProps) {
    const cseCategoriesTree: Record<string, string[]> = {};

    if (categories && categories.length > 0) {
        categories.forEach((cat) => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(
                (sub) => sub.name,
            );
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection',
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension',
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation',
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems',
        ];
        cseCategoriesTree['Clerical Ability'] = ['Filing', 'Spelling'];
    }

    const [linkedFields, setLinkedFields] = useState<Set<string>>(new Set());

    const { data, setData, put, processing, errors } = useForm({
        questions: questions.map((q) => ({
            id: q.id,
            category: q.category || Object.keys(cseCategoriesTree)[0],
            subcategory: q.subcategory || cseCategoriesTree[q.category || Object.keys(cseCategoriesTree)[0]]?.[0],
            language: q.language || 'English',
            stem: q.stem || '',
            options: q.options && q.options.length > 0 ? [...q.options] : ['', '', '', '', ''],
            correct_option: q.correct_option ?? 0,
            explanation: q.explanation || '',
            status: q.status === 'ACTIVE' ? 'active' : 'draft',
        })),
    });

    const toggleLinkedField = (e: React.MouseEvent, fieldKey: string) => {
        if (e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            setLinkedFields((prev) => {
                const next = new Set(prev);
                if (next.has(fieldKey)) next.delete(fieldKey);
                else next.add(fieldKey);
                return next;
            });
        }
    };

    const getLinkedClass = (fieldKey: string) => {
        return linkedFields.has(fieldKey) 
            ? 'ring-2 ring-purple-500 ring-offset-2 border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/20' 
            : '';
    };

    const applyDiffToValue = (oldStr: string, newStr: string, targetStr: string) => {
        if (oldStr === newStr) return targetStr;
        oldStr = oldStr || '';
        newStr = newStr || '';
        targetStr = targetStr || '';
        
        let prefixLen = 0;
        while (prefixLen < oldStr.length && prefixLen < newStr.length && oldStr[prefixLen] === newStr[prefixLen]) prefixLen++;
        
        let suffixLen = 0;
        while (suffixLen < oldStr.length - prefixLen && suffixLen < newStr.length - prefixLen && oldStr[oldStr.length - 1 - suffixLen] === newStr[newStr.length - 1 - suffixLen]) suffixLen++;
        
        const addedStr = newStr.slice(prefixLen, newStr.length - suffixLen);
        const removedLen = oldStr.length - prefixLen - suffixLen;
        
        let targetPrefixLen = prefixLen;
        if (suffixLen === 0) {
            targetPrefixLen = Math.max(0, targetStr.length - removedLen);
        } else if (prefixLen === 0) {
            targetPrefixLen = 0;
        } else {
            const ratio = prefixLen / oldStr.length;
            targetPrefixLen = Math.max(0, Math.min(targetStr.length - removedLen, Math.round(targetStr.length * ratio)));
        }
        
        const targetPrefix = targetStr.slice(0, targetPrefixLen);
        const targetSuffix = targetStr.slice(targetPrefixLen + removedLen);
        
        return targetPrefix + addedStr + targetSuffix;
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const fieldKey = `${index}-${field}`;
        const newQuestions = [...data.questions];

        if (linkedFields.has(fieldKey)) {
            const oldValue = newQuestions[index][field as keyof typeof newQuestions[0]];
            
            linkedFields.forEach(key => {
                const [lQIndexStr, ...lFieldParts] = key.split('-');
                const lQIndex = parseInt(lQIndexStr, 10);
                const lField = lFieldParts.join('-');

                if (lField === 'category') {
                    newQuestions[lQIndex] = { ...newQuestions[lQIndex], category: value, subcategory: cseCategoriesTree[value]?.[0] || '' };
                } else if (lField === 'status' || lField === 'language' || lField === 'stem' || lField === 'explanation' || lField === 'subcategory') {
                    // Only apply diff for text fields, exact mirror for others
                    let newValue = value;
                    if (typeof value === 'string' && typeof oldValue === 'string' && (lField === 'stem' || lField === 'explanation')) {
                        newValue = applyDiffToValue(oldValue, value, newQuestions[lQIndex][lField] as string);
                    }
                    newQuestions[lQIndex] = { ...newQuestions[lQIndex], [lField]: newValue };
                }
            });
        } else {
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            if (field === 'category') {
                newQuestions[index].subcategory = cseCategoriesTree[value]?.[0] || '';
            }
        }
        
        setData('questions', newQuestions);
    };

    const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
        const fieldKey = `${qIndex}-options-${optIndex}`;
        const newQuestions = [...data.questions];

        if (linkedFields.has(fieldKey)) {
            const oldValue = newQuestions[qIndex].options[optIndex];
            
            linkedFields.forEach(key => {
                const [lQIndexStr, ...lFieldParts] = key.split('-');
                const lQIndex = parseInt(lQIndexStr, 10);
                const lField = lFieldParts.join('-');

                if (lField.startsWith('options-')) {
                    const lOptIndex = parseInt(lField.split('-')[1], 10);
                    const newOptions = [...newQuestions[lQIndex].options];
                    newOptions[lOptIndex] = applyDiffToValue(oldValue, val, newOptions[lOptIndex]);
                    newQuestions[lQIndex] = { ...newQuestions[lQIndex], options: newOptions };
                } else if (lField === 'stem' || lField === 'explanation') {
                    newQuestions[lQIndex] = { 
                        ...newQuestions[lQIndex], 
                        [lField]: applyDiffToValue(oldValue, val, newQuestions[lQIndex][lField as keyof typeof newQuestions[0]] as string) 
                    };
                } else {
                    newQuestions[lQIndex] = { ...newQuestions[lQIndex], [lField]: val };
                }
            });
        } else {
            const newOptions = [...newQuestions[qIndex].options];
            newOptions[optIndex] = val;
            newQuestions[qIndex].options = newOptions;
        }

        setData('questions', newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/questions/bulk-update');
    };

    return (
        <>
            <Head title="Bulk Edit Questions" />

            <CurationEditShell
                title="Bulk Edit Questions"
                description={`You are currently editing ${data.questions.length} questions. Hold Alt and click multiple fields to link them together for simultaneous editing.`}
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                headerTitle="Bulk Edit Mode"
                headerIcon={HelpCircle}
                onSaveSubmit={handleSubmit}
                isSaving={processing}
            >
                <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                        <span className="font-black">Multi-Edit Tip:</span> Hold <strong>Alt</strong> and click on multiple inputs (text boxes, options, dropdowns) to link them. Typing in one will magically update all linked fields at the same time!
                    </p>
                    {linkedFields.size > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setLinkedFields(new Set())}
                            className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline transition"
                        >
                            Clear linked selection ({linkedFields.size} fields linked)
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-8">
                    {data.questions.map((q, qIndex) => (
                        <div key={q.id} className="rounded-xl border border-border bg-card p-6 shadow-sm relative">
                            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                                <h3 className="text-lg font-bold">Question #{q.id}</h3>
                                <div 
                                    className={`flex items-center gap-2 rounded-lg p-1 transition-all cursor-pointer ${getLinkedClass(`${qIndex}-status`)}`}
                                    onClickCapture={(e) => toggleLinkedField(e, `${qIndex}-status`)}
                                >
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
                                    <select
                                        value={q.status}
                                        onChange={(e) => updateQuestion(qIndex, 'status', e.target.value)}
                                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                                <div 
                                    onClickCapture={(e) => toggleLinkedField(e, `${qIndex}-category`)}
                                    className={`rounded-lg p-1 transition-all ${getLinkedClass(`${qIndex}-category`)}`}
                                >
                                    <SelectField
                                        label="Target Category"
                                        value={q.category}
                                        onValueChange={(val) => updateQuestion(qIndex, 'category', val)}
                                        options={Object.keys(cseCategoriesTree)}
                                    />
                                </div>
                                <div 
                                    onClickCapture={(e) => toggleLinkedField(e, `${qIndex}-subcategory`)}
                                    className={`rounded-lg p-1 transition-all ${getLinkedClass(`${qIndex}-subcategory`)}`}
                                >
                                    <SelectField
                                        label="Target Subcategory"
                                        value={q.subcategory}
                                        onValueChange={(val) => updateQuestion(qIndex, 'subcategory', val)}
                                        options={cseCategoriesTree[q.category] || []}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div 
                                    onClickCapture={(e) => toggleLinkedField(e, `${qIndex}-language`)}
                                    className={`rounded-lg p-1 transition-all ${getLinkedClass(`${qIndex}-language`)}`}
                                >
                                    <SelectField
                                        label="Exam Language"
                                        value={q.language}
                                        onValueChange={(val) => updateQuestion(qIndex, 'language', val)}
                                        options={['English', 'Tagalog']}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                                    Question Stem
                                </label>
                                <textarea
                                    value={q.stem}
                                    onClick={(e) => toggleLinkedField(e, `${qIndex}-stem`)}
                                    onChange={(e) => updateQuestion(qIndex, 'stem', e.target.value)}
                                    rows={4}
                                    className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:outline-none transition-all ${
                                        errors[`questions.${qIndex}.stem`] ? 'border-red-500' : 'border-border focus:border-blue-500'
                                    } ${getLinkedClass(`${qIndex}-stem`)}`}
                                    required
                                />
                                {errors[`questions.${qIndex}.stem`] && (
                                    <p className="mt-1 text-[10px] font-medium text-red-500">{errors[`questions.${qIndex}.stem`]}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-[10px] font-extrabold text-slate-400 uppercase">
                                    Distractor Options & Correct Choice
                                </label>
                                <div className="space-y-3">
                                    {q.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`flex items-center gap-3.5 rounded-xl border p-3 transition duration-200 ${
                                                q.correct_option === optIndex
                                                    ? 'border-emerald-250 dark:border-emerald-850 bg-emerald-50/20 dark:bg-emerald-950/10'
                                                    : 'border-border'
                                            } ${getLinkedClass(`${qIndex}-options-${optIndex}`)}`}
                                            onClickCapture={(e) => {
                                                // Only toggle link if clicking on the wrapper or input, not the radio
                                                if ((e.target as HTMLInputElement).type !== 'radio') {
                                                    toggleLinkedField(e, `${qIndex}-options-${optIndex}`);
                                                }
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`correct_option_${q.id}`}
                                                checked={q.correct_option === optIndex}
                                                onChange={() => updateQuestion(qIndex, 'correct_option', optIndex)}
                                                className="size-4.5 cursor-pointer accent-emerald-600"
                                            />
                                            <span
                                                className={`inline-flex size-6.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                                                    q.correct_option === optIndex
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {String.fromCharCode(65 + optIndex)}
                                            </span>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                className="w-full bg-transparent text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                                    Cognitive Explanation & Rationale
                                </label>
                                <textarea
                                    value={q.explanation}
                                    rows={3}
                                    onClick={(e) => toggleLinkedField(e, `${qIndex}-explanation`)}
                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                    className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:outline-none transition-all ${
                                        errors[`questions.${qIndex}.explanation`] ? 'border-red-500' : 'border-border focus:border-blue-500'
                                    } ${getLinkedClass(`${qIndex}-explanation`)}`}
                                    required
                                />
                                {errors[`questions.${qIndex}.explanation`] && (
                                    <p className="mt-1 text-[10px] font-medium text-red-500">{errors[`questions.${qIndex}.explanation`]}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CurationEditShell>
        </>
    );
}

BulkEditQuestions.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Bulk Edit',
            href: '',
        },
    ],
};
