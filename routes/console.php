<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:record-financial-snapshot')->lastDayOfMonth('23:50');
Schedule::command('app:auto-remind-debt')->dailyAt('07:00');
Schedule::command('app:process-recurring-bills')->dailyAt('01:00');
