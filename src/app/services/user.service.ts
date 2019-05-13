import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { AppService } from './app.service';
import { HttpResponse } from '@angular/common/http';
import { User } from '../models/user';

@Injectable()
export class UserService {
    static instance: UserService;

    constructor(
        private requestService: RequestService,
        private appService: AppService
    ) {
        UserService.instance = this;
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

    getUser(identifier) {
        return this.requestService.get('/users/' + identifier);
    }
}
