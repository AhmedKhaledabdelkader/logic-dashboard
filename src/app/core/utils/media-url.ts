import { environment } from '../../../environments/environment';

/**
 * "photo.jpg"  →  "http://127.0.0.1:8000/api/media/photo.jpg"
 * A full URL (or a blob/data URL) is returned unchanged.
 */
export function mediaUrl(image: string | null | undefined): string {
  if (!image) return '';
  if (/^(https?:)?\/\//i.test(image) || image.startsWith('blob:') || image.startsWith('data:')) return image;
  return `${environment.mediaUrl}/${image.replace(/^\/+/, '')}`;
}

/** Returns a copy of the item with its `image` turned into a full URL */
export function withMediaUrl<T extends { image: string }>(item: T): T {
  return { ...item, image: mediaUrl(item.image) };
}