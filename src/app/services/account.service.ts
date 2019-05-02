import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { AppService } from './app.service';
import { HttpResponse } from '@angular/common/http';
import { User } from '../models/user';

@Injectable()
export class AccountService {
    static instance: AccountService;

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

    register() {
        return this.requestService.register();
    }

    addCredentials(username, password) {
        return this.requestService
            .post(
                '/users/addcredentials',
                {
                    username,
                    password
                },
                true
            )
            .then((response: HttpResponse<object>) => {
                const user = new User(response.body);
                this.appService.updateUserAndAuth(
                    user,
                    response.headers.get('x-auth-token'),
                    response.headers.get('x-refresh-token')
                );
                return Promise.resolve(response.body);
            });
    }

    loginToAccount(username, password) {
        return this.requestService
            .post(
                '/users/login',
                {
                    username,
                    password
                },
                true
            )
            .then((response: HttpResponse<object>) => {
                const user = new User(response.body);
                this.appService.updateUserAndAuth(
                    user,
                    response.headers.get('x-auth-token'),
                    response.headers.get('x-refresh-token')
                );
                return Promise.resolve(response.body);
            });
    }

    depositBalance(amount) {
        return this.requestService.post('/balances/deposit', { amount });
    }

    withdrawBalance(paymentRequest) {
        return this.requestService.post('/balances/withdraw', {
            payment_request: paymentRequest
        });
    }
}
