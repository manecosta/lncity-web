import { Model } from './model';

export class User extends Model {
    userId: number;
    balance: number;
    username: string;
    created: string;
    updated: string;

    mapping(): { [key: string]: any } {
        return {
            id: 'userId',
            username: 'username',
            balance: 'balance',
            created: 'created',
            updated: 'updated'
        };
    }
}
