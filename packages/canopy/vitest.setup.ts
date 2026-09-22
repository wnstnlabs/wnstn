// vitest setup file
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/page',
    pathname: '/page',
    search: '',
    protocol: 'https:',
  },
  writable: true,
});

// Mock document.referrer
Object.defineProperty(document, 'referrer', {
  value: 'https://referrer.com',
  writable: true,
});

// Mock document.title
Object.defineProperty(document, 'title', {
  value: 'Test Page',
  writable: true,
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true,
});

// Mock history.pushState and replaceState
history.pushState = vi.fn();
history.replaceState = vi.fn();

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  value: vi.fn().mockReturnValue('test-uuid-1234'),
  writable: true,
});

// Mock navigator.doNotTrack
Object.defineProperty(navigator, 'doNotTrack', {
  value: null,
  writable: true,
});

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});