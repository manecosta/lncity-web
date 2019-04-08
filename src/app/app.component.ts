import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { PaymentDialogComponent } from './dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    menuOptions = [
        {
            title: 'Home',
            type: 'navigate',
            navigate: '/alpha'
        },
        {
            title: 'Games',
            type: 'menu',
            options: [
                {
                    title: 'Roulette',
                    type: 'navigate',
                    navigate: '/roulette'
                },
                {
                    title: 'Slot Machine',
                    type: 'navigate',
                    navigate: '/slot'
                }
            ]
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

        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message:
                'Paste a payment request here of up to ' +
                this.appService.user.balance +
                ' satoshi.'
        };

        const withdrawalDialog = this.dialog.open(
            WithdrawalDialogComponent,
            dialogConfig
        );
    }

    registerAccount() {
        console.log('Register');
    }

    switchAccount() {
        console.log('Switch');
    }
}
