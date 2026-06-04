<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoUrls implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        // Check if value contains common URL patterns (http://, https://, ftp://, www., or standard domains)
        $urlPattern = '/\b(?:https?|ftp):\/\/|www\.|\b[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?\b/i';

        if (preg_match($urlPattern, $value)) {
            $fail('The :attribute field must not contain website links or URLs.');
        }
    }
}
