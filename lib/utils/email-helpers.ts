/**
 * Email Helper Utilities
 * 
 * Purpose: Detect and manage test accounts using mailinator emails
 * Used for: AutoWallet automation, test account identification
 */

/**
 * Check if email is a mailinator test email
 * 
 * @param email - Email address to check
 * @returns true if email is a mailinator test email
 * 
 * @example
 * isMailinatorEmail('test@mailinator.com') // true
 * isMailinatorEmail('user@gmail.com') // false
 */
export function isMailinatorEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase().includes('@mailinator.com');
}

/**
 * Check if email is a test account (mailinator)
 * Alias for isMailinatorEmail for clarity
 * 
 * @param email - Email address to check
 * @returns true if email is a test account
 */
export function isTestAccount(email: string | undefined | null): boolean {
  return isMailinatorEmail(email);
}

/**
 * Extract username from mailinator email
 * 
 * @param email - Mailinator email address
 * @returns Username part of email (before @)
 * 
 * @example
 * getMailinatorUsername('testuser-123@mailinator.com') // 'testuser-123'
 */
export function getMailinatorUsername(email: string): string {
  return email.split('@')[0];
}

/**
 * Generate a unique mailinator test email
 * 
 * @param prefix - Optional prefix for the email (defaults to 'test')
 * @returns Generated mailinator email
 * 
 * @example
 * generateMailinatorEmail('qa-wallet') // 'qa-wallet-1234567890@mailinator.com'
 * generateMailinatorEmail() // 'test-1234567890@mailinator.com'
 */
export function generateMailinatorEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}@mailinator.com`;
}

/**
 * Format email for display (masks most of the email for privacy)
 * 
 * @param email - Email address
 * @returns Masked email for display
 * 
 * @example
 * maskEmail('test@mailinator.com') // 't***@mailinator.com'
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  
  const maskedUser = user[0] + '***' + user.slice(-1);
  return `${maskedUser}@${domain}`;
}






