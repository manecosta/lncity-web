import {
    Component,
    Inject,
    PipeTransform,
    Pipe,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PaymentService } from 'src/app/services/payment.service';
import { BalanceService } from 'src/app/services/balance.service';
import { UserService } from 'src/app/services/user.service';
import { AppService } from 'src/app/services/app.service';

@Pipe({ name: 'amountPipe' })
export class AmountPipe implements PipeTransform {
    transform(value: number, exponent: string): string {
        const components = [];
        while (value > 0) {
            let component = '';
            if (value > 999) {
                component = ('000' + (value % 1000)).slice(-3);
            } else {
                component = '' + value;
            }

            components.push(component);
            value = Math.floor(value / 1000);
        }
        return components.reverse().join(' ');
    }
}

@Component({
    selector: 'app-paymentdialog',
    templateUrl: './paymentdialog.component.html',
    styleUrls: ['./paymentdialog.component.less']
})
export class PaymentDialogComponent implements AfterViewInit, OnDestroy {
    Math = Math;

    title = 'Lightning Network City';
    message = 'Select an amount to deposit (satoshi):';

    userTarget = '';
    target = 'balance';

    addedFunds = false;

    amount: number = null;
    selectedRow: number = null;
    selectedColumn: number = null;

    minAmount = 100;
    maxAmount = 500000;

    suggestedAmounts = [
        [1000, 2000, 5000],
        [10000, 20000, 50000],
        [100000, 200000, 500000]
    ];

    selectingAmount = false;
    selectingTarget = false;
    loading = false;
    awaitingPayment = false;
    paymentTimeout = false;
    paymentSuccess = false;

    generatedInvoicePaymentRequest = null;
    generatedInvoiceRHash = null;

    invoiceTimeout = null;
    invoiceExpirationTimestamp = 0;
    timeoutElapsedRatio = 0;
    checkInvoiceInterval = null;

    constructor(
        public dialogRef: MatDialogRef<PaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private paymentService: PaymentService,
        private balanceService: BalanceService,
        private userService: UserService,
        private appService: AppService
    ) {
        if (data) {
            if (data.title) {
                this.title = data.title;
            }
            if (data.message) {
                this.message = data.message;
            }
            if (data.amount) {
                this.amount = data.amount;
                this.performPayment();
            }
            if (data.target) {
                this.target = data.target;
                this.selectingAmount = true;
            } else {
                this.selectingTarget = true;
            }
        }
    }

    ngAfterViewInit() {
        this.dialogRef.updateSize('400px', '400px');
    }

    ngOnDestroy() {
        if (this.checkInvoiceInterval) {
            clearInterval(this.checkInvoiceInterval);
            this.checkInvoiceInterval = null;
        }
    }

    selectAmount(row, column) {
        this.selectedRow = row;
        this.selectedColumn = column;
        this.amount = this.suggestedAmounts[row][column];
    }

    generatedInvoiceSuccessHandler(generatedInvoice) {
        this.loading = false;
        this.generatedInvoicePaymentRequest = generatedInvoice.payment_request;
        this.generatedInvoiceRHash = generatedInvoice.r_hash;
        this.awaitingPayment = true;
        let step = 0;
        this.checkInvoiceInterval = setInterval(() => {
            if (step % 6 === 0) {
                this.paymentService
                    .getInvoice(this.generatedInvoiceRHash)
                    .then((statusInvoice: any) => {
                        const currentT = Math.floor(Date.now() / 1000);
                        this.invoiceExpirationTimestamp =
                            +statusInvoice.creation_date +
                            +statusInvoice.expiry;
                        this.invoiceTimeout = +statusInvoice.expiry;
                        this.timeoutElapsedRatio =
                            1 -
                            (this.invoiceExpirationTimestamp - currentT) /
                                this.invoiceTimeout;
                        if (
                            statusInvoice.settled ||
                            this.timeoutElapsedRatio > 1
                        ) {
                            if (!this.paymentSuccess && !this.paymentTimeout) {
                                this.awaitingPayment = false;
                                if (statusInvoice.settled) {
                                    this.paymentSuccess = true;
                                } else {
                                    this.paymentTimeout = true;
                                }
                                clearInterval(this.checkInvoiceInterval);
                                this.generatedInvoicePaymentRequest = null;
                                this.generatedInvoiceRHash = null;
                                this.dialogRef.updateSize('400px', '400px');
                                if (this.target === 'balance') {
                                    this.userService.reloadAccount();
                                    setTimeout(() => {
                                        this.dialogRef.close(true);
                                    }, 2000);
                                } else {
                                    this.loading = true;
                                    this.performTip();
                                }
                            }
                        }
                    })
                    .catch(error => {});
            } else if (this.invoiceExpirationTimestamp) {
                const currentT = Math.floor(Date.now() / 1000);
                this.timeoutElapsedRatio =
                    1 -
                    (this.invoiceExpirationTimestamp - currentT) /
                        this.invoiceTimeout;
            }
            step += 1;
        }, 500);
    }

    performTip() {
        this.paymentService
            .tipTarget(this.target, this.amount)
            .then(_ => {
                this.loading = false;
                this.userService.reloadAccount();
                this.paymentSuccess = true;
                setTimeout(() => {
                    this.dialogRef.close({
                        target: this.target,
                        amount: this.amount
                    });
                }, 2000);
            })
            .catch(error => {
                this.loading = false;
                this.paymentSuccess = false;
                this.userService.reloadAccount();
                setTimeout(() => {
                    this.dialogRef.close(false);
                }, 2000);
            });
    }

    performPayment() {
        this.selectingAmount = false;
        this.loading = true;
        if (
            this.target === 'balance' ||
            this.appService.user.balance < this.amount
        ) {
            this.dialogRef.updateSize('400px', '700px');
            this.addedFunds = true;
            this.balanceService
                .depositBalance(this.amount)
                .then(response => {
                    this.generatedInvoiceSuccessHandler(response);
                })
                .catch(error => {
                    this.loading = false;
                });
        } else {
            this.performTip();
        }
    }

    selectTarget() {
        this.target = 'user/' + this.userTarget;
        this.selectingTarget = false;
        this.selectingAmount = true;
    }

    amountInputChanged(event) {
        const newValue = +event.target.value;
        for (let row = 0; row < this.suggestedAmounts.length; row++) {
            const rowAmounts = this.suggestedAmounts[row];
            for (let column = 0; column < rowAmounts.length; column++) {
                const suggestedValue = rowAmounts[column];
                if (suggestedValue === newValue) {
                    this.selectedRow = row;
                    this.selectedColumn = column;
                    return true;
                }
            }
        }
        this.selectedRow = null;
        this.selectedColumn = null;
    }
}
