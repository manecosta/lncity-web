import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { NotificationService } from 'src/app/services/notification.service';

import * as moment from 'moment';

@Component({
    selector: 'app-activity',
    templateUrl: 'activity.component.html',
    styleUrls: ['activity.component.less']
})
export class ActivityComponent implements OnInit {
    page = 1;
    count = 100;
    total = null;
    loading = true;
    notifications = [];

    constructor(
        private appService: AppService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.retrieveNotifications();
    }

    retrieveNotifications() {
        this.loading = true;
        this.notificationService.getNotifications(1, 100).then(response => {
            this.loading = false;

            this.page = response.page;
            this.count = response.count;
            this.total = response.total;
            this.notifications = response.notifications;

            this.notificationService.updateNotificationCounts();
        });
    }

    notificationDate(notification) {
        return moment(notification.time * 1000).fromNow();
    }

    notificationTitle(notification) {
        if (notification.event === 'transfer_in') {
            return 'Transfer received';
        } else if (notification.event === 'transfer_out') {
            return 'Transfer sent';
        } else if (notification.event === 'tip_in') {
            return 'Tip received';
        } else if (notification.event === 'tip_out') {
            return 'Tip sent';
        } else if (notification.event === 'deposit') {
            return 'Deposit';
        } else if (notification.event === 'withdraw') {
            return 'Withdraw';
        }
        return 'N/A';
    }

    userName(user) {
        return user.username || 'Anonymous';
    }

    notificationDescription(notification) {
        if (notification.event === 'transfer_in') {
            return (
                'You received ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                ' from ' +
                this.userName(notification.other_user) +
                '.'
            );
        } else if (notification.event === 'transfer_out') {
            return (
                'You transferred ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                ' to ' +
                this.userName(notification.other_user) +
                '.'
            );
        } else if (notification.event === 'tip_in') {
            return (
                'You received a ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                ' tip from ' +
                this.userName(notification.other_user) +
                '.' +
                (notification.info.target_entity === 'lncity'
                    ? ' <b>ln.city TIP.</b>'
                    : '')
            );
        } else if (notification.event === 'tip_out') {
            return (
                'You sent a ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                ' tip to ' +
                (notification.info.target_entity === 'lncity'
                    ? 'ln.city'
                    : this.userName(notification.other_user)) +
                '.'
            );
        } else if (notification.event === 'deposit') {
            return (
                'You deposited ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                '.'
            );
        } else if (notification.event === 'withdraw') {
            return (
                'You withdrew ' +
                notification.info.amount +
                ' <img src="assets/img/satoshi-symbol-32x64.png" />' +
                '.'
            );
        }
        return 'N/A';
    }
}
