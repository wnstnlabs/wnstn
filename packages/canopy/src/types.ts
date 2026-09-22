/** Configuration options for Canopy */
export interface CanopyOptions {
  /** Your Canopy site ID — found at dashboard → site settings */
  siteId: string;
  /** Endpoint to send events to. Defaults to /api/canopy/event (same origin) */
  endpoint?: string;
  /** Tag for environment e.g. production, development */
  env?: string;
  /** Disable automatic pageview on init */
  manualPageview?: boolean;
  /** Disable automatic outbound link tracking */
  disableOutbound?: boolean;
  /** Respect Do Not Track header — default true */
  respectDnt?: boolean;
  /** Sample rate 0-1 — default 1 (100%) */
  sampleRate?: number;
  /** Extra props attached to every event */
  props?: Record<string, unknown>;
  /** Enable debug logging to console */
  debug?: boolean;
  /** Hooks for intercepting events before/after sending */
  hooks?: CanopyHooks;
}

/** Hooks for intercepting and modifying events */
export interface CanopyHooks {
  /** Called before an event is sent. Return modified event or false to cancel. */
  beforeSend?: (event: CanopyEventPayload) => CanopyEventPayload | false | Promise<CanopyEventPayload | false>;
  /** Called after an event is successfully sent. */
  afterSend?: (event: CanopyEventPayload, response: Response | null) => void | Promise<void>;
  /** Called when an event fails to send. */
  onError?: (event: CanopyEventPayload, error: Error) => void | Promise<void>;
}

/** Event names that Canopy tracks */
export type CanopyEventName =
  | 'pageview'
  | 'outbound'
  | 'identify'
  | 'custom';

/** Base event payload structure */
export interface CanopyEventBase {
  /** Event name */
  n: CanopyEventName | string;
  /** Page URL */
  u: string;
  /** Referrer */
  r?: string;
  /** Page path + query */
  p?: string;
  /** Page title */
  t?: string;
  /** Viewport width */
  w?: number;
  /** Custom properties */
  props?: Record<string, unknown>;
  /** Timestamp */
  ts?: number;
}

/** Request payload (what we send) */
export interface CanopyEventPayload extends CanopyEventBase {
  /** SDK version */
  v: string;
  /** Site ID */
  s: string;
  /** Session ID */
  sid: string;
  /** Environment tag */
  env?: string;
}

/** Response from the server */
export interface CanopyResponse {
  success: boolean;
  eventId?: string;
  message?: string;
}

/** Instance methods returned by initCanopy */
export interface CanopyInstance {
  /** Track a custom event */
  track: (name: string, props?: Record<string, unknown>) => void;
  /** Track a pageview */
  pageview: (props?: Record<string, unknown>) => void;
  /** Identify a user */
  identify: (props?: Record<string, unknown>) => void;
  /** Reset the session */
  reset: () => void;
  /** Current configuration */
  options: CanopyOptions;
  /** Set default props for all future events */
  setDefaultProps: (props: Record<string, unknown>) => void;
  /** Get current session ID */
  getSessionId: () => string;
}

/** Event queue item for pre-init calls */
export interface QueuedCall {
  name: string;
  props?: Record<string, unknown>;
  type: 'track' | 'pageview' | 'identify';
}

/**
 * CanopyError — Structured error for debugging and handling
 */
export class CanopyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'CanopyError';
    // Maintains proper stack trace in V8 (Node.js)
    const ErrorCtor = Error as unknown as { captureStackTrace?: (target: object, constructorOpt?: Function) => void };
    if (typeof ErrorCtor.captureStackTrace === 'function') {
      ErrorCtor.captureStackTrace(this, CanopyError);
    }
  }

  /** Check if error is a configuration error */
  isConfigError(): boolean {
    return this.code === 'CONFIG_ERROR';
  }

  /** Check if error is a network/send error */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /** Check if error is a validation error */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  /** Check if error is a send cancelled error */
  isCancelledError(): boolean {
    return this.code === 'SEND_CANCELLED';
  }
}

// Type aliases for backward compatibility
export type MeadowOptions = CanopyOptions;
export type MeadowEvent = CanopyEventPayload;
export type MeadowInstance = CanopyInstance;