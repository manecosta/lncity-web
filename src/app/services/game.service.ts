import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class GameService {
    static instance: GameService;

    constructor(private requestService: RequestService) {
        GameService.instance = this;
    }

    getSlotParameters() {
        return this.requestService.get('/games/slots/getparameters');
    }

    getSlotBoard(betMultiplier) {
        return this.requestService.post('/games/slots/play', {
            bet_multiplier: betMultiplier
        });
    }

    getRouletteParameters() {
        return this.requestService.get('/games/roulettes/getparameters');
    }

    getRouletteResult(bets) {
        return this.requestService.post('/games/roulettes/play', {
            bets
        });
    }
}
