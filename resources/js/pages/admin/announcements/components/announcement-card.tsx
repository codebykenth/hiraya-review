import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface Announcement {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

interface AnnouncementCardProps {
    announcement: Announcement;
    onToggleStatus: (
        id: number,
        currentStatus: boolean,
        announcement: Announcement,
    ) => void;
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: number) => void;
}

export function AnnouncementCard({
    announcement,
    onToggleStatus,
    onEdit,
    onDelete,
}: AnnouncementCardProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="size-5 text-amber-500" />;
            case 'success':
                return <CheckCircle2 className="size-5 text-emerald-500" />;
            default:
                return <Info className="size-5 text-blue-500" />;
        }
    };

    const getTypeClasses = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40';
            case 'success':
                return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40';
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40';
        }
    };

    return (
        <Card
            className={`flex flex-col justify-between overflow-hidden transition-all hover:shadow-md ${getTypeClasses(announcement.type)}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {getTypeIcon(announcement.type)}
                        <span className="text-xs font-bold tracking-wider uppercase opacity-70">
                            {announcement.type}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={announcement.is_active}
                            onCheckedChange={() =>
                                onToggleStatus(
                                    announcement.id,
                                    announcement.is_active,
                                    announcement,
                                )
                            }
                            aria-label="Toggle active status"
                        />
                    </div>
                </div>
                <CardTitle className="mt-3 text-lg leading-tight">
                    {announcement.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="line-clamp-3 text-sm leading-relaxed opacity-80">
                    {announcement.message}
                </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-black/5 bg-black/5 pt-3 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
                    <Calendar className="size-3.5" />
                    {new Date(announcement.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        onClick={() => onEdit(announcement)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/20"
                        onClick={() => onDelete(announcement.id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
