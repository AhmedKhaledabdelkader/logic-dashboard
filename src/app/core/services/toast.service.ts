import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.show('success', message); }
  error(message: string)   { this.show('error', message, 7000); }
  warning(message: string) { this.show('warning', message); }
  info(message: string)    { this.show('info', message); }

  show(type: ToastType, message: string, duration = 5000) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}