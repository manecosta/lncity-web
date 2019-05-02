import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class PaymentService {
    static instance: PaymentService;

    constructor(private requestService: RequestService) {
        PaymentService.instance = this;
    }

    tipTarget(target, amount) {
        return this.requestService.post('/tips/send', {
            target,
            amount
        });
    }

    getInvoice(rHash) {
        return this.requestService.post('/invoices/get', {
            r_hash: rHash
        });
    }
}
