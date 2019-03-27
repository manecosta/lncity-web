import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
    static instance: AppService;

    public isInside = false;

    constructor() {
        AppService.instance = this;
    }
}
