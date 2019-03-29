import { Injectable } from '@angular/core';
import { Utils } from '../utils/utils';

@Injectable()
export class LocalStorage {
    static localStorage: any;

    constructor() {
        if (!localStorage) {
            throw new Error('Current browser does not support Local Storage');
        }

        LocalStorage.localStorage = localStorage;
    }

    static set(key: string, value: string): void {
        LocalStorage.localStorage[key] = value;
    }

    static get(key: string): string {
        return LocalStorage.localStorage[key];
    }

    static setObject(key: string, value: any): void {
        LocalStorage.localStorage[key] = JSON.stringify(value);
    }

    static getObject(key: string): any {
        return JSON.parse(LocalStorage.localStorage[key] || '{}');
    }

    static remove(key: string): any {
        LocalStorage.localStorage.removeItem(key);
    }

    static clearAllData() {
        Utils.Objects.keys(LocalStorage.localStorage).forEach(element => {
            this.remove(element);
        });
    }
}

export const LOCAL_STORAGE_PROVIDERS: any = {
    LocalStorage,
    useClass: LocalStorage
};
