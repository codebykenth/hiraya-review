import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { ChartDataPoint } from '../types';

interface ScoreTrendsProps {
    filteredChartData: ChartDataPoint[];
    isDemoMode: boolean;
}

export function ScoreTrends({ filteredChartData, isDemoMode }: ScoreTrendsProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const chartWidth = 800;
    const chartHeight = 260;
    const chartPadding = 32;
    const chartPaddingLeft = 50;
    const chartPaddingRight = 32;

    const points = filteredChartData.map((dp, idx) => {
        const x =
            chartPaddingLeft +
            (idx * (chartWidth - chartPaddingLeft - chartPaddingRight)) /
                (filteredChartData.length - 1 || 1);
        const y =
            chartHeight -
            chartPadding -
            (dp.score * (chartHeight - chartPadding * 2)) / 100;

        return { x, y };
    });

    const pathD = points.reduce((acc, p, i) => {
        if (i === 0) {
            return `M ${p.x} ${p.y}`;
        }

        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;

        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    const areaD =
        points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`
            : '';

    return (
        <Card className="relative p-6 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="flex items-center gap-2 font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Score History
                        {isDemoMode && (
                            <span className="bg-amber-50 inline-flex items-center gap-1 rounded-full border border-amber-200/65 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-700 uppercase dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                                Demo Data
                            </span>
                        )}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Track your score percentage across recent attempts.
                    </p>
                    <div className="group relative flex w-fit items-center gap-1 text-xs font-bold text-slate-400">
                        <Info className="size-3.5 cursor-help" />
                        Trend details
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded bg-slate-900 p-2 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-800">
                            Displays the scores of your last attempts. Hover on any node to view details.
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive SVG line chart visualization */}
            <div className="relative w-full overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 dark:border-slate-800/70 dark:from-slate-900/30 dark:to-slate-900">
                <div className="min-w-[600px] md:min-w-0">
                    {/* Detailed HTML absolute glassmorphic tooltip card */}
                    {hoveredIdx !== null &&
                        filteredChartData[hoveredIdx] &&
                        filteredChartData[hoveredIdx].track !== 'No Data' && (
                            <div
                                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-blue-200/50 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-all duration-150 dark:border-slate-800/50 dark:bg-slate-900/95"
                                style={{
                                    left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
                                    top: `${(points[hoveredIdx].y / chartHeight) * 100 - 8}%`,
                                }}
                            >
                                <div className="flex min-w-[130px] flex-col gap-1">
                                    <span className="text-[10px] font-extrabold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                        {filteredChartData[hoveredIdx].track}
                                    </span>
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-sm font-black text-slate-800 dark:text-white">
                                            {filteredChartData[hoveredIdx].score}%
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                            {filteredChartData[hoveredIdx].detail}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-slate-450">
                                        Date: {filteredChartData[hoveredIdx].date}
                                    </span>
                                </div>
                            </div>
                        )}

                    <svg
                        className="h-auto w-full"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    >
                        <defs>
                            <pattern
                                id="grid"
                                width="40"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 40 0 L 0 0 0 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-blue-100/40 dark:text-slate-800/40"
                                />
                            </pattern>
                            <linearGradient
                                id="chartGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                                patternUnits="userSpaceOnUse"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#2563eb"
                                    stopOpacity="0.2"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#2563eb"
                                    stopOpacity="0.0"
                                />
                            </linearGradient>
                        </defs>

                        {/* Background grid mesh */}
                        <rect
                            width={chartWidth}
                            height={chartHeight}
                            fill="url(#grid)"
                        />

                        {/* Render clean guide metrics */}
                        {[0, 25, 50, 75, 100].map((level) => {
                            const y =
                                chartHeight -
                                chartPadding -
                                (level * (chartHeight - chartPadding * 2)) / 100;

                            return (
                                <g key={level}>
                                    <line
                                        x1={chartPaddingLeft}
                                        y1={y}
                                        x2={chartWidth - chartPaddingRight}
                                        y2={y}
                                        stroke="currentColor"
                                        strokeWidth="0.5"
                                        className="text-blue-100/30 dark:text-slate-800/30"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x={chartPaddingLeft - 8}
                                        y={y + 3}
                                        textAnchor="end"
                                        fontSize="9"
                                        fontWeight="bold"
                                        className="fill-slate-400 dark:fill-slate-500"
                                    >
                                        {level}%
                                    </text>
                                </g>
                            );
                        })}

                        {points.length > 0 && (
                            <>
                                <path
                                    d={areaD}
                                    fill="url(#chartGradient)"
                                />
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </>
                        )}

                        {points.length === 0 && (
                            <text
                                x={chartWidth / 2}
                                y={chartHeight / 2}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="semibold"
                                className="fill-slate-400 dark:fill-slate-500"
                            >
                                No matched attempts found.
                            </text>
                        )}

                        {points.map((p, idx) => (
                            <g key={idx}>
                                {hoveredIdx === idx && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="9"
                                        fill="#2563eb"
                                        fillOpacity="0.15"
                                        className="animate-pulse"
                                    />
                                )}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredIdx === idx ? 6 : 4.5}
                                    fill="#ffffff"
                                    stroke="#2563eb"
                                    strokeWidth={hoveredIdx === idx ? 3 : 2}
                                    className="cursor-pointer transition-all duration-150"
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />

                                {idx === points.length - 1 && hoveredIdx === null && (
                                    <text
                                        x={p.x - 15}
                                        y={p.y - 12}
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill="#2563eb"
                                        className="dark:fill-blue-400"
                                    >
                                        {filteredChartData[idx].score}%
                                    </text>
                                )}

                                <text
                                    x={p.x}
                                    y={chartHeight - 4}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="bold"
                                    className="cursor-pointer fill-slate-400 hover:fill-blue-600 dark:fill-slate-500 dark:hover:fill-blue-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHoveredIdx(hoveredIdx === idx ? null : idx);
                                    }}
                                >
                                    {filteredChartData[idx].date}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </Card>
    );
}
