<?php

namespace App\Http\Controllers;

use App\Models\StudySchedule;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudyScheduleController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);

        $startDate = now()->setDate($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth();

        $schedules = StudySchedule::where('user_id', Auth::id())
            ->whereBetween('study_date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($schedule) {
                return $schedule->study_date->format('Y-m-d');
            });

        $examDates = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('exam_dates')) {
            $examDates = \App\Models\ExamDate::where('is_active', true)
                ->whereBetween('date', [$startDate, $endDate])
                ->get()
                ->pluck('date')
                ->map(fn($date) => \Carbon\Carbon::parse($date)->format('Y-m-d'))
                ->toArray();
        }

        return response()->json([
            'schedules' => $schedules,
            'examDates' => $examDates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'study_date' => 'required|date',
            'study_time' => 'nullable|date_format:H:i',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subcategory_id' => 'nullable|exists:subcategories,id',
        ]);

        $schedule = StudySchedule::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json($schedule, 201);
    }

    public function getSubcategories()
    {
        $subcategories = Subcategory::orderBy('name')->get(['id', 'name', 'category_id']);

        return response()->json(['subcategories' => $subcategories]);
    }

    public function destroyAll()
    {
        StudySchedule::where('user_id', Auth::id())->delete();
        return response()->json(null, 204);
    }

    public function destroy(StudySchedule $studySchedule)
    {
        if ($studySchedule->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $studySchedule->delete();

        return response()->json(null, 204);
    }
}
