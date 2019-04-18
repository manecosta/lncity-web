import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.less']
})
export class HomeComponent {
    constructor(private dialog: MatDialog) {}
}
