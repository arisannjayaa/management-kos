<?php

namespace App\Http\Controllers;

use App\DataTables\PaymentDataTable;
use App\Helpers\Helper;
use App\Http\Resources\PropertyResource;
use App\Models\User;
use App\Services\Payment\PaymentService;
use App\Services\Property\PropertyService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    protected PropertyService $propertyService;

    public function __construct(PaymentService $paymentService, PropertyService $propertyService)
    {
        $this->paymentService = $paymentService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak berwenang membuka buku besar kuitansi.');
        }

        // 🌟 SINKRONISASI CONTEXT OWNER UNTUK MASTER DROPDOWN KUITANSI STAFF
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        $properties = $this->propertyService->findAllByOwnerId($ownerId)->getResult();
        $dataTable = new PaymentDataTable;

        return $dataTable->render('payment/index', 'payments', [
            'properties' => $properties ? PropertyResource::collection($properties) : [],
        ]);
    }

    public function destroy($id)
    {
        $response = $this->paymentService->annulPayment(Helper::decrypt($id) ?? $id);
        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', $response->getMessage());
    }

    public function bulkDestroy(Request $request)
    {
        $ids = array_map(fn ($id) => Helper::decrypt($id) ?? $id, $request->input('ids', []));
        $response = $this->paymentService->bulkAnnul($ids);

        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', $response->getMessage());
    }
}
