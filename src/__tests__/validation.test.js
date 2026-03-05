import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateProductName,
  validateQuantity,
  validateLocation,
  validateImageUrl,
  validatePasswordsMatch,
  validatePasswordDifference,
  getPasswordStrengthIndicators,
} from '../validation';

// email validation tests
describe('validateEmail', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validateEmail(null)).toBe('Email is required');
    });

    test('returns error for undefined', () => {
      expect(validateEmail(undefined)).toBe('Email is required');
    });

    test('returns error for non-string (number)', () => {
      expect(validateEmail(42)).toBe('Email is required');
    });

    test('returns error for empty string', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    test('returns error for whitespace-only string', () => {
      expect(validateEmail('   ')).toBe('Email cannot be empty');
    });

    test('returns error when @ is missing', () => {
      expect(validateEmail('userexample.com')).toBe('Invalid email format');
    });

    test('returns error when domain is missing (user@)', () => {
      expect(validateEmail('user@')).toBe('Invalid email format');
    });

    test('returns error when TLD is missing (user@domain)', () => {
      expect(validateEmail('user@domain')).toBe('Invalid email format');
    });

    test('returns error when local part is missing (@domain.com)', () => {
      expect(validateEmail('@domain.com')).toBe('Invalid email format');
    });

    test('returns error for multiple @ symbols', () => {
      expect(validateEmail('user@@example.com')).toBe('Invalid email format');
    });

    test('returns error for spaces in email', () => {
      expect(validateEmail('user name@example.com')).toBe('Invalid email format');
    });

    test('returns error when email exceeds 254 characters', () => {
      const longLocal = 'a'.repeat(244);
      expect(validateEmail(`${longLocal}@example.com`)).toBe('Email is too long');
    });
  });

  describe('valid inputs', () => {
    test('accepts a simple valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
    });

    test('accepts email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBeNull();
    });

    test('accepts email with plus tag', () => {
      expect(validateEmail('user+tag@example.com')).toBeNull();
    });

    test('accepts email with dots in local part', () => {
      expect(validateEmail('first.last@example.org')).toBeNull();
    });

    test('accepts email with leading/trailing whitespace (trims before validating)', () => {
      expect(validateEmail('  user@example.com  ')).toBeNull();
    });

    test('accepts email at exactly 254 characters', () => {
      // 254 total: local(242) + @ + domain(7) + .com(4)
      const local = 'a'.repeat(242);
      expect(validateEmail(`${local}@test.com`)).toBeNull();
    });
  });
});

// password validation tests
describe('validatePassword', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validatePassword(null)).toBe('Password is required');
    });

    test('returns error for undefined', () => {
      expect(validatePassword(undefined)).toBe('Password is required');
    });

    test('returns error for non-string', () => {
      expect(validatePassword(12345678)).toBe('Password is required');
    });

    test('returns error for empty string', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    test('returns error when shorter than 8 characters', () => {
      expect(validatePassword('abc123')).toBe('Password must be at least 8 characters');
    });

    test('returns error for 7-character password (one below minimum)', () => {
      expect(validatePassword('1234567')).toBe('Password must be at least 8 characters');
    });

    test('returns error when longer than 1024 characters', () => {
      expect(validatePassword('a'.repeat(1025))).toBe('Password must not exceed 1024 characters');
    });
  });

  describe('valid inputs', () => {
    test('accepts password at exactly minimum length (8)', () => {
      expect(validatePassword('abcd1234')).toBeNull();
    });

    test('accepts password at exactly maximum length (1024)', () => {
      expect(validatePassword('a'.repeat(1024))).toBeNull();
    });

    test('accepts a passphrase with spaces', () => {
      expect(validatePassword('correct horse battery staple')).toBeNull();
    });

    test('accepts a password with special characters', () => {
      expect(validatePassword('P@ssw0rd!#$')).toBeNull();
    });

    test('accepts a numeric-only password of sufficient length', () => {
      expect(validatePassword('12345678')).toBeNull();
    });
  });
});

// display name validation tests
describe('validateDisplayName', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validateDisplayName(null)).toBe('Display name is required');
    });

    test('returns error for undefined', () => {
      expect(validateDisplayName(undefined)).toBe('Display name is required');
    });

    test('returns error for empty string', () => {
      expect(validateDisplayName('')).toBe('Display name is required');
    });

    test('returns error for single character', () => {
      expect(validateDisplayName('A')).toBe('Display name must be at least 2 characters');
    });

    test('returns error for whitespace-only (trims to empty)', () => {
      expect(validateDisplayName(' ')).toBe('Display name must be at least 2 characters');
    });

    test('returns error when over 50 characters', () => {
      expect(validateDisplayName('a'.repeat(51))).toBe('Display name must be 50 characters or less');
    });

    test('returns error for name with special characters', () => {
      expect(validateDisplayName('user!name')).toMatch(/Display name can only contain/);
    });

    test('returns error for name with emoji', () => {
      expect(validateDisplayName('Cool 😎')).toMatch(/Display name can only contain/);
    });
  });

  describe('valid inputs', () => {
    test('accepts a plain first and last name', () => {
      expect(validateDisplayName('John Doe')).toBeNull();
    });

    test('accepts name with hyphen', () => {
      expect(validateDisplayName('Mary-Jane')).toBeNull();
    });

    test('accepts name with apostrophe', () => {
      expect(validateDisplayName("O'Brien")).toBeNull();
    });

    test('accepts name with ampersand', () => {
      expect(validateDisplayName('Ben & Jerry')).toBeNull();
    });

    test('accepts name with period', () => {
      expect(validateDisplayName('Dr. Smith')).toBeNull();
    });

    test('accepts name at exactly 2 characters', () => {
      expect(validateDisplayName('Jo')).toBeNull();
    });

    test('accepts name at exactly 50 characters', () => {
      expect(validateDisplayName('a'.repeat(50))).toBeNull();
    });
  });
});

// product name validation tests
describe('validateProductName', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validateProductName(null)).toBe('Product name is required');
    });

    test('returns error for undefined', () => {
      expect(validateProductName(undefined)).toBe('Product name is required');
    });

    test('returns error for empty string', () => {
      expect(validateProductName('')).toBe('Product name is required');
    });

    test('returns error for whitespace-only string', () => {
      expect(validateProductName('   ')).toBe('Product name cannot be empty');
    });

    test('returns error when over 100 characters', () => {
      expect(validateProductName('a'.repeat(101))).toBe('Product name must be 100 characters or less');
    });

    test('Does not return error when exactly 100 characters', () => {
      expect(validateProductName('a'.repeat(100))).toBeNull();
    });

    test('returns error for name with invalid characters', () => {
      expect(validateProductName('Beans @special')).toBe('Product name contains invalid characters');
    });
  });

  describe('valid inputs', () => {
    test('accepts a simple product name', () => {
      expect(validateProductName('Canned Beans')).toBeNull();
    });

    test('accepts name with parentheses', () => {
      expect(validateProductName('Milk (whole)')).toBeNull();
    });

    test('accepts name with hyphen', () => {
      expect(validateProductName('Ready-to-eat Soup')).toBeNull();
    });

    test('accepts name with comma and period', () => {
      expect(validateProductName('Large, Fresh Eggs.')).toBeNull();
    });

    test('accepts name with ampersand', () => {
      expect(validateProductName('Mac & Cheese')).toBeNull();
    });

    test('accepts name at exactly 100 characters', () => {
      expect(validateProductName('a'.repeat(100))).toBeNull();
    });
  });
});

// quantity validation tests
describe('validateQuantity', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validateQuantity(null)).toBe('Quantity is required');
    });

    test('returns error for undefined', () => {
      expect(validateQuantity(undefined)).toBe('Quantity is required');
    });

    test('returns error for empty string', () => {
      expect(validateQuantity('')).toBe('Quantity is required');
    });

    test('returns error for a float', () => {
      expect(validateQuantity(1.5)).toBe('Quantity must be a whole number');
    });

    test('returns error for a negative number', () => {
      expect(validateQuantity(-1)).toBe('Quantity cannot be negative');
    });

    test('returns error for value exceeding 999999', () => {
      expect(validateQuantity(1000000)).toBe('Quantity cannot exceed 999,999');
    });

    test('returns error for non-numeric string', () => {
      expect(validateQuantity('abc')).toBe('Quantity must be a whole number');
    });
  });

  describe('valid inputs', () => {
    test('accepts 0', () => {
      expect(validateQuantity(0)).toBeNull();
    });

    test('accepts 1', () => {
      expect(validateQuantity(1)).toBeNull();
    });

    test('accepts a numeric string', () => {
      expect(validateQuantity('10')).toBeNull();
    });

    test('accepts exactly 999999', () => {
      expect(validateQuantity(999999)).toBeNull();
    });

    test('accepts a large valid integer', () => {
      expect(validateQuantity(500)).toBeNull();
    });
  });
});

// location validation tests
describe('validateLocation', () => {
  describe('invalid inputs', () => {
    test('returns error for null', () => {
      expect(validateLocation(null)).toBe('Location is required');
    });

    test('returns error for undefined', () => {
      expect(validateLocation(undefined)).toBe('Location is required');
    });

    test('returns error for empty string', () => {
      expect(validateLocation('')).toBe('Location is required');
    });

    test('returns error for string shorter than 3 characters', () => {
      expect(validateLocation('LA')).toBe('Location must be at least 3 characters');
    });

    test('returns error for whitespace-only input trimming below 3 chars', () => {
      expect(validateLocation('  ')).toBe('Location must be at least 3 characters');
    });

    test('returns error when over 150 characters', () => {
      expect(validateLocation('a'.repeat(151))).toBe('Location must be 150 characters or less');
    });

    test('returns error for regex injection pattern ".*"', () => {
      expect(validateLocation('Tampa.*')).toBe('Location contains invalid characters');
    });

    test('returns error for regex injection pattern ".+"', () => {
      expect(validateLocation('city.+')).toBe('Location contains invalid characters');
    });

    test('returns error for "(?:" pattern', () => {
      expect(validateLocation('(?:Tampa)')).toBe('Location contains invalid characters');
    });

    test('returns error for string with "!" character', () => {
      expect(validateLocation('Tampa!')).toBe('Location contains invalid characters');
    });

    test('returns error for string with "@" character', () => {
      expect(validateLocation('Tampa@FL')).toBe('Location contains invalid characters');
    });
  });

  describe('valid inputs', () => {
    test('accepts a city name', () => {
      expect(validateLocation('Tampa')).toBeNull();
    });

    test('accepts city and state abbreviation', () => {
      expect(validateLocation('Tampa, FL')).toBeNull();
    });

    test('accepts a full street address', () => {
      expect(validateLocation('123 Main St, Tampa, FL 33601')).toBeNull();
    });

    test('accepts address with hyphen and parentheses', () => {
      expect(validateLocation('Main St (North)')).toBeNull();
    });

    test('accepts exactly 3 characters', () => {
      expect(validateLocation('NYC')).toBeNull();
    });

    test('accepts exactly 150 characters', () => {
      expect(validateLocation('a'.repeat(150))).toBeNull();
    });
  });
});


// image URL tests
describe('validateImageUrl', () => {
  describe('optional / empty inputs', () => {
    test('returns null for null (optional field)', () => {
      expect(validateImageUrl(null)).toBeNull();
    });

    test('returns null for undefined (optional field)', () => {
      expect(validateImageUrl(undefined)).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(validateImageUrl('')).toBeNull();
    });

    test('returns null for whitespace-only string', () => {
      expect(validateImageUrl('   ')).toBeNull();
    });
  });

  describe('invalid inputs', () => {
    test('returns error when URL exceeds 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2030);
      expect(validateImageUrl(longUrl)).toBe('Image URL is too long');
    });

    test('returns error for a plain string that is not a URL', () => {
      expect(validateImageUrl('not-a-url')).toBe('Invalid URL format');
    });

    test('returns error for URL without protocol', () => {
      expect(validateImageUrl('example.com/image.png')).toBe('Invalid URL format');
    });

    test('returns error for ftp:// URL', () => {
      expect(validateImageUrl('ftp://example.com/image.png')).toBe('Image URL must use http:// or https://');
    });

    test('returns error for file:// URL', () => {
      expect(validateImageUrl('file:///local/image.png')).toBe('Image URL must use http:// or https://');
    });
  });

  describe('valid inputs', () => {
    test('accepts an http:// URL', () => {
      expect(validateImageUrl('http://example.com/image.png')).toBeNull();
    });

    test('accepts an https:// URL', () => {
      expect(validateImageUrl('https://example.com/image.jpg')).toBeNull();
    });

    test('accepts an https:// URL with query params', () => {
      expect(validateImageUrl('https://cdn.example.com/photo.jpg?w=800&q=80')).toBeNull();
    });

    test('accepts URL with leading/trailing whitespace', () => {
      expect(validateImageUrl('  https://example.com/img.png  ')).toBeNull();
    });
  });
});

// password match tests
describe('validatePasswordsMatch', () => {
  test('returns null when passwords are identical', () => {
    expect(validatePasswordsMatch('password123', 'password123')).toBeNull();
  });

  test('errors when passwords are not the same', () => {
    expect(validatePasswordsMatch('password123', 'different1')).toBe('Passwords do not match');
  });

  test('returns null when both are empty strings', () => {
    expect(validatePasswordsMatch('', '')).toBeNull();
  });

  test('errors when one is empty and the other is not', () => {
    expect(validatePasswordsMatch('password123', '')).toBe('Passwords do not match');
  });

  test('is case-sensitive', () => {
    expect(validatePasswordsMatch('Password123', 'password123')).toBe('Passwords do not match');
  });
});

// password difference tests
describe('validatePasswordDifference', () => {
  test('errors when new password is the same as current', () => {
    expect(validatePasswordDifference('myPassword1', 'myPassword1')).toBe(
      'New password must be different from current password'
    );
  });

  test('returns null when passwords are different', () => {
    expect(validatePasswordDifference('oldPassword1', 'newPassword2')).toBeNull();
  });

  test('is case-sensitive', () => {
    expect(validatePasswordDifference('password123', 'Password123')).toBeNull();
  });

  test('treats two empty strings as the same', () => {
    expect(validatePasswordDifference('', '')).toBe(
      'New password must be different from current password'
    );
  });
});

// password strength tests
describe('getPasswordStrengthIndicators', () => {
  test('returns score 0 and label "weak" for no password', () => {
    const result = getPasswordStrengthIndicators('');
    expect(result.score).toBe(0);
    expect(result.label).toBe('weak');
  });

  test('returns score 0 for null password', () => {
    const result = getPasswordStrengthIndicators(null);
    expect(result.score).toBe(0);
    expect(result.label).toBe('weak');
  });

  test('returns score 0 for a repetitive password', () => {
    const result = getPasswordStrengthIndicators('aaaaaaaa');
    expect(result.score).toBe(0);
    expect(result.label).toBe('weak');
  });

  test('returns low score for a short, single-case password', () => {
    const result = getPasswordStrengthIndicators('abcdefgh');
    expect(result.score).toBeLessThan(3);
  });

  test('returns "fair" or higher for a mixed-case password over 12 chars', () => {
    const result = getPasswordStrengthIndicators('AbcDefGhi123');
    expect(result.score).toBeGreaterThanOrEqual(2);
  });

  test('returns "good" or "strong" for a long diverse password', () => {
    const result = getPasswordStrengthIndicators('Tr0ub4dor&3xtraLong!');
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  test('returns "strong" (score 4) for a very long, fully diverse password', () => {
    const result = getPasswordStrengthIndicators('Correct-Horse-Battery-Staple#99!');
    expect(result.score).toBe(4);
    expect(result.label).toBe('strong');
  });

  test('score is always clamped between 0 and 4', () => {
    const passwords = ['', 'a', 'abcdefgh', 'Tr0ub4dor&3xtra!LongPass2024'];
    passwords.forEach((pw) => {
      const { score } = getPasswordStrengthIndicators(pw);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    });
  });

  test('label is always one of the expected values', () => {
    const validLabels = ['weak', 'fair', 'good', 'strong'];
    const passwords = ['', 'short1A!', 'medium1234AB', 'Tr0ub4dor&3xtraLong!Secure'];
    passwords.forEach((pw) => {
      const { label } = getPasswordStrengthIndicators(pw);
      expect(validLabels).toContain(label);
    });
  });

  test('message field is always a non-empty string', () => {
    ['', 'weak', 'StrongPass123!'].forEach((pw) => {
      const { message } = getPasswordStrengthIndicators(pw);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
