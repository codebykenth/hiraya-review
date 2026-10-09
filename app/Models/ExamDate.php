<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

#[Fillable(['date', 'description', 'is_active'])]
class ExamDate extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the next upcoming active exam date, or dynamically estimate the next official CSC cycle.
     *
     * @return array{
     *     date: Carbon,
     *     date_string: string,
     *     raw: string,
     *     description: string,
     *     days_until: int,
     *     is_estimated: bool
     * }
     */
    public static function getNextActiveOrEstimated(): array
    {
        if (Schema::hasTable('exam_dates')) {
            $examDate = static::where('is_active', true)
                ->where('date', '>', now())
                ->orderBy('date')
                ->first();

            if ($examDate) {
                $carbon = Carbon::parse($examDate->date);

                return [
                    'date' => $carbon,
                    'date_string' => $carbon->format('F j, Y'),
                    'raw' => $carbon->toDateString(),
                    'description' => $examDate->description ?? 'Civil Service Examination',
                    'days_until' => max(1, (int) ceil(now()->diffInDays($carbon, false))),
                    'is_estimated' => false,
                ];
            }
        }

        $estimatedCarbon = static::estimateNextCscExamDate();
        $season = $estimatedCarbon->month === 3 ? 'March' : 'August';

        return [
            'date' => $estimatedCarbon,
            'date_string' => $estimatedCarbon->format('F j, Y'),
            'raw' => $estimatedCarbon->toDateString(),
            'description' => "{$season} {$estimatedCarbon->year} Examination",
            'days_until' => max(1, (int) ceil(now()->diffInDays($estimatedCarbon, false))),
            'is_estimated' => true,
        ];
    }

    /**
     * Dynamically estimate the next CSC Pen-and-Paper Test cycle (March or August).
     */
    public static function estimateNextCscExamDate(): Carbon
    {
        $now = now();
        $year = (int) $now->year;
        $month = (int) $now->month;

        if ($month < 3) {
            return Carbon::create($year, 3, 15, 8, 0, 0);
        } elseif ($month < 8) {
            return Carbon::create($year, 8, 15, 8, 0, 0);
        }

        return Carbon::create($year + 1, 3, 15, 8, 0, 0);
    }
}
