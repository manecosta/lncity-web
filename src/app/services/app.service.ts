import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
    static instance: AppService;

    public isInside = false;

    public paymentsUrl = 'https://ln.city/api/v1/';

    constructor() {
        AppService.instance = this;
    }
}
