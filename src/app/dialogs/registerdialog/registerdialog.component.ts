import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-registerdialog',
    templateUrl: './registerdialog.component.html',
    styleUrls: ['./registerdialog.component.less']
})
export class RegisterDialogComponent implements AfterViewInit {
    title = 'Lightning Network City';

    username = '';
    password = '';

    loading = false;
    requestCompleted = false;
    requestSuccess = false;

    failureMessage = 'Register Failed.';

    constructor(
        public dialogRef: MatDialogRef<RegisterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private userService: UserService
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

    addCredentials() {
        if (this.username !== '' && this.password !== '') {
            this.loading = true;
            this.userService
                .addCredentials(this.username, this.password)
                .then(response => {
                    this.loading = false;
                    this.requestCompleted = true;
                    this.requestSuccess = true;

                    setTimeout(() => {
                        this.dialogRef.close();
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
