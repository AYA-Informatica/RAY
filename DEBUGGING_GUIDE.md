# 🐞 RAY Platform Debugging Guide

This guide explains how to enable debug logging across the RAY platform for easier development and troubleshooting.

## 🔧 Environment Variables

The platform uses environment variables to control debug logging. All debug logs are **disabled by default in production** and only enabled when explicitly configured.

### Web App (`ray-web`)
- `VITE_DEBUG_API=true` - Enable API request/response logging
- `VITE_DEBUG_AUTH=true` - Enable authentication flow logging  
- Both automatically enabled in development mode (`import.meta.env.DEV`)

### Admin App (`ray-admin`) 
- `VITE_DEBUG_API=true` - Enable API request/response logging
- `VITE_DEBUG_ADMIN=true` - Alternative way to enable admin API logging
- `VITE_DEBUG_AUTH=true` - Enable admin authentication flow logging
- Both automatically enabled in development mode (`import.meta.env.DEV`)

## 🚀 How to Enable Debug Mode

### 1. Create/Edit Environment Files

**For Web App** (`ray-web/.env`):
```env
# Enable all debug logging
VITE_DEBUG_API=true
VITE_DEBUG_AUTH=true

# Or just API debugging
VITE_DEBUG_API=true
```

**For Admin App** (`ray-admin/.env`):
```env
# Enable all debug logging  
VITE_DEBUG_API=true
VITE_DEBUG_AUTH=true

# Or just admin-specific debugging
VITE_DEBUG_ADMIN=true
VITE_DEBUG_AUTH=true
```

### 2. Restart Development Server

After adding environment variables, restart your dev server:

```bash
# Web app
cd ray-web && npm run dev

# Admin app  
cd ray-admin && npm run dev
```

## 📋 What Gets Logged

### Authentication Flow
- `[web.authStore]` / `[admin.authStore]` - User authentication state changes
- `[web.useAuth]` / `[admin.useAdminAuth]` - Hook initialization
- `[web.firebase]` / `[admin.firebase]` - Firebase initialization
- Token claims and role verification

### API Requests
- `[web.api]` / `[admin.api]` - Request start/end with timing
- HTTP method, endpoint, status codes
- Auth token presence and claims (in debug mode)
- Error details for failed requests

### Component Lifecycle  
- `[admin.AdminGuard]` - Route protection decisions
- Key component mounting and state changes

## 🎯 Common Debugging Scenarios

### "Why am I getting Access Denied?"
1. Enable `VITE_DEBUG_AUTH=true` in admin app
2. Check console for `[admin.authStore] Access denied - insufficient role`
3. Verify your Firebase user has custom claims: `{ role: 'admin' }`

### "Why are my API calls failing?"
1. Enable `VITE_DEBUG_API=true` 
2. Look for `[admin.api] Request failed` messages
3. Check HTTP status codes and error messages

### "Why isn't my auth state persisting?"
1. Enable `VITE_DEBUG_AUTH=true`
2. Watch for `[admin.authStore] Auth state changed` events
3. Verify token refresh is working correctly

## ⚠️ Important Notes

- **Production Safety**: Debug logs are automatically disabled in production builds
- **Performance**: Debug logging has minimal performance impact but should be disabled for performance testing
- **Security**: Debug logs never expose sensitive data like passwords or full tokens
- **Console Clutter**: Disable debug mode when not actively debugging to keep console clean

## 🔄 Resetting Debug Configuration

To disable debug logging, either:
1. Remove the environment variables from `.env` files, OR
2. Set them to `false`: `VITE_DEBUG_API=false`

The changes take effect after restarting the development server.