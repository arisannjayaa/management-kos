<?php

use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('employee')->name('employee.')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');
        Route::post('/', [EmployeeController::class, 'create'])->name('create');
        Route::put('/update', [EmployeeController::class, 'update'])->name('update');
        Route::delete('/bulk-destroy', [EmployeeController::class, 'bulkDestroy'])->name('bulk-destroy');
        Route::delete('/delete/{id}', [EmployeeController::class, 'delete'])->name('delete');
        Route::post('/restore', [EmployeeController::class, 'restore'])->name('restore');
        Route::get('/form/{id?}', [EmployeeController::class, 'form'])->name('form');
        Route::get('/detail/{id}', [EmployeeController::class, 'detail'])->name('detail');
    });
});

require __DIR__.'/settings.php';
