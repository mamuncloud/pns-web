## Summary
[FEATURE] Unified Staff Login UI & WhatsApp Management

## Environment
- **Product/Service**: pns-web (Next.js 16.2.0, App Router)
- **UI Library**: React 19, Tailwind CSS v4, shadcn/ui

## Description
This feature implements a unified staff login interface at `/staff` that supports both Email and WhatsApp Magic Links. Additionally, it provides a dashboard management interface for managers to control the session of the WhatsApp notification bot.

## Key Changes
- **Unified Login Form**: Smart input field on `/staff` that detects Email or Phone identifiers and calls the new `POST /auth/staff/request` endpoint.
- **Confirmation Flow**: Updated UI to show delivery-method-specific instructions (Email or WhatsApp) after a magic link is requested.
- **WhatsApp Manager Component**: A new dashboard card for users with the `MANAGER` role to view connection status (Connected, QR_READY, INITIALIZING, DISCONNECTED) and logout/unpair the device.
- **API Integration**: Extended `src/lib/api.ts` with staff login and WhatsApp status/logout methods.

## Impact
**Medium** - Streamlines the staff login process and provides operational control over the notification service.

## Additional Context
The implementation follows the established Access + Refresh Token flow for session management.
