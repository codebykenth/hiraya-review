import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface PerformanceCardProps {
    onClearCache: () => void;
    onOptimize: () => void;
}

export function PerformanceCard({
    onClearCache,
    onOptimize,
}: PerformanceCardProps) {
    return (
        <Card className="border border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/50">
            <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Performance & Cache
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Manage the application cache to ensure optimal performance
                    or clear stale data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Clear System Cache
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Removes all temporary compiled views and application
                            cache.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                        onClick={onClearCache}
                    >
                        Clear Cache
                    </Button>
                </div>
                <div className="flex flex-col justify-between border-t border-slate-200/50 pt-4 sm:flex-row sm:items-center dark:border-slate-800/50">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Optimize Framework
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Compiles configurations and routes into a fast,
                            singular cache file.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                        onClick={onOptimize}
                    >
                        Optimize App
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
