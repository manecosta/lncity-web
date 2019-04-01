import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { Router, RouterEvent, NavigationStart } from '@angular/router';
import { AppService } from './services/app.service';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material';
import {
    PaymentDialogComponent,
    AmountPipe
} from './dialogs/paymentdialog/paymentdialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentService } from './services/payment.service';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { RequestService } from './services/request.service';
import { QRCodeModule } from 'angularx-qrcode';
import { RouletteGameComponent } from './components/games/roulette/roulette.component';
import { LocalStorage } from './services/localstorage.service';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { User } from './models/user';

@NgModule({
    declarations: [
        AppComponent,
        ComingSoonComponent,
        PaymentDialogComponent,
        AmountPipe,
        RouletteGameComponent,
        HomeComponent
    ],
    entryComponents: [PaymentDialogComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        HttpClientModule,
        QRCodeModule,
        FormsModule
    ],
    providers: [
        AppService,
        PaymentService,
        RequestService,
        LocalStorage,
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { hasBackdrop: false }
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(
        private router: Router,
        private appService: AppService,
        private requestService: RequestService
    ) {
        router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                AppService.instance.isInside =
                    event.url !== '/comingsoon' && event.url !== '/';
            }
        });

        if (!this.appService.user) {
            this.requestService
                .post('/users/register', {}, true)
                .then((response: HttpResponse<object>) => {
                    const user = new User(response.body);
                    this.appService.updateUserDetails(
                        user,
                        response.headers.get('x-auth-token'),
                        response.headers.get('x-refresh-token')
                    );
                });
        }
    }
}
