<?php

use App\Models\Subcategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('study_schedules', function (Blueprint $table) {
            $table->time('study_time')->nullable()->after('study_date');
            $table->foreignId('subcategory_id')->nullable()->constrained()->cascadeOnDelete()->after('study_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('study_schedules', function (Blueprint $table) {
            $table->dropColumn('study_time');
            $table->dropForeignIdFor(Subcategory::class);
            $table->dropColumn('subcategory_id');
        });
    }
};
