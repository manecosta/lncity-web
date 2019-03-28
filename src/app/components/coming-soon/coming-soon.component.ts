import { Component, OnInit } from '@angular/core';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';

@Component({
    selector: 'app-coming-soon',
    templateUrl: 'coming-soon.component.html',
    styleUrls: ['coming-soon.component.less']
})
export class ComingSoonComponent implements OnInit {
    constructor(private dialog: MatDialog) {}

    ngOnInit() {}

    openPopup() {
        let dialogConfig = new MatDialogConfig();

        let paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }
}
