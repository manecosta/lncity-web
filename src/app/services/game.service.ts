import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class GameService {
    static instance: GameService;

    public isInside = false;

    constructor(private requestService: RequestService) {
        GameService.instance = this;
    }

    getSlotParameters() {
        return this.requestService.get('/games/slots/getparameters');
    }

    getSlotBoard(betMultiplier) {
        return this.requestService.post('/games/slots/getboard', {
            bet_multiplier: betMultiplier
        });
    }
}
