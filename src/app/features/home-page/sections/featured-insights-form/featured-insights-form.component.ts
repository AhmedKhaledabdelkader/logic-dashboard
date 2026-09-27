import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Insight } from '../../../../core/models/insight.model';
import { HomePageService } from '../../../../core/services/home-page.service';
import { InsightsService } from '../../../../core/services/insights.service';
import { applyServerErrors } from '../../../../core/utils/http-error';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { SectionCardComponent } from '../../../../shared/components/section-card/section-card.component';

@Component({
  selector: 'app-featured-insights-form',
  imports: [ReactiveFormsModule, RouterLink, SectionCardComponent, FieldErrorComponent],
  templateUrl: './featured-insights-form.component.html',
  styles: `
    .picked {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 10px; padding: 12px 14px;
      background: #fbfcfc; border: 1px solid #dfe5e7;
    }
    .order {
      flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; font-size: 13px; font-weight: 700;
      color: var(--brand-dark); background: var(--brand-accent);
    }
    .picked img { flex: 0 0 auto; width: 84px; height: 52px; object-fit: cover; background: var(--brand-dark); }
    .picked .title { flex: 1; font-weight: 600; line-height: 1.4; color: var(--brand-dark); }
    .empty { padding: 28px; text-align: center; color: #6b7c80; border: 1px dashed #cfd8db; }
    @media (max-width: 576px) { .picked { flex-wrap: wrap; } .picked .title { flex-basis: 60%; } }
  `,
})
export class FeaturedInsightsFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly homeApi = inject(HomePageService);
  private readonly insightsApi = inject(InsightsService);

  readonly MAX = 3;
  loading = signal(true);
  saving = signal(false);

  allInsights = signal<Insight[]>([]);
  selectedIds = signal<number[]>([]);

  form = this.fb.group({
    insightIds: this.fb.control<number[]>([], [Validators.required, Validators.maxLength(this.MAX)]),
  });

  /** chosen insights, in the order they will appear on the website */
  selected = computed(() => {
    const byId = new Map(this.allInsights().map(i => [i.id, i]));
    return this.selectedIds().map(id => byId.get(id)).filter((i): i is Insight => !!i);
  });

  /** insights still available in the dropdown */
  available = computed(() => this.allInsights().filter(i => !this.selectedIds().includes(i.id)));

  placeholder = computed(() => {
    if (!this.allInsights().length) return 'No insights yet';
    if (this.selectedIds().length >= this.MAX) return `Maximum of ${this.MAX} reached`;
    if (!this.available().length) return 'No more insights available';
    return 'Choose an insight to add...';
  });

  ngOnInit() {
    forkJoin({ all: this.insightsApi.getAll(), ids: this.homeApi.getFeaturedInsights() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ all, ids }) => {
        this.allInsights.set(all);
        // ignore ids of insights that were deleted in the meantime
        const valid = (ids ?? []).filter(id => all.some(i => i.id === id)).slice(0, this.MAX);
        this.setIds(valid, false);
      });
  }

  add(id: number) {
    if (!id || this.selectedIds().length >= this.MAX || this.selectedIds().includes(id)) return;
    this.setIds([...this.selectedIds(), id]);
  }

  remove(id: number) {
    this.setIds(this.selectedIds().filter(x => x !== id));
  }

  move(i: number, step: -1 | 1) {
    const ids = [...this.selectedIds()];
    const j = i + step;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    this.setIds(ids);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    this.homeApi.saveFeaturedInsights(this.form.getRawValue().insightIds)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({ error: err => applyServerErrors(this.form, err) });   // success toast: interceptor
  }

  /** keeps the signal and the form control in sync */
  private setIds(ids: number[], touch = true) {
    this.selectedIds.set(ids);
    const control = this.form.controls.insightIds;
    control.setValue(ids);
    if (touch) { control.markAsDirty(); control.markAsTouched(); }
  }
}