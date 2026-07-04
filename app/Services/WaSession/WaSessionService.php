<?php

namespace App\Services\WaSession;

use LaravelEasyRepository\BaseService;

interface WaSessionService extends BaseService{

    public function checkStatus(): mixed;
    public function initSession(): mixed;
    public function sendMessage(string $to, string $message): mixed;
    public function broadcastMessage(array $numbers, string $message): mixed;
    public function getGroups(): mixed;
}
