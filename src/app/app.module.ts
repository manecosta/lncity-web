import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './services/app.service';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material';
import {
    PaymentDialogComponent,
    AmountPipe
} from './dialogs/paymentdialog/paymentdialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentService } from './services/payment.service';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from './services/request.service';
import { QRCodeModule } from 'angularx-qrcode';
import { RouletteGameComponent } from './components/games/roulette/roulette.component';
import { LocalStorage } from './services/localstorage.service';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { BalanceService } from './services/balance.service';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';
import { SlotMachinGameComponent } from './components/games/slotmachine/slotmachine.component';
import { GameService } from './services/game.service';
import { BlogComponent } from './components/blog/blog.component';
import { NodeComponent } from './components/node/node.component';
import { RegisterDialogComponent } from './dialogs/registerdialog/registerdialog.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { SwitchAccountDialogComponent } from './dialogs/switchaccountdialog/switchaccountdialog.component';
import { BlogService } from './services/blog.service';
import { NotificationService } from './services/notification.service';
import { ActivityComponent } from './components/activity/activity.component';
import { PokerGameComponent } from './components/games/poker/poker.component';
import { TippingComponent } from './components/tipping/tipping.component';
import { FAQComponent } from './components/faq/faq.component';

@NgModule({
    declarations: [
        AppComponent,
        PaymentDialogComponent,
        WithdrawalDialogComponent,
        RegisterDialogComponent,
        SwitchAccountDialogComponent,
        AmountPipe,
        RouletteGameComponent,
        SlotMachinGameComponent,
        PokerGameComponent,
        HomeComponent,
        BlogComponent,
        NodeComponent,
        ActivityComponent,
        TippingComponent,
        FAQComponent
    ],
    entryComponents: [
        PaymentDialogComponent,
        WithdrawalDialogComponent,
        RegisterDialogComponent,
        SwitchAccountDialogComponent
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
        UserService,
        BalanceService,
        GameService,
        BlogService,
        NotificationService,
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
        private userService: UserService
    ) {
        if (!this.appService.user) {
            this.requestService.register();
        } else {
            this.userService.reloadAccount();
        }
    }
}
