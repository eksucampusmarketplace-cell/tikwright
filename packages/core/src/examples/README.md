# TikTok Upload Demo - Educational Example

## Purpose

This is an **educational demonstration only** of form/file upload automation in JavaScript-heavy single-page applications. It demonstrates how to:

- Load and use saved browser sessions (cookies, localStorage)
- Navigate to upload pages
- Interact with hidden file inputs
- Wait for dynamic content to load
- Simulate human-like behavior (mouse movements, typing delays)
- Handle form submission and success indicators

## ⚠️ Important Disclaimer

**DO NOT:**
- Use for mass/batch uploads
- Automate authentication
- Use on live platforms without explicit permission

**REQUIREMENTS:**
1. Manual authentication is required
2. Cookies must be saved beforehand
3. This is for **single-file, educational demonstration only**

## Prerequisites

### 1. Install Dependencies

```bash
cd /home/engine/project
pnpm install
```

### 2. Save TikTok Session Manually

You need an authenticated TikTok session before running the demo. Here's how to save it:

#### Option A: Using Playwright Codegen (Recommended)

```bash
# Navigate to project directory
cd /home/engine/project

# Run Playwright codegen in headed mode
npx playwright codegen --device="Desktop Chrome" https://www.tiktok.com
```

In the browser that opens:
1. Login to your TikTok account
2. Once logged in, extract the cookies using browser DevTools
3. Save cookies to: `sessions/<your-profile-id>/cookies.json`

#### Option B: Manual Cookie Extraction

1. Login to TikTok.com in your regular browser
2. Open DevTools → Application → Cookies
3. Export cookies as JSON
4. Create directory: `sessions/<your-profile-id>/`
5. Save cookies to: `sessions/<your-profile-id>/cookies.json`

The cookies.json should be in this format:
```json
[
  {
    "name": "sessionid",
    "value": "...",
    "domain": ".tiktok.com",
    "path": "/",
    "expires": 1234567890,
    "httpOnly": true,
    "secure": true,
    "sameSite": "Lax"
  },
  ...
]
```

### 3. Prepare Video File

Have a video file ready to upload. The demo will use the absolute path you provide.

## Configuration

Edit `packages/core/src/examples/uploadDemoExample.ts` to configure:

```typescript
const config = {
  // Your profile ID (must match saved session directory name)
  profileId: 'my-tiktok-profile',

  // Absolute path to video file
  videoPath: '/path/to/your/video.mp4',

  // Caption text
  caption: 'Check out this amazing video! #demo',

  // Optional hashtags
  hashtags: ['#fyp', '#trending', '#demo']
};
```

## Running the Demo

### Build the Project

```bash
pnpm build
```

### Run the Example

```bash
# Using ts-node (if installed)
npx ts-node packages/core/src/examples/uploadDemoExample.ts

# Or using node after building
node packages/core/dist/examples/uploadDemoExample.js
```

## What to Expect

The demo will:

1. **Launch browser** - Create a stealth browser context
2. **Load session** - Use saved cookies from `sessions/<profileId>/`
3. **Navigate to upload page** - Go to https://www.tiktok.com/upload
4. **Upload video** - Select file via hidden file input
5. **Wait for preview** - Wait for the upload to process and preview to appear
6. **Add caption** - Type caption with hashtags using human-like delays
7. **Submit upload** - Click the post button
8. **Wait for completion** - Wait for success indicator
9. **Save session** - Update session state with any new cookies

### Console Output

You'll see detailed logging:

```
============================================================
TikTok Video Upload Demo
============================================================

Configuration:
  Profile ID: my-tiktok-profile
  Video Path: /path/to/video.mp4
  Caption: Check out this amazing video! #demo
  Hashtags: #fyp, #trending, #demo

============================================================

[uploadVideoDemo] Starting upload for profile: my-tiktok-profile
[uploadVideoDemo] Video path: /path/to/video.mp4
[uploadVideoDemo] Loading existing session for my-tiktok-profile
[SessionManager] Loaded 15 cookies for profile my-tiktok-profile
...
[uploadVideoDemo] Upload completed successfully
```

## Troubleshooting

### "Login modal detected"

Your session is expired or invalid. Re-save the cookies.

### "No saved session found for [profileId]"

The session directory doesn't exist. Create it with cookies.json.

### "Preview did not load within timeout"

The video upload is taking too long. Try a smaller video file.

### "Post button is disabled"

The video is still processing. Wait a bit longer or try again.

## Code Architecture

The demo consists of:

1. **uploadVideoDemo.ts** - Main upload logic
   - Uses `StealthBrowserFactory` for browser creation
   - Uses `SessionManager` for session persistence
   - Uses `tiktokSelectors` for element selection
   - Implements human-like behavior with `typeWithVariability`

2. **uploadDemoExample.ts** - Example runner
   - Configuration management
   - Simple CLI interface
   - Error handling and reporting

## Learning Objectives

This demo demonstrates:

- Session persistence and reuse
- Dynamic content handling (waiting for elements)
- Hidden input interaction
- Human-like behavior simulation
- Error handling and recovery
- Success detection patterns

## Next Steps

After understanding this demo, you can:

1. Study the selectors to understand TikTok's DOM structure
2. Modify the human-like behavior parameters
3. Add additional validation steps
4. Experiment with different upload flows

**Remember:** Always use automation responsibly and only with explicit permission.
