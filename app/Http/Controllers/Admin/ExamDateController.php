<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreExamDateRequest;
use App\Http\Requests\UpdateExamDateRequest;
use App\Models\ExamDate;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ExamDateController
{
    public function index()
    {
        $examDates = ExamDate::orderBy('date', 'desc')->get();

        return Inertia::render('admin/exam-dates/index', [
            'examDates' => $examDates,
        ]);
    }

    public function store(StoreExamDateRequest $request)
    {
        $validated = $request->validated();

        ExamDate::create([
            'date' => $validated['date'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        Cache::forget('exam_dates.active');

        return redirect()->back()->with('success', 'Exam date added successfully.');
    }

    public function update(UpdateExamDateRequest $request, ExamDate $examDate)
    {
        $validated = $request->validated();

        $examDate->update([
            'date' => $validated['date'],
            'description' => $validated['description'],
            'is_active' => $request->has('is_active') ? $validated['is_active'] : $examDate->is_active,
        ]);

        Cache::forget('exam_dates.active');

        return redirect()->back()->with('success', 'Exam date updated successfully.');
    }

    public function destroy(ExamDate $examDate)
    {
        $examDate->delete();
        Cache::forget('exam_dates.active');

        return redirect()->back()->with('success', 'Exam date deleted successfully.');
    }
}
