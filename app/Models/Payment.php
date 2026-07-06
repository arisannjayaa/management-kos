<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Payment extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'receiver_id',
        'payment_number',
        'amount_paid',
        'payment_date',
        'payment_method',
        'proof_attachment',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'amount_paid' => 'float',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
