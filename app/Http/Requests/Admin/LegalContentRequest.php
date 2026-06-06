<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LegalContentRequest extends FormRequest
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
            'content' => ['required', 'array'],
            'content.privacy' => ['required', 'string'],
            'content.terms' => ['required', 'string'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'content' => [
                'privacy' => $this->sanitizeHtml($this->input('content.privacy')),
                'terms' => $this->sanitizeHtml($this->input('content.terms')),
            ],
        ]);
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
