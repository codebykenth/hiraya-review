<?php

namespace App\Http\Controllers;

use App\Models\LearnModule;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for Google Search Console.
     */
    public function index(): Response
    {
        $urls = [];
        $baseUrl = 'https://hirayareview.com';

        // Static routes
        $staticRoutes = [
            '/' => ['priority' => '1.0', 'changefreq' => 'daily'],
            '/guide' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            '/exams' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            '/support' => ['priority' => '0.3', 'changefreq' => 'monthly'],
            '/privacy' => ['priority' => '0.1', 'changefreq' => 'monthly'],
            '/terms' => ['priority' => '0.1', 'changefreq' => 'monthly'],
            '/learn' => ['priority' => '0.9', 'changefreq' => 'daily'],
        ];

        foreach ($staticRoutes as $path => $meta) {
            $urls[] = [
                'loc' => $baseUrl . $path,
                'priority' => $meta['priority'],
                'changefreq' => $meta['changefreq'],
                'lastmod' => now()->startOfDay()->toAtomString(),
            ];
        }

        // Dynamic published learn modules
        $modules = LearnModule::where('is_published', true)
            ->latest('updated_at')
            ->get();

        foreach ($modules as $module) {
            $urls[] = [
                'loc' => $baseUrl . '/learn/' . $module->slug,
                'priority' => '0.8',
                'changefreq' => 'weekly',
                'lastmod' => $module->updated_at->toAtomString(),
            ];
        }

        // Build XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        
        foreach ($urls as $url) {
            $xml .= '<url>';
            $xml .= '<loc>' . htmlspecialchars($url['loc']) . '</loc>';
            $xml .= '<lastmod>' . $url['lastmod'] . '</lastmod>';
            $xml .= '<changefreq>' . $url['changefreq'] . '</changefreq>';
            $xml .= '<priority>' . $url['priority'] . '</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
