import { ImageValue } from '../models/image-value.model';

/**
 * Converts an object to FormData using bracket notation (PHP / Laravel friendly):
 *   { title: 'A', slides: [{ title: 'B', image: File }] }
 *   →  title=A · slides[0][title]=B · slides[0][image]=<file>
 * null / undefined values are skipped, so the backend keeps the current value.
 */
export function toFormData(data: object, method?: 'PUT' | 'PATCH'): FormData {
  const formData = new FormData();
  append(formData, data, '');
  if (method) formData.append('_method', method);   // method spoofing, see the notes at the end
  return formData;
}

function append(formData: FormData, value: unknown, key: string): void {
  if (value === null || value === undefined) return;

  if (value instanceof File) {
    formData.append(key, value, value.name);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => append(formData, item, `${key}[${i}]`));
  } else if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) append(formData, v, key ? `${key}[${k}]` : k);
  } else {
    formData.append(key, String(value));
  }
}

/** Only a newly chosen file is sent. An unchanged image (URL string) is not sent at all. */
export function fileOrNull(value: ImageValue): File | null {
  return value instanceof File ? value : null;
}