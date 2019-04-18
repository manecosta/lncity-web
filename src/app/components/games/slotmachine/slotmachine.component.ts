import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { GameService } from 'src/app/services/game.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';

@Component({
    selector: 'app-game-slotmachine',
    templateUrl: 'slotmachine.component.html',
    styleUrls: ['slotmachine.component.less']
})
export class SlotMachinGameComponent implements OnInit, OnDestroy {
    Object = Object;

    uiScale = 1;
    fillerCount = 30;

    loading = true;

    fillerWildcardChance = 0.08;
    fillerBonusChance = 0.08;

    baseBet = null;
    betMultiplier = null;
    maxBetMultiplier = null;
    lastWin = 0;
    serverPrize = null;
    winningLines = null;

    columnCount = 5;
    lineCount = 3;

    spinning = false;
    spinTimeout = null;

    animatingColumn = [false, false, false, false, false];

    fillerBoard = null;
    board = null;

    highlightedElements = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false]
    ];

    lastWinsInfo = {};

    highlightedWinIndex = 0;

    winHighlightsInterval = null;
    prizeAnimationTimeout = null;
    prizeAnimationInterval = null;

    lines = null;
    availableSymbols = null;
    symbolNames = null;
    wildSymbolName = null;
    bonusSymbolName = null;

    nonBonusSymbols = [];
    reversedNonBonusSymbols = [];

    constructor(
        public appService: AppService,
        private gameService: GameService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.loading = true;
        this.gameService
            .getSlotParameters()
            .then(response => {
                this.loading = false;
                this.availableSymbols = response.available_symbols;
                this.lines = response.lines;
                this.baseBet = response.base_bet;
                this.betMultiplier = response.min_bet_multiplier;
                this.maxBetMultiplier = response.max_bet_multiplier;
                this.symbolNames = response.symbol_names;
                this.wildSymbolName = response.wild_symbol_name;
                this.bonusSymbolName = response.bonus_symbol_name;

                for (const symbolName of Object.keys(this.availableSymbols)) {
                    if (!this.availableSymbols[symbolName].isBonus) {
                        this.nonBonusSymbols.push(symbolName);
                    }
                }

                this.reversedNonBonusSymbols = this.nonBonusSymbols.slice();
                this.reversedNonBonusSymbols.reverse();

                this.board = this.generateInitialBoard();
            })
            .catch(error => {
                console.log(error);
            });

        this.fillerBoard = null;
    }

    ngOnDestroy() {
        if (this.winHighlightsInterval) {
            clearInterval(this.winHighlightsInterval);
            this.winHighlightsInterval = null;
        }
        if (this.spinTimeout) {
            clearTimeout(this.spinTimeout);
            this.spinTimeout = null;
        }
        this.resetPrizeAnimations();
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
    }

    increaseMultiplier() {
        if (this.betMultiplier < this.maxBetMultiplier && !this.spinning) {
            this.betMultiplier += 1;
        }
    }

    decreaseMultiplier() {
        if (this.betMultiplier > 1 && !this.spinning) {
            this.betMultiplier -= 1;
        }
    }

    @HostListener('window:keydown', ['$event'])
    keyPressed(event) {
        if (event.code === 'Space') {
            this.spin();
            return false;
        } else if (event.key === '+') {
            this.increaseMultiplier();
            return false;
        } else if (event.key === '-') {
            this.decreaseMultiplier();
            return false;
        }
    }

    dealWithWins(win) {
        for (const column of this.highlightedElements) {
            for (let lineIndex = 0; lineIndex < column.length; lineIndex++) {
                column[lineIndex] = false;
            }
        }

        this.lastWinsInfo = {};
        const winSymbol = win[1][0];
        const prizeIndex = win[1].length - 1;
        if (this.lastWinsInfo[winSymbol] in this.lastWinsInfo) {
            if (this.lastWinsInfo[winSymbol].indexOf(prizeIndex) === -1) {
                this.lastWinsInfo[winSymbol].push(prizeIndex);
            }
        } else {
            this.lastWinsInfo[winSymbol] = [prizeIndex];
        }
        for (let j = 0; j < win[1].length; j++) {
            const coordinate = win[2][j];
            this.highlightedElements[coordinate[0]][coordinate[1]] = true;
        }

        this.highlightedWinIndex++;
    }

    spin() {
        if (this.spinning) {
            return;
        }

        const betPrice = this.betMultiplier * this.baseBet;

        this.resetPrizeAnimations();

        if (this.appService.user.balance >= betPrice) {
            this.spinning = true;

            if (this.winHighlightsInterval) {
                clearInterval(this.winHighlightsInterval);
                this.winHighlightsInterval = null;
            }

            this.lastWinsInfo = {};
            for (const column of this.highlightedElements) {
                for (
                    let lineIndex = 0;
                    lineIndex < column.length;
                    lineIndex++
                ) {
                    column[lineIndex] = false;
                }
            }

            this.appService.user.balance -= betPrice;
            this.appService.backupUser();
            const lastBoard = this.board;
            this.gameService
                .getSlotBoard(this.betMultiplier)
                .then(response => {
                    this.animatingColumn = [false, false, false, false, false];

                    this.board = response.board;
                    this.winningLines = response.winning_lines;

                    this.fillerBoard = this.generateFillerBoard(lastBoard);

                    this.animatingColumn = [true, true, true, true, true];

                    this.spinTimeout = setTimeout(() => {
                        const prizedWins = [];
                        this.lastWin = response.prize;

                        for (const win of this.winningLines) {
                            const prize = win[3];
                            if (prize > 0) {
                                prizedWins.push(win);
                            }
                        }

                        if (this.lastWin > 0) {
                            this.prizeAnimationTimeout = setTimeout(() => {
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
                                                this.prizeAnimationInterval
                                            );
                                            this.prizeAnimationInterval = null;
                                            this.appService.backupUser();
                                        }
                                    },
                                    50
                                );
                            }, 2000);
                        }

                        if (prizedWins.length > 0) {
                            this.highlightedWinIndex = 0;
                            this.dealWithWins(
                                prizedWins[
                                    this.highlightedWinIndex % prizedWins.length
                                ]
                            );
                            this.winHighlightsInterval = setInterval(() => {
                                this.dealWithWins(
                                    prizedWins[
                                        this.highlightedWinIndex %
                                            prizedWins.length
                                    ]
                                );
                            }, 1000);
                        }
                        this.spinning = false;
                    }, 3700);
                })
                .catch(error => {
                    this.spinning = false;
                    console.log(error);
                });
        }
    }

    isPrizeWon(symbolName, index) {
        const winsForSymbol = this.lastWinsInfo[symbolName];
        if (winsForSymbol != null) {
            return winsForSymbol.indexOf(index) !== -1 ? true : false;
        }
        return false;
    }

    generateFillerBoard(lastBoard) {
        const board = [];
        for (let column = 0; column < this.columnCount; column++) {
            board.push([]);
            for (
                let line = 0;
                line < this.fillerCount - this.lineCount;
                line++
            ) {
                const r = Math.random();
                if (r < this.fillerWildcardChance) {
                    board[column].push(this.wildSymbolName);
                } else if (
                    r <
                    this.fillerWildcardChance + this.fillerBonusChance
                ) {
                    board[column].push(this.bonusSymbolName);
                } else {
                    const randInt = this.getRandomInt(
                        0,
                        this.symbolNames.length - 1
                    );
                    board[column].push(this.symbolNames[randInt]);
                }
            }
        }

        for (let column = 0; column < this.columnCount; column++) {
            for (let line = 0; line < this.lineCount; line++) {
                board[column].push(lastBoard[column][line]);
            }
        }

        return board;
    }

    generateInitialBoard() {
        const board = [];
        for (let column = 0; column < this.columnCount; column++) {
            board.push([]);
            for (let line = 0; line < this.lineCount; line++) {
                const r = Math.random();
                if (r < this.fillerWildcardChance) {
                    board[column].push(this.wildSymbolName);
                } else if (
                    r <
                    this.fillerWildcardChance + this.fillerBonusChance
                ) {
                    board[column].push(this.bonusSymbolName);
                } else {
                    const randInt = this.getRandomInt(
                        0,
                        this.symbolNames.length - 1
                    );
                    board[column].push(this.symbolNames[randInt]);
                }
            }
        }

        return board;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    aboveZero(e) {
        return e > 0;
    }

    depositBalance() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            message: 'Select an amount to deposit (satoshi):',
            payingToBalance: true
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }
}
