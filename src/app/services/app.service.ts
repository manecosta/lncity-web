import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable()
export class AppService {
    static instance: AppService;

    public isInside = false;

    public user: User = null;

    public paymentsUrl = 'https://ln.city/api/v1/';

    constructor() {
        AppService.instance = this;
    }
}
