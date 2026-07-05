<?php

namespace App\Services\Occupancy;

use App\Models\Room;
use App\Repositories\Occupancy\OccupancyRepository;
use App\Repositories\Room\RoomRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;
use Opcodes\LogViewer\Logs\Log;

class OccupancyServiceImplement extends ServiceApi implements OccupancyService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Okupansi Check-In';
    /**
     * uncomment this to override the default message
     * protected string $create_message = "";
     * protected string $update_message = "";
     * protected string $delete_message = "";
     */

    /**
     * don't change $this->mainRepository variable name
     * because used in extends service class
     */
    protected OccupancyRepository $mainRepository;
    protected RoomRepository $roomRepository;

    public function __construct(OccupancyRepository $mainRepository, RoomRepository $roomRepository)
    {
        $this->mainRepository = $mainRepository;
        $this->roomRepository = $roomRepository;
    }

    /**
     * Mengambil riwayat hunian aktif berdasarkan properti tertentu
     */
    public function findActiveByProperty($propertyId): mixed
    {
        try {
            $result = $this->mainRepository->getActiveByProperty($propertyId);

            return $this->setStatus(true)->setCode(200)->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }

    /**
     * Memproses Siklus Check-In Kontrak Penyewa Baru (Logika Atomik)
     */
    public function checkIn(array $data): mixed
    {
        DB::beginTransaction();
        try {
            // 1. Validasi awal kesiapan kamar fisik
            $room = $this->roomRepository->findOrFail($data['room_id']);

            if ($room->status !== 'available') {
                return $this->setStatus(false)
                    ->setCode(422)
                    ->setMessage('Kamar gagal disewa. Kondisi unit kamar saat ini tidak kosong atau sedang dalam perbaikan.');
            }

            // 2. Tentukan otomatisasi tanggal penagihan bulanan dari start_date jika tidak dilampirkan
            if (empty($data['billing_day'])) {
                $data['billing_day'] = Carbon::parse($data['start_date'])->day;
            }

            $data['status'] = 'active';

            // 3. Simpan induk data log kontrak via repository
            $occupancy = $this->mainRepository->create($data);

            // 4. AUTOMATION: Balik status fisik unit kamar menjadi terisi ('occupied')
            $room->update(['status' => 'occupied']);

            $redirect = redirect()->intended(route('occupancies.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(201)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage("Proses Check-in penyewa baru berhasil diamankan. Status Kamar {$room->room_number} kini resmi Terisi!");
        } catch (Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Memproses Siklus Check-Out (Pemutusan/Penyelesaian Kontrak Sewa)
     */
    public function checkOut($id, array $closureData): mixed
    {
        DB::beginTransaction();
        try {
            $occupancy = $this->mainRepository->find($id);
            if ($occupancy->status === 'checked_out') {
                return $this->setStatus(false)->setCode(422)->setMessage('Kontrak hunian ini sudah berstatus check-out sebelumnya.');
            }

            // 1. Perbarui status log kontrak hunian
            $this->mainRepository->update($id, [
                'status' => 'checked_out',
                'end_date' => $closureData['end_date'] ?? now()->format('Y-m-d'),
            ]);

            // 2. AUTOMATION: Kembalikan status fisik unit kamar menjadi kosong ('available') agar bisa disewakan kembali
            $room = Room::findOrFail($occupancy->room_id);
            $room->update(['status' => 'available']);

            $redirect = redirect()->intended(route('occupancies.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage("Proses check-out berhasil dirampungkan. Unit Kamar {$room->room_number} kini siap dipasarkan kembali.");
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }
}
