<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LaravelEasyRepository\Traits\GenUid;

#[Fillable(['user_id', 'employee_code', 'division', 'level', 'status',
    'joined_at', 'id_card_number', 'telephone', 'address',

])]
class Employee extends Model
{
    use GenUid;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
