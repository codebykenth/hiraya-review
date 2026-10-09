<?php

declare(strict_types=1);

return [
    'plans' => [
        'pro_pass' => [
            'name' => 'Pro Reviewer Pass',
            'code' => 'pro_pass',
            'price' => 299.00,
            'currency' => 'PHP',
            'billing_period' => '90 Days Access',
            'duration_days' => 90,
            'description' => 'Comprehensive exam prep package for the upcoming Civil Service Examination batch.',
            'features' => [
                'Unlimited full-length mock exams (Professional & Subprofessional)',
                'Full access to all 5 Core Subject Drills & Smart Weakness Drills',
                'AI-powered Exam Readiness & post-mortem diagnostics',
                'Priority question generation & full explanation breakdowns',
                'PDF scorecards & offline summary downloads',
            ],
            'badge' => 'Most Popular',
            'is_featured' => true,
        ],
        'lifetime_access' => [
            'name' => 'Lifetime Reviewer Pass',
            'code' => 'lifetime_access',
            'price' => 499.00,
            'currency' => 'PHP',
            'billing_period' => 'One-time Payment',
            'duration_days' => null, // null = lifetime
            'description' => 'Unrestricted lifetime access to all current and future CSE reviewer content.',
            'features' => [
                'Everything in Pro Reviewer Pass',
                'Lifetime access with zero renewal or expiration',
                'Free access to future question bank expansions & syllabus updates',
                'Unlimited PDF test kit exports with full answer keys',
                'Verified Pro Reviewer badge on profile',
            ],
            'badge' => 'Best Value',
            'is_featured' => false,
        ],
    ],
];
