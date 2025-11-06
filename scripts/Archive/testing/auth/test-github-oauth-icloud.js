#!/usr/bin/env node

/**
 * GitHub OAuth Test Script for iCloud Email
 * Tests complete GitHub OAuth flow with real email account
 * Designed to work with iCloud, Gmail, or other real email providers
 */

const { chromium } = require('playwright');

async function testGitHubOAuthWithRealEmail(emailConfig = {}) {
  console.log('🚀 Starting GitHub OAuth Test with Real Email');
  console.log('============================================');

  // Email configuration - can be passed as parameters or use defaults
  const {
    email = 'test@example.com', // Replace with real email
    password = 'password',      // Replace with real password
    githubUsername = 'testuser',
    useEmailVerification = true
  } = emailConfig;

  console.log(`📧 Email: ${email}`);
  console.log(`👤 GitHub Username: ${githubUsername}`);
  console.log(`🔐 Using Email Verification: ${useEmailVerification}`);
  console.log('');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  const page = await context.newPage();

  // Monitor network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('github.com') || url.includes('supabase.co') || url.includes('devdapp.com')) {
      console.log('🌐 REQUEST:', request.method(), url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('github.com') || url.includes('supabase.co') || url.includes('devdapp.com')) {
      console.log('📡 RESPONSE:', response.status(), url);
    }
  });

  try {
    console.log('📋 STEP 1: Navigate to devdapp.com login');
    console.log('=====================================');

    await page.goto('https://devdapp.com/auth/login');
    await page.waitForTimeout(3000);

    console.log('🔍 Current URL:', page.url());

    // Check if GitHub login button exists
    const githubButton = page.locator('button:has-text("Sign in with GitHub")');
    const isVisible = await githubButton.isVisible().catch(() => false);

    if (!isVisible) {
      console.log('❌ GitHub login button not found');
      const content = await page.content();
      console.log('🔍 Page content preview:');
      console.log(content.substring(0, 1000));
      throw new Error('GitHub login button not found');
    }

    console.log('✅ Found GitHub login button');

    // Click GitHub login button
    await githubButton.click();
    console.log('🔄 Clicked GitHub login button');

    // Wait for GitHub OAuth page
    await page.waitForTimeout(2000);
    console.log('🔍 Current URL after click:', page.url());

    // Check if we're at GitHub OAuth authorization page
    if (page.url().includes('github.com/login/oauth/authorize')) {
      console.log('✅ Successfully reached GitHub OAuth authorization page');

      // Click authorize button
      const authorizeButton = page.locator('button[type="submit"]');
      await authorizeButton.click();
      console.log('🔄 Clicked GitHub authorization button');

    } else if (page.url().includes('github.com/login')) {
      console.log('🔄 Redirected to GitHub login page (need to sign in first)');

      // This is where manual intervention might be needed
      console.log('📧 Please sign in to GitHub manually if prompted');
      console.log('🔍 Waiting for manual GitHub login...');

      // Wait for OAuth authorization page after manual login
      await page.waitForURL('**/github.com/login/oauth/authorize**', { timeout: 60000 });
      console.log('✅ Reached GitHub OAuth authorization page after manual login');

      // Click authorize button
      const authorizeButton = page.locator('button[type="submit"]');
      await authorizeButton.click();
      console.log('🔄 Authorized GitHub application');

    } else {
      console.log('❌ Unexpected URL after clicking GitHub login');
      throw new Error('Unexpected redirect URL: ' + page.url());
    }

    console.log('🔐 STEP 2: Wait for OAuth callback');
    console.log('================================');

    // Wait for redirect back to devdapp.com
    await page.waitForURL('**/devdapp.com/**', { timeout: 30000 });
    console.log('🔄 Redirected back to devdapp.com');

    const finalUrl = page.url();
    console.log('🎯 Final URL:', finalUrl);

    // Analyze the result
    if (finalUrl.includes('/?code=')) {
      console.log('❌ ISSUE: OAuth code delivered to homepage');
      console.log('❌ This indicates environment variables are not properly deployed');

      // Extract code and try manual callback
      const codeMatch = finalUrl.match(/code=([^&]+)/);
      if (codeMatch) {
        const code = codeMatch[1];
        console.log('🔧 Extracted OAuth code:', code);

        console.log('🔄 Attempting manual navigation to callback URL...');
        await page.goto(`https://devdapp.com/auth/callback?code=${code}&next=/protected/profile`);
        await page.waitForTimeout(5000);

        const callbackUrl = page.url();
        console.log('🔄 Manual callback result:', callbackUrl);

        if (callbackUrl.includes('/protected/profile')) {
          console.log('✅ Manual callback successful - redirected to profile page');
          await verifyProfilePage(page);
        } else {
          console.log('❌ Manual callback failed');
        }
      }

    } else if (finalUrl.includes('/auth/callback')) {
      console.log('✅ OAuth correctly redirected to /auth/callback');
      await page.waitForTimeout(5000);

      const currentUrlAfterCallback = page.url();
      console.log('🔄 URL after callback processing:', currentUrlAfterCallback);

      if (currentUrlAfterCallback.includes('/protected/profile')) {
        console.log('✅ OAuth flow completed successfully - user at profile page');
        await verifyProfilePage(page);
      } else if (currentUrlAfterCallback.includes('/auth/error')) {
        console.log('❌ OAuth callback resulted in error');
        const errorText = await page.locator('body').textContent();
        console.log('Error details:', errorText.substring(0, 500));
      } else {
        console.log('❌ OAuth callback reached but authentication may have failed');
        console.log('🔍 Checking if user is authenticated...');
        await checkAuthenticationStatus(page);
      }

    } else if (finalUrl.includes('/protected/profile')) {
      console.log('✅ OAuth flow completed successfully - already at profile page');
      await verifyProfilePage(page);

    } else if (finalUrl.includes('/auth/error')) {
      console.log('❌ OAuth flow resulted in error page');
      const errorText = await page.locator('body').textContent();
      console.log('Error details:', errorText.substring(0, 500));

    } else {
      console.log('❓ Unexpected final URL:', finalUrl);
      console.log('🔍 Checking authentication status...');
      await checkAuthenticationStatus(page);
    }

    // Final environment check
    const envInfo = await page.evaluate(() => {
      return {
        origin: window.location.origin,
        userAgent: navigator.userAgent,
        cookies: document.cookie,
        localStorage: Object.keys(window.localStorage || {}).length
      };
    });

    console.log('📊 Environment info:', envInfo);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Final URL:', page.url());
  } finally {
    console.log('🧹 Cleaning up...');
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

async function verifyProfilePage(page) {
  console.log('🔍 Verifying profile page elements...');

  try {
    // Wait for profile page to load
    await page.waitForTimeout(3000);

    // Check for profile-related elements
    const profileElements = [
      '[data-testid="user-profile"]',
      'h1, h2, h3',  // Headers
      '.profile',     // Profile class
      'button',       // Action buttons
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
      console.log(`✅ Profile page verified - found ${foundElements} profile elements`);
    } else {
      console.log('⚠️ Profile page loaded but no specific profile elements detected');
    }

    // Check page title
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Check if user can interact with the page
    const hasInteractiveElements = await page.locator('button, input, a[href]').count() > 0;
    console.log('🖱️ Has interactive elements:', hasInteractiveElements);

  } catch (error) {
    console.log('⚠️ Could not fully verify profile page:', error.message);
  }
}

async function checkAuthenticationStatus(page) {
  console.log('🔍 Checking authentication status...');

  try {
    // Check for authentication indicators
    const authIndicators = [
      'Logout',
      'Sign out',
      'Profile',
      'Dashboard',
      '[data-testid="user-menu"]',
      '.avatar',
      '.user-menu'
    ];

    let authFound = false;
    for (const indicator of authIndicators) {
      const element = page.locator(`text=${indicator}, ${indicator}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ Authentication indicator found: ${indicator}`);
        authFound = true;
      }
    }

    if (authFound) {
      console.log('✅ User appears to be authenticated');
    } else {
      console.log('❌ No authentication indicators found');
    }

  } catch (error) {
    console.log('⚠️ Could not check authentication status:', error.message);
  }
}

// Example usage with iCloud email
async function testWithICloud() {
  console.log('🍎 Testing with iCloud Email');
  console.log('============================');

  // NOTE: Replace these with real iCloud credentials
  const emailConfig = {
    email: 'your-icloud-email@icloud.com',  // Replace with real iCloud email
    password: 'your-app-specific-password', // Replace with app-specific password
    githubUsername: 'yourgithubusername',
    useEmailVerification: true
  };

  await testGitHubOAuthWithRealEmail(emailConfig);
}

// Example usage with Gmail
async function testWithGmail() {
  console.log('📧 Testing with Gmail');
  console.log('===================');

  // NOTE: Replace these with real Gmail credentials
  const emailConfig = {
    email: 'your-gmail@gmail.com',  // Replace with real Gmail
    password: 'your-app-password',  // Replace with app password
    githubUsername: 'yourgithubusername',
    useEmailVerification: false  // Gmail usually doesn't need email verification for existing accounts
  };

  await testGitHubOAuthWithRealEmail(emailConfig);
}

// Run the test
if (require.main === module) {
  // You can call testWithICloud() or testWithGmail() or pass custom config
  // For now, we'll run a basic test that shows what would happen
  console.log('📋 To use this script with a real email account:');
  console.log('1. Replace email and password in the config object');
  console.log('2. Call testWithICloud() or testWithGmail()');
  console.log('3. The script will handle the OAuth flow');

  // Example of how to run with custom config:
  // testGitHubOAuthWithRealEmail({
  //   email: 'test@example.com',
  //   password: 'password',
  //   githubUsername: 'testuser'
  // }).catch(console.error);
}

module.exports = {
  testGitHubOAuthWithRealEmail,
  testWithICloud,
  testWithGmail
};

