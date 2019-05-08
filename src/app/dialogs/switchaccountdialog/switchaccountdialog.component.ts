import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AccountService } from 'src/app/services/account.service';

@Component({
    selector: 'app-switchaccountdialog',
    templateUrl: './switchaccountdialog.component.html',
    styleUrls: ['./switchaccountdialog.component.less']
})
export class SwitchAccountDialogComponent implements AfterViewInit {
    title = 'Lightning Network City';

    username = '';
    password = '';

    loading = false;
    requestCompleted = false;
    requestSuccess = false;

    failureMessage = 'Login Failed.';

    constructor(
        public dialogRef: MatDialogRef<SwitchAccountDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private accountService: AccountService
    ) {
        if (data) {
            if (data.title) {
                this.title = data.title;
            }
        }
    }

    ngAfterViewInit() {
        this.dialogRef.updateSize('400px', '360px');
    }

    loginToAccount() {
        if (this.username !== '' && this.password !== '') {
            this.loading = true;
            this.accountService
                .loginToAccount(this.username, this.password)
                .then(response => {
                    this.loading = false;
                    this.requestCompleted = true;
                    this.requestSuccess = true;

                    setTimeout(() => {
                        this.dialogRef.close();
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    this.loading = false;
                    this.requestCompleted = true;
                    this.requestSuccess = false;

                    if (error.status === 409) {
                        this.failureMessage = 'Username already taken!';
                        setTimeout(() => {
                            this.requestCompleted = false;
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            this.dialogRef.close();
                        }, 2000);
                    }
                });
        }
    }
}
