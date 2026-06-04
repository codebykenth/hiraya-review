<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TransactionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            DB::beginTransaction();

            try {
                $response = $next($request);

                if ($response->getStatusCode() >= 400) {
                    DB::rollBack();
                } else {
                    DB::commit();
                }

                return $response;
            } catch (Throwable $e) {
                DB::rollBack();

                throw $e;
            }
        }

        return $next($request);
    }
}
