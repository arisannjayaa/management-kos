<?php

namespace App\Http\Controllers;

use App\DataTables\PropertyDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionPropertyRequest;
use App\Http\Requests\PropertyRequest;
use App\Services\Property\PropertyService;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    protected PropertyService $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        // Proteksi role berdasarkan Roadmap Fase 1
        if (! auth()->user()->hasRole(['super_admin', 'owner'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin untuk mengelola properti.');
        }

        $dataTable = new PropertyDataTable;

        return $dataTable->render('property/index', 'properties');
    }

    public function create(PropertyRequest $request)
    {
        $data = $request->only([
            'name', 'address', 'city', 'phone',
            'billing_cycle_days', 'billing_grace_period_days',
            'reminder_offsets_json', 'wa_reminder_enabled',
        ]);

        $result = $this->propertyService->create($data)->getResult();
        $targetUrl = $result['redirect'] ?? route('properties.index');

        return redirect()->to($targetUrl)->with('success', 'Properti kos baru berhasil didaftarkan!');
    }

    public function update(PropertyRequest $request, $id)
    {
        $data = $request->only([
            'name', 'address', 'city', 'phone',
            'billing_cycle_days', 'billing_grace_period_days',
            'reminder_offsets_json', 'wa_reminder_enabled', 'is_active',
        ]);

        $result = $this->propertyService->update(Helper::decrypt($id), $data)->getResult();
        $targetUrl = $result['redirect'] ?? route('properties.index');

        return redirect()->to($targetUrl)->with('success', 'Informasi properti berhasil diperbarui!');
    }

    public function delete(Request $request, $id)
    {
        $this->propertyService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Properti berhasil dihapus.');
    }

    // ─── SOFT DELETE EXTENSIONS (Sesuai Rute Web) ───

    public function restore($id)
    {
        // Memanggil repositori via service untuk mengembalikan data dari soft delete
        $this->propertyService->restore(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Properti berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->propertyService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Properti dihapus secara permanen.');
    }

    // ─── BULK ACTIONS ───

    public function bulkDestroy(BulkActionPropertyRequest $request)
    {
        $this->propertyService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti berhasil dihapus.');
    }

    public function bulkForceDelete(BulkActionPropertyRequest $request)
    {
        $this->propertyService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti dihapus permanen.');
    }

    public function bulkRestore(BulkActionPropertyRequest $request)
    {
        $this->propertyService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti berhasil dipulihkan.');
    }
}
