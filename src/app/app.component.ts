import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { PaymentDialogComponent } from './dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';
import { Router } from '@angular/router';
import { RegisterDialogComponent } from './dialogs/registerdialog/registerdialog.component';
import { SwitchAccountDialogComponent } from './dialogs/switchaccountdialog/switchaccountdialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    menuOptions = [
        {
            titleMethod: 'getAccountTitle',
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
                },
                {
                    title: 'Register Account',
                    type: 'action',
                    action: 'registerAccount',
                    condition: 'isRegisterVisible'
                },
                {
                    title: 'Switch Account',
                    type: 'action',
                    action: 'switchAccount'
                }
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
        },
        {
            title: 'Donate',
            type: 'action',
            action: 'donate'
        }
    ];

    constructor(
        public appService: AppService,
        private dialog: MatDialog,
        private router: Router
    ) {}

    donate() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to donate (satoshi):',
            payingToBalance: false
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }

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
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {};

        const registerDialog = this.dialog.open(
            RegisterDialogComponent,
            dialogConfig
        );
    }

    switchAccount() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {};

        const registerDialog = this.dialog.open(
            SwitchAccountDialogComponent,
            dialogConfig
        );
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
        if (this.appService.user) {
            return this.appService.user.balance;
        } else {
            return 0;
        }
    }

    isRegisterVisible() {
        if (this.appService.user) {
            return this.appService.user.username == null;
        } else {
            return false;
        }
    }

    getAccountTitle() {
        if (this.appService.user && this.appService.user.username) {
            return this.appService.user.username;
        }
        return 'Account';
    }

    getMethodResult(methodName) {
        return this[methodName]();
    }
}
