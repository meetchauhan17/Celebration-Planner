/**
 * Standard Result and Storage Error types.
 */
export type StorageErrorCode =
  | "QUOTA_EXCEEDED"
  | "UNAVAILABLE"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNKNOWN";

export interface StorageError {
  code: StorageErrorCode;
  message: string;
  cause?: unknown;
}

export type Result<T, E = StorageError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T = never>(error: StorageError): Result<T> {
  return { ok: false, error };
}

