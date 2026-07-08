<?php

namespace App\Http\Controllers;

use App\DataTables\TenantDataTable;
use App\Helpers\Helper;
use App\Http\Requests\TenantRequest;
use App\Services\Tenant\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

// 🌟 Panggil Facade Storage

class TenantController extends Controller
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi');
        }

        return (new TenantDataTable)->render('tenant/index', 'tenants');
    }

    public function create(TenantRequest $request)
    {
        // 🌟 Pastikan 'ktp_attachment' ikut dikumpulkan di dalam array only
        $data = $request->only(['name', 'ktp_number', 'ktp_attachment', 'phone', 'emergency_contact', 'status', 'email']);

        $response = $this->tenantService->create($data);
        if (! $response->getStatus()) {
            return redirect()->back()->withInput()->with('error', $response->getMessage()); // Evaluasi 9.1[cite: 1]
        }

        $result = $response->getResult();

        return redirect($result['redirect'])->with('success', $response->getMessage()); // Standard redirect 9.3[cite: 1]
    }

    public function update(TenantRequest $request, $id)
    {
        // 🌟 Pastikan 'ktp_attachment' ikut dikumpulkan di dalam array only
        $data = $request->only(['name', 'ktp_number', 'ktp_attachment', 'phone', 'emergency_contact', 'status', 'email']);

        $response = $this->tenantService->update(Helper::decrypt($id), $data);
        if (! $response->getStatus()) {
            return redirect()->back()->withInput()->with('error', $response->getMessage());
        }

        $result = $response->getResult();

        return redirect($result['redirect'])->with('success', $response->getMessage());
    }

    public function delete(Request $request, $id)
    {
        // Catatan: Jika menggunakan SoftDeletes berkas fisik jangan dihapus dulu,
        // hapus fisik berkas hanya diletakkan di method ForceDelete nantinya.
        $this->tenantService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Data penyewa berhasil dibuang.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $this->tenantService->bulkDelete($request->ids);

        return redirect()->back()->with('success', 'Data penyewa massal berhasil dihapus.');
    }
}
