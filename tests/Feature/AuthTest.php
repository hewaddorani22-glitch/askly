<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_professor_can_register_and_use_returned_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Professor',
            'email' => 'professor@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'professor@example.com')
            ->assertJsonStructure(['token']);

        $this->withHeader('Authorization', 'Bearer '.$response->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'professor@example.com');
    }

    public function test_professor_can_log_in_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'professor@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'professor@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('user.email', 'professor@example.com')
            ->assertJsonStructure(['token']);
    }

    public function test_email_verification_is_not_required_for_professors(): void
    {
        $this->assertFalse(Schema::hasColumn('users', 'email_verified_at'));

        $user = User::factory()->create([
            'email' => 'ready@example.com',
            'password' => Hash::make('password123'),
        ]);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->getJson('/api/professor/sessions')
            ->assertOk();
    }

    public function test_spa_routes_return_app_shell_with_database_session_driver(): void
    {
        config([
            'session.driver' => 'database',
            'session.table' => 'browser_sessions',
        ]);

        $this->get('/')->assertOk();
        $this->get('/login')->assertOk();
        $this->get('/dashboard')->assertOk();
    }
}
