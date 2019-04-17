import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
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

    selectedTab = 0;

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
        this.dialogRef.updateSize('400px', '500px');
    }

    initializeCamera() {
        this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
            this.camerasLoaded = true;

            this.availableDevices = devices;

            for (const device of devices) {
                if (/back|rear|environment/gi.test(device.label)) {
                    this.scanner.changeDevice(device);
                    this.selectedDevice = device;
                    console.log(this.selectedDevice);
                    break;
                }
            }

            if (this.selectedDevice == null) {
                this.selectedDevice = this.availableDevices[0];
            }

            this.cameraInitialized = true;
        });

        this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
            this.cameraFound = false;
        });

        this.scanner.permissionResponse.subscribe((answer: boolean) => {
            this.hasPermission = answer;
        });
    }

    handleQrCodeResult(resultString: string) {
        this.paymentRequest = resultString;
        this.selectTab(0);
    }

    onDeviceSelectChange(selectedValue: string) {
        console.log('Selection changed: ', selectedValue);
        this.selectedDevice = this.scanner.getDeviceById(selectedValue);
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

    selectTab(tabIndex) {
        this.selectedTab = tabIndex;

        if (tabIndex === 1) {
            setTimeout(() => {
                this.initializeCamera();
            }, 500);
        }
    }
}
