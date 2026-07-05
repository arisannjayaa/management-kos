<?php

namespace App\Http\Controllers;

use App\DataTables\TenantDataTable;
use App\Helpers\Helper;
use App\Http\Requests\TenantRequest;
use App\Models\Tenant;
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
        $data = $request->validated();
        $data['owner_id'] = auth()->id();

        // 🌟 LOGIKA UPLOAD BERKAS BARU
        if ($request->hasFile('ktp_attachment')) {
            $file = $request->file('ktp_attachment');
            $path = $file->store('attachments/ktp', 'public');
            $data['ktp_attachment'] = $path;
        }

        $response = $this->tenantService->create($data);
        if (! $response->getStatus()) {
            if (isset($data['ktp_attachment'])) {
                Storage::disk('public')->delete($data['ktp_attachment']);
            }

            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->to(route('tenants.index'))->with('success', 'Profil penyewa dan dokumen berhasil disimpan!');
    }

    public function update(TenantRequest $request, $id)
    {
        $data = $request->validated();
        $tenantId = Helper::decrypt($id);

        // Ambil data entity lama dari database untuk mengecek file lama
        $tenant = Tenant::findOrFail($tenantId);

        // 🌟 LOGIKA UPDATE & PENYINGKIRAN FILE LAMA
        if ($request->hasFile('ktp_attachment')) {
            // Hapus file fisik lama jika sebelumnya sudah pernah upload berkas
            if ($tenant->ktp_attachment) {
                Storage::disk('public')->delete($tenant->ktp_attachment);
            }

            $file = $request->file('ktp_attachment');
            $path = $file->store('attachments/ktp', 'public');
            $data['ktp_attachment'] = $path;
        }

        $response = $this->tenantService->update($tenantId, $data);
        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->to(route('tenants.index'))->with('success', 'Data profil penyewa berhasil diperbarui!');
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
