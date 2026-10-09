<?php

namespace App\Http\Controllers\Public;

use App\Enums\LegalContentType;
use App\Http\Controllers\Controller;
use App\Repositories\LegalContentRepositoryInterface;

class PublicController extends Controller
{
    public function __construct(
        protected LegalContentRepositoryInterface $legalContentRepository
    ) {}

    public function welcome()
    {
        session()->forget('is_free_attempt_active');

        return $this->render('public/welcome', [
            'plans' => array_values(config('pricing.plans', [])),
        ]);
    }

    public function about()
    {
        return $this->render('public/about');
    }

    public function support()
    {
        return $this->render('public/support');
    }

    public function guide()
    {
        return $this->render('guide');
    }

    public function privacy()
    {
        $privacy = $this->legalContentRepository->findByType(LegalContentType::Privacy);

        return $this->render('public/privacy', [
            'privacy' => $privacy,
        ]);
    }

    public function terms()
    {
        $terms = $this->legalContentRepository->findByType(LegalContentType::Terms);

        return $this->render('public/terms', [
            'terms' => $terms,
        ]);
    }
}
