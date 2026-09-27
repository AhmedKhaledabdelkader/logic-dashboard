import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-section-card',
  template: `
    <section class="section-card">

      @if (loading()) {
        <div class="loading"><span class="spinner-border text-primary"></span></div>
      }

      <header class="head">
        @if (step()) { <span class="step">{{ step() }}</span> }
        <div>
          <h2>{{ title() }}</h2>
          @if (description()) { <p>{{ description() }}</p> }
        </div>
      </header>

      <div class="body"><ng-content /></div>

      <footer class="foot">
        @if (showCancel()) {
          <button type="button" class="btn btn-outline-secondary" (click)="cancelled.emit()">Cancel</button>
        }
        <!-- type=submit: the wrapping <form> runs (ngSubmit) -->
        <button type="submit" class="btn btn-primary px-4" [disabled]="saving()">
          @if (saving()) {
            <span class="spinner-border spinner-border-sm me-2"></span> Saving...
          } @else {
            <i class="bi bi-check2 me-1"></i> {{ saveLabel() }}
          }
        </button>
      </footer>
    </section>`,
  styles: `
    .section-card { position: relative; margin-bottom: 28px; background: #fff; border: 1px solid #dfe5e7; border-top: 4px solid var(--brand-primary); }
    .head { display: flex; align-items: flex-start; gap: 16px; padding: 26px 30px 0; }
    .head h2 { margin: 0 0 4px; font-size: 20px; font-weight: 600; color: var(--brand-dark); }
    .head p { margin: 0; font-size: 14px; color: #6b7c80; }
    .step { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; font-weight: 700; color: var(--brand-dark); background: var(--brand-accent); }
    .body { padding: 26px 30px; }
    .foot { display: flex; justify-content: flex-end; gap: 12px; padding: 18px 30px; background: var(--brand-light); border-top: 1px solid #e3e9eb; }
    .loading { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, .7); }
    @media (max-width: 576px) { .head, .body, .foot { padding-left: 18px; padding-right: 18px; } }
  `,
})
export class SectionCardComponent {
  step = input<string>();
  title = input.required<string>();
  description = input<string>();
  saving = input(false);
  loading = input(false);
  saveLabel = input('Save changes');
  showCancel = input(false);
  cancelled = output<void>();
}