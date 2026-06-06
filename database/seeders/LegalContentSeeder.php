<?php

namespace Database\Seeders;

use App\Models\LegalContent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LegalContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $privacyContent = <<<'HTML'
<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">1. Introduction</h2>
<p class="text-base leading-relaxed text-muted-foreground">Welcome to the Hiraya Review portal. Hiraya Review values your privacy and is committed to protecting your personal data. This Privacy Policy outlines how Hiraya Review collects, uses, and safeguards your information when you use the platform for your CSE preparation.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">2. Information Hiraya Review Collects</h2>
<p class="text-base leading-relaxed text-muted-foreground">To provide mock exams, custom study logs, and AI analytics, Hiraya Review collects:</p>
<ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
<li><strong>Account Credentials:</strong> Email addresses and passwords when you create a native account.</li>
<li><strong>Social Sign-In Data:</strong> Hiraya Review offers third-party authentication via Google. When you use Google to sign in, Hiraya Review receives and securely store basic profile details (such as your name and email address) to personalize your account and metrics dashboard. Hiraya Review will never post or publish to your social feed.</li>
<li><strong>Practice Data:</strong> Your test attempts, chosen tracks (Professional vs. Subprofessional), scores, categories performance, and time-per-question metrics used to generate your custom dashboard analytics.</li>
<li><strong>Log & Session Info:</strong> Minimal browser metadata to ensure system stability, rate-limiting, and security against unauthorized access.</li>
</ul>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">3. How Hiraya Review Uses Your Information</h2>
<p class="text-base leading-relaxed text-muted-foreground">Hiraya Review uses the gathered information to:</p>
<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
<li>Authenticate your identity and customize your preparation dashboard.</li>
<li>Calculate your historical scores and performance percentages across exam disciplines.</li>
<li>Train and optimize your custom AI drill generators on the sections you struggle with most.</li>
<li>Protect the database from scraping and DDoS attacks.</li>
</ul>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">4. Data Sharing & Security</h2>
<p class="text-base leading-relaxed text-muted-foreground">Hiraya Review does not sell, rent, or trade your personal data with third parties. Your account records and score history are fully confidential. Hiraya Review utilizes standard SSL/TLS encryption and strict Laravel Sanctum sessions to guarantee that your profile remains secure.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">5. Your Choices & Rights</h2>
<p class="text-base leading-relaxed text-muted-foreground">You have full control over your data. At any time, you can edit your profile settings or choose to permanently clear your historical attempt logs. If you wish to fully delete your account, you can go to profile settings and delete your account.</p>
</section>
HTML;

        $termsContent = <<<'HTML'
<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">1. Acceptance of Terms</h2>
<p class="text-base leading-relaxed text-muted-foreground">By accessing or using the Hiraya Review portal, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you must not access or use the platform.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">2. Description of Service</h2>
<p class="text-base leading-relaxed text-muted-foreground">Hiraya Review provides practice exams, category-specific drills, AI-assisted question generation, and score analytics tailored for the Philippine Civil Service Exam (Professional and Sub-Professional levels). Hiraya Review provides both free base resources and customizable exam simulators.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">3. Unofficial Study Aid Disclaimer</h2>
<p class="text-rose-600 dark:text-rose-400 text-base leading-relaxed font-semibold">This platform is an independent study resource. Hiraya Review is not officially connected to, endorsed by, or affiliated with the Civil Service Commission (CSC) of the Philippines. Hiraya Review does not guarantee passing scores on actual CSC examinations; all material is intended for practice and education only.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">4. Account Rules & Google Login</h2>
<p class="text-base leading-relaxed text-muted-foreground">When registering, you may create a native profile or sign in using a Google account. You agree that:</p>
<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
<li>You will provide accurate, current, and complete registration info.</li>
<li>You are responsible for keeping your login credentials secure.</li>
<li>Hiraya Review reserves the right to suspend accounts that show signs of automated bot abuse, scraping, or commercial resale.</li>
</ul>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">5. Fair Use & Prohibited Acts</h2>
<p class="text-base leading-relaxed text-muted-foreground">Hiraya Review's question bank and study materials are protected by intellectual property guidelines. You are prohibited from using web-scrapers, spiders, or automated scripts to download or clone Hiraya Review's practice sets for commercial use. Standard manual study and personal mock testing are fully permitted.</p>
</section>

<section class="space-y-3">
<h2 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">6. Modifications and Termination of Service</h2>
<p class="text-base leading-relaxed text-muted-foreground">Hiraya Review reserves the right to modify, suspend, discontinue, or completely close this project and terminate the service (or any portion thereof) at any time, for any reason, with or without prior notice, and without any form of liability to you. As a free educational platform, you agree that Hiraya Review has no obligation to maintain, host, or guarantee continuous availability of the platform or your historical practice metrics.</p>
</section>
HTML;

        LegalContent::updateOrCreate(
            ['type' => 'privacy'],
            ['content' => $this->sanitizeHtml($privacyContent)]
        );

        LegalContent::updateOrCreate(
            ['type' => 'terms'],
            ['content' => $this->sanitizeHtml($termsContent)]
        );
    }

    /**
     * Sanitize HTML content by removing dangerous tags and attributes.
     */
    private function sanitizeHtml(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        // Remove dangerous tags and their content
        $dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style', 'link', 'meta'];
        foreach ($dangerousTags as $tag) {
            $html = preg_replace('#<' . $tag . '.*?>.*?</' . $tag . '>#is', '', $html);
            $html = preg_replace('#<' . $tag . '.*?/>#is', '', $html);
        }

        // Remove dangerous attributes from remaining tags
        $dangerousAttributes = ['on\w+', 'javascript:', 'data:', 'vbscript:', 'onclick', 'onload', 'onerror', 'onmouseover'];
        foreach ($dangerousAttributes as $attr) {
            $html = preg_replace('#\s' . $attr . '\s*=\s*["\'][^"\']*["\']#is', '', $html);
            $html = preg_replace('#\s' . $attr . '\s*=\s*[^\s>]#is', '', $html);
        }

        return $html;
    }
}
