import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { LocalStorage } from './localstorage.service';

@Injectable()
export class AppService {
    static instance: AppService;

    public isInside = false;

    public user: User = null;
    public authToken: string = null;
    public refreshToken: string = null;

    constructor(private localStorage: LocalStorage) {
        AppService.instance = this;

        this.user = LocalStorage.getObject('user');
        this.authToken = LocalStorage.get('auth_token');
        this.refreshToken = LocalStorage.get('refresh_token');
    }

    updateUser(user: User) {
        this.user = user;
        LocalStorage.setObject('user', user.serializable());
    }

    updateUserAndAuth(user: User, authToken: string, refreshToken: string) {
        this.user = user;
        this.authToken = authToken;
        this.refreshToken = refreshToken;
        this.backupUser();
    }

    backupUser() {
        LocalStorage.setObject('user', this.user.serializable());
        LocalStorage.set('auth_token', this.authToken);
        LocalStorage.set('refresh_token', this.refreshToken);
    }
}
