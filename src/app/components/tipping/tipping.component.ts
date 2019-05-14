import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';

@Component({
    selector: 'app-tipping',
    templateUrl: 'tipping.component.html',
    styleUrls: ['tipping.component.less']
})
export class TippingComponent implements OnInit {
    tipUser = null;

    loading = true;

    constructor(
        public appService: AppService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService
    ) {}

    ngOnInit() {
        console.log(this.appService.user);
        this.route.paramMap.subscribe((route: ParamMap) => {
            const filter = route.get('filter');
            if (filter) {
                if (
                    parseInt(filter, 10) === this.appService.user.userId ||
                    filter === this.appService.user.username
                ) {
                    this.tipUser = {
                        id: this.appService.user.userId,
                        username: this.appService.user.username
                    };
                    this.loading = false;
                } else {
                    console.log(2);
                    this.userService
                        .getUser(filter)
                        .then(result => {
                            this.tipUser = result;
                            this.loading = false;
                        })
                        .catch(error => {
                            this.loading = false;
                        });
                }
            } else {
                this.navigateToOwnPage();
            }
        });
    }

    navigateToOwnPage() {
        let userIdentifier: number | string = this.appService.user.userId;
        if (this.appService.user.username) {
            userIdentifier = this.appService.user.username;
        }
        this.router.navigate(['tipping/' + userIdentifier]);
    }

    tipUserAction() {
        if (this.appService.user.userId != this.tipUser.id) {
            const dialogConfig = new MatDialogConfig();

            dialogConfig.data = {
                target: 'user/' + this.tipUser.id
            };

            const paymentDialog = this.dialog.open(
                PaymentDialogComponent,
                dialogConfig
            );
        }
    }
}
