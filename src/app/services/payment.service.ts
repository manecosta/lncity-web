import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class PaymentService {
    static instance: PaymentService;

    public isInside = false;

    constructor(private requestService: RequestService) {
        PaymentService.instance = this;
    }

    generateInvoice(amount, memo) {
        return this.requestService.get(
            'https://ln.city/api/v1/invoices/generate/' +
                amount +
                '/' +
                encodeURI(memo)
        );
    }

    getInvoice(rHash) {
        return this.requestService.post('https://ln.city/api/v1/invoices/get', {
            r_hash: rHash
        });
    }
}
