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

    firstDeal = true;

    loadParamtersInterval = null;
    loadedParameters = false;
    loadingParameters = false;

    dealingOrDrawing = false;
    identifier = null;

    prizeInfos = [];
    cards = [];
    baseBet = null;
    betMultiplier = null;
    maxBetMultiplier = null;

    showCardsInterval = null;
    showingCards = [null, null, null, null, null];

    holdIndexes = [];

    prizeAnimationTimeout = null;
    prizeAnimationInterval = null;

    tempLastWin = 0;
    tempPrizeInfo = null;
    tempMatchedIndexes = [];

    staticLastWin = 0;
    lastWin = 0;
    serverPrize = null;
    lastPrizeInfo = null;
    matchedIndexes = [];
    showingResult = false;

    prizeCards = {
        royal_flush: [
            {
                suit: 'hearts',
                name: 'ten'
            },
            {
                suit: 'hearts',
                name: 'jack'
            },
            {
                suit: 'hearts',
                name: 'queen'
            },
            {
                suit: 'hearts',
                name: 'king'
            },
            {
                suit: 'hearts',
                name: 'ace'
            }
        ],
        straight_flush: [
            {
                suit: 'spades',
                name: 'seven'
            },
            {
                suit: 'spades',
                name: 'eight'
            },
            {
                suit: 'spades',
                name: 'nine'
            },
            {
                suit: 'spades',
                name: 'ten'
            },
            {
                suit: 'spades',
                name: 'jack'
            }
        ],
        four_of_a_kind: [
            {
                suit: 'diamonds',
                name: 'six'
            },
            {
                suit: 'spades',
                name: 'six'
            },
            {
                suit: 'hearts',
                name: 'six'
            },
            {
                suit: 'clubs',
                name: 'six'
            }
        ],
        full_house: [
            {
                suit: 'spades',
                name: 'seven'
            },
            {
                suit: 'diamonds',
                name: 'seven'
            },
            {
                suit: 'clubs',
                name: 'seven'
            },
            {
                suit: 'hearts',
                name: 'two'
            },
            {
                suit: 'spades',
                name: 'two'
            }
        ],
        flush: [
            {
                suit: 'spades',
                name: 'seven'
            },
            {
                suit: 'spades',
                name: 'two'
            },
            {
                suit: 'spades',
                name: 'eight'
            },
            {
                suit: 'spades',
                name: 'queen'
            },
            {
                suit: 'spades',
                name: 'ace'
            }
        ],
        straight: [
            {
                suit: 'spades',
                name: 'three'
            },
            {
                suit: 'diamonds',
                name: 'four'
            },
            {
                suit: 'clubs',
                name: 'five'
            },
            {
                suit: 'hearts',
                name: 'six'
            },
            {
                suit: 'spades',
                name: 'seven'
            }
        ],
        three_of_a_kind: [
            {
                suit: 'spades',
                name: 'jack'
            },
            {
                suit: 'diamonds',
                name: 'jack'
            },
            {
                suit: 'clubs',
                name: 'jack'
            }
        ],
        two_pairs: [
            {
                suit: 'spades',
                name: 'ace'
            },
            {
                suit: 'diamonds',
                name: 'ace'
            },
            {
                suit: 'clubs',
                name: 'three'
            },
            {
                suit: 'hearts',
                name: 'three'
            }
        ],
        pair_jacks_or_better: [
            {
                suit: 'spades',
                name: 'king'
            },
            {
                suit: 'diamonds',
                name: 'king'
            }
        ]
    };

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

        if (this.appService.user.balance >= betPrice || this.identifier) {
            this.showingResult = false;
            if (!this.identifier) {
                this.appService.user.balance -= betPrice;
                this.appService.backupUser();

                this.showingCards = [null, null, null, null, null];
                this.holdIndexes = [];
                this.matchedIndexes = [];
                this.dealingOrDrawing = true;
                this.firstDeal = false;
                this.staticLastWin = 0;
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
                                this.tempLastWin = result.prize;
                                this.tempPrizeInfo = result.prize_info;
                                this.tempMatchedIndexes =
                                    result.matched_indexes;
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
                        for (let j = 0; j < 5; j++) {
                            if (this.holdIndexes.indexOf(j) === -1) {
                                swapIndexes.push(j);
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
                                this.staticLastWin = result.prize;
                                this.matchedIndexes = result.matched_indexes;
                                this.identifier = null;
                                this.tempLastWin = 0;
                                this.tempMatchedIndexes = [];
                                this.tempPrizeInfo = null;
                                this.showingResult = true;

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

    isTempPrizeWon(prizeInfo) {
        if (this.tempPrizeInfo) {
            if (prizeInfo.name === this.tempPrizeInfo.name) {
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
