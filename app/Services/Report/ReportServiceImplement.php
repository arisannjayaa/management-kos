<?php

namespace App\Services\Report;

use App\Helpers\Helper;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class ReportServiceImplement extends ServiceApi implements ReportService
{
    protected string $title = 'Laporan Keuangan';

    public function getFinancialDashboardData(?string $propertyId, ?int $year, ?int $month): mixed
    {
        try {
            $user = auth()->user();
            $year = $year ?? (int) date('Y');
            $month = $month ?? (int) date('m');

            // 🌟 IMPLEMENTASI PEDOMAN 9.4: Scoping Visibilitas Data Berdasarkan Role
            $ownerId = $user->hasRole('staff')
                ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
                : $user->id;

            // Kueri Dasar: Pembayaran Masuk (Incomes)
            $incomeQuery = Payment::whereHas('invoice.property', function ($q) use ($ownerId, $propertyId) {
                $q->where('owner_id', $ownerId);
                if ($propertyId) {
                    $q->where('id', Helper::decrypt($propertyId));
                }
            });

            // Kueri Dasar: Pengeluaran (Expenses)
            $expenseQuery = Expense::whereHas('property', function ($q) use ($ownerId, $propertyId) {
                $q->where('owner_id', $ownerId);
                if ($propertyId) {
                    $q->where('id', Helper::decrypt($propertyId));
                }
            });

            // 1. Kalkulasi Ringkasan Widget (Bulan Ini vs Bulan Lalu)
            $currentMonthIncome = (clone $incomeQuery)->whereYear('payment_date', $year)->whereMonth('payment_date', $month)->sum('amount_paid');
            $currentMonthExpense = (clone $expenseQuery)->whereYear('expense_date', $year)->whereMonth('expense_date', $month)->sum('amount');

            $lastMonth = $month - 1 == 0 ? 12 : $month - 1;
            $lastYear = $month - 1 == 0 ? $year - 1 : $year;

            $lastMonthIncome = (clone $incomeQuery)->whereYear('payment_date', $lastYear)->whereMonth('payment_date', $lastMonth)->sum('amount_paid');
            $lastMonthExpense = (clone $expenseQuery)->whereYear('expense_date', $lastYear)->whereMonth('expense_date', $lastMonth)->sum('amount');

            // 2. Kalkulasi Grafik Tahunan (Per Bulan)
            $chartData = [];
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

            for ($i = 1; $i <= 12; $i++) {
                $inc = (clone $incomeQuery)->whereYear('payment_date', $year)->whereMonth('payment_date', $i)->sum('amount_paid');
                $exp = (clone $expenseQuery)->whereYear('expense_date', $year)->whereMonth('expense_date', $i)->sum('amount');

                $chartData[] = [
                    'name' => $months[$i - 1],
                    'income' => (float) $inc,
                    'expense' => (float) $exp,
                    'profit' => (float) ($inc - $exp),
                ];
            }

            $result = [
                'summary' => [
                    'current_income' => (float) $currentMonthIncome,
                    'current_expense' => (float) $currentMonthExpense,
                    'current_profit' => (float) ($currentMonthIncome - $currentMonthExpense),
                    'last_income' => (float) $lastMonthIncome,
                    'last_expense' => (float) $lastMonthExpense,
                    'last_profit' => (float) ($lastMonthIncome - $lastMonthExpense),
                ],
                'chart' => $chartData,
            ];

            return $this->setStatus(true)->setCode(200)->setResult($result);
        } catch (Exception $e) {
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function getDetailedReportData(?string $propertyId, ?int $year, ?int $month): mixed
    {
        try {
            $user = auth()->user();
            $year = $year ?? (int) date('Y');
            $month = $month ?? (int) date('m');

            $ownerId = $user->hasRole('staff')
                ? User::whereHas('roles', fn($q) => $q->where('name', 'owner'))->first()?->id
                : $user->id;

            // Rincian Pembayaran Masuk (Uang Kos)
            $incomes = Payment::with(['invoice.property', 'invoice.room', 'invoice.tenant'])
                ->whereHas('invoice.property', function ($q) use ($ownerId, $propertyId) {
                    $q->where('owner_id', $ownerId);
                    if ($propertyId) {
                        $q->where('id', Helper::decrypt($propertyId));
                    }
                })
                ->whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->orderBy('payment_date', 'asc')
                ->get();

            // Rincian Pengeluaran Operasional
            $expenses = Expense::with(['property', 'category'])
                ->whereHas('property', function ($q) use ($ownerId, $propertyId) {
                    $q->where('owner_id', $ownerId);
                    if ($propertyId) {
                        $q->where('id', Helper::decrypt($propertyId));
                    }
                })
                ->whereYear('expense_date', $year)
                ->whereMonth('expense_date', $month)
                ->orderBy('expense_date', 'asc')
                ->get();

            // Hitung Agregat
            $totalIncome = $incomes->sum('amount_paid');
            $totalExpense = $expenses->sum('amount');
            $netProfit = $totalIncome - $totalExpense;

            // Cari nama properti jika filter aktif
            $propertyName = 'Semua Gedung Kos';
            if ($propertyId) {
                $prop = \App\Models\Property::find(Helper::decrypt($propertyId));
                if ($prop) $propertyName = $prop->name;
            }

            $result = [
                'period' => "Bulan {$month} Tahun {$year}",
                'property_name' => $propertyName,
                'summary' => [
                    'income' => $totalIncome,
                    'expense' => $totalExpense,
                    'profit' => $netProfit,
                ],
                'incomes' => $incomes,
                'expenses' => $expenses,
            ];

            return $this->setStatus(true)->setCode(200)->setResult($result);
        } catch (Exception $e) {
            Log::error($e);
            return $this->exceptionResponse($e);
        }
    }
}
