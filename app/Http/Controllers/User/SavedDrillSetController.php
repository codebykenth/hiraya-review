<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\User\SavedDrillSets\AddQuestionToSavedSetRequest;
use App\Http\Requests\User\SavedDrillSets\StoreSavedDrillSetRequest;
use App\Http\Requests\User\SavedDrillSets\UpdateSavedDrillSetRequest;
use App\Models\Question;
use App\Models\SavedDrillSet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SavedDrillSetController
{
    /**
     * List user's saved drill sets with question counts.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $sets = SavedDrillSet::where('user_id', $userId)
            ->withCount('questions')
            ->with(['questions.subcategory.category'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($set) {
                return [
                    'id' => $set->id,
                    'name' => $set->name,
                    'description' => $set->description,
                    'color' => $set->color,
                    'questions_count' => $set->questions_count,
                    'sample_categories' => $set->questions->map(fn ($q) => $q->subcategory?->category?->name)->filter()->unique()->values()->all(),
                    'created_at' => $set->created_at?->toIso8601String(),
                ];
            });

        return response()->json(['sets' => $sets]);
    }

    /**
     * Store a new saved drill set.
     */
    public function store(StoreSavedDrillSetRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        $set = DB::transaction(function () use ($validated) {
            $set = SavedDrillSet::create([
                'user_id' => auth()->id(),
                'name' => trim($validated['name']),
                'description' => $validated['description'] ?? null,
                'color' => $validated['color'] ?? 'blue',
            ]);

            if (! empty($validated['question_ids'])) {
                $set->questions()->sync($validated['question_ids']);
            }

            return $set;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'set' => [
                    'id' => $set->id,
                    'name' => $set->name,
                    'description' => $set->description,
                    'color' => $set->color,
                    'questions_count' => count($validated['question_ids'] ?? []),
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Practice set created successfully.');
    }

    /**
     * Update an existing saved drill set.
     */
    public function update(UpdateSavedDrillSetRequest $request, SavedDrillSet $savedDrillSet): JsonResponse|RedirectResponse
    {
        Gate::authorize('update', $savedDrillSet);

        $validated = $request->validated();

        $savedDrillSet->update([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? $savedDrillSet->description,
            'color' => $validated['color'] ?? $savedDrillSet->color,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'set' => $savedDrillSet,
            ]);
        }

        return redirect()->back()->with('success', 'Practice set updated successfully.');
    }

    /**
     * Delete a saved drill set.
     */
    public function destroy(SavedDrillSet $savedDrillSet): JsonResponse|RedirectResponse
    {
        Gate::authorize('delete', $savedDrillSet);

        $savedDrillSet->delete();

        if (request()->wantsJson()) {
            return response()->json(['status' => 'success', 'message' => 'Practice set deleted.']);
        }

        return redirect()->back()->with('success', 'Practice set deleted.');
    }

    /**
     * Add / bookmark a question into a saved drill set.
     */
    public function addQuestion(AddQuestionToSavedSetRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id();

        $question = Question::findOrFail($validated['question_id']);

        if (! empty($validated['saved_drill_set_id'])) {
            $set = SavedDrillSet::where('id', $validated['saved_drill_set_id'])
                ->where('user_id', $userId)
                ->firstOrFail();
        } elseif (! empty($validated['new_set_name'])) {
            $set = SavedDrillSet::create([
                'user_id' => $userId,
                'name' => trim($validated['new_set_name']),
                'description' => 'Custom practice set created from review items.',
                'color' => 'indigo',
            ]);
        } else {
            // Default "Bookmarked Exam Items" set
            $set = SavedDrillSet::firstOrCreate(
                ['user_id' => $userId, 'name' => 'Bookmarked Items'],
                ['description' => 'Questions bookmarked from past exams and drills.', 'color' => 'blue']
            );
        }

        $set->questions()->syncWithoutDetaching([$question->id]);

        return response()->json([
            'status' => 'success',
            'set_id' => $set->id,
            'set_name' => $set->name,
            'question_id' => $question->id,
        ]);
    }

    /**
     * Remove a question from a saved drill set.
     */
    public function removeQuestion(SavedDrillSet $savedDrillSet, Question $question): JsonResponse
    {
        if ($savedDrillSet->user_id !== auth()->id()) {
            abort(403);
        }

        $savedDrillSet->questions()->detach($question->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Question removed from practice set.',
            'remaining_count' => $savedDrillSet->questions()->count(),
        ]);
    }

    /**
     * Get full questions for a saved drill set to launch a practice session.
     */
    public function getSetQuestions(SavedDrillSet $savedDrillSet): JsonResponse
    {
        if ($savedDrillSet->user_id !== auth()->id()) {
            abort(403);
        }

        $questions = $savedDrillSet->questions()
            ->where('status', 'active')
            ->with(['subcategory.category'])
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'stem' => $q->stem,
                    'options' => $q->options ?? [],
                    'correct_option' => $q->correct_option,
                    'explanation' => $q->explanation ?? '',
                    'category' => $q->subcategory?->category?->name ?? 'General Information',
                    'subcategory' => $q->subcategory?->name ?? '',
                    'language' => (str_contains(strtolower($q->language ?? ''), 'tagalog') || str_contains(strtolower($q->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                    'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
                ];
            });

        return response()->json([
            'set' => [
                'id' => $savedDrillSet->id,
                'name' => $savedDrillSet->name,
                'description' => $savedDrillSet->description,
                'color' => $savedDrillSet->color,
                'total_items' => count($questions),
            ],
            'questions' => $questions,
        ]);
    }
}
