import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    const parseTime = (timeString: string) => {
        if (!timeString) {
            return { hours: 12, minutes: 0, period: 'AM' };
        }

        const [hoursStr, minutesStr] = timeString.split(':');
        const hours24 = parseInt(hoursStr) || 0;
        const minutes = parseInt(minutesStr) || 0;

        // Convert to 12-hour format
        const period = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 =
            hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

        return { hours: hours12, minutes, period };
    };

    const convertTo24Hour = (hours12: number, period: string) => {
        let hours24 = hours12;

        if (period === 'AM' && hours24 === 12) {
            hours24 = 0;
        }

        if (period === 'PM' && hours24 !== 12) {
            hours24 += 12;
        }

        return hours24;
    };

    const { hours, minutes, period } = parseTime(value);

    // Local inputs for typing to prevent parent state overriding during active typing
    const [hourInput, setHourInput] = useState(String(hours).padStart(2, '0'));
    const [minuteInput, setMinuteInput] = useState(
        String(minutes).padStart(2, '0'),
    );
    const [isHourFocused, setIsHourFocused] = useState(false);
    const [isMinuteFocused, setIsMinuteFocused] = useState(false);

    // Keep local state in sync with value updates when not focused
    useEffect(() => {
        const { hours: nextHours, minutes: nextMinutes } = parseTime(value);

        const timer = setTimeout(() => {
            if (!isHourFocused) {
                setHourInput(String(nextHours).padStart(2, '0'));
            }

            if (!isMinuteFocused) {
                setMinuteInput(String(nextMinutes).padStart(2, '0'));
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [value, isHourFocused, isMinuteFocused]);

    const handleHourInputChange = (val: string) => {
        // Strip non-digits and cap at 2 characters
        const cleanVal = val.replace(/\D/g, '').substring(0, 2);
        setHourInput(cleanVal);

        const parsed = parseInt(cleanVal);

        if (!isNaN(parsed)) {
            const constrainedHour = Math.max(1, Math.min(12, parsed));
            const hours24 = convertTo24Hour(constrainedHour, period);
            onChange(
                `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
            );
        }
    };

    const handleMinuteInputChange = (val: string) => {
        // Strip non-digits and cap at 2 characters
        const cleanVal = val.replace(/\D/g, '').substring(0, 2);
        setMinuteInput(cleanVal);

        const parsed = parseInt(cleanVal);

        if (!isNaN(parsed)) {
            const constrainedMinute = Math.max(0, Math.min(59, parsed));
            const hours24 = convertTo24Hour(hours, period);
            onChange(
                `${String(hours24).padStart(2, '0')}:${String(constrainedMinute).padStart(2, '0')}`,
            );
        }
    };

    const handleHourBlur = () => {
        setIsHourFocused(false);
        const parsed = parseInt(hourInput);
        const finalHour = isNaN(parsed)
            ? 12
            : Math.max(1, Math.min(12, parsed));
        setHourInput(String(finalHour).padStart(2, '0'));
        const hours24 = convertTo24Hour(finalHour, period);
        onChange(
            `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        );
    };

    const handleMinuteBlur = () => {
        setIsMinuteFocused(false);
        const parsed = parseInt(minuteInput);
        const finalMinute = isNaN(parsed)
            ? 0
            : Math.max(0, Math.min(59, parsed));
        setMinuteInput(String(finalMinute).padStart(2, '0'));
        const hours24 = convertTo24Hour(hours, period);
        onChange(
            `${String(hours24).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`,
        );
    };

    const handleHourChange = (newHour: number) => {
        const constrainedHour = Math.max(1, Math.min(12, newHour));
        const hours24 = convertTo24Hour(constrainedHour, period);
        onChange(
            `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        );
    };

    const handleMinuteChange = (newMinute: number) => {
        const constrainedMinute = Math.max(0, Math.min(59, newMinute));
        const hours24 = convertTo24Hour(hours, period);
        onChange(
            `${String(hours24).padStart(2, '0')}:${String(constrainedMinute).padStart(2, '0')}`,
        );
    };

    const handlePeriodChange = (newPeriod: string) => {
        const hours24 = convertTo24Hour(hours, newPeriod);
        onChange(
            `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        );
    };

    const incrementHour = () => {
        handleHourChange(hours + 1 > 12 ? 1 : hours + 1);
    };

    const decrementHour = () => {
        handleHourChange(hours - 1 < 1 ? 12 : hours - 1);
    };

    const incrementMinute = () => {
        const newMinute = (minutes + 15) % 60;
        handleMinuteChange(newMinute);
    };

    const decrementMinute = () => {
        const newMinute = minutes - 15 < 0 ? 45 : minutes - 15;
        handleMinuteChange(newMinute);
    };

    const displayTime = value
        ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
        : 'Select time';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-semibold text-slate-900 hover:bg-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
                {displayTime}
            </button>

            {showPicker && (
                <div className="absolute top-full right-0 left-0 z-10 mt-2 rounded-lg border border-slate-300 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center justify-center gap-4">
                        {/* Hours */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={incrementHour}
                                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <input
                                type="text"
                                value={hourInput}
                                onFocus={() => setIsHourFocused(true)}
                                onChange={(e) =>
                                    handleHourInputChange(e.target.value)
                                }
                                onBlur={handleHourBlur}
                                className="h-12 w-16 rounded border border-slate-300 bg-white text-center text-lg font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <button
                                type="button"
                                onClick={decrementHour}
                                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="text-3xl font-black tracking-tight text-slate-600 sm:text-4xl dark:text-slate-400">
                            :
                        </div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={incrementMinute}
                                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <input
                                type="text"
                                value={minuteInput}
                                onFocus={() => setIsMinuteFocused(true)}
                                onChange={(e) =>
                                    handleMinuteInputChange(e.target.value)
                                }
                                onBlur={handleMinuteBlur}
                                className="h-12 w-16 rounded border border-slate-300 bg-white text-center text-lg font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <button
                                type="button"
                                onClick={decrementMinute}
                                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Period */}
                        <div className="flex flex-col items-center gap-2 border-l border-slate-300 pl-4 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() =>
                                    handlePeriodChange(
                                        period === 'AM' ? 'PM' : 'AM',
                                    )
                                }
                                className="rounded px-3 py-1 font-semibold hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                                {period === 'AM' ? '↓' : '↑'}
                            </button>
                            <div className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                                {period}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    handlePeriodChange(
                                        period === 'AM' ? 'PM' : 'AM',
                                    )
                                }
                                className="rounded px-3 py-1 font-semibold hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                                {period === 'AM' ? '↓' : '↑'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setShowPicker(false);
                            }}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPicker(false)}
                            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
