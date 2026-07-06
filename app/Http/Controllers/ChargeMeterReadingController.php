<?php

namespace App\Http\Controllers;

use App\DataTables\ChargeMeterReadingDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionChargeMeterReadingRequest;
use App\Http\Requests\ChargeMeterReadingRequest;
use App\Http\Resources\ChargeTypeResource;
use App\Http\Resources\OccupancyResource;
use App\Http\Resources\PropertyResource;
use App\Models\ChargeMeterReading;
use App\Models\ChargeType;
use App\Models\Occupancy;
use App\Services\ChargeMeterReading\ChargeMeterReadingService;
use App\Services\Property\PropertyService;
use Illuminate\Http\Request;

class ChargeMeterReadingController extends Controller
{
    protected ChargeMeterReadingService $meterReadingService;

    protected PropertyService $propertyService;

    public function __construct(ChargeMeterReadingService $meterReadingService, PropertyService $propertyService)
    {
        $this->meterReadingService = $meterReadingService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak berwenang mengelola meteran utilitas.');
        }

        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();
        $propertyIds = $properties ? $properties->pluck('id')->toArray() : [];

        // Ambil data master biaya khusus tipe metered (variabel) untuk keperluan dropdown filter & form
        $chargeTypes = ChargeType::whereIn('property_id', $propertyIds)
            ->where('billing_method', 'metered')
            ->where('is_active', true)
            ->get();

        // Ambil hunian/kontrak aktif untuk opsi pencatatan baru
        $occupancies = Occupancy::with(['room', 'tenant'])
            ->whereIn('property_id', $propertyIds)
            ->where('status', 'active')
            ->get();

        $dataTable = new ChargeMeterReadingDataTable;

        return $dataTable->render('meter-reading/index', 'meterReadings', [
            'properties' => $properties ? PropertyResource::collection($properties) : [],
            'chargeTypes' => $chargeTypes ? ChargeTypeResource::collection($chargeTypes) : [],
            'occupancies' => $occupancies ? OccupancyResource::collection($occupancies) : [],
        ]);
    }

    public function store(ChargeMeterReadingRequest $request)
    {
        $data = $request->validated();
        $response = $this->meterReadingService->create($data);

        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', 'Angka posisi meteran baru berhasil direkam.');
    }

    /**
     * Mengambil otomatis posisi angka meteran terakhir secara realtime via API internal form
     */
    public function getPreviousReading(Request $request)
    {
        $occId = Helper::decrypt($request->occupancy_id) ?? $request->occupancy_id;
        $chargeTypeId = Helper::decrypt($request->charge_type_id) ?? $request->charge_type_id;

        $value = $this->meterReadingService->getPreviousReadingValue($occId, $chargeTypeId);

        return response()->json(['previous_reading' => $value]);
    }

    public function destroy($id)
    {
        $decryptedId = Helper::decrypt($id);

        // Proteksi Keamanan: Cegah penghapusan jika data meteran sudah dikunci oleh invoice yang terbit
        $reading = ChargeMeterReading::findOrFail($decryptedId);
        if ($reading->invoice_id) {
            return redirect()->back()->withErrors(['error' => 'Data tidak bisa dihapus karena sudah terkunci dalam invoice tagihan bulanan.']);
        }

        $this->meterReadingService->delete($decryptedId);

        return redirect()->back()->with('success', 'Catatan riwayat meteran berhasil dianulir.');
    }

    // ─── SOFT DELETE EXTENSIONS (Sesuai Rute Web) ───

    public function restore($id)
    {
        // Memanggil repositori via service untuk mengembalikan data dari soft delete
        $this->meterReadingService->restore($id);

        return redirect()->back()->with('success', 'Catatan riwayat meteran berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->meterReadingService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Catatan riwayat meteran dihapus secara permanen.');
    }

    // ─── BULK ACTIONS ───

    public function bulkDestroy(BulkActionChargeMeterReadingRequest $request)
    {
        $this->meterReadingService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan riwayat meteran berhasil dihapus.');
    }

    public function bulkForceDelete(BulkActionChargeMeterReadingRequest $request)
    {
        $this->meterReadingService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan riwayat meteran dihapus permanen.');
    }

    public function bulkRestore(BulkActionChargeMeterReadingRequest $request)
    {
        $this->meterReadingService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan riwayat meteran berhasil dipulihkan.');
    }
}
