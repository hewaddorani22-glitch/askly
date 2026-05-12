<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (getenv('VERCEL')) {
    $defaults = [
        'APP_ENV' => 'production',
        'APP_DEBUG' => 'false',
        'LOG_CHANNEL' => 'stderr',
        'SESSION_DRIVER' => 'array',
        'CACHE_STORE' => 'array',
        'QUEUE_CONNECTION' => 'sync',
        'DB_CONNECTION' => 'sqlite',
        'DB_DATABASE' => '/tmp/askly.sqlite',
        'APP_PACKAGES_CACHE' => '/tmp/askly/packages.php',
        'APP_SERVICES_CACHE' => '/tmp/askly/services.php',
        'APP_CONFIG_CACHE' => '/tmp/askly/config.php',
        'APP_ROUTES_CACHE' => '/tmp/askly/routes.php',
        'APP_EVENTS_CACHE' => '/tmp/askly/events.php',
        'VIEW_COMPILED_PATH' => '/tmp/askly/views',
    ];

    foreach ($defaults as $key => $value) {
        if (! getenv($key)) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }

    foreach (['/tmp/askly', '/tmp/askly/views'] as $directory) {
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    if (getenv('DB_CONNECTION') === 'sqlite' && ! file_exists(getenv('DB_DATABASE'))) {
        touch(getenv('DB_DATABASE'));
    }

    if (getenv('DB_CONNECTION') === 'sqlite') {
        bootstrapVercelSqlite(getenv('DB_DATABASE'));
    }
}

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$request = Request::capture();
$app->handleRequest($request);

function bootstrapVercelSqlite(string $database): void
{
    $pdo = new PDO('sqlite:'.$database);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON');

    $statements = [
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL DEFAULT "professor",
            remember_token VARCHAR(100),
            created_at DATETIME,
            updated_at DATETIME
        )',
        'CREATE TABLE IF NOT EXISTS password_reset_tokens (
            email VARCHAR(255) PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            created_at DATETIME
        )',
        'CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            professor_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            topic_keywords VARCHAR(255),
            session_code VARCHAR(6) NOT NULL UNIQUE,
            accent_color VARCHAR(255) NOT NULL DEFAULT "#46178f",
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            ended_at DATETIME,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(professor_id) REFERENCES users(id) ON DELETE CASCADE
        )',
        'CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_anonymous TINYINT(1) NOT NULL DEFAULT 1,
            status VARCHAR(255) NOT NULL DEFAULT "active",
            upvote_count INTEGER NOT NULL DEFAULT 0,
            is_duplicate TINYINT(1) NOT NULL DEFAULT 0,
            duplicate_of INTEGER,
            filter_reason VARCHAR(255),
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            FOREIGN KEY(duplicate_of) REFERENCES questions(id) ON DELETE SET NULL
        )',
        'CREATE TABLE IF NOT EXISTS upvotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            voter_id VARCHAR(255) NOT NULL,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
        )',
        'CREATE UNIQUE INDEX IF NOT EXISTS upvotes_question_id_voter_id_unique ON upvotes (question_id, voter_id)',
        'CREATE TABLE IF NOT EXISTS personal_access_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenable_type VARCHAR(255) NOT NULL,
            tokenable_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            abilities TEXT,
            last_used_at DATETIME,
            expires_at DATETIME,
            created_at DATETIME,
            updated_at DATETIME
        )',
        'CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id)',
        'CREATE INDEX IF NOT EXISTS personal_access_tokens_expires_at_index ON personal_access_tokens (expires_at)',
    ];

    foreach ($statements as $statement) {
        $pdo->exec($statement);
    }
}
