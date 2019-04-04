import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { AppService } from './app.service';
import { HttpResponse } from '@angular/common/http';
import { User } from '../models/user';

@Injectable()
export class AccountService {
    static instance: AccountService;

    public isInside = false;

    constructor(
        private requestService: RequestService,
        private appService: AppService
    ) {
        AccountService.instance = this;
    }

    reloadAccount() {
        this.requestService.get('/users/me').then((response: object) => {
            const user = new User(response);
            this.appService.updateUser(user);
        });
    }

    depositBalance(amount) {
        return this.requestService.post('/balances/deposit', { amount });
    }
}
