<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ChargeTypeController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OccupancyController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\SecureFileController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WaSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard.index');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // ==========================================
    // UTAMA
    // ==========================================
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.view')->name('dashboard.index');

    // ==========================================
    // MANAJEMEN KOS
    // ==========================================

    // ─── 1. MODUL PROPERTI ──────────────────────────────────────────────────
    Route::prefix('properties')->name('properties.')->group(function () {
        Route::get('/', [PropertyController::class, 'index'])->middleware('permission:property.view')->name('index');
        Route::post('/', [PropertyController::class, 'create'])->middleware('permission:property.create')->name('create');
        Route::put('/update/{id}', [PropertyController::class, 'update'])->middleware('permission:property.update')->name('update');
        Route::delete('/delete/{id}', [PropertyController::class, 'delete'])->middleware('permission:property.delete')->name('delete');
        Route::post('/restore/{id}', [PropertyController::class, 'restore'])->middleware('permission:property.update')->name('restore');
        Route::delete('/force-delete/{id}', [PropertyController::class, 'forceDelete'])->middleware('permission:property.delete')->name('force-delete');

        // Bulk Actions
        Route::delete('/bulk-destroy', [PropertyController::class, 'bulkDestroy'])->middleware('permission:property.delete')->name('bulk-destroy');
        Route::delete('/bulk-force-delete', [PropertyController::class, 'bulkForceDelete'])->middleware('permission:property.delete')->name('bulk-force-delete');
        Route::post('/bulk-restore', [PropertyController::class, 'bulkRestore'])->middleware('permission:property.update')->name('bulk-restore');
    });

    // ─── 2. MODUL TIPE KAMAR & TARIF (TAMBAHAN WAJIB) ───────────────────────
    Route::prefix('room-types')->name('room-types.')->group(function () {
        Route::get('/', [RoomTypeController::class, 'index'])->middleware('permission:room.view')->name('index');
        // Memanggil service implementasi createWithTiers & updateWithTiers
        Route::post('/', [RoomTypeController::class, 'create'])->middleware('permission:room.create')->name('create');
        Route::put('/update/{id}', [RoomTypeController::class, 'update'])->middleware('permission:room.update')->name('update');
        Route::delete('/delete/{id}', [RoomTypeController::class, 'delete'])->middleware('permission:room.delete')->name('delete');
        Route::post('/restore/{id}', [RoomTypeController::class, 'restore'])->middleware('permission:property.update')->name('restore');
        Route::delete('/force-delete/{id}', [RoomTypeController::class, 'forceDelete'])->middleware('permission:property.delete')->name('force-delete');

        // Bulk Actions
        Route::delete('/bulk-destroy', [RoomTypeController::class, 'bulkDestroy'])->middleware('permission:property.delete')->name('bulk-destroy');
        Route::delete('/bulk-force-delete', [RoomTypeController::class, 'bulkForceDelete'])->middleware('permission:property.delete')->name('bulk-force-delete');
        Route::post('/bulk-restore', [RoomTypeController::class, 'bulkRestore'])->middleware('permission:property.update')->name('bulk-restore');
    });

    // ─── 3. MODUL KAMAR ─────────────────────────────────────────────────────
    Route::prefix('rooms')->name('rooms.')->group(function () {
        Route::get('/', [RoomController::class, 'index'])->middleware('permission:room.view')->name('index');
        Route::post('/', [RoomController::class, 'create'])->middleware('permission:room.create')->name('create');
        Route::put('/update/{id}', [RoomController::class, 'update'])->middleware('permission:room.update')->name('update');
        Route::delete('/delete/{id}', [RoomController::class, 'delete'])->middleware('permission:room.delete')->name('delete');

        // FIX: Mengubah PropertyController menjadi RoomController & Hak Akses menjadi room.*
        Route::post('/restore/{id}', [RoomController::class, 'restore'])->middleware('permission:room.update')->name('restore');
        Route::delete('/force-delete/{id}', [RoomController::class, 'forceDelete'])->middleware('permission:room.delete')->name('force-delete');

        // FIX: Bulk Actions khusus untuk entitas Kamar
        Route::delete('/bulk-destroy', [RoomController::class, 'bulkDestroy'])->middleware('permission:room.delete')->name('bulk-destroy');
        Route::delete('/bulk-force-delete', [RoomController::class, 'bulkForceDelete'])->middleware('permission:room.delete')->name('bulk-force-delete');
        Route::post('/bulk-restore', [RoomController::class, 'bulkRestore'])->middleware('permission:room.update')->name('bulk-restore');
    });

    Route::prefix('tenants')->name('tenants.')->group(function () {
        Route::get('/', [TenantController::class, 'index'])->middleware('permission:tenant.view')->name('index');
        Route::post('/', [TenantController::class, 'create'])->middleware('permission:tenant.create')->name('create');
        Route::put('/update/{id}', [TenantController::class, 'update'])->middleware('permission:tenant.update')->name('update');
        Route::delete('/delete/{id}', [TenantController::class, 'delete'])->middleware('permission:tenant.delete')->name('delete');

        // Mass Action
        Route::delete('/bulk-destroy', [TenantController::class, 'bulkDestroy'])->middleware('permission:tenant.delete')->name('bulk-destroy');
    });

    // ─── 5. MODUL OKUPANSI & CHECK-IN (KONTRAK) ─────────────────────────────
    Route::prefix('occupancies')->name('occupancies.')->group(function () {
        Route::get('/', [OccupancyController::class, 'index'])->middleware('permission:occupancy.view')->name('index');
        Route::post('/', [OccupancyController::class, 'create'])->middleware('permission:occupancy.create')->name('create');
        Route::post('/check-out/{id}', [OccupancyController::class, 'checkOut'])->middleware('permission:occupancy.update')->name('check-out');
        Route::delete('/delete/{id}', [OccupancyController::class, 'delete'])->middleware('permission:occupancy.delete')->name('delete');
    });

    // ==========================================
    // KEUANGAN
    // ==========================================

    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->middleware('permission:invoice.view')->name('index');
        Route::get('/details/{id}', [InvoiceController::class, 'details'])->middleware('permission:invoice.view')->name('details');
        Route::post('/pay/{id}', [InvoiceController::class, 'pay'])->middleware('permission:invoice.pay')->name('pay');
        Route::post('/void/{id}', [InvoiceController::class, 'void'])->middleware('permission:invoice.void')->name('void');
    });

    // Payments
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->middleware('permission:payment.view')->name('index');
        Route::post('/', [PaymentController::class, 'create'])->middleware('permission:payment.create')->name('create');
        Route::delete('/delete/{id}', [PaymentController::class, 'delete'])->middleware('permission:payment.delete')->name('delete');
    });

    // Expenses
    Route::prefix('expenses')->name('expenses.')->group(function () {
        Route::get('/', [ExpenseController::class, 'index'])->middleware('permission:expense.view')->name('index');
        Route::post('/', [ExpenseController::class, 'create'])->middleware('permission:expense.create')->name('create');
        Route::put('/update/{id}', [ExpenseController::class, 'update'])->middleware('permission:expense.update')->name('update');
        Route::delete('/delete/{id}', [ExpenseController::class, 'delete'])->middleware('permission:expense.delete')->name('delete');

        // Expense Categories (Nested Prefix)
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [ExpenseController::class, 'categoriesIndex'])->middleware('permission:expense_category.view')->name('index');
            Route::post('/', [ExpenseController::class, 'categoriesCreate'])->middleware('permission:expense_category.create')->name('create');
        });
    });

    // ==========================================
    // OPERASIONAL
    // ==========================================

    // Complaints
    Route::prefix('complaints')->name('complaints.')->group(function () {
        Route::get('/', [ComplaintController::class, 'index'])->middleware('permission:complaint.view')->name('index');
        Route::post('/', [ComplaintController::class, 'create'])->middleware('permission:complaint.create')->name('create');
        Route::put('/update-status/{id}', [ComplaintController::class, 'updateStatus'])->middleware('permission:complaint.update')->name('update-status');
        Route::delete('/delete/{id}', [ComplaintController::class, 'delete'])->middleware('permission:complaint.delete')->name('delete');
    });

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->middleware('permission:report.view')->name('index');
        Route::get('/income', [ReportController::class, 'income'])->middleware('permission:report.view')->name('income');
        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])->middleware('permission:report.view')->name('profit-loss');
    });

    // ==========================================
    // MASTER DATA & PENGGUNA
    // ==========================================

    // Charge Types (Master Data Biaya)
    Route::prefix('charge-types')->name('charge-types.')->group(function () {
        Route::get('/', [ChargeTypeController::class, 'index'])->middleware('permission:charge_type.view')->name('index');
        Route::post('/', [ChargeTypeController::class, 'store'])->middleware('permission:charge_type.create')->name('store');
        Route::put('/{id}', [ChargeTypeController::class, 'update'])->middleware('permission:charge_type.edit')->name('update');
        Route::delete('/{id}', [ChargeTypeController::class, 'destroy'])->middleware('permission:charge_type.delete')->name('destroy');
    });

    // Users (Staff & Owners)
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/staff', [UserController::class, 'staffIndex'])->middleware('permission:staff.manage')->name('staff.index');
        Route::get('/owners', [UserController::class, 'ownerIndex'])->middleware('permission:staff.manage')->name('owner.index');
        Route::post('/', [UserController::class, 'create'])->middleware('permission:staff.manage')->name('create');
        Route::put('/update/{id}', [UserController::class, 'update'])->middleware('permission:staff.manage')->name('update');
        Route::delete('/delete/{id}', [UserController::class, 'delete'])->middleware('permission:staff.manage')->name('delete');
    });

    // ==========================================
    // SISTEM & PENGATURAN
    // ==========================================

    // Roles & Permissions
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->middleware('permission:role.manage')->name('index');
        Route::post('/', [RoleController::class, 'create'])->middleware('permission:role.manage')->name('create');
        Route::put('/update/{id}', [RoleController::class, 'update'])->middleware('permission:role.manage')->name('update');
        Route::delete('/delete/{id}', [RoleController::class, 'delete'])->middleware('permission:role.manage')->name('delete');
    });

    // WA Gateway Session
    Route::prefix('wa-session')->name('wa-session.')->group(function () {
        Route::get('/', [WaSessionController::class, 'index'])->middleware('permission:system_settings.manage')->name('index');
        Route::get('/status', [WaSessionController::class, 'status'])->middleware('permission:system_settings.manage')->name('status');
        Route::get('/groups', [WaSessionController::class, 'getGroups'])->middleware('permission:system_settings.manage')->name('groups');
        Route::post('/init', [WaSessionController::class, 'init'])->middleware('permission:system_settings.manage')->name('init');
        Route::post('/test-send', [WaSessionController::class, 'testSend'])->middleware('permission:system_settings.manage')->name('test-send');
        Route::post('/broadcast', [WaSessionController::class, 'broadcast'])->middleware('permission:system_settings.manage')->name('broadcast');
    });

    // Audit Logs
    Route::prefix('audit-logs')->name('audit-logs.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->middleware('permission:audit_logs.view')->name('index');
        Route::delete('/clear', [AuditLogController::class, 'clear'])->middleware('permission:system_settings.manage')->name('clear'); // Tidak ada audit_logs.delete di seeder
    });

    Route::prefix('secure')->name('secure.')->group(function () {
        Route::get('/s/{path}', [SecureFileController::class, 'index'])->name('file');
        Route::get('/d/{path}', [SecureFileController::class, 'download'])->name('file.download');
        Route::get('/f/{path}', [SecureFileController::class, 'filepond'])->name('file.filepond');
    });

});

require __DIR__.'/settings.php';
