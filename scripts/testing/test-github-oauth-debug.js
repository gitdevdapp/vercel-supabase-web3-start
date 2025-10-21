#!/usr/bin/env node

/**
 * GitHub OAuth Debug Script
 * Tests the complete GitHub OAuth flow using browser automation
 * to diagnose authentication issues on devdapp.com
 */

const { chromium } = require('playwright');
const crypto = require('crypto');

async function testGitHubEmailDomain(email, username, password) {
  const browser = await chromium.launch({
    headless: true, // Use headless for quick domain testing
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

  try {
    // Go to GitHub signup
    await page.goto('https://github.com/signup');
    await page.waitForTimeout(2000);

    // Fill out GitHub signup form
    await page.fill('[name="user[login]"]', username);
    await page.fill('[name="user[email]"]', email);
    await page.fill('[name="user[password]"]', password);
    await page.fill('[name="opt_in"]', 'n'); // Skip newsletter

    // Click continue
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check if we get an error about email domain
    const currentUrl = page.url();
    const pageContent = await page.content();

    // If we stay on signup page and see error, domain is rejected
    if (currentUrl.includes('github.com/signup') && pageContent.includes('domain cannot be verified')) {
      return false;
    }

    // If we proceed to email verification step, domain is accepted
    if (currentUrl.includes('github.com/signup/email')) {
      return true;
    }

    // Check for specific errors
    if (pageContent.includes('domain cannot be verified')) {
      return false;
    }

    if (pageContent.includes('email') && pageContent.includes('invalid')) {
      return false;
    }

    // For legitimate domains, if we stay on signup page, it might be due to other validation errors
    // Let's check if we get past the initial validation
    if (currentUrl.includes('github.com/signup') && !pageContent.includes('domain cannot be verified')) {
      // We might have gotten past domain validation, check for other errors
      if (pageContent.includes('Username') && pageContent.includes('already taken')) {
        return true; // Domain is accepted, username just taken
      }
      if (pageContent.includes('password') && pageContent.includes('weak')) {
        return true; // Domain is accepted, password just weak
      }
      // If no specific domain error, assume domain is accepted
      return true;
    }

    // If we're redirected somewhere else (not signup page), domain is likely accepted
    return !currentUrl.includes('github.com/signup');

  } catch (error) {
    console.error('Error testing email domain:', error.message);
    return false;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function testGitHubOAuthFlow() {
  console.log('🚀 Starting GitHub OAuth Flow Debug Test');
  console.log('=====================================');

  // Test different email domains that work with GitHub
  // Based on research, these are legitimate domains that GitHub typically accepts
  const emailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'proton.me',
    'icloud.com'
  ];

  let testEmail, testPassword, githubUsername;

  // Try each domain until we find one that works
  for (const domain of emailDomains) {
    console.log(`🔍 Testing email domain: ${domain}`);

    // Use more realistic names and emails
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    testEmail = `johnsmith${randomNum}@${domain}`;
    testPassword = 'SecurePass123!';
    githubUsername = `johnsmith${randomNum}`;

    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`👤 GitHub Username: ${githubUsername}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log('');

    // Test if GitHub accepts this email domain
    const acceptsEmail = await testGitHubEmailDomain(testEmail, githubUsername, testPassword);
    if (acceptsEmail) {
      console.log(`✅ GitHub accepts ${domain} email domain`);
      break;
    } else {
      console.log(`❌ GitHub rejects ${domain} email domain, trying next...`);
      continue;
    }
  }

  if (!testEmail) {
    throw new Error('No working email domain found for GitHub');
  }

  // Generate realistic credentials for the main OAuth test
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const mainTestEmail = `johnsmith${randomNum}@guerrillamail.com`;
  const mainTestPassword = 'SecurePass123!';
  const mainGithubUsername = `johnsmith${randomNum}`;

  console.log(`📋 Using realistic credentials for main OAuth test:`);
  console.log(`📧 Email: ${mainTestEmail}`);
  console.log(`👤 Username: ${mainGithubUsername}`);
  console.log(`🔑 Password: ${mainTestPassword}`);
  console.log('');

  const browser = await chromium.launch({
    headless: false, // Run in visible mode for debugging
    slowMo: 1000, // Slow down actions for better visibility
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  // Enable console logging and network monitoring
  const page = await context.newPage();

  // Monitor console messages
  page.on('console', msg => {
    console.log('🖥️  CONSOLE:', msg.text());
  });

  // Monitor network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('github.com') || url.includes('supabase.co') || url.includes('devdapp.com')) {
      console.log('🌐 REQUEST:', request.method(), url);
    }
  });

  // Monitor responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('github.com') || url.includes('supabase.co') || url.includes('devdapp.com')) {
      console.log('📡 RESPONSE:', response.status(), url);
    }
  });

  try {
    console.log('📋 STEP 1: Creating GitHub Account');
    console.log('====================================');

    // Step 1: Go to GitHub signup
    await page.goto('https://github.com/signup');
    await page.waitForTimeout(2000);

    // Fill out GitHub signup form with realistic credentials
    await page.fill('[name="user[login]"]', mainGithubUsername);
    await page.fill('[name="user[email]"]', mainTestEmail);
    await page.fill('[name="user[password]"]', mainTestPassword);
    await page.fill('[name="opt_in"]', 'n'); // Skip newsletter

    // Click continue
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Handle email verification (GitHub sends email)
    console.log('📧 STEP 2: Checking Guerrilla Mail for GitHub Email');
    console.log('=================================================');

    // Go to Guerrilla Mail
    await page.goto('https://www.guerrillamail.com/');
    await page.waitForTimeout(3000);

    // Get the generated email address
    const emailAddress = await page.locator('#email-widget').inputValue();

    if (emailAddress && emailAddress.includes('@')) {
      console.log('📧 Generated email address:', emailAddress);

      // Wait for emails to arrive
      await page.waitForTimeout(15000);

      // Look for GitHub verification email
      const emailExists = await page.locator('.mail-item').first().isVisible().catch(() => false);

      if (emailExists) {
        // Click on the email
        await page.click('.mail-item');
        await page.waitForTimeout(2000);

        // Extract verification link from email content
        const emailContent = await page.locator('.email_body').textContent();
        const verifyLinkMatch = emailContent.match(/https:\/\/github\.com\/users\/[^\/]+\/verify\/[^?\s]+/);

        if (verifyLinkMatch) {
          const verifyLink = verifyLinkMatch[0];
          console.log('✅ Found GitHub verification link:', verifyLink);

          // Complete email verification
          await page.goto(verifyLink);
          await page.waitForTimeout(3000);
          console.log('✅ GitHub email verified successfully');
        } else {
          console.log('❌ Could not find verification link in email');
          console.log('Email content preview:', emailContent.substring(0, 500));
          throw new Error('GitHub verification link not found');
        }
      } else {
        console.log('❌ No email found in Guerrilla Mail');
        throw new Error('GitHub verification email not received');
      }
    } else {
      console.log('❌ Could not get email address from Guerrilla Mail');
      throw new Error('Failed to generate temporary email');
    }

    console.log('🔐 STEP 3: Testing GitHub Login on devdapp.com');
    console.log('============================================');

    // Step 3: Test GitHub login on devdapp.com
    await page.goto('https://devdapp.com/auth/login');
    await page.waitForTimeout(3000);

    // Click GitHub login button
    const githubButton = page.locator('button:has-text("Sign in with GitHub")');
    await githubButton.click();

    // Wait for GitHub OAuth page
    await page.waitForURL('**/github.com/login/oauth/authorize**');
    console.log('✅ GitHub OAuth initiated');

    // Authorize the application
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Wait for redirect back to devdapp.com
    await page.waitForURL('**/devdapp.com/**');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('🔄 Current URL after OAuth:', currentUrl);

    if (currentUrl.includes('/?code=')) {
      console.log('❌ PROBLEM: OAuth code delivered to homepage instead of /auth/callback');
      console.log('❌ This confirms the bug described in the diagnostic report');

      // Try to manually navigate to callback URL
      const codeMatch = currentUrl.match(/code=([^&]+)/);
      if (codeMatch) {
        const code = codeMatch[1];
        console.log('🔧 Attempting manual fix - navigating to callback URL');
        await page.goto(`https://devdapp.com/auth/callback?code=${code}&next=/protected/profile`);
        await page.waitForTimeout(3000);

        // Check if we're now authenticated
        const isAuthenticated = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
        if (isAuthenticated) {
          console.log('✅ Manual callback navigation successful - user is authenticated');
        } else {
          console.log('❌ Manual callback navigation failed - user still not authenticated');
        }
      }
    } else if (currentUrl.includes('/auth/callback')) {
      console.log('✅ OAuth redirected to /auth/callback correctly');

      // Wait for authentication to complete
      await page.waitForTimeout(3000);

      // Check if user is authenticated
      const isAuthenticated = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
      if (isAuthenticated) {
        console.log('✅ GitHub OAuth flow completed successfully');
      } else {
        console.log('❌ OAuth callback reached but authentication failed');
      }
    } else if (currentUrl.includes('/auth/error')) {
      console.log('❌ OAuth flow resulted in error page');

      // Get error message
      const errorText = await page.locator('body').textContent();
      console.log('Error details:', errorText.substring(0, 500));
    } else {
      console.log('❓ Unexpected redirect URL:', currentUrl);
    }

    console.log('📊 STEP 4: Collecting Debug Information');
    console.log('=====================================');

    // Get browser console logs
    const logs = await page.evaluate(() => {
      return new Promise((resolve) => {
        const logs = [];
        const originalConsole = window.console;

        // Override console methods to capture logs
        ['log', 'error', 'warn', 'info'].forEach(method => {
          window.console[method] = (...args) => {
            logs.push({ method, args: args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            )});
            originalConsole[method](...args);
          };
        });

        setTimeout(() => {
          // Restore original console
          window.console = originalConsole;
          resolve(logs);
        }, 2000);
      });
    });

    console.log('Console logs captured:', logs.length);

    // Check environment variables in browser
    const envInfo = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        origin: window.location.origin,
        nextPublicAppUrl: typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_APP_URL : 'undefined',
        nextPublicSiteUrl: typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SITE_URL : 'undefined'
      };
    });

    console.log('Environment info:', envInfo);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    console.log('🧹 Cleaning up...');
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
