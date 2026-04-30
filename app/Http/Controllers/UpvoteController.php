<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Upvote;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UpvoteController extends Controller
{
    public function toggle(Request $request, Question $question)
    {
        $request->validate([
            'voter_id' => 'required|string'
        ]);

        $voterId = $request->voter_id;

        $existingUpvote = Upvote::where('question_id', $question->id)
                                ->where('voter_id', $voterId)
                                ->first();

        if ($existingUpvote) {
            $existingUpvote->delete();
            $question->decrement('upvote_count');
            return response()->json(['message' => 'Upvote removed', 'upvoted' => false]);
        } else {
            Upvote::create([
                'question_id' => $question->id,
                'voter_id' => $voterId
            ]);
            $question->increment('upvote_count');
            return response()->json(['message' => 'Upvote added', 'upvoted' => true]);
        }
    }
}
