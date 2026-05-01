<?php

namespace App\Services;

use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    private const MAX_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    /**
     * Attempt login and return token on success.
     *
     * @throws ValidationException
     */
    public function login(string $email, string $password, string $ip): array
    {
        $this->checkLockout($email, $ip);

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            $this->recordAttempt($email, $ip, false);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Contact support.'],
            ]);
        }

        $this->recordAttempt($email, $ip, true);
        $user->recordLogin();

        $token = $user->createToken('api-token', $this->getAbilities($user))->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user->load('roles'),
        ];
    }

    /**
     * Revoke the current token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Revoke all tokens for the user.
     */
    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function checkLockout(string $email, string $ip): void
    {
        $recentFailures = LoginAttempt::where('email', $email)
            ->where('ip_address', $ip)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes(self::LOCKOUT_MINUTES))
            ->count();

        if ($recentFailures >= self::MAX_ATTEMPTS) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in ' . self::LOCKOUT_MINUTES . ' minutes.'],
            ]);
        }
    }

    private function recordAttempt(string $email, string $ip, bool $successful): void
    {
        LoginAttempt::create([
            'email'      => $email,
            'ip_address' => $ip,
            'successful' => $successful,
        ]);
    }

    private function getAbilities(User $user): array
    {
        if ($user->hasRole('admin')) {
            return ['*'];
        }

        return ['read', 'write'];
    }
}
