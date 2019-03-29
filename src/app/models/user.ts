import { Model } from './model';

export class User extends Model {
    identifier: string = null;
    balance = 0;

    mapping(): { [key: string]: any } {
        return {
            identifier: 'userId',
            balance: 'balance'
        };
    }
}
