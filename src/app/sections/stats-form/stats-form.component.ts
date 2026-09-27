import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  finalize,
} from 'rxjs';

import {
  StatItem,
} from '../../../app/core/models/home.models';

import {
  HomePageService,
} from '../../../app/core/services/home-page.service';

import {
  applyServerErrors,
} from '../../../app/core/utils/http-error';

import {
  notBlank,
} from '../../../app/core/utils/validators';

import {
  FieldErrorComponent,
} from '../../shared/components/field-error/field-error.component';

import {
  SectionCardComponent,
} from '../../shared/components/section-card/section-card.component';


@Component({
  selector: 'app-stats-form',

  imports: [
    ReactiveFormsModule,
    SectionCardComponent,
    FieldErrorComponent,
  ],

  templateUrl: './stats-form.component.html',
})
export class StatsFormComponent
  implements OnInit {


  // =========================================================
  // DEPENDENCIES
  // =========================================================

  private readonly fb = inject(
    NonNullableFormBuilder
  );

  private readonly api = inject(
    HomePageService
  );


  // =========================================================
  // CONSTANTS
  // =========================================================

  readonly MIN = 2;

  readonly MAX = 4;


  // =========================================================
  // STATE
  // =========================================================

  loading = signal(true);

  saving = signal(false);


  // =========================================================
  // FORM
  // =========================================================

  form = this.fb.group({

    stats: this.fb.array(

      [
        this.newStat(),
        this.newStat(),
      ],

      {
        validators: [
          Validators.minLength(
            this.MIN
          ),

          Validators.maxLength(
            this.MAX
          ),
        ],
      }

    ),

  });


  // =========================================================
  // GETTERS
  // =========================================================

  get stats() {

    return this.form.controls.stats;

  }


  // =========================================================
  // CREATE STAT FORM
  // =========================================================

  private newStat(
    stat?: Partial<StatItem>
  ) {

    return this.fb.group({

      id: this.fb.control<number | null>(
        stat?.id ?? null
      ),

      number: [

        stat?.number ?? '',

        [
          Validators.required,

          Validators.pattern(
            /^\d{1,6}[+%KkMm]?$/
          ),
        ],

      ],

      title: [

        stat?.title ?? '',

        [
          Validators.required,

          notBlank,

          Validators.minLength(3),

          Validators.maxLength(80),
        ],

      ],

    });

  }


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadStats();

  }


  // =========================================================
  // LOAD
  // =========================================================

  private loadStats(): void {

    this.api

      .getStats()

      .pipe(

        finalize(() =>
          this.loading.set(false)
        )

      )

      .subscribe({

        next: stats => {

          /**
           * Remove the two default statistics.
           */
          this.stats.clear();


          /**
           * Add statistics from backend.
           *
           * Maximum allowed = 4.
           */
          stats

            .slice(0, this.MAX)

            .forEach(stat => {

              this.stats.push(
                this.newStat(stat)
              );

            });


          /**
           * Always keep at least
           * two statistics.
           */
          while (
            this.stats.length < this.MIN
          ) {

            this.stats.push(
              this.newStat()
            );

          }

        },


        error: (error: unknown) => {

          console.error(
            'Failed to load statistics.',
            error
          );

        },

      });

  }


  // =========================================================
  // ADD
  // =========================================================

  add(): void {

    if (
      this.stats.length >= this.MAX
    ) {

      return;

    }


    this.stats.push(
      this.newStat()
    );

  }


  // =========================================================
  // REMOVE
  // =========================================================

  remove(
    index: number
  ): void {

    if (
      this.stats.length <= this.MIN
    ) {

      return;

    }


    this.stats.removeAt(index);

  }


  // =========================================================
  // SAVE
  // =========================================================

  save(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }


    this.saving.set(true);


    /**
     * Convert the FormArray
     * into StatItem[].
     */
    const statistics: StatItem[] =
      this.form.getRawValue().stats
        .map(stat => ({

          id: stat.id,

          number: stat.number,

          title: stat.title,

        }));


    /**
     * Send:
     *
     * {
     *   statistics: [...]
     * }
     *
     * to the Laravel API.
     */
    this.api

      .saveStats(statistics)

      .pipe(

        finalize(() =>
          this.saving.set(false)
        )

      )

      .subscribe({

        next: response => {

          /**
           * Synchronize the form
           * with the backend response.
           */
          if (
            response.data
          ) {

            this.stats.clear();


            response.data
              .slice(0, this.MAX)
              .forEach(stat => {

                this.stats.push(
                  this.newStat(stat)
                );

              });

          }

        },


        error: (error: unknown) => {

          applyServerErrors(
            this.form,
            error
          );

        },

      });

  }

}