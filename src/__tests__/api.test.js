jest.mock('axios');

describe('api.js', () => {
  let apiModule;
  let mockInstance;
  beforeEach(() => {
    jest.resetModules();
    process.env.VITE_API_URL = 'http://localhost:3000';

    mockInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockCreate = jest.fn().mockReturnValue(mockInstance);
    const mockedAxios = require('axios');
    mockedAxios.create = mockCreate;

    apiModule = require('../api');
  });

// axios instance configuration tests
  describe('axios instance configuration', () => {
    test('sets baseURL from the VITE_API_URL environment variable', () => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: 'http://localhost:3000' })
      );
    });

    test('uses a different baseURL when VITE_API_URL changes', () => {
      // Re-load with a different env value to confirm it is env-driven
      jest.resetModules();
      process.env.VITE_API_URL = 'https://api.example.com';

      const altMockInstance = {
        get: jest.fn(),
        post: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      };
      const altCreate = jest.fn().mockReturnValue(altMockInstance);
      require('axios').create = altCreate;
      require('../api');

      expect(altCreate).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: 'https://api.example.com' })
      );
    });

    test('enables withCredentials', () => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ withCredentials: true })
      );
    });
  });

  // fetchCSRFToken / getCSRFToken
  describe('fetchCSRFToken / getCSRFToken', () => {
    test('getCSRFToken returns null before fetchCSRFToken is called', () => {
      expect(apiModule.getCSRFToken()).toBeNull();
    });

    test('fetchCSRFToken calls GET /api/auth/csrf-token', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { csrfToken: 'abc123' } });
      await apiModule.fetchCSRFToken();
      expect(mockInstance.get).toHaveBeenCalledWith('/api/auth/csrf-token');
    });

    test('fetchCSRFToken stores and returns the token from the server', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { csrfToken: 'abc123' } });
      const token = await apiModule.fetchCSRFToken();
      expect(token).toBe('abc123');
      expect(apiModule.getCSRFToken()).toBe('abc123');
    });

    test('fetchCSRFToken handles network errors gracefully without throwing', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockInstance.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(apiModule.fetchCSRFToken()).resolves.toBeUndefined();
      // Token must remain null – callers should not assume it was set
      expect(apiModule.getCSRFToken()).toBeNull();
    });
  });

  // request interceptor – CSRF header attachment
  describe('request interceptor – CSRF header', () => {
    // Helpers to pull the registered handlers out of the mock
    const getHandler = () =>
      mockInstance.interceptors.request.use.mock.calls[0][0];
    const getErrorHandler = () =>
      mockInstance.interceptors.request.use.mock.calls[0][1];

    // When a CSRF token HAS been fetched
    describe('when a CSRF token is set', () => {
      beforeEach(async () => {
        mockInstance.get.mockResolvedValueOnce({ data: { csrfToken: 'test-csrf' } });
        await apiModule.fetchCSRFToken();
      });

      test.each(['post', 'put', 'delete'])(
        'attaches X-CSRF-Token header for %s requests',
        (method) => {
          const config = { method, headers: {} };
          const result = getHandler()(config);
          expect(result.headers['X-CSRF-Token']).toBe('test-csrf');
        }
      );

      test('does NOT attach X-CSRF-Token for read-only GET requests', () => {
        const config = { method: 'get', headers: {} };
        const result = getHandler()(config);
        expect(result.headers['X-CSRF-Token']).toBeUndefined();
      });

      test('returns the config object from the interceptor', () => {
        const config = { method: 'post', headers: {} };
        const result = getHandler()(config);
        expect(result).toBe(config);
      });
    });

    // When NO CSRF token has been fetched (token is null)
    describe('when no CSRF token is set', () => {
      test('does NOT attach X-CSRF-Token for POST requests', () => {
        const config = { method: 'post', headers: {} };
        const result = getHandler()(config);
        expect(result.headers['X-CSRF-Token']).toBeUndefined();
      });

      test('does NOT attach X-CSRF-Token for PUT requests', () => {
        const config = { method: 'put', headers: {} };
        const result = getHandler()(config);
        expect(result.headers['X-CSRF-Token']).toBeUndefined();
      });

      test('does NOT attach X-CSRF-Token for DELETE requests', () => {
        const config = { method: 'delete', headers: {} };
        const result = getHandler()(config);
        expect(result.headers['X-CSRF-Token']).toBeUndefined();
      });
    });

    // Error path
    test('request error handler rejects with the original error', () => {
      const err = new Error('request setup error');
      return expect(getErrorHandler()(err)).rejects.toEqual(err);
    });
  });
});
