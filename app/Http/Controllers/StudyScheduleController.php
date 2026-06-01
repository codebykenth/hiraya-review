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
            $allExamDates = \Illuminate\Support\Facades\Cache::rememberForever('exam_dates.active', function () {
                return \App\Models\ExamDate::where('is_active', true)
                    ->get()
                    ->pluck('date')
                    ->map(fn($date) => \Carbon\Carbon::parse($date)->format('Y-m-d'))
                    ->toArray();
            });

            // Filter for the requested month, though returning all is also fine
            $examDates = array_filter($allExamDates, function($date) use ($startDate, $endDate) {
                return $date >= $startDate->format('Y-m-d') && $date <= $endDate->format('Y-m-d');
            });
            
            // Re-index array for JSON response
            $examDates = array_values($examDates);
        }

        return response()->json([
            'schedules' => $schedules,
            'examDates' => $examDates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'study_date' => 'required|date|after_or_equal:today',
            'study_time' => 'nullable|date_format:H:i',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subcategory_id' => 'nullable|exists:subcategories,id',
        ]);

        $existing = StudySchedule::where('user_id', Auth::id())
            ->where('study_date', $validated['study_date'])
            ->where('title', $validated['title'])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $schedule = StudySchedule::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json($schedule, 201);
    }

    public function update(Request $request, StudySchedule $studySchedule)
    {
        if ($studySchedule->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'study_date' => 'required|date',
            'study_time' => 'nullable|date_format:H:i:s,H:i',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subcategory_id' => 'nullable|exists:subcategories,id',
        ]);

        // Fix time format validation edge cases depending on H:i:s or H:i input
        if (isset($validated['study_time']) && strlen($validated['study_time']) === 5) {
            $validated['study_time'] .= ':00';
        }

        $studySchedule->update($validated);

        return response()->json($studySchedule);
    }

    public function getSubcategories()
    {
        $subcategories = Subcategory::orderBy('name')->get(['id', 'name', 'category_id']);
        $modules = \App\Models\LearnModule::where('is_published', true)
            ->with(['subcategory:id,name', 'category:id,name'])
            ->get(['id', 'title', 'slug', 'topic', 'subcategory_id', 'category_id']);

        return response()->json([
            'subcategories' => $subcategories,
            'modules' => $modules->map(fn($m) => [
                'title' => $m->title,
                'slug' => $m->slug,
                'topic' => $m->topic,
                'subcategory_name' => $m->subcategory?->name,
                'category_name' => $m->category?->name,
            ]),
        ]);
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
