import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  template: `@if (text(); as t) { <div class="field-error"><i class="bi bi-exclamation-circle"></i> {{ t }}</div> }`,
  styles: `.field-error { margin-top: 6px; font-size: 13px; color: #dc3545; }`,
})
export class FieldErrorComponent {
  control = input.required<AbstractControl | null>();
  /** optional custom messages per error key, e.g. { pattern: '...' } */
  messages = input<Record<string, string>>({});

  text(): string | null {
    const c = this.control();
    if (!c?.errors || !(c.touched || c.dirty)) return null;

    const [key, value] = Object.entries(c.errors)[0];
    const custom = this.messages()[key];
    if (custom) return custom;

    switch (key) {
      case 'required':
      case 'blank':     return 'This field is required.';
      case 'minlength': return `Minimum ${value.requiredLength} characters (now ${value.actualLength}).`;
      case 'maxlength': return `Maximum ${value.requiredLength} characters.`;
      case 'pattern':   return 'Invalid format.';
      case 'youtube':   return 'Enter a valid YouTube link (watch, youtu.be, embed or shorts).';
      case 'server':    return String(value);
      case 'imageType': return 'Only JPG, PNG or WebP images are allowed.';
case 'imageSize': return `The image must be smaller than ${value.maxMb} MB.`;            // message coming from the backend
      default:          return 'Invalid value.';
    }
  }
}