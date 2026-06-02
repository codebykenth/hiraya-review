<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SyllabusController
{
    /**
     * Display a listing of the syllabus categories and subcategories.
     */
    public function index(Request $request)
    {
        $categories = Category::with('subcategory')->orderBy('name')->get();

        return Inertia::render('admin/syllabus/index', [
            'categories' => $categories,
        ]);
    }
}
