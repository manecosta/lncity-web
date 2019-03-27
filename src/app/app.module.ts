import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { MainComponent } from './components/main/main.component';
import {
    Router,
    RouterEvent,
    NavigationStart,
    ResolveStart
} from '@angular/router';
import { AppService } from './services/app.service';

@NgModule({
    declarations: [AppComponent, ComingSoonComponent, MainComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [AppService],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private router: Router) {
        router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                console.log(event);
                AppService.instance.isInside =
                    event.url !== '/comingsoon' && event.url !== '/';
            }
        });
    }
}
