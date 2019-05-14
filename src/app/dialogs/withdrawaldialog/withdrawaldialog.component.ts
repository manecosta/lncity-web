import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BalanceService } from 'src/app/services/balance.service';
import { UserService } from 'src/app/services/user.service';
import { requestProvider } from 'webln';
import { AppService } from 'src/app/services/app.service';

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

    selectedTab = 0;

    webln = null;

    // Camera

    cameraInitialized = false;

    @ViewChild('scanner')
    scanner: ZXingScannerComponent;

    camerasLoaded = false;
    hasPermission = true;
    cameraFound = true;

    availableDevices: MediaDeviceInfo[];
    selectedDevice: MediaDeviceInfo;

    // End Camera

    constructor(
        public dialogRef: MatDialogRef<WithdrawalDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
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
        }
    }

    ngAfterViewInit() {
        this.dialogRef.updateSize('400px', '500px');

        try {
            requestProvider()
                .then(result => {
                    this.webln = result;
                    this.webln
                        .makeInvoice({
                            amount: this.appService.user.balance,
                            defaultMemo: 'Withdrawal from ln.city'
                        })
                        .then(invoice => {
                            this.paymentRequest = invoice.paymentRequest;
                            this.withdrawPaymentRequest();
                        })
                        .catch(error => {
                            this.withdrawResult(false, error);
                        });
                })
                .catch(error => {
                    console.log('WebLN Not Available (1)');
                });
        } catch (error) {
            console.log('WebLN Not Available (2)', error);
        }
    }

    camerasFoundHandler(devices) {
        this.camerasLoaded = true;

        this.availableDevices = devices;

        if (this.selectedDevice == null) {
            this.selectedDevice = this.availableDevices[0];
        }

        this.cameraInitialized = true;
    }

    camerasNotFoundHandler(event) {
        this.cameraFound = false;
    }

    scanSuccessHandler(resultString: string) {
        this.paymentRequest = resultString;
        this.selectTab(0);
    }

    permissionResponseHandler(hasPermission) {
        this.hasPermission = hasPermission;
    }

    withdrawResult(success, errorMessage = null) {
        this.dialogRef.updateSize('400px', '400px');
        this.loading = false;
        this.paymentCompleted = true;
        this.paymentSuccess = success;
        if (success) {
            this.paymentMessage = 'Withdrawal succeeded!';
        } else {
            this.paymentMessage = 'Withdrawal failed.';
            this.paymentResultMessage = errorMessage;
        }
        this.userService.reloadAccount();
        setTimeout(() => {
            this.dialogRef.close(success);
        }, 2000);
    }

    withdrawPaymentRequest() {
        this.loading = true;
        this.dialogRef.updateSize('400px', '400px');
        this.balanceService
            .withdrawBalance(this.paymentRequest)
            .then(result => {
                this.withdrawResult(true);
            })
            .catch(error => {
                this.withdrawResult(false, error.error);
            });
    }

    selectTab(tabIndex) {
        this.selectedTab = tabIndex;
    }
}
