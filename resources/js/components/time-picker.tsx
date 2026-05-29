import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    const parseTime = (timeString: string) => {
        if (!timeString) {
            return { hours: 0, minutes: 0, period: 'AM' };
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-semibold text-slate-900 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
            >
                {displayTime}
            </button>

            {showPicker && (
                <div className="absolute top-full right-0 left-0 z-10 mt-2 rounded-lg border border-slate-300 bg-white p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-4">
                        {/* Hours */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={incrementHour}
                                className="rounded p-1 hover:bg-slate-100"
                            >
                                <ChevronUp className="h-5 w-5 text-slate-600" />
                            </button>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={String(hours).padStart(2, '0')}
                                onChange={(e) =>
                                    handleHourChange(
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                className="h-12 w-16 rounded border border-slate-300 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={decrementHour}
                                className="rounded p-1 hover:bg-slate-100"
                            >
                                <ChevronDown className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>

                        <div className="text-2xl font-bold text-slate-600">
                            :
                        </div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={incrementMinute}
                                className="rounded p-1 hover:bg-slate-100"
                            >
                                <ChevronUp className="h-5 w-5 text-slate-600" />
                            </button>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={String(minutes).padStart(2, '0')}
                                onChange={(e) =>
                                    handleMinuteChange(
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                className="h-12 w-16 rounded border border-slate-300 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={decrementMinute}
                                className="rounded p-1 hover:bg-slate-100"
                            >
                                <ChevronDown className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Period */}
                        <div className="flex flex-col items-center gap-2 border-l border-slate-300 pl-4">
                            <button
                                type="button"
                                onClick={() =>
                                    handlePeriodChange(
                                        period === 'AM' ? 'PM' : 'AM',
                                    )
                                }
                                className="rounded px-3 py-1 font-semibold hover:bg-slate-100"
                            >
                                {period === 'AM' ? '↓' : '↑'}
                            </button>
                            <div className="text-lg font-bold text-slate-900">
                                {period}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    handlePeriodChange(
                                        period === 'AM' ? 'PM' : 'AM',
                                    )
                                }
                                className="rounded px-3 py-1 font-semibold hover:bg-slate-100"
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
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
