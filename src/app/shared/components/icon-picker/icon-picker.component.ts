import { CommonModule } from '@angular/common';

import {
  Component,
  forwardRef,
  signal,
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { VALUE_ICON_OPTIONS } from '../../../core/constants/icon-options';


@Component({
  selector: 'app-icon-picker',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './icon-picker.component.html',

  styleUrl: './icon-picker.component.scss',

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true,
    },
  ],
})
export class IconPickerComponent implements ControlValueAccessor {

  options = VALUE_ICON_OPTIONS;

  selected = signal<string | null>(null);

  disabled = signal(false);


  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};


  select(iconClass: string): void {
    if (this.disabled()) return;

    this.selected.set(iconClass);
    this.onChange(iconClass);
    this.onTouched();
  }


  // ----- ControlValueAccessor -----

  writeValue(value: string | null): void {
    this.selected.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}