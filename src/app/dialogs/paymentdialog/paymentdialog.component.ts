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
import { requestProvider } from 'webln';

enum PaymentPhase {
    SelectingTarget = 1,
    SelectingAmount,
    RetrievingInvoice,
    FailedRetrievingInvoice,
    AwaitingPayment,
    PaymentTimedOut,
    SendingTransfer,
    PaymentSuccess,
    PaymentFailed,
    TransferSuccess,
    TransferFailed,
    ShowingResult
}

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
    PaymentPhase = PaymentPhase;

    // Configurations
    minAmount = 100;
    maxAmount = 500000;

    // UI

    title = null;
    message = null;
    subMessage = null;

    // Life Cycle
    phase: PaymentPhase = null;

    awaitingPaymentInterval = null;

    // Target Selection
    target = null;
    targetUsername = null;

    // Amount Selection
    amount: number = null;

    selectedRow: number = null;
    selectedColumn: number = null;

    suggestedAmounts = [
        [1000, 2000, 5000],
        [10000, 20000, 50000],
        [100000, 200000, 500000]
    ];

    // Payment Information

    paymentRequest = null;
    rHash = null;

    timeoutElapsedRatio = 0;
    invoiceTimeout = 300;
    invoiceExpirationTimestamp = null;

    // Result

    success = false;

    // WebLN
    webln = null;

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
            } else {
                this.title = 'Lightning Network City';
            }
            if (data.target) {
                this.target = data.target;
            } else {
                if (!this.phase) {
                    this.jumpToPhase(PaymentPhase.SelectingTarget);
                }
            }
            if (data.amount) {
                this.amount = data.amount;
            } else {
                if (!this.phase) {
                    this.jumpToPhase(PaymentPhase.SelectingAmount);
                }
            }
        }
    }

    // Component Lyfe Cycle

    ngAfterViewInit() {
        try {
            requestProvider().then(result => {
                this.webln = result;
            });
        } catch (err) {}
    }

    ngOnDestroy() {
        if (this.awaitingPaymentInterval) {
            clearInterval(this.awaitingPaymentInterval);
            this.awaitingPaymentInterval = null;
        }
    }

    closeWithResult(success: boolean) {
        this.userService.reloadAccount();
        setTimeout(() => {
            this.dialogRef.close({
                success,
                amount: this.amount
            });
        }, 2000);
    }

    updateDialogSize(width, height) {
        setTimeout(() => {
            this.dialogRef.updateSize(width + 'px', height + 'px');
        });
    }

    // Phase Management Methods

    jumpToPhase(phase: PaymentPhase, data = null) {
        this.phase = phase;
        this.updateDialogSize(400, 400);

        switch (phase) {
            case PaymentPhase.SelectingTarget:
                this.message = 'Select target:';
                break;
            case PaymentPhase.SelectingAmount:
                this.message = 'Select amount:';
                break;
            case PaymentPhase.RetrievingInvoice:
                this.message = 'Retrieving invoice...';
                break;
            case PaymentPhase.AwaitingPayment:
                this.message = null;
                this.updateDialogSize(400, 700);
                break;
            case PaymentPhase.FailedRetrievingInvoice:
                this.message = 'Failed generating payment invoice';
                this.jumpToPhase(PaymentPhase.ShowingResult, false);
                break;
            case PaymentPhase.PaymentTimedOut:
                this.message = 'Payment Timed Out';
                this.jumpToPhase(PaymentPhase.ShowingResult, false);
                break;
            case PaymentPhase.PaymentSuccess:
                this.message = 'Payment Success';
                this.jumpToPhase(PaymentPhase.ShowingResult, true);
                break;
            case PaymentPhase.PaymentFailed:
                this.message = 'Payment Failed';
                this.jumpToPhase(PaymentPhase.ShowingResult, false);
                break;
            case PaymentPhase.SendingTransfer:
                this.message = 'Transferring funds...';
                break;
            case PaymentPhase.TransferSuccess:
                this.message = 'Transfer Success';
                this.jumpToPhase(PaymentPhase.ShowingResult, true);
                break;
            case PaymentPhase.TransferFailed:
                this.message = 'Transfer Failed';
                if (this.paymentRequest) {
                    this.subMessage =
                        'Any deposited funds will be credited to your balance.';
                }
                this.jumpToPhase(PaymentPhase.ShowingResult, false);
                break;
            case PaymentPhase.ShowingResult:
                this.success = data;
                this.closeWithResult(data);
                break;
        }
    }

    // Target Selection

    targetSelectionComplete() {
        this.target = 'user/' + this.targetUsername;
        if (this.amount) {
            this.amountSelectionComplete();
        } else {
            this.jumpToPhase(PaymentPhase.SelectingAmount);
        }
    }

    // Amount Selection

    amountSelectionComplete() {
        const targetComponents = this.target.split('/');
        if (
            targetComponents[0] === 'balance' ||
            this.appService.user.balance < this.amount
        ) {
            this.jumpToPhase(PaymentPhase.RetrievingInvoice);
            this.retrievePaymentInvoice();
        } else {
            this.sendTransfer();
        }
    }

    selectAmount(row, column) {
        this.selectedRow = row;
        this.selectedColumn = column;
        this.amount = this.suggestedAmounts[row][column];
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

    // Payments

    retrievePaymentInvoice() {
        this.balanceService
            .depositBalance(this.amount)
            .then(response => {
                this.paymentRequest = response.payment_request;
                this.rHash = response.r_hash;
                this.jumpToPhase(PaymentPhase.AwaitingPayment);
                this.awaitPayment();
                if (this.webln) {
                    this.webln
                        .sendPayment(this.paymentRequest)
                        .then(result => {
                            // Do nothing
                        })
                        .catch(error => {
                            this.stopAwaitingPayment();
                            this.jumpToPhase(PaymentPhase.PaymentFailed);
                        });
                }
            })
            .catch(error => {
                this.jumpToPhase(PaymentPhase.FailedRetrievingInvoice);
            });
    }

    stopAwaitingPayment() {
        if (this.awaitingPaymentInterval) {
            clearInterval(this.awaitingPaymentInterval);
            this.awaitingPaymentInterval = null;
        }
    }

    handleStatusInvoice(statusInvoice) {
        const currentT = Math.floor(Date.now() / 1000);

        this.invoiceExpirationTimestamp =
            +statusInvoice.creation_date + +statusInvoice.expiry;
        this.invoiceTimeout = +statusInvoice.expiry;

        this.timeoutElapsedRatio =
            1 -
            (this.invoiceExpirationTimestamp - currentT) / this.invoiceTimeout;

        if (statusInvoice.settled) {
            this.stopAwaitingPayment();
            if (this.target === 'balance') {
                this.jumpToPhase(PaymentPhase.PaymentSuccess);
            } else {
                this.sendTransfer();
            }
        } else if (this.timeoutElapsedRatio > 1) {
            this.stopAwaitingPayment();
            this.jumpToPhase(PaymentPhase.PaymentTimedOut);
        }
    }

    awaitPayment() {
        let step = 0;
        this.awaitingPaymentInterval = setInterval(() => {
            if (step % 6 === 0) {
                this.paymentService
                    .getInvoice(this.rHash)
                    .then((statusInvoice: any) => {
                        this.handleStatusInvoice(statusInvoice);
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

    // Transfer

    sendTransfer() {
        this.jumpToPhase(PaymentPhase.SendingTransfer);
        this.paymentService
            .tipTarget(this.target, this.amount)
            .then(result => {
                this.jumpToPhase(PaymentPhase.TransferSuccess);
            })
            .catch(error => {
                this.jumpToPhase(PaymentPhase.TransferFailed);
            });
    }

    // Result
}
