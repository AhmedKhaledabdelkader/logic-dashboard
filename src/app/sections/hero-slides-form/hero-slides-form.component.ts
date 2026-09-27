import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HeroSlide, HeroSlidePayload } from '../../core/models/home.models';
import { ImageValue } from '../../core/models/image-value.model';
import { HomePageService } from '../../core/services/home-page.service';
import { fileOrNull } from '../../core/utils/form-data';
import { applyServerErrors } from '../../core/utils/http-error';
import { imageFileValidator, notBlank } from '../../core/utils/validators';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { SectionCardComponent } from '../../shared/components/section-card/section-card.component';

@Component({
  selector: 'app-hero-slides-form',
  imports: [ReactiveFormsModule, SectionCardComponent, ImageUploadComponent, FieldErrorComponent],
  templateUrl: './hero-slides-form.component.html',
})
export class HeroSlidesFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(HomePageService);

  readonly MAX = 6;
  loading = signal(true);
  saving = signal(false);

  form = this.fb.group({
    slides: this.fb.array([this.newSlide()], {
      validators: [Validators.minLength(1), Validators.maxLength(this.MAX)],
    }),
  });

  get slides() { return this.form.controls.slides; }

  private newSlide(slide?: Partial<HeroSlide>) {
    return this.fb.group({
      id: this.fb.control<number | null>(slide?.id ?? null),
      title: [slide?.title ?? '', [Validators.required, notBlank, Validators.minLength(3), Validators.maxLength(100)]],
      subtitle: [slide?.subtitle ?? '', [Validators.required, notBlank, Validators.maxLength(250)]],
      image: this.fb.control<ImageValue>(slide?.image ?? null, [Validators.required, imageFileValidator()]),
    });
  }

  private setSlides(list: HeroSlide[]) {
    this.slides.clear();
    list.forEach(s => this.slides.push(this.newSlide(s)));
  }

  ngOnInit() {
    this.api.getSlides().pipe(finalize(() => this.loading.set(false))).subscribe(list => {
      if (list?.length) this.setSlides(list);
    });
  }

  add() { if (this.slides.length < this.MAX) this.slides.push(this.newSlide()); }
  remove(i: number) { if (this.slides.length > 1) this.slides.removeAt(i); }

  move(i: number, step: -1 | 1) {
    const j = i + step;
    if (j < 0 || j >= this.slides.length) return;
    const control = this.slides.at(i);
    this.slides.removeAt(i);
    this.slides.insert(j, control);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    // title + subtitle as text, image as a File (only when the user picked a new one)
    const slides: HeroSlidePayload[] = this.form.getRawValue().slides.map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      image: fileOrNull(s.image),
    }));

    this.saving.set(true);
    this.api.saveSlides(slides).pipe(finalize(() => this.saving.set(false))).subscribe({
      // reload from the response so every image now points to its saved URL
      next: res => { if (res.data?.length) this.setSlides(res.data); },
      error: err => applyServerErrors(this.form, err),
    });
  }
}