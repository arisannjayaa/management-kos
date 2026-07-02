<?php

namespace App\Services\User;

use App\Helpers\Helper;
use App\Repositories\User\UserRepository;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use LaravelEasyRepository\ServiceApi;
use LaravelEasyRepository\Traits\ResultService;

class UserServiceImplement extends ServiceApi implements UserService
{
    /**
     * uncomment this to override the default message
     * protected $create_message = "";
     * protected $update_message = "";
     * protected $delete_message = "";
     */
    protected string $delete_message = 'User berhasil dihapus';

    /**
     * don't change $this->mainRepository variable name
     * because used in extends service class
     */
    protected $mainRepository;

    public function __construct(UserRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    /**
     * menambah data
     *
     * @throws \Throwable
     */
    public function create($data): Model|ResultService|UserServiceImplement|ServiceApi|null
    {
        DB::beginTransaction();
        try {
            $data['password'] = bcrypt($data['password']);

            $this->mainRepository->create($data);

            $redirect = redirect()->intended(route('user.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('User berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * memperbaharui data
     *
     * @return UserServiceImplement|bool|ResultService|mixed
     *
     * @throws \Throwable
     */
    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            $id = Helper::decrypt($id);
            $user = $this->mainRepository->find($id);
            $data['password'] = bcrypt($data['password']);
            unset($data['id']);

            if (@$data['id_card_attachment_old']) {
                $data['id_card_attachment'] = $data['id_card_attachment_old'];
            }

            if (! @$data['id_card_attachment_old']) {
                if (Storage::disk('public')->exists(@$user->id_card_attachment)) {
                    Storage::disk('public')->delete(@$user->id_card_attachment);
                }
            }

            $this->mainRepository->update($id, $data);
            $redirect = redirect()->intended(route('user.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('User berhasil diperbaharui');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * verifikasi pengguna
     *
     * @throws \Throwable
     */
    public function verification($data)
    {
        DB::beginTransaction();
        try {
            $id = $data['id'];
            unset($data['id']);

            $message = '';

            if ($data['status'] == 'Terverifikasi') {
                $message .= 'Berhasil memverifikasi pengguna';
            }

            if ($data['status'] == 'Di Tolak') {
                $message .= 'Berhasil menolak pengguna';
            }

            $redirect = redirect()->intended(route('user.index'));
            $this->mainRepository->update($id, $data);

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage($message);
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }
}
