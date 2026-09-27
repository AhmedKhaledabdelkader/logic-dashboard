import { Insight } from '../models/insight.model';

/**
 * Laravel can serialize a boolean column as `true`/`false`, `1`/`0`, or
 * `"1"`/`"0"` depending on the response path (resource cast, raw model,
 * form-data round trip, etc). Doing `item.is_featured` as a truthiness check
 * anywhere downstream is unsafe, because the string "0" is truthy in JS.
 *
 * Normalize once, right where the API response is mapped, so every consumer
 * (computed signals, template *ngIf, filters) can trust `is_featured` is a
 * real boolean.
 */
export function normalizeInsight<T extends { is_featured: unknown }>(
  insight: T
): T & { is_featured: boolean } {
  return {
    ...insight,
    is_featured:
      insight.is_featured === true ||
      insight.is_featured === 1 ||
      insight.is_featured === '1',
  };
}