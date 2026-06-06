<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LegalContentRequest;
use App\Models\LegalContent;
use Inertia\Inertia;

class LegalContentController extends Controller
{
    public function edit()
    {
        $privacy = LegalContent::where('type', 'privacy')->first();
        $terms = LegalContent::where('type', 'terms')->first();

        return Inertia::render('admin/legal-content/edit', [
            'privacy' => $privacy,
            'terms' => $terms,
        ]);
    }

    public function update(LegalContentRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated['content'] as $type => $content) {
            LegalContent::updateOrCreate(
                ['type' => $type],
                ['content' => $content]
            );
        }

        return back()->with('success', 'Legal content updated successfully.');
    }
}
