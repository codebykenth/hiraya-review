import { Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface ExamCountdownProps {
    examDate: string;
    examDateRaw: string;
    motivationText?: string | null;
}

export function ExamCountdown({
    examDate,
    examDateRaw,
    motivationText,
}: ExamCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        // Set target time to 00:00:00 of the exam date
        const targetDate = new Date(`${examDateRaw}T00:00:00`);

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                });

                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [examDateRaw]);

    if (timeLeft.isExpired) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-rose-200/60 bg-rose-50/60 p-6 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-100/50 border border-rose-200/50 backdrop-blur-md dark:bg-rose-500/20 dark:border-rose-500/30">
                            <Clock className="size-6 animate-bounce text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase dark:text-rose-500">
                                Exam Day Is Here
                            </span>
                            <h3 className="mt-0.5 font-heading text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                Civil Service Exam date has arrived:{' '}
                                <span className="underline decoration-slate-300 dark:decoration-white/40 decoration-2 underline-offset-4">
                                    {examDate}
                                </span>
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white/60 border border-rose-100 px-4 py-2 text-sm font-bold text-rose-700 backdrop-blur-sm dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300">
                        Best of luck! 🎯
                    </div>
                </div>
            </div>
        );
    }

    const padZero = (num: number) => String(num).padStart(2, '0');
    const isUrgent = timeLeft.days <= 30;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md backdrop-blur-xl ${
                isUrgent
                    ? 'border-amber-200/60 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30'
                    : 'border-blue-100/60 bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900/60'
            }`}
        >
            {/* Decorative background lights */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className={`flex size-14 shrink-0 items-center justify-center rounded-full backdrop-blur-md border ${isUrgent ? 'bg-amber-100/50 border-amber-200/50 dark:bg-amber-500/20 dark:border-amber-500/30' : 'bg-blue-100/50 border-blue-200/50 dark:bg-blue-500/20 dark:border-blue-500/30'}`}>
                        <Clock
                            className={`size-7 ${isUrgent ? 'animate-pulse text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}
                        />
                    </div>
                    <div>
                        <span
                            className={`text-[10px] font-bold tracking-widest uppercase ${isUrgent ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-400'}`}
                        >
                            {isUrgent
                                ? '⚠️ EXAM Nearing COUNTDOWN'
                                : 'Exam Countdown'}
                        </span>
                        <h3 className="mt-0.5 font-heading text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Civil Service Exam:{' '}
                            <span className="underline decoration-slate-300 dark:decoration-white/40 decoration-2 underline-offset-4">
                                {examDate}
                            </span>
                        </h3>
                    </div>
                </div>

                {/* Countdown Numbers Grid */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                        {/* Days */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 items-center justify-center rounded-full border border-slate-200/60 bg-white/60 font-mono text-xl font-extrabold tracking-tight text-slate-800 backdrop-blur-md sm:size-14 sm:text-2xl dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-white">
                                {padZero(timeLeft.days)}
                            </div>
                            <span className="mt-1.5 text-[9px] font-bold text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                Days
                            </span>
                        </div>

                        <span className="flex h-12 items-center font-mono text-lg font-bold text-slate-300 sm:h-14 sm:text-xl dark:text-slate-600">
                            :
                        </span>

                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 items-center justify-center rounded-full border border-slate-200/60 bg-white/60 font-mono text-xl font-extrabold tracking-tight text-slate-800 backdrop-blur-md sm:size-14 sm:text-2xl dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-white">
                                {padZero(timeLeft.hours)}
                            </div>
                            <span className="mt-1.5 text-[9px] font-bold text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                Hrs
                            </span>
                        </div>

                        <span className="flex h-12 items-center font-mono text-lg font-bold text-slate-300 sm:h-14 sm:text-xl dark:text-slate-600">
                            :
                        </span>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 items-center justify-center rounded-full border border-slate-200/60 bg-white/60 font-mono text-xl font-extrabold tracking-tight text-slate-800 backdrop-blur-md sm:size-14 sm:text-2xl dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-white">
                                {padZero(timeLeft.minutes)}
                            </div>
                            <span className="mt-1.5 text-[9px] font-bold text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                Mins
                            </span>
                        </div>

                        <span className="flex h-12 items-center font-mono text-lg font-bold text-slate-300 sm:h-14 sm:text-xl dark:text-slate-600">
                            :
                        </span>

                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 items-center justify-center rounded-full border border-slate-200/60 bg-white/60 font-mono text-xl font-extrabold tracking-tight text-blue-600 backdrop-blur-md sm:size-14 sm:text-2xl dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-blue-400">
                                {padZero(timeLeft.seconds)}
                            </div>
                            <span className="mt-1.5 text-[9px] font-bold text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                Secs
                            </span>
                        </div>
                    </div>

                    <div className="hidden max-w-[200px] border-l border-slate-200 py-1 pl-4 md:block dark:border-slate-800">
                        <p className="text-xs leading-snug font-bold text-slate-600 dark:text-slate-400">
                            {motivationText ||
                                (isUrgent
                                    ? '🚨 Time is running short! Focus on your weakest topics now.'
                                    : 'Master your study recommendations to boost your passing probability.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
