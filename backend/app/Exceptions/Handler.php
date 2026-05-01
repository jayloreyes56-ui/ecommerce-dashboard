<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Add custom reporting (e.g., Sentry) here
        });
    }

    /**
     * Render all exceptions as clean JSON for API consumers.
     */
    public function render($request, Throwable $e): JsonResponse
    {
        // Validation errors
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        }

        // Model not found
        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            $model = $e instanceof ModelNotFoundException
                ? class_basename($e->getModel())
                : 'Resource';

            return response()->json([
                'success' => false,
                'message' => "{$model} not found.",
            ], 404);
        }

        // Unauthenticated
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please log in.',
            ], 401);
        }

        // Unauthorized
        if ($e instanceof AccessDeniedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        // Business logic errors (thrown from services)
        if ($e instanceof \InvalidArgumentException || $e instanceof \RuntimeException) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        // Generic server error — never expose internals in production
        $debug = config('app.debug');

        return response()->json([
            'success' => false,
            'message' => $debug ? $e->getMessage() : 'An unexpected error occurred.',
            'trace'   => $debug ? $e->getTrace() : null,
        ], 500);
    }
}
