<?php

namespace App\Http\Controllers;

use App\Models\ExamDate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminExamDateController extends Controller
{
    public function index()
    {
        $examDates = ExamDate::orderBy('date', 'desc')->get();
        
        return Inertia::render('admin/exam-dates/index', [
            'examDates' => $examDates
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:exam_dates,date',
            'description' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        ExamDate::create([
            'date' => $validated['date'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        \Illuminate\Support\Facades\Cache::forget('exam_dates.active');

        return redirect()->back()->with('success', 'Exam date added successfully.');
    }

    public function update(Request $request, ExamDate $examDate)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:exam_dates,date,' . $examDate->id,
            'description' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $examDate->update([
            'date' => $validated['date'],
            'description' => $validated['description'],
            'is_active' => $request->has('is_active') ? $validated['is_active'] : $examDate->is_active,
        ]);

        \Illuminate\Support\Facades\Cache::forget('exam_dates.active');

        return redirect()->back()->with('success', 'Exam date updated successfully.');
    }

    public function destroy(ExamDate $examDate)
    {
        $examDate->delete();
        \Illuminate\Support\Facades\Cache::forget('exam_dates.active');
        return redirect()->back()->with('success', 'Exam date deleted successfully.');
    }
}
