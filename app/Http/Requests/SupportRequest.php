<?php

namespace App\Http\Requests;

use App\Rules\NoEmojis;
use App\Rules\NoHtml;
use App\Rules\NoProfanity;
use App\Rules\NoUrls;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SupportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new NoEmojis, new NoHtml, new NoUrls, new NoProfanity],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000', new NoEmojis, new NoHtml, new NoProfanity],
        ];
    }
}
