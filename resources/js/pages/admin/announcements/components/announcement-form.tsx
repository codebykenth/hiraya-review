import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface AnnouncementFormProps {
    data: {
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success';
        is_active: boolean;
        expires_at: string;
    };
    errors: Record<string, string>;
    processing: boolean;
    isEdit: boolean;
    setData: (field: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function AnnouncementForm({
    data,
    errors,
    processing,
    isEdit,
    setData,
    onSubmit,
    onCancel,
}: AnnouncementFormProps) {
    return (
        <DialogContent className="sm:max-w-2xl">
            <form onSubmit={onSubmit}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Announcement' : 'New Announcement'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update the announcement details and settings.'
                            : 'Create a banner notification that will appear on user dashboards.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor={isEdit ? 'edit-title' : 'title'}>
                            Title
                        </Label>
                        <Input
                            id={isEdit ? 'edit-title' : 'title'}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. System Maintenance Scheduled"
                        />
                        {errors.title && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={isEdit ? 'edit-message' : 'message'}>
                            Message
                        </Label>
                        <Textarea
                            id={isEdit ? 'edit-message' : 'message'}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Enter the full announcement text..."
                            className="min-h-[100px]"
                        />
                        {errors.message && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={isEdit ? 'edit-type' : 'type'}>
                            Type
                        </Label>
                        <Select
                            value={data.type}
                            onValueChange={(
                                v: 'info' | 'warning' | 'success',
                            ) => setData('type', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">
                                    Information (Blue)
                                </SelectItem>
                                <SelectItem value="warning">
                                    Warning (Amber)
                                </SelectItem>
                                <SelectItem value="success">
                                    Success (Green)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor={isEdit ? 'edit-expires_at' : 'expires_at'}
                        >
                            Expiration Date (Optional)
                        </Label>
                        <Input
                            id={isEdit ? 'edit-expires_at' : 'expires_at'}
                            type="datetime-local"
                            value={data.expires_at}
                            onChange={(e) =>
                                setData('expires_at', e.target.value)
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave blank to keep active indefinitely.
                        </p>
                        {errors.expires_at && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.expires_at}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Immediately publish to dashboards.
                            </p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked)
                            }
                        />
                    </div>
                </div>
                <DialogFooter className="mt-8">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing
                            ? isEdit
                                ? 'Updating...'
                                : 'Publishing...'
                            : isEdit
                              ? 'Update Announcement'
                              : 'Publish Announcement'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
