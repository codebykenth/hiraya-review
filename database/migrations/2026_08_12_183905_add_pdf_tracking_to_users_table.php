<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'pdf_downloads_count')) {
                $table->integer('pdf_downloads_count')->default(0);
            }
            if (! Schema::hasColumn('users', 'can_download_pdf')) {
                $table->boolean('can_download_pdf')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pdf_downloads_count', 'can_download_pdf']);
        });
    }
};
