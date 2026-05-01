<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('platform', 30);          // shopify, amazon, woocommerce
            $table->string('store_name', 150)->nullable();
            $table->string('store_url', 255)->nullable();
            $table->jsonb('credentials')->default('{}'); // encrypted at app layer
            $table->jsonb('settings')->default('{}');
            $table->string('status', 20)->default('inactive'); // active, inactive, error
            $table->timestamp('last_synced_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index('platform');
            $table->index('status');
        });

        Schema::create('integration_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained()->cascadeOnDelete();
            $table->string('direction', 10);   // import, export
            $table->string('entity', 30);      // orders, products, inventory
            $table->unsignedInteger('total')->default(0);
            $table->unsignedInteger('success')->default(0);
            $table->unsignedInteger('failed')->default(0);
            $table->jsonb('errors')->default('[]');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();

            $table->index('integration_id');
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_sync_logs');
        Schema::dropIfExists('integrations');
    }
};
