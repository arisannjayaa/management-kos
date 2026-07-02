<?php

namespace App\Services\Employee;

use App\Helpers\Helper;
use App\Repositories\Employee\EmployeeRepository;
use App\Repositories\User\UserRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;
use LaravelEasyRepository\Traits\ResultService;

class EmployeeServiceImplement extends ServiceApi implements EmployeeService
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
    protected string $delete_message = 'Pegawai berhasil dihapus';

    /**
     * don't change $this->mainRepository variable name
     * because used in extends service class
     */
    protected EmployeeRepository $mainRepository;

    protected UserRepository $userRepository;

    public function __construct(EmployeeRepository $mainRepository, UserRepository $userRepository)
    {
        $this->mainRepository = $mainRepository;
        $this->userRepository = $userRepository;
    }

    public function create($data)
    {
        DB::beginTransaction();
        try {
            // 1. Petakan Data User
            $dataUser['password'] = bcrypt($data['password']);
            $dataUser['email'] = $data['email'];
            $dataUser['name'] = $data['name'];

            $user = $this->userRepository->create($dataUser);

            $user->assignRole('staff');

            $dataEmployee['user_id'] = $user->id;
            $dataEmployee['employee_code'] = 'AGS-'.time();
            $dataEmployee['division'] = $data['division'];
            $dataEmployee['level'] = $data['level'];
            $dataEmployee['address'] = $data['address'];
            $dataEmployee['id_card_number'] = $data['id_card_number'];
            $dataEmployee['status'] = $data['status'];
            $dataEmployee['joined_at'] = $data['joined_at'];
            $dataEmployee['telephone'] = $data['telephone'];

            $this->mainRepository->create($dataEmployee);

            $redirect = redirect()->intended(route('employee.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Pegawai berhasil ditambahkan');

        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * update data pengguna
     *
     * @return EmployeeServiceImplement|bool|ResultService|mixed
     *
     * @throws \Throwable
     */
    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            $id = Helper::decrypt($id);
            $userId = Helper::decrypt($data['user_id']);

            if ($data['password'] != null) {
                $dataUser['password'] = bcrypt(@$data['password']);
            }

            $dataUser['email'] = $data['email'];
            $dataUser['name'] = $data['name'];

            $dataEmployee['user_id'] = $userId;
            $dataEmployee['employee_code'] = 'AGS-'.time();
            $dataEmployee['division'] = $data['division'];
            $dataEmployee['level'] = $data['level'];
            $dataEmployee['address'] = $data['address'];
            $dataEmployee['id_card_number'] = $data['id_card_number'];
            $dataEmployee['status'] = $data['status'];
            $dataEmployee['joined_at'] = $data['joined_at'];
            $dataEmployee['telephone'] = $data['telephone'];

            unset($data);

            $this->userRepository->update($userId, $dataUser);
            $this->mainRepository->update($id, $dataEmployee);
            $redirect = redirect()->intended(route('employee.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Pegawai berhasil diperbaharui');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return EmployeeServiceImplement|ServiceApi|ResultService
     *
     * @throws \Throwable
     */
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            // 1. Cari data employee berdasarkan ID asli yang sudah didekripsi dari Controller
            $employee = $this->mainRepository->find($id);

            if (! $employee) {
                throw new \Exception('Data karyawan tidak ditemukan');
            }

            // 2. Ambil data User murni langsung dari relasi database
            $user = $employee->user;

            // 3. Hapus data employee terlebih dahulu untuk mengamankan Foreign Key
            $employee->delete();

            // 4. Hapus data user induk beserta permission-nya secara aman
            if ($user) {
                // Pastikan ID-nya dibaca sebagai Integer asli oleh Spatie/Laravel
                // Jika sebelumnya properti ->id sempat ter-overwrite string di tempat lain, kita paksa ambil yang asli
                $user->delete();
            }

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setMessage('Karyawan berhasil dihapus');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function restore($id)
    {
        DB::beginTransaction();
        try {
            $employee = $this->mainRepository->findWithTrashed($id);
            $user = $this->userRepository->findWithTrashed($employee->user_id);

            if (! $employee) {
                throw new Exception('Data nasabah tidak ditemukan');
            }

            $employee->restore($id);
            $user->restore($employee->user_id);

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setMessage('Pegawai berhasil dipulihkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return EmployeeServiceImplement|ResultService
     */
    public function findByUserId($userId)
    {
        try {

            $result = $this->mainRepository->findByUserId($userId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }
}
