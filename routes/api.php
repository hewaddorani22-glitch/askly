<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\UpvoteController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Student routes (Session and Questions via Code or ID)
Route::get('/sessions/{id}', [SessionController::class, 'show']);
Route::get('/sessions/{id}/questions', [QuestionController::class, 'index']);
Route::post('/sessions/{id}/questions', [QuestionController::class, 'store']);
Route::post('/questions/{question}/upvote', [UpvoteController::class, 'toggle']);

// Protected routes (Professor)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('professor/sessions', SessionController::class)->except(['show']);
    Route::patch('/questions/{question}/status', [QuestionController::class, 'updateStatus']);
});
