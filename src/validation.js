/**
 * Frontend Validation Utilities
 * Mirrors backend validation rules for consistent UX
 * Provides real-time feedback to users
 */

// Email regex (simplified, matches backend)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PRODUCT_NAME_MAX_LENGTH = 200;
const ADDRESS_MAX_LENGTH = 500;

/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Email cannot be empty';
  }

  if (trimmed.length > 254) {
    return 'Email is too long';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Invalid email format';
  }

  return null;
}

/**
 * Validate password strength
 * NIST SP 800-63B compliant: minimum length only
 * Allows any characters (numbers, symbols, passphrases, etc.)
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (password.length > 64) {
    return 'Password is too long';
  }

  return null;
}

/**
 * Validate display name
 * @param {string} displayName
 * @returns {string|null} Error message or null if valid
 */
export function validateDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') {
    return 'Display name is required';
  }

  const trimmed = displayName.trim();

  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters';
  }

  if (trimmed.length > 100) {
    return 'Display name must be 100 characters or less';
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return 'Display name can only contain letters, numbers, spaces, hyphens, and underscores';
  }

  return null;
}

/**
 * Validate product name
 * @param {string} name
 * @returns {string|null} Error message or null if valid
 */
export function validateProductName(name) {
  if (!name || typeof name !== 'string') {
    return 'Product name is required';
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return 'Product name cannot be empty';
  }

  if (trimmed.length > PRODUCT_NAME_MAX_LENGTH) {
    return `Product name must be ${PRODUCT_NAME_MAX_LENGTH} characters or less`;
  }

  if (!/^[a-zA-Z0-9\s\-()&.,]+$/.test(trimmed)) {
    return 'Product name contains invalid characters';
  }

  return null;
}

/**
 * Validate product quantity
 * @param {number|string} quantity
 * @returns {string|null} Error message or null if valid
 */
export function validateQuantity(quantity) {
  if (quantity === null || quantity === undefined || quantity === '') {
    return 'Quantity is required';
  }

  const num = Number(quantity);

  if (!Number.isInteger(num)) {
    return 'Quantity must be a whole number';
  }

  if (num < 0) {
    return 'Quantity cannot be negative';
  }

  if (num > 999999) {
    return 'Quantity cannot exceed 999,999';
  }

  return null;
}

/**
 * Validate location/address
 * @param {string} location
 * @returns {string|null} Error message or null if valid
 */
export function validateLocation(location) {
  if (!location || typeof location !== 'string') {
    return 'Location is required';
  }

  const trimmed = location.trim();

  if (trimmed.length < 3) {
    return 'Location must be at least 3 characters';
  }

  if (trimmed.length > ADDRESS_MAX_LENGTH) {
    return `Location must be ${ADDRESS_MAX_LENGTH} characters or less`;
  }

  // Prevent regex injection
  const dangerousPatterns = ['.*', '.+', '^', '$', '|', '(?:', '\\'];
  for (const pattern of dangerousPatterns) {
    if (trimmed.includes(pattern)) {
      return 'Location contains invalid characters';
    }
  }

  if (!/^[a-zA-Z0-9\s\-.,()#&]+$/.test(trimmed)) {
    return 'Location contains invalid characters';
  }

  return null;
}

/**
 * Validate image URL
 * @param {string} url
 * @returns {string|null} Error message or null if valid
 */
export function validateImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return null; // Optional field
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return null; // Empty is OK
  }

  if (trimmed.length > 2048) {
    return 'Image URL is too long';
  }

  try {
    new URL(trimmed);
  } catch (_) {
    return 'Invalid URL format';
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'Image URL must use http:// or https://';
  }

  return null;
}

/**
 * Validate passwords match
 * @param {string} password1
 * @param {string} password2
 * @returns {string|null} Error message or null if valid
 */
export function validatePasswordsMatch(password1, password2) {
  if (password1 !== password2) {
    return 'Passwords do not match';
  }
  return null;
}

/**
 * Validate that new password is different from current
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {string|null} Error message or null if valid
 */
export function validatePasswordDifference(currentPassword, newPassword) {
  if (currentPassword === newPassword) {
    return 'New password must be different from current password';
  }
  return null;
}

/**
 * Get password strength feedback for optional display
 * Shows indicators for entropy (length), but does NOT block submission
 * @param {string} password
 * @returns {object} { score: number, label: 'weak'|'fair'|'good'|'strong', message: string }
 */
export function getPasswordStrengthIndicators(password) {
  if (!password) {
    return { score: 0, label: 'weak', message: 'Enter a password' };
  }

  let score = 0;
  const len = password.length;

  // Length scoring
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (len >= 20) score++;

  // Character diversity (lightweight, not strict rules)
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Penalize repetition like "aaaaaaa"
  if (/^(.)\1+$/.test(password)) score = 0;

  // Clamp score
  score = Math.min(score, 4);

  const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
  const messages = [
    'Very weak password',
    'Weak - increase length',
    'Fair - could be stronger',
    'Good password',
    'Strong password'
  ];

  return {
    score,
    label: labels[score],
    message: messages[score]
  };
}