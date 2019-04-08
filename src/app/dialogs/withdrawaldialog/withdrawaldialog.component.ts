import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AccountService } from 'src/app/services/account.service';

@Component({
    selector: 'app-withdrawaldialog',
    templateUrl: './withdrawaldialog.component.html',
    styleUrls: ['./withdrawaldialog.component.less']
})
export class WithdrawalDialogComponent implements AfterViewInit {
    title = 'Lightning Network City';
    message = 'Paste a payment request here:';

    paymentRequest = '';

    loading = false;

    paymentCompleted = false;
    paymentSuccess = false;
    paymentMessage = '';
    paymentResultMessage = '';

    constructor(
        public dialogRef: MatDialogRef<WithdrawalDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private accountService: AccountService
    ) {
        if (data) {
            if (data.title) {
                this.title = data.title;
            }
            if (data.message) {
                this.message = data.message;
            }
        }
    }

    ngAfterViewInit() {
        this.dialogRef.updateSize('400px', '400px');
    }

    withdrawPaymentRequest() {
        this.loading = true;
        this.accountService
            .withdrawBalance(this.paymentRequest)
            .then(result => {
                this.loading = false;
                this.paymentCompleted = true;
                this.paymentSuccess = true;
                this.paymentMessage = 'Withdrawal succeeded!';
                this.accountService.reloadAccount();
                setTimeout(() => {
                    this.dialogRef.close();
                }, 2000);
            })
            .catch(error => {
                this.loading = false;
                this.paymentCompleted = true;
                this.paymentSuccess = false;
                this.paymentMessage = 'Withdrawal failed.';
                this.paymentResultMessage = error.error;
                setTimeout(() => {
                    this.dialogRef.close();
                }, 2000);
            });
    }
}
