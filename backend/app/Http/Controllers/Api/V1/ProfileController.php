<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\UpdateNotificationSettingsRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * GET /api/v1/profile
     * Get current user profile
     */
    public function show(): JsonResponse
    {
        $user = auth()->user()->load('roles');

        return response()->json([
            'success' => true,
            'data'    => new UserResource($user),
        ]);
    }

    /**
     * PUT /api/v1/profile
     * Update profile information
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = auth()->user();
        
        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new UserResource($user->fresh('roles')),
            'message' => 'Profile updated successfully.',
        ]);
    }

    /**
     * PUT /api/v1/profile/password
     * Change password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
                'errors'  => [
                    'current_password' => ['The current password is incorrect.'],
                ],
            ], 422);
        }

        // Update password
        $user->update([
            'password' => $request->new_password,
        ]);

        // Revoke all tokens except current
        $currentToken = $user->currentAccessToken();
        $user->tokens()->where('id', '!=', $currentToken->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Other sessions have been logged out.',
        ]);
    }

    /**
     * GET /api/v1/profile/notifications
     * Get notification settings
     */
    public function getNotificationSettings(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'data'    => $user->getNotificationSettings(),
        ]);
    }

    /**
     * PUT /api/v1/profile/notifications
     * Update notification settings
     */
    public function updateNotificationSettings(UpdateNotificationSettingsRequest $request): JsonResponse
    {
        $user = auth()->user();

        $currentSettings = $user->getNotificationSettings();
        $newSettings = array_merge($currentSettings, $request->validated());

        $user->update([
            'notification_settings' => $newSettings,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $newSettings,
            'message' => 'Notification settings updated successfully.',
        ]);
    }
}
