#!/usr/bin/env node

/**
 * Simple GitHub OAuth Debug Script
 * Tests the GitHub OAuth flow using browser automation
 */

const { chromium } = require('playwright');

async function testGitHubOAuthFlow() {
  console.log('🚀 Starting Simple GitHub OAuth Test');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📋 STEP 1: Navigate to devdapp.com login');
    await page.goto('https://devdapp.com/auth/login');
    await page.waitForTimeout(3000);

    console.log('🔍 Current URL:', page.url());

    // Check if GitHub login button exists
    const githubButton = page.locator('button:has-text("Sign in with GitHub")');
    const isVisible = await githubButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Found GitHub login button');

      // Click GitHub login button
      await githubButton.click();
      console.log('🔄 Clicked GitHub login button');

      // Wait a bit and check what happened
      await page.waitForTimeout(2000);
      console.log('🔍 Current URL after click:', page.url());

      // Wait for GitHub OAuth page
      try {
        await page.waitForURL('**/github.com/login/oauth/authorize**', { timeout: 10000 });
        console.log('✅ Redirected to GitHub OAuth page');
      } catch (error) {
        console.log('❌ Failed to redirect to GitHub OAuth page');
        console.log('🔍 Current URL:', page.url());
        const content = await page.content();
        console.log('🔍 Page content preview:');
        console.log(content.substring(0, 1000));
        throw error;
      }

      // Authorize the application
      const authorizeButton = page.locator('button[type="submit"]');
      await authorizeButton.click();
      console.log('🔄 Authorized GitHub application');

      // Wait for redirect back to devdapp.com
      await page.waitForURL('**/devdapp.com/**', { timeout: 15000 });
      console.log('🔄 Redirected back to devdapp.com');

      const finalUrl = page.url();
      console.log('🎯 Final URL:', finalUrl);

      if (finalUrl.includes('/?code=')) {
        console.log('❌ ISSUE: OAuth code delivered to homepage');
        console.log('❌ This confirms the redirect issue');

        // Extract code and try manual callback
        const codeMatch = finalUrl.match(/code=([^&]+)/);
        if (codeMatch) {
          const code = codeMatch[1];
          console.log('🔧 Code extracted:', code);

          await page.goto(`https://devdapp.com/auth/callback?code=${code}&next=/protected/profile`);
          await page.waitForTimeout(3000);

          const callbackUrl = page.url();
          console.log('🔄 Manual callback URL:', callbackUrl);

          if (callbackUrl.includes('/protected/profile')) {
            console.log('✅ Manual callback successful - user redirected to profile');
          } else {
            console.log('❌ Manual callback failed');
          }
        }
      } else if (finalUrl.includes('/auth/callback')) {
        console.log('✅ OAuth correctly redirected to /auth/callback');
        await page.waitForTimeout(3000);

        if (page.url().includes('/protected/profile')) {
          console.log('✅ GitHub OAuth flow completed successfully');
        } else {
          console.log('❌ OAuth callback reached but authentication failed');
        }
      } else if (finalUrl.includes('/auth/error')) {
        console.log('❌ OAuth flow resulted in error');
        const errorText = await page.locator('body').textContent();
        console.log('Error details:', errorText.substring(0, 300));
      } else {
        console.log('❓ Unexpected final URL');
      }

    } else {
      console.log('❌ GitHub login button not found');
      console.log('🔍 Page content preview:');
      const content = await page.content();
      console.log(content.substring(0, 1000));
    }

    // Check environment info
    const envInfo = await page.evaluate(() => {
      return {
        origin: window.location.origin,
        userAgent: navigator.userAgent
      };
    });

    console.log('📊 Environment info:', envInfo);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

// Run the test
if (require.main === module) {
  testGitHubOAuthFlow().catch(console.error);
}

module.exports = { testGitHubOAuthFlow };
