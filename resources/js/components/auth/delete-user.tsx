import { Form } from '@inertiajs/react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/shared/heading';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const [confirmation, setConfirmation] = useState('');

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-base leading-relaxed">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            confirm you would like to permanently delete your
                            account by typing "
                            <span className="font-bold text-foreground">
                                delete account
                            </span>
                            ".
                        </DialogDescription>

                        <Form
                            action={ProfileController.destroy().url}
                            method={ProfileController.destroy().method}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="confirmation"
                                            className="sr-only"
                                        >
                                            Confirmation text
                                        </Label>

                                        <Input
                                            id="confirmation"
                                            name="confirmation"
                                            value={confirmation}
                                            onChange={(e) =>
                                                setConfirmation(e.target.value)
                                            }
                                            placeholder="delete account"
                                            autoComplete="off"
                                        />

                                        <InputError
                                            message={errors.confirmation}
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setConfirmation('');
                                                    resetAndClearErrors();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={
                                                processing ||
                                                confirmation !==
                                                    'delete account'
                                            }
                                            data-test="confirm-delete-user-button"
                                        >
                                            Delete account
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
