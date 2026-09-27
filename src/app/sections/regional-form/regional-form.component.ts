import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ImageValue } from '../../core/models/image-value.model';
import { HomePageService } from '../../core/services/home-page.service';
import { fileOrNull } from '../../core/utils/form-data';
import { applyServerErrors } from '../../core/utils/http-error';
import { imageFileValidator, notBlank } from '../../core/utils/validators';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { SectionCardComponent } from '../../shared/components/section-card/section-card.component';

@Component({
  selector: 'app-regional-form',
  imports: [ReactiveFormsModule, SectionCardComponent, ImageUploadComponent, FieldErrorComponent],
  templateUrl: './regional-form.component.html',
})
export class RegionalFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(HomePageService);

  readonly MAX_PARAGRAPH = 2000;
  loading = signal(true);
  saving = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, notBlank, Validators.minLength(3), Validators.maxLength(120)]],
    paragraph: ['', [Validators.required, notBlank, Validators.minLength(20), Validators.maxLength(this.MAX_PARAGRAPH)]],
    image: this.fb.control<ImageValue>(null, [Validators.required, imageFileValidator()]),
  });

  ngOnInit() {
    this.api.getRegional().pipe(finalize(() => this.loading.set(false))).subscribe(data => {
      if (data) this.form.patchValue(data);
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { title, paragraph, image } = this.form.getRawValue();

    this.saving.set(true);
    this.api.saveRegional({ title, paragraph, image: fileOrNull(image) })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: res => { if (res.data) this.form.patchValue(res.data); },   // image becomes the saved URL
        error: err => applyServerErrors(this.form, err),
      });
  }
}