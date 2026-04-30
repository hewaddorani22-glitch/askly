<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Upvote extends Model
{
    protected $fillable = [
        'question_id',
        'voter_id',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
