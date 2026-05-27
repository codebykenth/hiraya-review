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
                <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Terms of Service
                </a>{' '}
                and{' '}
                <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Privacy Policy
                </a>
                .
            </label>
        </div>
    );
}
