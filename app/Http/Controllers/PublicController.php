<?php

namespace App\Http\Controllers;

use App\Models\LegalContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function welcome() {
        return Inertia::render('public/welcome');
    }

    public function about() {
        return Inertia::render('public/about');
    }

    public function support() {
        return Inertia::render('public/support');
    }

    public function guide() {
        return Inertia::render('guide');
    }

    public function privacy()
    {
        $privacy = LegalContent::where('type', 'privacy')->first();

        return Inertia::render('public/privacy', [
            'privacy' => $privacy,
        ]);
    }

    public function terms()
    {
        $terms = LegalContent::where('type', 'terms')->first();

        return Inertia::render('public/terms', [
            'terms' => $terms,
        ]);
    }
}
