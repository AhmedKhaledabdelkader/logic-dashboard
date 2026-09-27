import { Component } from '@angular/core';
import { HeroSlidesFormComponent } from './../../sections/hero-slides-form/hero-slides-form.component';
import { RegionalFormComponent } from '../../sections/regional-form/regional-form.component';
import { StatsFormComponent } from '../../sections/stats-form/stats-form.component';
import { VideoFormComponent } from '../../sections/video-form/video-form.component';
import { FeaturedInsightsFormComponent } from './sections/featured-insights-form/featured-insights-form.component';

@Component({
  selector: 'app-home-page',
  imports: [HeroSlidesFormComponent, RegionalFormComponent, StatsFormComponent, VideoFormComponent],
  template: `
    <div class="page-head">
      <h1>Home Page</h1>
      <p>Edit the sections of the website's home page. Each section is saved on its own.</p>
    </div>

    <app-hero-slides-form />
    <app-regional-form />
    <app-stats-form />
    <app-video-form />
 
    
    `,

})
export class HomePageComponent {}