import { Component, OnInit } from '@angular/core';
import { AppService } from './services/app.service';
import { PaymentDialogComponent } from './dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { WithdrawalDialogComponent } from './dialogs/withdrawaldialog/withdrawaldialog.component';
import { Router } from '@angular/router';
import { RegisterDialogComponent } from './dialogs/registerdialog/registerdialog.component';
import { SwitchAccountDialogComponent } from './dialogs/switchaccountdialog/switchaccountdialog.component';
import { NotificationService } from './services/notification.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    mobileMenuOptions = [];
    menuOptions = [
        {
            titleMethod: 'getAccountTitle',
            isWarn: 'hasUnseenNotifications',
            type: 'menu',
            subtitle: 'getBalance',
            mobileMenu: false,
            options: [
                {
                    name: 'Activity',
                    type: 'separator'
                },
                {
                    title: 'Activity',
                    type: 'navigate',
                    navigate: '/activity',
                    isWarn: 'hasUnseenNotifications'
                },
                {
                    name: 'Balance',
                    type: 'separator'
                },
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
                    title: 'Transfer Funds',
                    type: 'action',
                    action: 'sendFundsToUser'
                },
                {
                    name: 'Account',
                    type: 'separator'
                },
                {
                    title: 'My Tipping Page',
                    type: 'navigate',
                    navigate: 'tipping'
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
                },
                {
                    title: 'Log out',
                    type: 'action',
                    action: 'logOut',
                    condition: 'isLogOutVisible'
                }
            ]
        },
        {
            title: 'Blog',
            type: 'navigate',
            navigate: '/blog',
            mobileMenu: true
        },
        {
            title: 'Games',
            type: 'menu',
            mobileMenu: true,
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
                },
                {
                    title: 'Poker',
                    type: 'navigate',
                    navigate: '/poker'
                }
            ]
        },
        {
            title: 'Node',
            type: 'navigate',
            navigate: '/node',
            mobileMenu: true
        } /*,
        {
            title: 'Tip',
            type: 'action',
            action: 'tip',
            mobileMenu: true
        }*/
    ];

    mobileMenuShowing = false;

    constructor(
        public appService: AppService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.mobileMenuOptions = [];
        for (const option of this.menuOptions.slice().reverse()) {
            if (option.mobileMenu) {
                this.mobileMenuOptions.push(option);
            }
        }
    }

    ngOnInit() {
        this.notificationService.updateNotificationCounts();
        setInterval(() => {
            this.notificationService.updateNotificationCounts();
        }, 30000);
    }

    tip() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            target: 'lncity'
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }

    depositBalance() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            target: 'balance'
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

    sendFundsToUser() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {};

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }

    clickedOption(option) {
        if (option.type === 'navigate') {
            this.mobileMenuShowing = false;
            this.router.navigateByUrl(option.navigate);
        } else if (option.type === 'action') {
            this.mobileMenuShowing = false;
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

    isLogOutVisible() {
        if (this.appService.user) {
            return this.appService.user.username != null;
        }
        return false;
    }

    logOut() {
        this.appService.clearUserAndAuth();
        window.location.reload();
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

    checkIsWarn(option) {
        if (option.isWarn) {
            return this[option.isWarn]();
        }
        return false;
    }

    hasUnseenNotifications() {
        return this.notificationService.notificationCounts.unseen !== 0;
    }

    toggleMobileMenu() {
        this.mobileMenuShowing = !this.mobileMenuShowing;
    }
}
