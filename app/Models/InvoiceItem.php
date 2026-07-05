<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LaravelEasyRepository\Traits\GenUid;

class InvoiceItem extends Model
{
    use GenUid;

    protected $fillable = [
        'invoice_id',
        'name',
        'qty',
        'price',
        'subtotal',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
