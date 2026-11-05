import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { Service, ServicePayload } from '../../core/models/service.model';
import { ServicesService } from '../../core/services/services.service';
import { ToastService } from '../../core/services/toast.service';
import { applyServerErrors } from '../../core/utils/http-error';
import { notBlank } from '../../core/utils/validators';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';

type StatusFilter = 'all' | 'active' | 'inactive';

/** Curated Bootstrap Icons for consulting service areas (stored as the class name). */
export const SERVICE_ICONS: { label: string; class: string }[] = [
  { label: 'Compass', class: 'bi-compass' },
  { label: 'Strategy', class: 'bi-bullseye' },
  { label: 'Growth', class: 'bi-graph-up-arrow' },
  { label: 'Analytics', class: 'bi-bar-chart-line' },
  { label: 'Data', class: 'bi-database' },
  { label: 'Technology', class: 'bi-cpu' },
  { label: 'Cloud', class: 'bi-cloud' },
  { label: 'Security', class: 'bi-shield-check' },
  { label: 'People', class: 'bi-people' },
  { label: 'Training', class: 'bi-mortarboard' },
  { label: 'Process', class: 'bi-diagram-3' },
  { label: 'Operations', class: 'bi-gear' },
  { label: 'Finance', class: 'bi-cash-coin' },
  { label: 'Legal', class: 'bi-briefcase' },
  { label: 'Governance', class: 'bi-bank' },
  { label: 'Global', class: 'bi-globe' },
  { label: 'Innovation', class: 'bi-lightbulb' },
  { label: 'Quality', class: 'bi-award' },
  { label: 'Planning', class: 'bi-calendar-check' },
  { label: 'Documents', class: 'bi-file-earmark-text' },
  { label: 'Sustainability', class: 'bi-tree' },
  { label: 'Energy', class: 'bi-lightning-charge' },
  { label: 'Infrastructure', class: 'bi-building' },
  { label: 'Puzzle', class: 'bi-puzzle' },
];

const DEFAULT_ICON = 'bi-grid-1x2';

type BulletGroup = FormGroup<{
  id: FormControl<number | null>;
  title: FormControl<string>;
}>;
type SectionGroup = FormGroup<{
  title: FormControl<string>;
  bullets: FormArray<BulletGroup>;
}>;

@Component({
  selector: 'app-services',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ServicesService);
  private readonly toast = inject(ToastService);

  readonly icons = SERVICE_ICONS;
  readonly defaultIcon = DEFAULT_ICON;

  // ----- state -----
  items = signal<Service[]>([]);
  loading = signal(true);
  saving = signal(false);
  loadFailed = signal(false);

  search = signal('');
  status = signal<StatusFilter>('all');

  drawerOpen = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  togglingId = signal<number | null>(null);
  expandedId = signal<number | null>(null);

  // drag & drop
  dragId = signal<number | null>(null);
  overId = signal<number | null>(null);

  // ----- derived -----
  total = computed(() => this.items().length);
  activeCount = computed(() => this.items().filter(s => s.is_active).length);
  inactiveCount = computed(() => this.total() - this.activeCount());
  bulletCount = computed(() =>
    this.items().reduce((sum, s) => sum + (s.items_count ?? s.items.length), 0)
  );

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
        (s.code ?? '').toLowerCase() === q ||
        s.items.some(i => i.title.toLowerCase().includes(q))
      );
    });
  });

  /** Reordering only makes sense on the full, unfiltered list. */
  canReorder = computed(
    () => !this.search().trim() && this.status() === 'all' && this.total() > 1
  );

  // ----- form -----
  form = this.fb.group({
    code: ['', [Validators.maxLength(5)]],
    title: ['', [Validators.required, notBlank, Validators.maxLength(200)]],
    description: ['', [Validators.required, notBlank, Validators.maxLength(5000)]],
    icon: this.fb.control<string | null>(null),
    is_active: [true],
    sections: this.fb.array<SectionGroup>([]),
  });

  get sections(): FormArray<SectionGroup> {
    return this.form.controls.sections;
  }

  bullets(section: SectionGroup): FormArray<BulletGroup> {
    return section.controls.bullets;
  }

  ngOnInit(): void {
    this.load();
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

  // ===== drawer =====
  openCreate(): void {
    this.editingId.set(null);
    this.deletingId.set(null);
    this.resetForm({
      code: this.nextCode(),
      title: '',
      description: '',
      icon: null,
      is_active: true,
      sections: [{ title: '', bullets: [{ id: null, title: '' }] }],
    });
    this.drawerOpen.set(true);
  }

  openEdit(service: Service): void {
    this.editingId.set(service.id);
    this.deletingId.set(null);

    // Re-bucket the flat bullets into their sub-sections (first appearance order).
    const buckets = new Map<string, { id: number | null; title: string }[]>();
    for (const it of service.items) {
      const key = it.group_title ?? '';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push({ id: it.id, title: it.title });
    }
    const sections = [...buckets.entries()].map(([title, bullets]) => ({ title, bullets }));

    this.resetForm({
      code: service.code ?? '',
      title: service.title,
      description: service.description,
      icon: service.icon,
      is_active: service.is_active,
      sections: sections.length ? sections : [{ title: '', bullets: [{ id: null, title: '' }] }],
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

  private resetForm(v: {
    code: string;
    title: string;
    description: string;
    icon: string | null;
    is_active: boolean;
    sections: { title: string; bullets: { id: number | null; title: string }[] }[];
  }): void {
    this.sections.clear();
    v.sections.forEach(s => this.sections.push(this.makeSection(s.title, s.bullets)));
    this.form.patchValue({
      code: v.code,
      title: v.title,
      description: v.description,
      icon: v.icon,
      is_active: v.is_active,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private makeBullet(id: number | null, title: string): BulletGroup {
    return this.fb.group({
      id: this.fb.control<number | null>(id),
      title: [title, [Validators.maxLength(250)]],
    });
  }

  private makeSection(title: string, bullets: { id: number | null; title: string }[]): SectionGroup {
    return this.fb.group({
      title: [title, [Validators.maxLength(200)]],
      bullets: this.fb.array<BulletGroup>(bullets.map(b => this.makeBullet(b.id, b.title))),
    });
  }

  private nextCode(): string {
    const used = new Set(this.items().map(s => (s.code ?? '').toUpperCase()));
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      if (!used.has(letter)) return letter;
    }
    return '';
  }

  // ===== sections & bullets editing =====
  addSection(): void {
    this.sections.push(this.makeSection('', [{ id: null, title: '' }]));
  }

  removeSection(i: number): void {
    this.sections.removeAt(i);
    if (!this.sections.length) this.addSection();
    this.form.markAsDirty();
  }

  addBullet(section: SectionGroup): void {
    this.bullets(section).push(this.makeBullet(null, ''));
  }

  removeBullet(section: SectionGroup, i: number): void {
    this.bullets(section).removeAt(i);
    this.form.markAsDirty();
  }

  /** Enter in the last bullet adds a new one and focuses it. */
  onBulletEnter(event: Event, section: SectionGroup, i: number): void {
    event.preventDefault();
    const arr = this.bullets(section);
    if (i !== arr.length - 1 || !arr.at(i).controls.title.value.trim()) return;

    const block = (event.target as HTMLElement).closest('.section-block');
    this.addBullet(section);
    setTimeout(() => {
      const inputs = block?.querySelectorAll<HTMLInputElement>('.bullet-input');
      inputs?.[inputs.length - 1]?.focus();
    });
  }

  pickIcon(cls: string): void {
    const ctrl = this.form.controls.icon;
    ctrl.setValue(ctrl.value === cls ? null : cls);
    ctrl.markAsDirty();
  }

  formBulletTotal(): number {
    return this.sections.controls.reduce(
      (n, s) => n + this.bullets(s).controls.filter(b => b.controls.title.value.trim()).length,
      0
    );
  }

  // ===== save =====
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const items: ServicePayload['items'] = [];
    for (const s of v.sections) {
      const group = s.title.trim() || null;
      for (const b of s.bullets) {
        const title = b.title.trim();
        if (title) items.push({ id: b.id, title, group_title: group });
      }
    }

    const body: ServicePayload = {
      code: v.code.trim().toUpperCase() || null,
      title: v.title.trim(),
      description: v.description.trim(),
      icon: v.icon,
      is_active: v.is_active,
      items,
    };

    const id = this.editingId();
    this.saving.set(true);

    (id !== null ? this.api.update(id, body) : this.api.create(body))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: saved => {
          this.items.update(list =>
            id !== null ? list.map(s => (s.id === saved.id ? saved : s)) : [...list, saved]
          );
          this.drawerOpen.set(false);
          this.editingId.set(null);
        },
        error: err => applyServerErrors(this.form, err),
      });
  }

  // ===== quick actions =====
  toggleActive(service: Service, event: Event): void {
    event.stopPropagation();
    if (this.togglingId() !== null) return;
    this.togglingId.set(service.id);
    this.api
      .update(service.id, { is_active: !service.is_active })
      .pipe(finalize(() => this.togglingId.set(null)))
      .subscribe({
        next: saved => this.items.update(list => list.map(s => (s.id === saved.id ? saved : s))),
      });
  }

  toggleExpanded(id: number): void {
    this.expandedId.update(cur => (cur === id ? null : id));
  }

  confirmDelete(id: number): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.items.update(list => list.filter(s => s.id !== id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
  }

  groupLabels(service: Service): string[] {
    return [...new Set(service.items.map(i => i.group_title).filter((g): g is string => !!g))];
  }

  // ===== drag & drop reorder =====
  onDragStart(service: Service, event: DragEvent): void {
    if (!this.canReorder()) {
      event.preventDefault();
      return;
    }
    this.dragId.set(service.id);
    event.dataTransfer?.setData('text/plain', String(service.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(service: Service, event: DragEvent): void {
    if (this.dragId() === null) return;
    event.preventDefault();
    this.overId.set(service.id);
  }

  onDragEnd(): void {
    this.dragId.set(null);
    this.overId.set(null);
  }

  onDrop(target: Service, event: DragEvent): void {
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
    this.persistOrder(list, before);
  }

  /** Button alternative to dragging (also works on touch screens). */
  move(service: Service, delta: -1 | 1): void {
    const before = this.items();
    const list = [...before];
    const i = list.findIndex(s => s.id === service.id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    this.persistOrder(list, before);
  }

  private persistOrder(list: Service[], before: Service[]): void {
    this.items.set(list); // optimistic
    this.api.reorder(list.map(s => s.id)).subscribe({
      next: fresh => this.items.set(fresh),
      error: () => {
        this.items.set(before);
        this.toast.warning('Could not save the new order. It was restored.');
      },
    });
  }
}
