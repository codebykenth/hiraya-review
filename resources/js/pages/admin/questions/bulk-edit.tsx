import { Head, useForm } from '@inertiajs/react';
import { HelpCircle, Trash2, Settings2, Regex, Type } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { CurationEditShell } from '@/components/domain/curation-edit-shell';
import InputError from '@/components/shared/input-error';
import { SelectField } from '@/components/ui/select';
import { index as questionsIndex } from '@/routes/questions';

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.MutableRefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [props.value]);

    return (
        <textarea
            {...props}
            ref={textareaRef}
            className={`resize-none overflow-hidden ${props.className || ''}`}
        />
    );
});

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
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);

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

    const handleFindAndReplace = () => {
        if (!findText) return;
        
        let regex: RegExp;
        try {
            if (useRegex) {
                regex = new RegExp(findText, matchCase ? 'g' : 'gi');
            } else {
                const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                regex = new RegExp(escapedFind, matchCase ? 'g' : 'gi');
            }
        } catch (e) {
            alert("Invalid regular expression");
            return;
        }

        const newQuestions = data.questions.map(q => {
            const replaceAll = (str: string) => {
                if (!str) return str;
                return str.replace(regex, replaceText);
            };
            
            return {
                ...q,
                stem: replaceAll(q.stem),
                options: q.options.map(opt => replaceAll(opt)),
                explanation: replaceAll(q.explanation)
            };
        });
        
        setData('questions', newQuestions);
    };

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

    const removeQuestion = (indexToRemove: number) => {
        setData('questions', data.questions.filter((_, i) => i !== indexToRemove));
        setLinkedFields(new Set());
        // Also clear from selected if it was selected
        if (selectedToRemove.has(indexToRemove)) {
            setSelectedToRemove(prev => {
                const next = new Set(prev);
                next.delete(indexToRemove);
                return next;
            });
        }
    };

    const [selectedToRemove, setSelectedToRemove] = useState<Set<number>>(new Set());

    const toggleRemoveSelect = (index: number) => {
        setSelectedToRemove(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const bulkRemoveQuestions = () => {
        setData('questions', data.questions.filter((_, i) => !selectedToRemove.has(i)));
        setSelectedToRemove(new Set());
        setLinkedFields(new Set());
    };

    const handleSelectAll = () => {
        if (selectedToRemove.size === data.questions.length) {
            setSelectedToRemove(new Set());
        } else {
            setSelectedToRemove(new Set(data.questions.map((_, i) => i)));
        }
    };

    const errorIndices = Array.from(new Set(Object.keys(errors).map(key => {
        const match = key.match(/^questions\.(\d+)\./);
        return match ? parseInt(match[1], 10) : null;
    }).filter(i => i !== null))) as number[];

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

                {errorIndices.length > 0 && (
                    <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
                        <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Validation Errors Found</h4>
                        <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                            Please fix the errors in the following questions before saving:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {errorIndices.map(index => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition"
                                >
                                    Question #{data.questions[index]?.id || (index + 1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {selectedToRemove.size === data.questions.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedToRemove.size > 0 && (
                        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/30 dark:bg-red-950/20 w-full sm:w-auto justify-between sm:justify-start">
                            <span className="text-xs font-bold text-red-800 dark:text-red-300">
                                {selectedToRemove.size} selected
                            </span>
                            <button
                                type="button"
                                onClick={bulkRemoveQuestions}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700 transition"
                            >
                                <Trash2 className="size-3.5" />
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Batch Find & Replace</h4>
                    <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="w-full sm:w-1/3">
                            <label className="mb-1 block text-[10px] font-extrabold uppercase text-slate-400">Find (Exact Match)</label>
                            <input
                                type="text"
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                placeholder="e.g. ["
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
                            />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <label className="mb-1 block text-[10px] font-extrabold uppercase text-slate-400">Replace With</label>
                            <input
                                type="text"
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                placeholder="Leave empty to delete"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMatchCase(!matchCase)}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition ${matchCase ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                                    title="Match Case"
                                >
                                    <Type className="size-3" />
                                    Match Case
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseRegex(!useRegex)}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition ${useRegex ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                                    title="Use Regular Expression"
                                >
                                    <Regex className="size-3" />
                                    Regex
                                </button>
                            </div>
                            <button
                                type="button"
                                disabled={!findText}
                                onClick={handleFindAndReplace}
                                className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Replace All
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {data.questions.map((q, qIndex) => (
                        <div key={q.id} id={`question-${qIndex}`} className={`rounded-xl border p-6 shadow-sm relative transition-all ${selectedToRemove.has(qIndex) ? 'border-red-300 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/10' : 'border-border bg-card'}`}>
                            <div className="mb-4 flex flex-wrap items-center justify-between border-b border-border pb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedToRemove.has(qIndex)}
                                        onChange={() => toggleRemoveSelect(qIndex)}
                                        className="size-4.5 rounded border-slate-300 accent-red-600 text-red-600 focus:ring-red-600 cursor-pointer"
                                    />
                                    <h3 className="text-lg font-bold">Question #{q.id}</h3>
                                </div>
                                <div className="flex items-center gap-4">
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
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                                        title="Remove from bulk edit"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
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
                                <AutoResizeTextarea
                                    value={q.stem}
                                    onClick={(e) => toggleLinkedField(e, `${qIndex}-stem`)}
                                    onChange={(e) => updateQuestion(qIndex, 'stem', e.target.value)}
                                    rows={3}
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
                                <AutoResizeTextarea
                                    value={q.explanation}
                                    rows={2}
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
