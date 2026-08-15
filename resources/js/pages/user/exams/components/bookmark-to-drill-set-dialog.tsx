import { BookmarkPlus, Bookmark, Check, FolderPlus, Loader2, Sparkles, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SavedSetOption {
    id: number;
    name: string;
    description?: string | null;
    color: string;
    questions_count: number;
}

interface QuestionData {
    id: number;
    stem: string;
    options?: string[];
    correct_option?: number;
    explanation?: string;
    category?: string;
}

interface BookmarkToDrillSetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question?: QuestionData | null;
    onSaved?: (questionId: number) => void;
}

export function BookmarkToDrillSetDialog({
    open,
    onOpenChange,
    question,
    onSaved,
}: BookmarkToDrillSetDialogProps) {
    if (!question) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <BookmarkForm
                    key={question.id}
                    question={question}
                    onOpenChange={onOpenChange}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    );
}

function BookmarkForm({
    question,
    onOpenChange,
    onSaved,
}: {
    question: QuestionData;
    onOpenChange: (open: boolean) => void;
    onSaved?: (questionId: number) => void;
}) {
    const [sets, setSets] = useState<SavedSetOption[]>([]);
    const [isLoadingSets, setIsLoadingSets] = useState(true);
    const [selectedMode, setSelectedMode] = useState<'existing' | 'new' | 'default'>('default');
    const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
    const [newSetName, setNewSetName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        fetch('/drills/saved-sets', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    const fetchedSets = data.sets || [];
                    setSets(fetchedSets);
                    if (fetchedSets.length > 0) {
                        setSelectedSetId(fetchedSets[0].id);
                    }
                    setIsLoadingSets(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsLoadingSets(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload: Record<string, unknown> = {
                question_id: question.id,
            };

            if (selectedMode === 'existing' && selectedSetId) {
                payload.saved_drill_set_id = selectedSetId;
            } else if (selectedMode === 'new' && newSetName.trim()) {
                payload.new_set_name = newSetName.trim();
            }

            const response = await fetch('/drills/saved-sets/add-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to bookmark question');
            }

            const result = await response.json();
            toast.success(`Bookmarked to "${result.set_name || 'Practice Set'}"!`, {
                description: 'You can practice this question anytime in Practice Drills > Saved Sets.',
            });

            onSaved?.(question.id);
            onOpenChange(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error bookmarking question';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2 border border-blue-200 dark:border-blue-800">
                        <BookmarkPlus className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-bold text-foreground">
                        Bookmark to Practice Set
                    </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                    Save this question to your custom practice sets to re-test yourself with instant rationales later.
                </DialogDescription>
            </DialogHeader>

            {/* Set Selection Options */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Choose Practice Set</span>
                    {isLoadingSets && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedMode('default')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition ${
                            selectedMode === 'default'
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <Sparkles className="size-3.5 text-blue-500" /> Default Set
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Bookmarked Items</span>
                    </button>

                    <button
                        type="button"
                        disabled={sets.length === 0}
                        onClick={() => setSelectedMode('existing')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            selectedMode === 'existing'
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <Folder className="size-3.5 text-blue-500" /> My Sets
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                            {sets.length > 0 ? `${sets.length} set(s)` : 'None yet'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedMode('new')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition ${
                            selectedMode === 'new'
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <FolderPlus className="size-3.5 text-blue-500" /> New Set
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Create new</span>
                    </button>
                </div>

                {selectedMode === 'existing' && sets.length > 0 && (
                    <div className="pt-2">
                        <Label htmlFor="existing-set-select" className="text-[11px] text-muted-foreground">
                            Select Target Set
                        </Label>
                        <select
                            id="existing-set-select"
                            value={selectedSetId ?? sets[0]?.id}
                            onChange={(e) => setSelectedSetId(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                            {sets.map((set) => (
                                <option key={set.id} value={set.id}>
                                    {set.name} ({set.questions_count} items)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedMode === 'new' && (
                    <div className="pt-2">
                        <Label htmlFor="new-set-name" className="text-[11px] text-muted-foreground">
                            New Set Name
                        </Label>
                        <Input
                            id="new-set-name"
                            required
                            value={newSetName}
                            onChange={(e) => setNewSetName(e.target.value)}
                            placeholder="e.g. Tough Word Problems, Syllogisms"
                            className="mt-1 h-9 text-xs"
                        />
                    </div>
                )}
            </div>

            {/* Question Preview Box */}
            <div className="rounded-xl border border-border bg-card p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {question.category || 'Exam Question'}
                    </Badge>
                </div>
                <p className="text-foreground line-clamp-2 leading-relaxed font-medium">
                    {question.stem}
                </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="text-xs rounded-xl"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="size-3.5 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Check className="size-3.5" /> Bookmark Question
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
