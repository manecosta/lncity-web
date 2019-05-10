import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { GameService } from 'src/app/services/game.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';

@Component({
    selector: 'app-game-poker',
    templateUrl: 'poker.component.html',
    styleUrls: ['poker.component.less']
})
export class PokerGameComponent implements OnInit, OnDestroy {
    uiScale = 1;
    fillerCount = 30;

    loadParamtersInterval = null;
    loadedParameters = false;
    loadingParameters = false;

    dealingOrDrawing = false;
    identifier = null;

    cards = [];
    baseBet = null;
    betMultiplier = null;
    maxBetMultiplier = null;
    lastWin = 0;
    serverPrize = null;
    lastPrizeInfo = null;

    showCardsInterval = null;
    showingCards = [null, null, null, null, null];

    holdIndexes = [];

    prizeAnimationTimeout = null;
    prizeAnimationInterval = null;

    prizeInfos = [];
    matchedIndexes = [];

    constructor(
        public appService: AppService,
        private gameService: GameService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.initializePokerParameters();
    }

    ngOnDestroy() {
        this.loadingParameters = false;
        if (this.loadParamtersInterval) {
            clearInterval(this.loadParamtersInterval);
            this.loadParamtersInterval = null;
        }
        if (this.showCardsInterval) {
            clearInterval(this.showCardsInterval);
            this.showCardsInterval = null;
        }
        this.resetPrizeAnimations();
    }

    initializePokerParameters() {
        this.loadParamtersInterval = setInterval(() => {
            if (this.loadedParameters) {
                clearInterval(this.loadParamtersInterval);
                return;
            }
            if (!this.loadingParameters) {
                this.loadingParameters = true;
                this.gameService
                    .getPokerParameters()
                    .then(response => {
                        this.loadedParameters = true;
                        this.loadingParameters = false;

                        this.baseBet = response.base_bet;
                        this.betMultiplier = response.min_bet_multiplier;
                        this.maxBetMultiplier = response.max_bet_multiplier;
                        this.prizeInfos = response.prize_infos;
                        this.cards = response.cards;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }, 1000);
    }

    resetPrizeAnimations() {
        if (this.prizeAnimationTimeout) {
            clearTimeout(this.prizeAnimationTimeout);
            this.prizeAnimationTimeout = null;
        }
        if (this.prizeAnimationInterval) {
            clearInterval(this.prizeAnimationInterval);
            this.prizeAnimationInterval = null;
        }
        if (this.lastWin > 0) {
            this.appService.user.balance += this.lastWin;
            this.lastWin = 0;
        }
        this.lastPrizeInfo = null;
    }

    increaseMultiplier() {
        if (this.betMultiplier < this.maxBetMultiplier && !this.identifier) {
            this.betMultiplier += 1;
        }
    }

    decreaseMultiplier() {
        if (this.betMultiplier > 1 && !this.identifier) {
            this.betMultiplier -= 1;
        }
    }

    @HostListener('window:keydown', ['$event'])
    keyPressed(event) {
        if (event.code === 'Space') {
            this.dealOrDraw();
            return false;
        } else if (event.key === '+') {
            this.increaseMultiplier();
            return false;
        } else if (event.key === '-') {
            this.decreaseMultiplier();
            return false;
        } else if (['1', '2', '3', '4', '5'].indexOf(event.key) !== -1) {
            const parsedHoldIndex = parseInt(event.key, 10);
            this.toggleHoldCardIndex(parsedHoldIndex - 1);
        }
    }

    dealOrDraw() {
        if (this.dealingOrDrawing) {
            return;
        }

        const betPrice = this.betMultiplier * this.baseBet;

        this.resetPrizeAnimations();

        if (this.appService.user.balance >= betPrice) {
            if (!this.identifier) {
                this.showingCards = [null, null, null, null, null];
                this.holdIndexes = [];
                this.matchedIndexes = [];
                this.dealingOrDrawing = true;
                this.gameService
                    .getPokerHand(this.betMultiplier)
                    .then(result => {
                        let cardIndex = 1;
                        this.showingCards[0] = result.front_cards[0];
                        this.showCardsInterval = setInterval(() => {
                            this.showingCards[cardIndex] =
                                result.front_cards[cardIndex];
                            cardIndex++;
                            if (cardIndex > 4) {
                                clearInterval(this.showCardsInterval);
                                this.dealingOrDrawing = false;
                            }
                        }, 300);
                        this.identifier = result.identifier;
                    });
            } else {
                this.dealingOrDrawing = true;
                for (let i = 0; i < this.showingCards.length; i++) {
                    if (this.holdIndexes.indexOf(i) === -1) {
                        this.showingCards[i] = null;
                    }
                }
                this.gameService
                    .getPokerResult(this.identifier, this.holdIndexes)
                    .then(result => {
                        const swapIndexes = [];
                        for (let i = 0; i < 5; i++) {
                            if (this.holdIndexes.indexOf(i) === -1) {
                                swapIndexes.push(i);
                            }
                        }

                        let i = 0;
                        this.showCardsInterval = setInterval(() => {
                            this.showingCards[swapIndexes[i]] =
                                result.result_cards[swapIndexes[i]];
                            i++;
                            if (i >= swapIndexes.length) {
                                clearInterval(this.showCardsInterval);
                                this.dealingOrDrawing = false;
                                this.lastPrizeInfo = result.prize_info;
                                this.lastWin = result.prize;
                                this.matchedIndexes = result.matched_indexes;
                                this.identifier = null;

                                if (this.lastWin > 0) {
                                    this.prizeAnimationTimeout = setTimeout(
                                        () => {
                                            this.prizeAnimationTimeout = null;
                                            this.prizeAnimationInterval = setInterval(
                                                () => {
                                                    const step = Math.min(
                                                        this.lastWin,
                                                        this.betMultiplier * 50
                                                    );
                                                    this.appService.user.balance += step;
                                                    this.lastWin -= step;
                                                    if (this.lastWin === 0) {
                                                        clearInterval(
                                                            this
                                                                .prizeAnimationInterval
                                                        );
                                                        this.prizeAnimationInterval = null;
                                                        this.appService.backupUser();
                                                    }
                                                },
                                                50
                                            );
                                        },
                                        3000
                                    );
                                }
                            }
                        }, 300);
                    });
            }
        }
    }

    toggleHoldCardIndex(holdIndex) {
        if (this.dealingOrDrawing || !this.identifier) {
            return;
        }

        const index = this.holdIndexes.indexOf(holdIndex);
        if (index !== -1) {
            this.holdIndexes.splice(index, 1);
        } else {
            this.holdIndexes.push(holdIndex);
        }
    }

    isPrizeWon(prizeInfo) {
        if (this.lastPrizeInfo) {
            if (prizeInfo.name === this.lastPrizeInfo.name) {
                return true;
            }
        }
        return false;
    }

    depositBalance() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to deposit (satoshi):',
            target: 'balance'
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }
}
