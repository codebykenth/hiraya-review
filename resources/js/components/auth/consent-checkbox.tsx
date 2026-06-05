import { Link } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';

export default function ConsentCheckbox({
    id,
    checked,
    onCheckedChange,
    tabIndex,
}: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    tabIndex?: number;
}) {
    return (
        <div className="flex items-start gap-3">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                tabIndex={tabIndex}
                className="mt-0.5"
            />
            <label
                htmlFor={id}
                className="cursor-pointer text-sm leading-relaxed text-slate-600 dark:text-slate-400"
            >
                I have read and agree to the{' '}
                <Link
                    href="/terms"
                    className="group font-medium text-blue-600 underline underline-offset-2 transition-all duration-300 hover:text-blue-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                    href="/privacy"
                    className="group font-medium text-blue-600 underline underline-offset-2 transition-all duration-300 hover:text-blue-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Privacy Policy
                </Link>
                .
            </label>
        </div>
    );
}
