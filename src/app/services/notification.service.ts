import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class NotificationService {
    static instance: NotificationService;

    notificationCounts = {
        total: 0,
        unseen: 0
    };

    constructor(private requestService: RequestService) {
        NotificationService.instance = this;
    }

    getNotificationCounts() {
        return this.requestService.get('/notifications/count');
    }

    getNotifications(page, count) {
        return this.requestService.get(
            '/notifications/get/' + page + '/' + count
        );
    }

    updateNotificationCounts() {
        this.getNotificationCounts().then(response => {
            this.notificationCounts = response;
        });
    }
}
