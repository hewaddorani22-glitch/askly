<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->sessions()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'topic_keywords' => 'nullable|string',
            'accent_color' => 'nullable|string|max:7',
        ]);

        // Generate unique 6 digit code
        do {
            $code = strtoupper(Str::random(6));
        } while (Session::where('session_code', $code)->exists());

        $session = $request->user()->sessions()->create([
            'title' => $request->title,
            'description' => $request->description,
            'topic_keywords' => $request->topic_keywords,
            'session_code' => $code,
            'accent_color' => $request->accent_color ?? '#46178f',
            'is_active' => true,
        ]);

        return response()->json($session, 201);
    }

    public function show($id)
    {
        // Try finding by ID or Code
        $session = Session::where('id', $id)->orWhere('session_code', $id)->firstOrFail();
        return response()->json($session);
    }

    public function update(Request $request, Session $session)
    {
        if ($session->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $session->update($request->all());

        return response()->json($session);
    }

    public function destroy(Request $request, Session $session)
    {
        if ($session->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session->delete();

        return response()->json(['message' => 'Session deleted']);
    }
}
