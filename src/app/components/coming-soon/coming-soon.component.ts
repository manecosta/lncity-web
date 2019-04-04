import { Component } from '@angular/core';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-coming-soon',
    templateUrl: 'coming-soon.component.html',
    styleUrls: ['coming-soon.component.less']
})
export class ComingSoonComponent {
    constructor(private dialog: MatDialog, private appService: AppService) {}

    openPopup() {
        const dialogConfig = new MatDialogConfig();

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }
}
