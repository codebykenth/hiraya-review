import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExamCountdownProps {
    examDate: string;
    examDateRaw: string;
    motivationText?: string | null;
}

export function ExamCountdown({ examDate, examDateRaw, motivationText }: ExamCountdownProps) {
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
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [examDateRaw]);

    if (timeLeft.isExpired) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-500 to-red-650 p-6 text-white shadow-md dark:border-rose-900/50 dark:from-slate-900 dark:to-rose-950/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                            <Clock className="size-6 text-white animate-bounce" />
                        </div>
                        <div>
                            <span className="text-xs font-bold tracking-widest text-rose-100 uppercase">
                                Exam Day Is Here
                            </span>
                            <h3 className="font-heading text-lg font-black tracking-tight text-white mt-0.5">
                                Civil Service Exam date has arrived: <span className="underline decoration-white/40 decoration-2 underline-offset-4">{examDate}</span>
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white/20 px-4 py-2 font-bold backdrop-blur-sm">
                        Best of luck! 🎯
                    </div>
                </div>
            </div>
        );
    }

    const padZero = (num: number) => String(num).padStart(2, '0');
    const isUrgent = timeLeft.days <= 30;

    return (
        <div className={`relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg p-6 text-white shadow-md ${
            isUrgent
                ? 'border-amber-250 bg-gradient-to-br from-amber-600 to-rose-700 dark:border-amber-900/40 dark:from-slate-900 dark:to-amber-950/30'
                : 'border-blue-200/50 bg-gradient-to-br from-blue-600 to-indigo-700 dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/50'
        }`}>
            {/* Decorative background lights */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl dark:bg-blue-500/10" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                        <Clock className={`size-8 text-white ${isUrgent ? 'animate-pulse text-amber-100' : ''}`} />
                    </div>
                    <div>
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isUrgent ? 'text-amber-150' : 'text-blue-100'}`}>
                            {isUrgent ? '⚠️ EXAM Nearing COUNTDOWN' : 'Exam Countdown'}
                        </span>
                        <h3 className="font-heading text-lg font-black tracking-tight text-white mt-0.5">
                            Civil Service Exam: <span className="underline decoration-white/40 decoration-2 underline-offset-4">{examDate}</span>
                        </h3>
                    </div>
                </div>

                {/* Countdown Numbers Grid */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                        {/* Days */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/15 font-mono text-xl sm:text-2xl font-extrabold tracking-tight backdrop-blur-md">
                                {padZero(timeLeft.days)}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-white/70 uppercase">Days</span>
                        </div>

                        <span className="text-lg sm:text-xl font-bold text-white/50 h-12 sm:h-14 flex items-center font-mono">:</span>

                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/15 font-mono text-xl sm:text-2xl font-extrabold tracking-tight backdrop-blur-md">
                                {padZero(timeLeft.hours)}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-white/70 uppercase">Hrs</span>
                        </div>

                        <span className="text-lg sm:text-xl font-bold text-white/50 h-12 sm:h-14 flex items-center font-mono">:</span>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/15 font-mono text-xl sm:text-2xl font-extrabold tracking-tight backdrop-blur-md">
                                {padZero(timeLeft.minutes)}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-white/70 uppercase">Mins</span>
                        </div>

                        <span className="text-lg sm:text-xl font-bold text-white/50 h-12 sm:h-14 flex items-center font-mono">:</span>

                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/15 font-mono text-xl sm:text-2xl font-extrabold tracking-tight text-amber-200/90 backdrop-blur-md">
                                {padZero(timeLeft.seconds)}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-white/70 uppercase">Secs</span>
                        </div>
                    </div>

                    <div className="border-l border-white/20 pl-4 py-1 max-w-[200px] hidden md:block">
                        <p className="text-xs font-bold leading-snug">
                            {motivationText || (isUrgent 
                                ? '🚨 Time is running short! Focus on your weakest topics now.' 
                                : 'Master your study recommendations to boost your passing probability.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
