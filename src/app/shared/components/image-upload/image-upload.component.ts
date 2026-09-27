import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageValue } from '../../../core/models/image-value.model';

@Component({
  selector: 'app-image-upload',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: ImageUploadComponent, multi: true }],
  template: `
    <div class="preview-box">
      @if (preview()) {
        <img [src]="preview()" alt="Preview">
      } @else {
        <div class="placeholder">
          <i class="bi bi-image"></i>
          <span>{{ fileName() ? 'Preview not available' : 'No image' }}</span>
        </div>
      }
    </div>

    <div class="d-flex gap-2 mt-2">
      <label class="btn btn-outline-primary btn-sm mb-0" [class.disabled]="disabled()">
        <i class="bi bi-upload me-1"></i> {{ preview() || fileName() ? 'Change image' : 'Choose image' }}
        <input type="file" hidden accept="image/jpeg,image/png,image/webp"
               [disabled]="disabled()" (change)="onFileSelected($event)">
      </label>
      @if (preview() || fileName()) {
        <button type="button" class="btn btn-outline-danger btn-sm" aria-label="Remove image" (click)="remove()">
          <i class="bi bi-trash"></i>
        </button>
      }
    </div>

    @if (fileName()) {
      <small class="d-block text-truncate mt-1"><i class="bi bi-paperclip"></i> {{ fileName() }}</small>
    }
    <small class="text-muted d-block mt-1">JPG, PNG or WebP · max 2 MB</small>`,
})
export class ImageUploadComponent implements ControlValueAccessor, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);

  preview = signal<SafeUrl | string | null>(null);
  fileName = signal<string | null>(null);
  disabled = signal(false);

  private objectUrl: string | null = null;
  private onChange: (v: ImageValue) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: ImageValue) { this.show(value); }
  registerOnChange(fn: (v: ImageValue) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { this.disabled.set(isDisabled); }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';                        // lets the user pick the same file again
    if (!file) return;

    this.show(file);
    this.onChange(file);                     // the form control now holds the File itself
    this.onTouched();                        // type / size errors are shown by the control's validators
  }

  remove() {
    this.show(null);
    this.onChange(null);
    this.onTouched();
  }

  private show(value: ImageValue) {
    this.revoke();

    if (value instanceof File) {
      this.fileName.set(value.name);
      if (value.type.startsWith('image/')) {
        this.objectUrl = URL.createObjectURL(value);
        this.preview.set(this.sanitizer.bypassSecurityTrustUrl(this.objectUrl));   // local blob we just created
      } else {
        this.preview.set(null);
      }
    } else {
      this.fileName.set(null);
      this.preview.set(value || null);       // existing image URL from the backend
    }
  }

  private revoke() {
    if (this.objectUrl) { URL.revokeObjectURL(this.objectUrl); this.objectUrl = null; }
  }

  ngOnDestroy() { this.revoke(); }
}