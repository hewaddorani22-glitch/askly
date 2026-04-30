<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Session;
use Illuminate\Support\Str;

class SmartFilterService
{
    private array $spamKeywords = [
        'fuck', 'shit', 'asshole', 'bitch', 'crap', 'damn', 'idiot', 'stupid'
    ];

    public function analyze(string $content, Session $session): array
    {
        // 1. Check for Spam/Inappropriate Content
        $lowerContent = strtolower($content);
        foreach ($this->spamKeywords as $keyword) {
            if (str_contains($lowerContent, $keyword)) {
                return [
                    'status' => 'filtered',
                    'reason' => 'inappropriate_language'
                ];
            }
        }

        // 2. Check for Duplicate Questions (Jaccard Similarity > 0.7)
        $existingQuestions = Question::where('session_id', $session->id)
                                      ->whereIn('status', ['active', 'pinned'])
                                      ->get();
        
        foreach ($existingQuestions as $existing) {
            $similarity = $this->calculateJaccardSimilarity($content, $existing->content);
            if ($similarity >= 0.7) {
                return [
                    'status' => 'active', // Will be linked as duplicate
                    'is_duplicate' => true,
                    'duplicate_of' => $existing->id,
                    'reason' => 'duplicate'
                ];
            }
        }

        // 3. Check Off-Topic (if session has topic keywords)
        if (!empty($session->topic_keywords)) {
            $topics = array_map('trim', explode(',', strtolower($session->topic_keywords)));
            $isRelevant = false;
            foreach ($topics as $topic) {
                if (str_contains($lowerContent, $topic)) {
                    $isRelevant = true;
                    break;
                }
            }
            if (!$isRelevant) {
                 return [
                    'status' => 'filtered',
                    'reason' => 'off_topic'
                ];
            }
        }

        return [
            'status' => 'active',
            'is_duplicate' => false,
            'duplicate_of' => null,
            'reason' => null
        ];
    }

    private function calculateJaccardSimilarity(string $text1, string $text2): float
    {
        $tokens1 = array_unique(explode(' ', strtolower(preg_replace('/[^a-z0-9 ]/i', '', $text1))));
        $tokens2 = array_unique(explode(' ', strtolower(preg_replace('/[^a-z0-9 ]/i', '', $text2))));

        $intersection = array_intersect($tokens1, $tokens2);
        $union = array_unique(array_merge($tokens1, $tokens2));

        if (count($union) === 0) return 0;
        
        return count($intersection) / count($union);
    }
}
