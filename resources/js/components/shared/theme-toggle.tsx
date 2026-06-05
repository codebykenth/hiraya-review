import { Sun, Moon, Monitor, Check } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const options: {
        value: Appearance;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9 rounded-xl border border-border bg-transparent text-foreground transition-all duration-300 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label="Toggle theme"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 text-slate-700 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 text-blue-400 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-36 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            >
                {options.map(({ value, label, icon: Icon }) => {
                    const isActive = appearance === value;

                    return (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus:bg-accent focus:text-accent-foreground"
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="size-4 opacity-80" />
                                {label}
                            </span>
                            {isActive && (
                                <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
