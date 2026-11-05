import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { WorkStep, WorkStepPayload } from '../../core/models/work-step.model';
import { ToastService } from '../../core/services/toast.service';
import { WorkStepsService } from '../../core/services/work-steps.service';
import { applyServerErrors } from '../../core/utils/http-error';
import { notBlank } from '../../core/utils/validators';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';

type StatusFilter = 'all' | 'active' | 'inactive';

/** Curated Bootstrap Icons for process / methodology steps (stored as the class name). */
export const STEP_ICONS: { label: string; class: string }[] = [
  { label: 'Search', class: 'bi-search' },
  { label: 'Diagnose', class: 'bi-clipboard2-pulse' },
  { label: 'Design', class: 'bi-vector-pen' },
  { label: 'Validate', class: 'bi-patch-check' },
  { label: 'Roadmap', class: 'bi-signpost-split' },
  { label: 'Launch', class: 'bi-rocket-takeoff' },
  { label: 'Growth', class: 'bi-graph-up-arrow' },
  { label: 'Target', class: 'bi-bullseye' },
  { label: 'Lightbulb', class: 'bi-lightbulb' },
  { label: 'Compass', class: 'bi-compass' },
  { label: 'Binoculars', class: 'bi-binoculars' },
  { label: 'Layers', class: 'bi-layers' },
  { label: 'Process', class: 'bi-diagram-3' },
  { label: 'Puzzle', class: 'bi-puzzle' },
  { label: 'Workshop', class: 'bi-people' },
  { label: 'Checklist', class: 'bi-card-checklist' },
  { label: 'Calendar', class: 'bi-calendar-check' },
  { label: 'Settings', class: 'bi-gear' },
  { label: 'Analytics', class: 'bi-bar-chart-line' },
  { label: 'Flag', class: 'bi-flag' },
  { label: 'Award', class: 'bi-award' },
  { label: 'Loop', class: 'bi-arrow-repeat' },
  { label: 'Handshake', class: 'bi-hand-thumbs-up' },
  { label: 'Shield', class: 'bi-shield-check' },
];

const DEFAULT_ICON = 'bi-circle';

@Component({
  selector: 'app-how-we-work',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './how-we-work.component.html',
  styleUrl: './how-we-work.component.scss',
})
export class HowWeWorkComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(WorkStepsService);
  private readonly toast = inject(ToastService);

  readonly icons = STEP_ICONS;
  readonly defaultIcon = DEFAULT_ICON;

  // ----- state -----
  items = signal<WorkStep[]>([]);
  loading = signal(true);
  saving = signal(false);
  loadFailed = signal(false);

  search = signal('');
  status = signal<StatusFilter>('all');

  drawerOpen = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  togglingId = signal<number | null>(null);
  flashId = signal<number | null>(null);

  // drag & drop
  dragId = signal<number | null>(null);
  overId = signal<number | null>(null);

  // ----- derived -----
  total = computed(() => this.items().length);
  activeCount = computed(() => this.items().filter(s => s.is_active).length);
  inactiveCount = computed(() => this.total() - this.activeCount());
  outcomeCount = computed(() => this.items().filter(s => !!s.outcome?.trim()).length);

  /**
   * The number each step carries on the public site: live steps are numbered
   * 01, 02, 03 ... in order and hidden steps don't take a number.
   */
  numbers = computed(() => {
    const map = new Map<number, string>();
    let n = 0;
    for (const s of this.items()) {
      if (s.is_active) map.set(s.id, String(++n).padStart(2, '0'));
    }
    return map;
  });

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const st = this.status();
    return this.items().filter(s => {
      if (st === 'active' && !s.is_active) return false;
      if (st === 'inactive' && s.is_active) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.outcome ?? '').toLowerCase().includes(q)
      );
    });
  });

  /** Reordering only makes sense on the full, unfiltered list. */
  canReorder = computed(
    () => !this.search().trim() && this.status() === 'all' && this.total() > 1
  );

  /** Positions offered in the editor (1..N, plus one extra when creating). */
  positions = computed(() => {
    const count = this.total() + (this.editingId() === null ? 1 : 0);
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  });

  // ----- form -----
  form = this.fb.group({
    title: ['', [Validators.required, notBlank, Validators.maxLength(150)]],
    description: ['', [Validators.required, notBlank, Validators.maxLength(5000)]],
    outcome: ['', [Validators.maxLength(2000)]],
    icon: this.fb.control<string | null>(null),
    is_active: [true],
    position: [1],
  });

  ngOnInit(): void {
    this.load();
  }

  num(step: WorkStep): string | null {
    return this.numbers().get(step.id) ?? null;
  }

  // ===== loading =====
  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: list => this.items.set(list),
        error: () => this.loadFailed.set(true),
      });
  }

  /** Re-fetch without the skeleton (numbering/positions may have shifted). */
  private refresh(): void {
    this.api.getAll().subscribe({ next: list => this.items.set(list) });
  }

  // ===== drawer =====
  openCreate(): void {
    this.editingId.set(null);
    this.deletingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      outcome: '',
      icon: null,
      is_active: true,
      position: this.total() + 1,
    });
    this.drawerOpen.set(true);
  }

  openEdit(step: WorkStep): void {
    this.editingId.set(step.id);
    this.deletingId.set(null);
    this.form.reset({
      title: step.title,
      description: step.description,
      outcome: step.outcome ?? '',
      icon: step.icon,
      is_active: step.is_active,
      position: this.items().findIndex(s => s.id === step.id) + 1,
    });
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    if (this.saving()) return;
    this.drawerOpen.set(false);
    this.editingId.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen()) this.closeDrawer();
  }

  pickIcon(cls: string): void {
    const ctrl = this.form.controls.icon;
    ctrl.setValue(ctrl.value === cls ? null : cls);
    ctrl.markAsDirty();
  }

  /** What the live preview should show as the step's number. */
  previewNumber(): string {
    if (!this.form.controls.is_active.value) return '';
    const id = this.editingId();
    const pos = Number(this.form.controls.position.value);

    // Simulate the list with this step moved to the chosen position.
    const others = this.items().filter(s => s.id !== id);
    const before = others.slice(0, pos - 1).filter(s => s.is_active).length;
    return String(before + 1).padStart(2, '0');
  }

  // ===== save =====
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const id = this.editingId();

    const body: WorkStepPayload = {
      title: v.title.trim(),
      description: v.description.trim(),
      outcome: v.outcome.trim() || null,
      icon: v.icon,
      is_active: v.is_active,
    };

    const oldPosition = id !== null ? this.items().findIndex(s => s.id === id) + 1 : null;
    const moved = id === null || Number(v.position) !== oldPosition;
    if (moved) body.sort_order = Number(v.position);

    this.saving.set(true);

    (id !== null ? this.api.update(id, body) : this.api.create(body))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: saved => {
          if (moved) {
            this.refresh(); // other steps shifted
          } else {
            this.items.update(list => list.map(s => (s.id === saved.id ? { ...s, ...saved } : s)));
          }
          this.drawerOpen.set(false);
          this.editingId.set(null);
          this.flash(saved.id);
        },
        error: err => applyServerErrors(this.form, err),
      });
  }

  // ===== quick actions =====
  toggleActive(step: WorkStep, event: Event): void {
    event.stopPropagation();
    if (this.togglingId() !== null) return;
    this.togglingId.set(step.id);
    this.api
      .update(step.id, { is_active: !step.is_active })
      .pipe(finalize(() => this.togglingId.set(null)))
      .subscribe({
        next: saved => this.items.update(list => list.map(s => (s.id === saved.id ? { ...s, ...saved } : s))),
      });
  }

  confirmDelete(id: number): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.items.update(list => list.filter(s => s.id !== id));
        this.deletingId.set(null);
        this.refresh();
      },
      error: () => this.deletingId.set(null),
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
  }

  // ===== journey strip: jump to a step =====
  jumpTo(step: WorkStep): void {
    if (this.search().trim() || this.status() !== 'all') this.clearFilters();
    setTimeout(() => {
      document.getElementById('step-' + step.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.flash(step.id);
    });
  }

  private flash(id: number): void {
    this.flashId.set(id);
    setTimeout(() => this.flashId.update(cur => (cur === id ? null : cur)), 1600);
  }

  // ===== drag & drop reorder =====
  onDragStart(step: WorkStep, event: DragEvent): void {
    if (!this.canReorder()) {
      event.preventDefault();
      return;
    }
    this.dragId.set(step.id);
    event.dataTransfer?.setData('text/plain', String(step.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(step: WorkStep, event: DragEvent): void {
    if (this.dragId() === null) return;
    event.preventDefault();
    this.overId.set(step.id);
  }

  onDragEnd(): void {
    this.dragId.set(null);
    this.overId.set(null);
  }

  onDrop(target: WorkStep, event: DragEvent): void {
    event.preventDefault();
    const fromId = this.dragId();
    this.onDragEnd();
    if (fromId === null || fromId === target.id) return;

    const before = this.items();
    const list = [...before];
    const from = list.findIndex(s => s.id === fromId);
    const to = list.findIndex(s => s.id === target.id);
    if (from < 0 || to < 0) return;

    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    this.persistOrder(list, before, fromId);
  }

  /** Button alternative to dragging (also works on touch screens). */
  move(step: WorkStep, delta: -1 | 1): void {
    const before = this.items();
    const list = [...before];
    const i = list.findIndex(s => s.id === step.id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    this.persistOrder(list, before, step.id);
  }

  private persistOrder(list: WorkStep[], before: WorkStep[], movedId: number): void {
    this.items.set(list); // optimistic
    this.flash(movedId);
    this.api.reorder(list.map(s => s.id)).subscribe({
      next: fresh => this.items.set(fresh),
      error: () => {
        this.items.set(before);
        this.toast.warning('Could not save the new order. It was restored.');
      },
    });
  }
}
