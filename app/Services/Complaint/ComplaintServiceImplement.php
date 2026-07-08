<?php

namespace App\Services\Complaint;

use App\Helpers\Helper;
use App\Models\Occupancy;
use App\Repositories\Complaint\ComplaintRepository;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class ComplaintServiceImplement extends ServiceApi implements ComplaintService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = '';
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
    protected ComplaintRepository $mainRepository;

    public function __construct(ComplaintRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            $user = auth()->user();

            // Sesuai Panduan §3.7: Resolusi Context Otomatis Jika Peran Adalah Tenant (Penyewa)
            if ($user->hasRole('tenant')) {
                $occupancy = Occupancy::whereHas('tenant', function ($q) use ($user) {
                    $q->where('email', $user->email);
                })->where('status', 'active')->first();

                if (! $occupancy) {
                    throw new Exception('Gagal membuat laporan, Anda tidak tercatat dalam hunian kos aktif.');
                }

                $data['property_id'] = $occupancy->property_id;
                $data['room_id'] = $occupancy->room_id;
                $data['tenant_id'] = $occupancy->tenant_id;
            }

            if (isset($data['attachment']) && $data['attachment'] instanceof UploadedFile) {
                $data['attachment'] = $data['attachment']->store('attachments/complaints', 'public');
            }

            $this->mainRepository->create($data);
            $redirect = route('complaints.index');
            DB::commit();

            return $this->setStatus(true)->setCode(201)
                ->setResult(['redirect' => $redirect])
                ->setMessage('Laporan keluhan Anda berhasil dikirim ke pengelola kos.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);


            return $this->setStatus(false)
                ->setCode(422) // Code 422: Unprocessable Entity (Sangat presisi untuk kegagalan logika bisnis)
                ->setMessage($e->getMessage()); // Mengambil string kalimat dari throw new Exception di atas
        }
    }

    public function update($id, $data): mixed
    {
        DB::beginTransaction();
        try {
            // Unset data pengunci imutabilitas kepemilikan sesuai panduan
            unset($data['property_id'], $data['room_id'], $data['tenant_id']);

            if (isset($data['attachment']) && $data['attachment'] instanceof UploadedFile) {
                $data['attachment'] = $data['attachment']->store('attachments/complaints', 'public');
            } else {
                unset($data['attachment']);
            }

            $this->mainRepository->update($id, $data);
            $redirect = route('complaints.index');
            DB::commit();

            return $this->setStatus(true)->setCode(200)
                ->setResult(['redirect' => $redirect])
                ->setMessage('Perkembangan status pengolahan keluhan berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->delete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Keluhan dibuang ke tempat sampah.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkDelete($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkDelete($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan keluhan berhasil dibuang.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function forceDelete($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->forceDelete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Keluhan dihapus permanen.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkForceDelete($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkForceDelete($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan keluhan dihapus permanen.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function restore($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->restore($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Laporan keluhan dipulihkan.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkRestore($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkRestore($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan keluhan dipulihkan.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }
}
