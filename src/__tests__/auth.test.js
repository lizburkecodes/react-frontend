import {
  AUTH_CHANGED_EVENT,
  getUser,
  setAuth,
  clearAuth,
  isAuthenticated,
} from '../auth';

// jsdom provides sessionStorage, but we clear it before every test
beforeEach(() => {
  sessionStorage.clear();
  jest.restoreAllMocks();
});

const mockUser = { id: '1', displayName: 'Mock', email: 'mock_wahlberg@example.com' };

describe('AUTH_CHANGED_EVENT', () => {
  test('is a non-empty string', () => {
    expect(typeof AUTH_CHANGED_EVENT).toBe('string');
    expect(AUTH_CHANGED_EVENT.length).toBeGreaterThan(0);
  });

  test('has the expected value', () => {
    expect(AUTH_CHANGED_EVENT).toBe('auth:changed');
  });
});

// getUser tests
describe('getUser', () => {
  test('returns null when sessionStorage is empty', () => {
    expect(getUser()).toBeNull();
  });

  test('returns the stored user object after setAuth', () => {
    setAuth({ user: mockUser });
    expect(getUser()).toEqual(mockUser);
  });

  test('returns null after clearAuth removes the user', () => {
    setAuth({ user: mockUser });
    clearAuth();
    expect(getUser()).toBeNull();
  });

  test('returns null when sessionStorage contains the literal string "null"', () => {
    sessionStorage.setItem('user', 'null');
    expect(getUser()).toBeNull();
  });

  test('returns null (does not throw) when sessionStorage contains malformed JSON', () => {
    sessionStorage.setItem('user', '{bad json{{');
    expect(() => getUser()).not.toThrow();
    expect(getUser()).toBeNull();
  });

  test('preserves all user fields exactly as stored', () => {
    const fullUser = { id: '99', displayName: 'Emilio', email: 'EmilioTestevez@test.com', role: 'admin' };
    setAuth({ user: fullUser });
    expect(getUser()).toEqual(fullUser);
  });
});

// setAuth tests
describe('setAuth', () => {
  test('stores the user so getUser returns it', () => {
    setAuth({ user: mockUser });
    expect(getUser()).toEqual(mockUser);
  });

  test('serialises the user to sessionStorage as JSON', () => {
    setAuth({ user: mockUser });
    const raw = sessionStorage.getItem('user');
    expect(JSON.parse(raw)).toEqual(mockUser);
  });

  test('dispatches the AUTH_CHANGED_EVENT on window', () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    setAuth({ user: mockUser });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  });

  test('overwrites a previously stored user', () => {
    const firstUser = { id: '1', displayName: 'Mock' };
    const secondUser = { id: '2', displayName: 'Emilio' };

    setAuth({ user: firstUser });
    setAuth({ user: secondUser });

    expect(getUser()).toEqual(secondUser);
  });

  test('dispatches event once per call, even when called multiple times', () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    setAuth({ user: mockUser });
    setAuth({ user: mockUser });

    expect(handler).toHaveBeenCalledTimes(2);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  });
});

// clearAuth tests
describe('clearAuth', () => {
  test('removes the user so getUser returns null', () => {
    setAuth({ user: mockUser });
    clearAuth();
    expect(getUser()).toBeNull();
  });

  test('removes the "user" key from sessionStorage', () => {
    setAuth({ user: mockUser });
    clearAuth();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  test('dispatches the AUTH_CHANGED_EVENT on window', () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    setAuth({ user: mockUser });
    handler.mockClear(); // ignore the setAuth event

    clearAuth();

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  });

  test('is safe to call when no user is stored (no throw)', () => {
    expect(() => clearAuth()).not.toThrow();
  });

  test('dispatches event even when no user was stored', () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    clearAuth();

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  });
});

// isAuthenticated tests
describe('isAuthenticated', () => {
  test('returns false when no user is stored', () => {
    expect(isAuthenticated()).toBe(false);
  });

  test('returns true after setAuth with a valid user', () => {
    setAuth({ user: mockUser });
    expect(isAuthenticated()).toBe(true);
  });

  test('returns false after clearAuth', () => {
    setAuth({ user: mockUser });
    clearAuth();
    expect(isAuthenticated()).toBe(false);
  });

  test('returns false when sessionStorage contains malformed JSON', () => {
    sessionStorage.setItem('user', '{bad json{{');
    expect(isAuthenticated()).toBe(false);
  });

  test('returns false when sessionStorage contains the string "null"', () => {
    sessionStorage.setItem('user', 'null');
    expect(isAuthenticated()).toBe(false);
  });

  test('returns a strict boolean (not just truthy/falsy)', () => {
    expect(typeof isAuthenticated()).toBe('boolean');
    setAuth({ user: mockUser });
    expect(typeof isAuthenticated()).toBe('boolean');
  });
});

// event lifecycle tests
describe('event lifecycle', () => {
  test('login → logout sequence fires event twice total', () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    setAuth({ user: mockUser });
    clearAuth();

    expect(handler).toHaveBeenCalledTimes(2);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  });

  test('listeners added after setAuth do not receive the past event', () => {
    setAuth({ user: mockUser });

    const lateHandler = jest.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, lateHandler);

    expect(lateHandler).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_CHANGED_EVENT, lateHandler);
  });
});
