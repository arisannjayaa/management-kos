<?php

namespace App\Http\Controllers;

use App\DataTables\ComplaintDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionComplaintRequest;
use App\Http\Requests\ComplaintRequest;
use App\Services\Complaint\ComplaintService;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    protected ComplaintService $complaintService;

    public function __construct(ComplaintService $complaintService)
    {
        $this->complaintService = $complaintService;
    }

    public function index(Request $request)
    {
        $dataTable = new ComplaintDataTable;

        return $dataTable->render('complaint/index', 'complaints');
    }

    public function create(ComplaintRequest $request)
    {
        $data = $request->only(['title', 'description', 'attachment']);

        $response = $this->complaintService->create($data);
        if (! $response->getStatus()) {
            return redirect()->back()->withInput()->with('error', $response->getMessage()); // Patuh aturan 9.1
        }

        $result = $response->getResult();

        return redirect($result['redirect'])->with('success', $response->getMessage()); // Patuh aturan 9.3
    }

    public function update(ComplaintRequest $request, $id)
    {
        $data = $request->only(['status', 'response_notes', 'attachment']);

        $response = $this->complaintService->update(Helper::decrypt($id), $data);
        if (! $response->getStatus()) {
            return redirect()->back()->withInput()->with('error', $response->getMessage());
        }

        $result = $response->getResult();

        return redirect($result['redirect'])->with('success', $response->getMessage());
    }

    public function delete(Request $request, $id)
    {
        $user = auth()->user();

        // 🔒 ATURAN UTAMA: Staff dilarang keras menghapus keluhan
        if ($user->hasRole('staff')) {
            abort(403, 'Staff tidak memiliki akses untuk menghapus tiket keluhan.');
        }

        $response = $this->complaintService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function restore($id)
    {
        $user = auth()->user();

        // 🔒 ATURAN UTAMA: Hanya Owner & SuperAdmin yang bisa memulihkan data dari sampah
        if (! $user->hasRole('owner') && ! $user->hasRole('super_admin')) {
            abort(403, 'Aksi ditolak. Hanya pemilik kos yang dapat memulihkan tiket keluhan.');
        }

        $response = $this->complaintService->restore(Helper::decrypt($id));

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function forceDelete($id)
    {
        $user = auth()->user();

        // 🔒 ATURAN UTAMA: Hanya Owner & SuperAdmin yang bisa menghapus permanen
        if (! $user->hasRole('owner') && ! $user->hasRole('super_admin')) {
            abort(403, 'Aksi ditolak. Hanya pemilik kos yang dapat menghapus tiket secara permanen.');
        }

        $response = $this->complaintService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function bulkDestroy(BulkActionComplaintRequest $request)
    {
        if (auth()->user()->hasRole('staff')) {
            abort(403, 'Staff tidak memiliki akses untuk menghapus keluhan.');
        }

        $response = $this->complaintService->bulkDelete($request->ids);

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function bulkForceDelete(BulkActionComplaintRequest $request)
    {
        if (! auth()->user()->hasRole('owner') && ! auth()->user()->hasRole('super_admin')) {
            abort(403, 'Aksi ditolak.');
        }

        $response = $this->complaintService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function bulkRestore(BulkActionComplaintRequest $request)
    {
        if (! auth()->user()->hasRole('owner') && ! auth()->user()->hasRole('super_admin')) {
            abort(403, 'Aksi ditolak.');
        }

        $response = $this->complaintService->bulkRestore($request->ids);

        return redirect()->back()->with('success', $response->getMessage());
    }
}
