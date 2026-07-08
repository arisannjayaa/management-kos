<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Room extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'property_id',
        'room_type_id',
        'room_number',
        'status',
    ];

    /**
     * Menunjuk ke Properti bernaung
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    /**
     * Menunjuk ke klasifikasi Tipe Kamar unit ini
     */
    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'room_id');
    }
}
