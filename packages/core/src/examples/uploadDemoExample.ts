/**
 * Example script to run the video upload demo manually.
 *
 * PREREQUISITES:
 * 1. Build the project: `pnpm install && pnpm build`
 * 2. Save TikTok session manually:
 *    - Use Playwright codegen: `npx playwright codegen https://www.tiktok.com`
 *    - Login to your TikTok account in the headed browser
 *    - Extract cookies and save them to sessions/<profileId>/cookies.json
 *    - Alternatively, use a session saving script to capture the authenticated state
 *
 * USAGE:
 * ```bash
 * npx ts-node packages/core/src/examples/uploadDemoExample.ts
 * ```
 *
 * CONFIGURATION:
 * Update the config object below with your specific values.
 */

import { uploadVideoDemo } from '@tikwright/adapters';

const config = {
  // Your profile ID (must match a saved session in sessions/ directory)
  profileId: 'my-tiktok-profile',

  // Absolute path to the video file to upload
  videoPath: '/path/to/your/video.mp4',

  // Caption text for the video
  caption: 'Check out this amazing video! #demo',

  // Optional hashtags
  hashtags: ['#fyp', '#trending', '#demo']
};

const runDemo = async () => {
  console.log('='.repeat(60));
  console.log('TikTok Video Upload Demo');
  console.log('='.repeat(60));
  console.log('');

  console.log('Configuration:');
  console.log(`  Profile ID: ${config.profileId}`);
  console.log(`  Video Path: ${config.videoPath}`);
  console.log(`  Caption: ${config.caption}`);
  console.log(`  Hashtags: ${config.hashtags.join(', ')}`);
  console.log('');
  console.log('='.repeat(60));
  console.log('');

  try {
    const result = await uploadVideoDemo(config);

    console.log('');
    console.log('='.repeat(60));
    console.log('Result:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Message: ${result.message}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('='.repeat(60));

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('Demo failed with unexpected error:');
    console.error(error);
    console.error('='.repeat(60));
    process.exit(1);
  }
};

runDemo();
