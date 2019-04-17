import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { AccountService } from './services/account.service';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';
import { SlotMachinGameComponent } from './components/games/slotmachine/slotmachine.component';
import { GameService } from './services/game.service';
import { BlogComponent } from './components/blog/blog.component';
import { TutorialsComponent } from './components/tutorials/tutorials.component';
import { RegisterDialogComponent } from './dialogs/registerdialog/registerdialog.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
    declarations: [
        AppComponent,
        PaymentDialogComponent,
        WithdrawalDialogComponent,
        RegisterDialogComponent,
        AmountPipe,
        RouletteGameComponent,
        SlotMachinGameComponent,
        HomeComponent,
        BlogComponent,
        TutorialsComponent
    ],
    entryComponents: [
        PaymentDialogComponent,
        WithdrawalDialogComponent,
        RegisterDialogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        HttpClientModule,
        QRCodeModule,
        FormsModule,
        ZXingScannerModule
    ],
    providers: [
        AppService,
        PaymentService,
        RequestService,
        AccountService,
        GameService,
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
        private appService: AppService,
        private requestService: RequestService,
        private accountService: AccountService
    ) {
        if (!this.appService.user) {
            this.requestService.register();
        } else {
            this.accountService.reloadAccount();
        }
    }
}
