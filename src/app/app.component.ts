import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { PaymentDialogComponent } from './dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    menuOptions = [
        {
            title: 'Account',
            type: 'menu',
            subtitle: 'getBalance',
            options: [
                {
                    title: 'Deposit',
                    type: 'action',
                    action: 'depositBalance'
                },
                {
                    title: 'Withdraw',
                    type: 'action',
                    action: 'withdrawBalance'
                } /*,
                {
                    title: 'Register Account',
                    type: 'action',
                    action: this.registerAccount
                },
                {
                    title: 'Switch Account',
                    type: 'action',
                    action: this.switchAccount
                }*/
            ]
        },
        {
            title: 'Blog',
            type: 'navigate',
            navigate: '/blog'
        },
        {
            title: 'Tutorials',
            type: 'navigate',
            navigate: '/tutorials'
        },
        {
            title: 'Games',
            type: 'menu',
            options: [
                {
                    title: 'Slot Machine',
                    type: 'navigate',
                    navigate: '/slot'
                },
                {
                    title: 'Roulette',
                    type: 'navigate',
                    navigate: '/roulette'
                }
            ]
        }
    ];

    constructor(
        public appService: AppService,
        private dialog: MatDialog,
        private router: Router
    ) {}

    depositBalance() {
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

    clickedOption(option) {
        if (option.type === 'navigate') {
            this.router.navigateByUrl(option.navigate);
        } else if (option.type === 'action') {
            this[option.action]();
        }
        return true;
    }

    getBalance() {
        return this.appService.user.balance;
    }
}
