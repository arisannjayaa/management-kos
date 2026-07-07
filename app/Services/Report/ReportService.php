<?php

namespace App\Services\Report;

use LaravelEasyRepository\BaseService;

interface ReportService extends BaseService{

    /**
     * Mengambil ringkasan total dan data grafik untuk Dasbor Keuangan.
     */
    public function getFinancialDashboardData(?string $propertyId, ?int $year, ?int $month): mixed;

    /**
     * Mengambil data rincian lengkap untuk diekspor ke PDF.
     */
    public function getDetailedReportData(?string $propertyId, ?int $year, ?int $month): mixed;
}
