<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'session_id',
        'content',
        'is_anonymous',
        'status',
        'upvote_count',
        'is_duplicate',
        'duplicate_of',
        'filter_reason',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_duplicate' => 'boolean',
    ];

    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    public function upvotes()
    {
        return $this->hasMany(Upvote::class);
    }

    public function duplicateOf()
    {
        return $this->belongsTo(Question::class, 'duplicate_of');
    }
}
