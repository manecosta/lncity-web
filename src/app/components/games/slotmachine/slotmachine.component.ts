import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { GameService } from 'src/app/services/game.service';

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

    lines = null;
    availableSymbols = null;
    symbolNames = null;
    wildSymbolName = null;
    bonusSymbolName = null;

    nonBonusSymbols = [];

    constructor(
        public appService: AppService,
        private gameService: GameService
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
                    this.serverPrize = response.prize;

                    this.fillerBoard = this.generateFillerBoard(lastBoard);

                    this.animatingColumn = [true, true, true, true, true];

                    this.spinTimeout = setTimeout(() => {
                        const wins = this.checkBoard();

                        const prizedWins = [];
                        this.lastWinsInfo = {};
                        this.lastWin = 0;
                        for (const win of wins) {
                            const prize = win[3];
                            if (prize > 0) {
                                this.lastWin += prize;
                                prizedWins.push(win);
                            }
                        }
                        this.lastWin *= this.betMultiplier;
                        this.appService.user.balance += this.lastWin;

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

    checkBoard() {
        const winningLines = [];
        for (const line of this.lines) {
            const symbols = [];
            for (const position of line) {
                symbols.push(this.board[position[0]][position[1]]);
            }

            let consecutiveSymbolNames = [];
            for (const symbol of symbols) {
                if (consecutiveSymbolNames.length === 0) {
                    consecutiveSymbolNames = [symbol];
                    continue;
                }

                const lastSymbolName = consecutiveSymbolNames.slice(-1)[0];
                if (lastSymbolName === this.wildSymbolName) {
                    if (symbol === this.wildSymbolName) {
                        consecutiveSymbolNames.push(this.wildSymbolName);
                    } else {
                        const newConsecutiveSymbolNames = [];
                        for (const _ of consecutiveSymbolNames) {
                            newConsecutiveSymbolNames.push(symbol);
                        }
                        newConsecutiveSymbolNames.push(symbol);
                        consecutiveSymbolNames = newConsecutiveSymbolNames;
                    }
                } else {
                    if (symbol === lastSymbolName) {
                        consecutiveSymbolNames.push(symbol);
                    } else if (symbol === this.wildSymbolName) {
                        consecutiveSymbolNames.push(lastSymbolName);
                    } else {
                        break;
                    }
                }
            }

            if (consecutiveSymbolNames[0] === this.bonusSymbolName) {
                continue;
            }
            const prize = this.availableSymbols[consecutiveSymbolNames[0]]
                .prize[consecutiveSymbolNames.length - 1];

            winningLines.push([symbols, consecutiveSymbolNames, line, prize]);
        }

        const bonusCoordinates = [];
        for (let column = 0; column < this.columnCount; column++) {
            for (let line = 0; line < this.lineCount; line++) {
                if (this.board[column][line] === this.bonusSymbolName) {
                    bonusCoordinates.push([column, line]);
                }
            }
        }

        let bonusPrize = 0;
        if (bonusCoordinates.length > 0) {
            bonusPrize = this.availableSymbols[this.bonusSymbolName].prize[
                bonusCoordinates.length - 1
            ];
        }

        const bonusLineSymbols = [];
        for (const _ of bonusCoordinates) {
            bonusLineSymbols.push(this.bonusSymbolName);
        }
        winningLines.push([
            bonusLineSymbols,
            bonusLineSymbols,
            bonusCoordinates,
            bonusPrize
        ]);

        return winningLines;
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
}
