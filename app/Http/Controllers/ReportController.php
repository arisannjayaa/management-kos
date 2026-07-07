<?php

namespace App\Http\Controllers;

use App\Http\Resources\PropertyResource;
use App\Models\User;
use App\Services\Property\PropertyService;
use App\Services\Report\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected ReportService $reportService;

    protected PropertyService $propertyService;

    public function __construct(ReportService $reportService, PropertyService $propertyService)
    {
        $this->reportService = $reportService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        $propertyId = $request->query('property_id');
        $year = $request->query('year');
        $month = $request->query('month');

        $user = auth()->user();
        $ownerId = $user->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : $user->id;

        // Ambil data Master Property untuk filter Dropdown
        $properties = $this->propertyService->findAllByOwnerId($ownerId)->getResult();

        // 🌟 IMPLEMENTASI PEDOMAN 9.1: Validasi Status Eksekusi Service
        $response = $this->reportService->getFinancialDashboardData($propertyId, $year, $month);

        if (! $response->getStatus()) {
            return back()->with('error', 'Gagal memuat data laporan: '.$response->getMessage());
        }

        return Inertia::render('report/index', [
            'filters' => [
                'property_id' => $propertyId,
                'year' => $year ?? (int) date('Y'),
                'month' => $month ?? (int) date('m'),
            ],
            'properties' => PropertyResource::collection($properties),
            'financialData' => $response->getResult(),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $propertyId = $request->query('property_id');
        $year = $request->query('year');
        $month = $request->query('month');

        $response = $this->reportService->getDetailedReportData($propertyId, $year, $month);

        if (! $response->getStatus()) {
            return back()->with('error', 'Gagal menyusun data laporan PDF.');
        }

        $data = $response->getResult();

        // Menggunakan library DOMPDF
        $pdf = Pdf::loadView('report.pdf', $data);

        // Atur ukuran kertas
        $pdf->setPaper('A4', 'portrait');

        $fileName = 'Laporan_Keuangan_Kos_'.str_replace(' ', '_', $data['period']).'.pdf';

        // Return stream agar PDF terbuka langsung di browser tab baru
        return $pdf->stream($fileName);
    }
}
