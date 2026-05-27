import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const options: { value: Appearance; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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
                    className="relative size-9 rounded-xl border border-border bg-transparent text-foreground hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-300"
                    aria-label="Toggle theme"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg border border-border bg-popover text-popover-foreground">
                {options.map(({ value, label, icon: Icon }) => {
                    const isActive = appearance === value;
                    return (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground"
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="size-4 opacity-80" />
                                {label}
                            </span>
                            {isActive && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
