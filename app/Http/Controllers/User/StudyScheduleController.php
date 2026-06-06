<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\BulkUpdateStudyTimeRequest;
use App\Http\Requests\StoreStudyScheduleRequest;
use App\Http\Requests\UpdateStudyScheduleRequest;
use App\Models\ExamDate;
use App\Models\LearnModule;
use App\Models\StudySchedule;
use App\Models\Subcategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class StudyScheduleController
{
    private function formatScheduleForCalendar(StudySchedule|\stdClass $schedule): array
    {
        $scheduleArray = $schedule instanceof StudySchedule
            ? $schedule->toArray()
            : (array) $schedule;

        return [
            ...$scheduleArray,
            'study_date' => $schedule->study_date instanceof \DateTime
                ? $schedule->study_date->format('Y-m-d')
                : (is_string($schedule->study_date) ? $schedule->study_date : $schedule->study_date?->format('Y-m-d')),
        ];
    }

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
            })
            ->map(fn ($items) => $items->map(fn ($schedule) => $this->formatScheduleForCalendar($schedule))->values());

        $examDates = [];
        if (Schema::hasTable('exam_dates')) {
            $allExamDates = Cache::rememberForever('exam_dates.active', function () {
                return ExamDate::where('is_active', true)
                    ->get()
                    ->pluck('date')
                    ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
                    ->toArray();
            });

            // Filter for the requested month, though returning all is also fine
            $examDates = array_filter($allExamDates, function ($date) use ($startDate, $endDate) {
                return $date >= $startDate->format('Y-m-d') && $date <= $endDate->format('Y-m-d');
            });

            // Re-index array for JSON response
            $examDates = array_values($examDates);
        }

        // Fetch past pending uncompleted tasks
        $pastPending = StudySchedule::where('user_id', Auth::id())
            ->where('study_date', '<', Carbon::today())
            ->where('is_done', false)
            ->orderBy('study_date', 'asc')
            ->get()
            ->map(fn ($schedule) => $this->formatScheduleForCalendar($schedule));

        $nextExam = null;
        if (Schema::hasTable('exam_dates')) {
            $nextExamModel = ExamDate::where('is_active', true)
                ->where('date', '>=', Carbon::today())
                ->orderBy('date', 'asc')
                ->first();

            if ($nextExamModel) {
                $nextExam = [
                    'date' => $nextExamModel->date->format('Y-m-d'),
                    'description' => $nextExamModel->description,
                    'days_remaining' => Carbon::today()->diffInDays($nextExamModel->date, false),
                ];
            }
        }

        return Inertia::render('user/calendar/index', [
            'schedules' => $schedules,
            'examDates' => $examDates,
            'pastPending' => $pastPending,
            'nextExam' => $nextExam,
        ]);
    }

    public function data(Request $request)
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
            })
            ->map(fn ($items) => $items->map(fn ($schedule) => $this->formatScheduleForCalendar($schedule))->values());

        $examDates = [];
        if (Schema::hasTable('exam_dates')) {
            $allExamDates = Cache::rememberForever('exam_dates.active', function () {
                return ExamDate::where('is_active', true)
                    ->get()
                    ->pluck('date')
                    ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
                    ->toArray();
            });

            $examDates = array_values(array_filter($allExamDates, function ($date) use ($startDate, $endDate) {
                return $date >= $startDate->format('Y-m-d') && $date <= $endDate->format('Y-m-d');
            }));
        }

        $pastPending = StudySchedule::where('user_id', Auth::id())
            ->where('study_date', '<', Carbon::today())
            ->where('is_done', false)
            ->orderBy('study_date', 'asc')
            ->get()
            ->map(fn ($schedule) => $this->formatScheduleForCalendar($schedule));

        $nextExam = null;
        if (Schema::hasTable('exam_dates')) {
            $nextExamModel = ExamDate::where('is_active', true)
                ->where('date', '>=', Carbon::today())
                ->orderBy('date', 'asc')
                ->first();

            if ($nextExamModel) {
                $nextExam = [
                    'date' => $nextExamModel->date->format('Y-m-d'),
                    'description' => $nextExamModel->description,
                    'days_remaining' => Carbon::today()->diffInDays($nextExamModel->date, false),
                ];
            }
        }

        return response()->json([
            'schedules' => $schedules,
            'examDates' => $examDates,
            'pastPending' => $pastPending,
            'nextExam' => $nextExam,
        ]);
    }

    public function store(StoreStudyScheduleRequest $request)
    {
        $validated = $request->validated();

        $existing = StudySchedule::where('user_id', Auth::id())
            ->whereDate('study_date', $validated['study_date'])
            ->where('title', $validated['title'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'A study item with the same title already exists on this date.',
                'duplicate' => $this->formatScheduleForCalendar($existing),
            ], 409);
        }

        $schedule = StudySchedule::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json($this->formatScheduleForCalendar($schedule), 201);
    }

    public function update(UpdateStudyScheduleRequest $request, StudySchedule $studySchedule)
    {
        $validated = $request->validated();

        // Fix time format validation edge cases depending on H:i:s or H:i input
        if (isset($validated['study_time']) && strlen($validated['study_time']) === 5) {
            $validated['study_time'] .= ':00';
        }

        $studySchedule->update($validated);

        return response()->json($this->formatScheduleForCalendar($studySchedule));
    }

    public function getSubcategories()
    {
        $subcategories = Subcategory::whereHas('category', function ($query) {
            $query->where('is_demographic', false);
        })->orderBy('name')->get(['id', 'name', 'category_id']);
        $modules = LearnModule::where('is_published', true)
            ->with(['subcategory:id,name', 'category:id,name'])
            ->get(['id', 'title', 'slug', 'topic', 'subcategory_id', 'category_id']);

        return response()->json([
            'subcategories' => $subcategories,
            'modules' => $modules->map(fn ($m) => [
                'title' => $m->title,
                'slug' => $m->slug,
                'topic' => $m->topic,
                'subcategory_name' => $m->subcategory?->name,
                'category_name' => $m->category?->name,
            ]),
        ]);
    }

    public function bulkUpdateTime(BulkUpdateStudyTimeRequest $request)
    {
        $validated = $request->validated();
        $query = StudySchedule::where('user_id', Auth::id());

        if (! empty($validated['start_date'])) {
            $query->whereDate('study_date', '>=', $validated['start_date']);
        }
        if (! empty($validated['end_date'])) {
            $query->whereDate('study_date', '<=', $validated['end_date']);
        }

        if (! empty($validated['category_id'])) {
            $query->whereHas('subcategory', function ($q) use ($validated) {
                $q->where('category_id', $validated['category_id']);
            });
        }

        $query->update([
            'study_time' => $validated['study_time'] ?: null,
        ]);

        return response()->json(['message' => 'Study times updated successfully.']);
    }

    public function destroyAll()
    {
        StudySchedule::where('user_id', Auth::id())->delete();

        return response()->json(null, 204);
    }

    public function destroy(StudySchedule $studySchedule)
    {
        Gate::allowIf(fn ($user) => $user->id === $studySchedule->user_id);

        $studySchedule->delete();

        return response()->json(null, 204);
    }
}
