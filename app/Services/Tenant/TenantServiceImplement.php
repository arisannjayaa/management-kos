<?php

namespace App\Services\Tenant;

use App\Helpers\Helper;
use App\Models\Tenant;
use App\Models\User;
use App\Repositories\Tenant\TenantRepository;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class TenantServiceImplement extends ServiceApi implements TenantService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Penyewa';
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
    protected TenantRepository $mainRepository;

    public function __construct(TenantRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    /**
     * Saring hanya tenant berstatus 'active' milik owner untuk dropdown check-in
     */
    public function allActiveByOwner($ownerId): mixed
    {
        try {
            // Memanggil query builder dari repository bawaan
            $result = $this->mainRepository->getByOwner($ownerId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }

    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            $data['owner_id'] = auth()->id();

            // 1. Proses penyimpanan berkas file KTP jika diunggah oleh Owner
            if (isset($data['ktp_attachment']) && $data['ktp_attachment'] instanceof UploadedFile) {
                $data['ktp_attachment'] = $data['ktp_attachment']->store('attachments/tenants', 'public');
            }

            // 2. Terbitkan Akun User Login Portal
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt($data['phone']),
            ]);
            $user->assignRole('tenant');

            $data['user_id'] = $user->id;
            // 3. Simpan Profil Tenant
            $this->mainRepository->create($data);

            DB::commit();

            return $this->setStatus(true)->setCode(201)
                ->setResult(['redirect' => route('tenants.index')])
                ->setMessage('Profil penyewa dan akun portal login berhasil diterbitkan.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function update($id, $data): mixed
    {
        DB::beginTransaction();
        try {
            unset($data['owner_id'], $data['user_id']);
            $tenant = Tenant::findOrFail($id);

            // 1. Pengondisian file upload KTP saat pembaharuan data profile
            if (isset($data['ktp_attachment']) && $data['ktp_attachment'] instanceof UploadedFile) {
                $data['ktp_attachment'] = $data['ktp_attachment']->store('attachments/tenants', 'public');
            } else {
                unset($data['ktp_attachment']); // Cegah overwrite null jika tidak sedang ganti foto KTP
            }

            // 2. Sinkronisasi data user
            $user = User::findOrFail($tenant->user_id);
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            // 3. Update database profile tenant
            $this->mainRepository->update($id, $data);

            DB::commit();

            return $this->setStatus(true)->setCode(200)
                ->setResult(['redirect' => route('tenants.index')])
                ->setMessage('Perubahan data profil penyewa berhasil disimpan.');
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
            $tenant = Tenant::findOrFail($id);
            $this->mainRepository->delete($id);
            User::where('id', $tenant->user_id)->delete();
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Data penyewa berhasil dibuang ke tempat sampah.');
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
            $tenant = Tenant::withTrashed()->findOrFail($id);
            User::withTrashed()->where('id', $tenant->user_id)->restore();
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Profil penyewa dan akses portal berhasil dipulihkan.');
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
            $tenant = Tenant::withTrashed()->findOrFail($id);
            User::withTrashed()->where('id', $tenant->user_id)->forceDelete();
            $this->mainRepository->forceDelete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Data penyewa dan akun login telah dimusnahkan permanen.');
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
            foreach ($decryptedIds as $id) {
                $this->delete($id);
            }
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan data penyewa berhasil dihapus.');
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
            foreach ($decryptedIds as $id) {
                $this->restore($id);
            }
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan data penyewa berhasil dipulihkan.');
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
            foreach ($decryptedIds as $id) {
                $this->forceDelete($id);
            }
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Kumpulan data penyewa dimusnahkan permanen.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }
}
