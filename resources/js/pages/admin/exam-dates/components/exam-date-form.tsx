import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ExamDateFormData } from '../types';

interface ExamDateFormProps {
    editingId: number | null;
    data: ExamDateFormData;
    errors: Record<string, string>;
    processing: boolean;
    onDateChange: (date: string) => void;
    onDescriptionChange: (description: string) => void;
    onActiveChange: (isActive: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function ExamDateForm({
    editingId,
    data,
    errors,
    processing,
    onDateChange,
    onDescriptionChange,
    onActiveChange,
    onSubmit,
    onCancel,
}: ExamDateFormProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-blue-500" />
                {editingId ? 'Edit Exam Date' : 'Add Exam Date'}
            </h3>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Date
                    </label>
                    <Input
                        type="date"
                        value={data.date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full"
                        required
                    />
                    {errors.date && (
                        <p className="mt-1 text-sm leading-relaxed text-red-500">
                            {errors.date}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Description
                    </label>
                    <Input
                        type="text"
                        value={data.description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="e.g., August 2026 Exam"
                        className="w-full"
                        required
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm leading-relaxed text-red-500">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={data.is_active}
                        onChange={(e) => onActiveChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                        htmlFor="is_active"
                        className="text-sm font-medium text-foreground"
                    >
                        Active
                    </label>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {editingId ? 'Update Date' : 'Add Date'}
                    </Button>
                    {editingId && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
