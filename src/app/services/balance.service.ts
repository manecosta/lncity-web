import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class BalanceService {
    static instance: BalanceService;

    constructor(private requestService: RequestService) {
        BalanceService.instance = this;
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
