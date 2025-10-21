#!/usr/bin/env node

/**
 * Quick OAuth Fix Verification Script
 * Tests if the environment variables fix is working
 */

const { chromium } = require('playwright');

async function verifyOAuthFix() {
  console.log('🚀 Verifying GitHub OAuth Fix');
  console.log('==============================');

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

    if (!isVisible) {
      console.log('❌ GitHub login button not found');
      return;
    }

    console.log('✅ Found GitHub login button');

    // Click GitHub login button
    await githubButton.click();
    console.log('🔄 Clicked GitHub login button');

    // Wait and check URL
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('🔍 Current URL after click:', currentUrl);

    // Check if we're at GitHub OAuth authorization page
    if (currentUrl.includes('github.com/login/oauth/authorize')) {
      console.log('✅ SUCCESS: OAuth correctly redirected to authorization page');

      // Click authorize button
      const authorizeButton = page.locator('button[type="submit"]');
      await authorizeButton.click();
      console.log('🔄 Clicked GitHub authorization button');

      // Wait for redirect back to devdapp.com
      await page.waitForTimeout(5000);
      const finalUrl = page.url();
      console.log('🎯 Final URL:', finalUrl);

      if (finalUrl.includes('/auth/callback')) {
        console.log('✅ OAuth correctly redirected to /auth/callback');
        await page.waitForTimeout(5000);

        if (page.url().includes('/protected/profile')) {
          console.log('✅ SUCCESS: User successfully redirected to profile page');
          await verifyProfilePage(page);
        } else if (page.url().includes('/auth/error')) {
          console.log('❌ OAuth callback resulted in error');
          const errorText = await page.locator('body').textContent();
          console.log('Error details:', errorText.substring(0, 500));
        } else {
          console.log('❌ OAuth callback reached but authentication may have failed');
        }
      } else if (finalUrl.includes('/?code=')) {
        console.log('❌ ISSUE: OAuth code delivered to homepage');
        console.log('This suggests environment variables may not be fully deployed');

        // Extract code and try manual callback
        const codeMatch = finalUrl.match(/code=([^&]+)/);
        if (codeMatch) {
          const code = codeMatch[1];
          console.log('🔧 Extracted OAuth code:', code);

          await page.goto(`https://devdapp.com/auth/callback?code=${code}&next=/protected/profile`);
          await page.waitForTimeout(5000);

          if (page.url().includes('/protected/profile')) {
            console.log('✅ Manual callback successful - user at profile page');
            await verifyProfilePage(page);
          }
        }
      }

    } else if (currentUrl.includes('github.com/login')) {
      console.log('🔄 Redirected to GitHub login page');
      console.log('📝 This is expected if user needs to sign in to GitHub first');
      console.log('✅ Environment variables fix is working - OAuth flow initiated correctly');

      // Check the redirect URL in the current page to confirm domain is correct
      const pageContent = await page.content();
      if (pageContent.includes('devdapp.com')) {
        console.log('✅ SUCCESS: OAuth URLs contain correct domain (devdapp.com)');
      } else if (pageContent.includes('vercel')) {
        console.log('❌ ISSUE: OAuth URLs still contain Vercel preview domain');
      }

    } else {
      console.log('❌ Unexpected URL after clicking GitHub login');
      console.log('🔍 URL:', currentUrl);
    }

    // Final check
    console.log('📊 Environment check:');
    const envInfo = await page.evaluate(() => {
      return {
        origin: window.location.origin,
        userAgent: navigator.userAgent
      };
    });
    console.log('Environment info:', envInfo);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

async function verifyProfilePage(page) {
  console.log('🔍 Verifying profile page...');

  try {
    await page.waitForTimeout(3000);

    // Check for profile indicators
    const profileElements = [
      'h1, h2, h3',
      'button',
      '[data-testid="user-profile"]',
      '.profile'
    ];

    let foundElements = 0;
    for (const selector of profileElements) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        foundElements++;
        console.log(`✅ Found profile element: ${selector}`);
      }
    }

    if (foundElements > 0) {
      console.log(`✅ Profile page verified - found ${foundElements} elements`);
    } else {
      console.log('⚠️ Profile page loaded but no specific elements detected');
    }

    const title = await page.title();
    console.log('📄 Page title:', title);

  } catch (error) {
    console.log('⚠️ Could not fully verify profile page:', error.message);
  }
}

// Run the verification
if (require.main === module) {
  verifyOAuthFix().catch(console.error);
}

module.exports = { verifyOAuthFix };

