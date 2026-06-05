import { Megaphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
    onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
    return (
        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Megaphone className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Announcements Yet
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Create your first announcement to broadcast messages to all user
                dashboards.
            </p>
            <Button variant="outline" className="mt-6" onClick={onCreate}>
                <Plus className="mr-2 size-4" />
                Create Now
            </Button>
        </Card>
    );
}
