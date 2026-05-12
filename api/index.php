<?php

use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (getenv('VERCEL')) {
    $defaults = [
        'APP_ENV' => 'production',
        'APP_DEBUG' => 'false',
        'APP_KEY' => 'base64:8s5p+EJq9pCEPVdfXOEgyAOZ0n2ujT4VnyT9JuD9Jvg=',
        'LOG_CHANNEL' => 'stderr',
        'SESSION_DRIVER' => 'array',
        'CACHE_STORE' => 'array',
        'QUEUE_CONNECTION' => 'sync',
        'VIEW_COMPILED_PATH' => '/tmp/askly/views',
    ];

    // If a Postgres host is configured, use pgsql for persistent storage.
    // Otherwise fall back to ephemeral SQLite so the app boots without any
    // Vercel env vars (MVP demo mode — data resets between cold starts).
    if (getenv('DB_HOST')) {
        $defaults += [
            'DB_CONNECTION' => 'pgsql',
            'DB_PORT' => '6543',
            'DB_DATABASE' => 'postgres',
            'DB_SEARCH_PATH' => 'askly',
            'DB_SSLMODE' => 'require',
        ];
    } else {
        $defaults += [
            'DB_CONNECTION' => 'sqlite',
            'DB_DATABASE' => '/tmp/askly.sqlite',
        ];
    }

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
}

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$request = Request::capture();
$app->instance('request', $request);

if (getenv('VERCEL') && getenv('ASKLY_SKIP_RUNTIME_MIGRATIONS') !== 'true') {
    $marker = '/tmp/askly/migrated';

    if (! file_exists($marker)) {
        $app->make(ConsoleKernel::class)->call('migrate', ['--force' => true]);
        file_put_contents($marker, (string) time());
    }
}

$app->handleRequest($request);
