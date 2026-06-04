<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoHtml implements ValidationRule
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

        // Check if value contains HTML tags
        if (strip_tags($value) !== $value || preg_match('/<[^>]*>/', $value)) {
            $fail('The :attribute field must not contain HTML tags or markup.');
        }
    }
}
