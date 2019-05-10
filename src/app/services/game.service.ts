import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable()
export class GameService {
    static instance: GameService;

    constructor(private requestService: RequestService) {
        GameService.instance = this;
    }

    // Slot

    getSlotParameters() {
        return this.requestService.get('/games/slots/getparameters');
    }

    getSlotBoard(betMultiplier) {
        return this.requestService.post('/games/slots/play', {
            bet_multiplier: betMultiplier
        });
    }

    // Roulette

    getRouletteParameters() {
        return this.requestService.get('/games/roulettes/getparameters');
    }

    getRouletteResult(bets) {
        return this.requestService.post('/games/roulettes/play', {
            bets
        });
    }

    // Poker

    getPokerParameters() {
        return this.requestService.get('/games/pokers/getparameters');
    }

    getPokerHand(betMultiplier) {
        return this.requestService.post('/games/pokers/get', {
            bet_multiplier: betMultiplier
        });
    }

    getPokerResult(identifier, holdIndexes) {
        return this.requestService.post('/games/pokers/play', {
            identifier,
            hold_indexes: holdIndexes
        });
    }
}
