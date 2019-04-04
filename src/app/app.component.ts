import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { PaymentDialogComponent } from './dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    menuOptions = [
        {
            title: 'Home',
            navigate: '/alpha'
        },
        {
            title: 'Roulette',
            navigate: '/roulette'
        }
    ];

    accountOptionsShowing = false;

    constructor(public appService: AppService, private dialog: MatDialog) {}

    toggleAccountOptions() {
        this.accountOptionsShowing = !this.accountOptionsShowing;
    }

    depositBalance() {
        this.accountOptionsShowing = false;

        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to deposit (satoshi):',
            payingToBalance: true
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }

    withdrawBalance() {
        this.accountOptionsShowing = false;

        console.log('Not implemented!');
    }
}
