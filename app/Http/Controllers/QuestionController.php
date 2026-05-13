<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Session;
use App\Services\SmartFilterService;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    private SmartFilterService $filterService;

    public function __construct(SmartFilterService $filterService)
    {
        $this->filterService = $filterService;
    }

    public function index(Request $request, $sessionId)
    {
        $session = Session::where('id', $sessionId)->orWhere('session_code', $sessionId)->firstOrFail();
        
        $query = Question::where('session_id', $session->id)->withCount('upvotes');

        // Manually resolve authenticated user (route is public, auth is optional)
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();

        // Only professors can see filtered/dismissed questions
        if (!$user || $session->professor_id !== $user->id) {
             $query->whereIn('status', ['active', 'pinned', 'answered']);
        }

        $questions = $query->orderByRaw("CASE WHEN status = 'pinned' THEN 0 ELSE 1 END")
                           ->orderByDesc('upvotes_count')
                           ->orderByDesc('created_at')
                           ->get();

        return response()->json($questions);
    }

    public function store(Request $request, $sessionId)
    {
        $session = Session::where('id', $sessionId)->orWhere('session_code', $sessionId)->firstOrFail();

        if (!$session->is_active) {
            return response()->json(['message' => 'Session is not active'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
            'is_anonymous' => 'boolean',
        ]);

        $analysis = $this->filterService->analyze($request->content, $session);

        $question = Question::create([
            'session_id' => $session->id,
            'content' => $request->content,
            'is_anonymous' => $request->is_anonymous ?? true,
            'status' => $analysis['status'],
            'is_duplicate' => $analysis['is_duplicate'] ?? false,
            'duplicate_of' => $analysis['duplicate_of'] ?? null,
            'filter_reason' => $analysis['reason'] ?? null,
        ]);

        return response()->json($question, 201);
    }

    public function updateStatus(Request $request, Question $question)
    {
        // Check if professor owns the session
        if ($question->session->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,pinned,answered,dismissed,filtered'
        ]);

        $question->update(['status' => $request->status]);

        return response()->json($question);
    }
}
