import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { finalize } from 'rxjs';

import { ImageValue } from '../../core/models/image-value.model';
import {
  AboutPagePayload,
  PresenceItem,
  ValueItem,
} from '../../core/models/about-page.models';
import { AboutPageService } from '../../core/services/about-page.service';

import { fileOrNull } from '../../core/utils/form-data';
import { applyServerErrors } from '../../core/utils/http-error';
import { imageFileValidator, notBlank } from '../../core/utils/validators';

import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { IconPickerComponent } from '../../shared/components/icon-picker/icon-picker.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { SectionCardComponent } from '../../shared/components/section-card/section-card.component';


@Component({
  selector: 'app-about-page-admin',

  imports: [
    ReactiveFormsModule,
    SectionCardComponent,
    ImageUploadComponent,
    IconPickerComponent,
    FieldErrorComponent,
  ],

  templateUrl: './about-page-admin.component.html',

  styleUrl: './about-page-admin.component.scss',
})
export class AboutPageAdminComponent implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);

  private readonly api = inject(AboutPageService);


  loading = signal(true);

  saving = signal(false);


  form = this.fb.group({

    heroTitle: [
      '',
      [Validators.required, notBlank, Validators.maxLength(150)],
    ],

    heroSubtitle: [
      '',
      [Validators.required, notBlank, Validators.maxLength(255)],
    ],

    storyTitle: [
      '',
      [Validators.required, notBlank, Validators.maxLength(150)],
    ],

    storyParagraph: [
      '',
      [Validators.required, notBlank],
    ],

    storyImage: this.fb.control<ImageValue>(
      null,
      [imageFileValidator()]
    ),

    presence: this.fb.array<ReturnType<AboutPageAdminComponent['buildPresenceGroup']>>([]),

    values: this.fb.array<ReturnType<AboutPageAdminComponent['buildValueGroup']>>([]),
  });


  get valuesArray(): FormArray {
    return this.form.controls.values;
  }

  get presenceArray(): FormArray {
    return this.form.controls.presence;
  }


  ngOnInit(): void {
    this.load();
  }


  private buildValueGroup(item?: ValueItem) {
    return this.fb.group({
      icon: [item?.icon ?? '', Validators.required],
      title: [item?.title ?? '', [Validators.required, Validators.maxLength(100)]],
      subtitle: [item?.subtitle ?? '', [Validators.required, Validators.maxLength(255)]],
    });
  }


  addValue(): void {
    this.valuesArray.push(this.buildValueGroup());
  }


  removeValue(index: number): void {
    this.valuesArray.removeAt(index);
  }


  private buildPresenceGroup(item?: PresenceItem) {
    return this.fb.group({
      title: [item?.title ?? '', [Validators.required, Validators.maxLength(150)]],
      subtitle: [item?.subtitle ?? '', [Validators.required, Validators.maxLength(255)]],
    });
  }


  addPresence(): void {
    this.presenceArray.push(this.buildPresenceGroup());
  }


  removePresence(index: number): void {
    this.presenceArray.removeAt(index);
  }


  private load(): void {

    this.loading.set(true);

    this.api
      .get()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({

        next: page => {

          this.valuesArray.clear();
          page.values.forEach(item =>
            this.valuesArray.push(this.buildValueGroup(item))
          );

          this.presenceArray.clear();
          page.presence.forEach(item =>
            this.presenceArray.push(this.buildPresenceGroup(item))
          );

          this.form.patchValue({
            heroTitle: page.hero_title,
            heroSubtitle: page.hero_subtitle,
            storyTitle: page.story_title,
            storyParagraph: page.story_paragraph,
            storyImage: page.story_image,
          });
        },

        error: error => {
          console.error('Failed to load About page.', error);
        },

      });
  }


  save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const body: AboutPagePayload = {
      hero_title: formValue.heroTitle,
      hero_subtitle: formValue.heroSubtitle,
      story_title: formValue.storyTitle,
      story_paragraph: formValue.storyParagraph,
      story_image: fileOrNull(formValue.storyImage),
      presence: formValue.presence,
      values: formValue.values,
    };

    this.saving.set(true);

    this.api
      .update(body)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({

        next: () => {
          // Form already reflects what was just saved; nothing to reset.
        },

        error: error => {
          applyServerErrors(this.form, error);
        },

      });
  }
}