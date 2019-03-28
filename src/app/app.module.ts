import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { MainComponent } from './components/main/main.component';
import { Router, RouterEvent, NavigationStart } from '@angular/router';
import { AppService } from './services/app.service';
import {
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatInputModule,
    MatButtonModule
} from '@angular/material';
import {
    PaymentDialogComponent,
    AmountPipe
} from './dialogs/paymentdialog/paymentdialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentService } from './services/payment.service';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from './services/request.service';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
    declarations: [
        AppComponent,
        ComingSoonComponent,
        MainComponent,
        PaymentDialogComponent,
        AmountPipe
    ],
    entryComponents: [PaymentDialogComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        HttpClientModule,
        QRCodeModule
    ],
    providers: [
        AppService,
        PaymentService,
        RequestService,
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { hasBackdrop: false }
        }
    ],
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
