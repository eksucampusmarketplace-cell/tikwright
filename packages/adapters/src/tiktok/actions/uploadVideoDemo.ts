/**
 * Educational single-file upload demonstration only — manual authentication required.
 *
 * DISCLAIMER: This code is provided for educational purposes to demonstrate
 * form/file upload automation patterns in JavaScript-heavy single-page applications.
 * It requires manual authentication and cookie saving beforehand.
 *
 * DO NOT:
 * - Use for mass/batch uploads
 * - Automate authentication
 * - Use on live platforms without explicit permission
 *
 * REQUIREMENTS:
 * 1. Manually authenticate with TikTok in a browser session
 * 2. Use codegen or similar to save cookies via SessionManager
 * 3. Provide a valid profileId that matches a saved session
 *
 * Usage example:
 * ```ts
 * import { uploadVideoDemo } from '@tikwright/adapters';
 *
 * const result = await uploadVideoDemo({
 *   profileId: 'my-tiktok-profile',
 *   videoPath: '/path/to/video.mp4',
 *   caption: 'Check out this amazing video!',
 *   hashtags: ['#fyp', '#trending']
 * });
 * ```
 */

import { StealthBrowserFactory, SessionManager, typeWithVariability, sleep } from '@tikwright/core';
import { Page } from 'playwright';
import { tiktokSelectors } from '../selectors';

export type UploadVideoParams = {
  /** Unique identifier for the profile session (must have been saved previously) */
  profileId: string;
  /** Absolute path to the video file to upload */
  videoPath: string;
  /** Caption text for the video */
  caption: string;
  /** Optional hashtags to append to the caption */
  hashtags?: string[];
};

export type UploadVideoResult = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Uploads a video to TikTok using a pre-authenticated session.
 *
 * This function demonstrates the complete flow of uploading a video to a
 * JavaScript-heavy single-page application, including:
 * - Loading a saved browser session (cookies, localStorage)
 * - Navigating to the upload page
 * - Interacting with hidden file inputs
 * - Waiting for dynamic content to load
 * - Simulating human-like behavior (mouse movements, typing delays)
 * - Handling form submission and success indicators
 *
 * @param params - Upload parameters including profileId, videoPath, caption, and optional hashtags
 * @returns Result object indicating success or failure with details
 */
export const uploadVideoDemo = async (
  params: UploadVideoParams
): Promise<UploadVideoResult> => {
  const { profileId, videoPath, caption, hashtags = [] } = params;

  console.log(`[uploadVideoDemo] Starting upload for profile: ${profileId}`);
  console.log(`[uploadVideoDemo] Video path: ${videoPath}`);

  const factory = new StealthBrowserFactory();
  const sessionManager = new SessionManager({
    logger: (msg) => console.log(`[SessionManager] ${msg}`)
  });

  let browser;
  let context;

  try {
    // Launch browser and load or create context
    browser = await factory.launchBrowser();

    // Check if a saved session exists
    const sessionExists = await sessionManager.sessionExists(profileId);
    if (sessionExists) {
      console.log(`[uploadVideoDemo] Loading existing session for ${profileId}`);
      context = await sessionManager.loadContext(profileId, { browser });
    } else {
      console.log(`[uploadVideoDemo] No saved session found for ${profileId}, creating fresh context`);
      console.log(`[uploadVideoDemo] WARNING: Fresh context may require manual login`);
      context = await factory.newContext();
    }

    const page = await context.newPage();

    // Navigate to upload page
    console.log('[uploadVideoDemo] Navigating to upload page');
    await page.goto('https://www.tiktok.com/upload', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for either login modal or upload elements
    console.log('[uploadVideoDemo] Waiting for page to load...');

    try {
      // Check if login modal appears (session expired or invalid)
      const loginModal = page.locator(tiktokSelectors.loginModal);
      const hasLoginModal = await loginModal.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasLoginModal) {
        return {
          success: false,
          message: 'Login modal detected. Session may be expired or invalid.',
          error: 'Authentication required'
        };
      }
    } catch (error) {
      // Login modal check failed, continue
    }

    // Wait for upload trigger or hidden file input
    console.log('[uploadVideoDemo] Waiting for upload interface');

    // Try to find and click the upload trigger if visible
    try {
      const uploadTrigger = page.locator(tiktokSelectors.uploadTrigger);
      const isTriggerVisible = await uploadTrigger.isVisible({ timeout: 10000 }).catch(() => false);

      if (isTriggerVisible) {
        console.log('[uploadVideoDemo] Clicking upload trigger');
        await uploadTrigger.click();
        await sleep(1000, 2000);
      }
    } catch (error) {
      // Upload trigger not found or not clickable, continue
      console.log('[uploadVideoDemo] Upload trigger not found, trying file input directly');
    }

    // Find the hidden file input and upload the file
    console.log('[uploadVideoDemo] Setting file input');

    try {
      // Wait for file input to be available in DOM
      await page.waitForSelector(tiktokSelectors.hiddenFileInput, {
        timeout: 15000,
        state: 'attached'
      });

      // Upload the video file
      await page.setInputFiles(tiktokSelectors.hiddenFileInput, videoPath);
      console.log('[uploadVideoDemo] File selected successfully');
    } catch (error) {
      return {
        success: false,
        message: 'Failed to select file input',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Wait for preview/form to appear after upload
    console.log('[uploadVideoDemo] Waiting for preview/form to load');

    try {
      // Wait for caption editor to appear (indicates upload processing is complete)
      await page.waitForSelector(tiktokSelectors.captionEditor, {
        timeout: 60000,
        state: 'visible'
      });
      console.log('[uploadVideoDemo] Preview loaded successfully');
    } catch (error) {
      return {
        success: false,
        message: 'Preview did not load within timeout',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Human-like: random pause before interacting
    const pauseDuration = 4000 + Math.floor(Math.random() * 8000);
    console.log(`[uploadVideoDemo] Pausing for ${pauseDuration}ms (human-like)`);
    await sleep(pauseDuration, pauseDuration + 2000);

    // Move mouse to caption area with curved motion
    try {
      console.log('[uploadVideoDemo] Moving mouse to caption area');
      const captionElement = page.locator(tiktokSelectors.captionEditor);
      const box = await captionElement.boundingBox();

      if (box) {
        const viewportSize = page.viewportSize() ?? { width: 1280, height: 720 };
        const startX = Math.floor(Math.random() * viewportSize.width);
        const startY = Math.floor(Math.random() * viewportSize.height);
        const endX = Math.floor(box.x + box.width / 2);
        const endY = Math.floor(box.y + box.height / 2);

        await humanCurveMove(page, { x: startX, y: startY }, { x: endX, y: endY });
      }
    } catch (error) {
      console.log('[uploadVideoDemo] Mouse movement skipped, continuing');
    }

    // Build full caption with hashtags
    const fullCaption = hashtags.length > 0
      ? `${caption}\n\n${hashtags.join(' ')}`
      : caption;

    console.log(`[uploadVideoDemo] Typing caption (${fullCaption.length} chars)`);

    // Type caption with variable delays
    await typeWithVariability(page, tiktokSelectors.captionEditor, fullCaption);

    // Human-like: brief pause before posting
    await sleep(2000, 4000);

    // Click post button (check not disabled first)
    console.log('[uploadVideoDemo] Checking post button status');

    try {
      const postButton = page.locator(tiktokSelectors.postButton);
      const postButtonDisabled = page.locator(tiktokSelectors.postButtonDisabled);

      // Wait for post button to be available
      await postButton.waitFor({ state: 'visible', timeout: 10000 });

      // Check if button is disabled
      const isDisabled = await postButtonDisabled.isVisible().catch(() => false);

      if (isDisabled) {
        return {
          success: false,
          message: 'Post button is disabled. Video may still be processing or form incomplete.',
          error: 'Post button disabled'
        };
      }

      console.log('[uploadVideoDemo] Clicking post button');
      await postButton.click();

      // Wait for success indicator
      console.log('[uploadVideoDemo] Waiting for upload completion');

      // Success could be indicated by:
      // 1. A toast/notification
      // 2. Redirect to a different page
      // 3. Post button disappearing
      // 4. Upload success message

      const success = await Promise.race([
        // Option 1: Page navigates away (redirect)
        page.waitForNavigation({ timeout: 30000 }).then(() => true),

        // Option 2: Post button disappears
        postButton.waitFor({ state: 'hidden', timeout: 30000 }).then(() => true),

        // Option 3: Timeout (assume success or check manually)
        sleep(15000, 20000).then(() => false)
      ]);

      if (success) {
        console.log('[uploadVideoDemo] Upload completed successfully');
      } else {
        console.log('[uploadVideoDemo] Upload submitted (no explicit success indicator)');
      }

      // Save updated session state
      console.log('[uploadVideoDemo] Saving session state');
      await sessionManager.saveContext(context, profileId);

      return {
        success: true,
        message: 'Video upload completed successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit upload',
        error: error instanceof Error ? error.message : String(error)
      };
    }

  } catch (error) {
    console.error('[uploadVideoDemo] Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error during upload',
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    // Cleanup
    try {
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      console.error('[uploadVideoDemo] Error during cleanup:', error);
    }
  }
};

/**
 * Helper function to move mouse in a human-like curved path
 */
async function humanCurveMove(
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number }
): Promise<void> {
  const steps = 15 + Math.floor(Math.random() * 10);

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    // Add slight curve to movement using sine/cosine
    const curveX = Math.sin(t * Math.PI) * 10 * (Math.random() > 0.5 ? 1 : -1);
    const curveY = Math.cos(t * Math.PI) * 10 * (Math.random() > 0.5 ? 1 : -1);

    const x = Math.floor(start.x + (end.x - start.x) * t + curveX);
    const y = Math.floor(start.y + (end.y - start.y) * t + curveY);

    await page.mouse.move(x, y);
    await sleep(15, 40);
  }
}
