import { Model } from './model';

export class User extends Model {
    userId: number;
    balance: number;
    username: string;
    createdTime: number;
    updatedTime: number;

    mapping(): { [key: string]: any } {
        return {
            id: 'userId',
            username: 'username',
            balance: 'balance',
            created_time: 'createdTime',
            updated_time: 'updatedTime'
        };
    }
}
