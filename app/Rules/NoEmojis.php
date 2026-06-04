<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoEmojis implements ValidationRule
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

        // Regex matching standard Unicode Emojis (pictographs, emoticons, symbols, flags)
        $emojiPattern = '/[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]|[\x{1F000}-\x{1F0FF}]|[\x{1F100}-\x{1F1FF}]|[\x{1F200}-\x{1F2FF}]|[\x{1F600}-\x{1F64F}]|[\x{1F680}-\x{1F6FF}]/u';

        if (preg_match($emojiPattern, $value)) {
            $fail('The :attribute field must not contain emojis.');
        }
    }
}
