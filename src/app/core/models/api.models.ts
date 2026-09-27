/** Every successful backend response: { message?: string, data: T } */
export interface ApiResponse<T = unknown> {
  message?: string;
  data: T;
}

/** Validation error (HTTP 422): { message: string, errors: { field: [msg, ...] } } */
export interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}