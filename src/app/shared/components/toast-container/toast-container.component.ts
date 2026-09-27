import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast-item" [class]="t.type" role="status">
          <i class="bi icon" [class]="iconOf(t.type)"></i>
          <span class="msg">{{ t.message }}</span>
          <button type="button" class="close" aria-label="Close" (click)="toasts.dismiss(t.id)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      }
    </div>`,
  styles: `
    .toast-stack {
      position: fixed; top: 20px; right: 20px; z-index: 2000;
      display: flex; flex-direction: column; gap: 12px;
      width: min(380px, calc(100vw - 40px));
    }
    .toast-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 16px; background: #fff; color: var(--brand-dark);
      border-left: 5px solid var(--brand-primary);
      box-shadow: 0 12px 30px rgba(11, 46, 51, .18);
      animation: slide-in .35s ease;
    }
    .toast-item.success { border-color: var(--brand-primary); .icon { color: var(--brand-primary); } }
    .toast-item.error   { border-color: #dc3545;              .icon { color: #dc3545; } }
    .toast-item.warning { border-color: var(--brand-accent);  .icon { color: var(--brand-accent); } }
    .toast-item.info    { border-color: #3b82f6;              .icon { color: #3b82f6; } }
    .icon { font-size: 20px; line-height: 1.3; }
    .msg { flex: 1; font-size: 14px; line-height: 1.5; }
    .close { border: 0; background: none; padding: 0; color: #8a9a9e; &:hover { color: var(--brand-dark); } }
    @keyframes slide-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
  `,
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService);

  iconOf(type: ToastType) {
    return {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-octagon-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    }[type];
  }
}