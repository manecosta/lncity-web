import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-game-slotmachine',
    templateUrl: 'slotmachine.component.html',
    styleUrls: ['slotmachine.component.less']
})
export class SlotMachinGameComponent implements OnInit {
    Object = Object;

    balance = 1000;
    creditPrice = 50;
    lastWin = 0;

    columnCount = 5;
    lineCount = 3;

    board = null;
    wildcardChance = 0.115;

    lastWonLines = [false, false, false];

    highlightedElements = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false]
    ];

    lines = [
        [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
        [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
        [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]]
    ];

    availableSymbols = {
        Apple: {
            image_path: 'assets/img/slot/apple.png',
            prize: [0, 0, 25, 50, 100],
            isWild: false
        },
        Strawberry: {
            image_path: 'assets/img/slot/strawberry.png',
            prize: [0, 0, 50, 100, 200],
            isWild: false
        },
        Lemon: {
            image_path: 'assets/img/slot/lemon.png',
            prize: [0, 0, 75, 150, 300],
            isWild: false
        },
        Banana: {
            image_path: 'assets/img/slot/banana.png',
            prize: [0, 0, 125, 250, 500],
            isWild: false
        },
        Bitcoin: {
            image_path: 'assets/img/slot/bitcoin.png',
            prize: [0, 0, 175, 350, 700],
            isWild: false
        },
        Satoshi: {
            image_path: 'assets/img/slot/satoshi.png',
            prize: [0, 0, 0, 0, 1000],
            isWild: true
        }
    };

    symbolNames = [];
    wildSymbolName = null;

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.parseSymbols();
        this.board = this.generateBoard();
    }

    parseSymbols() {
        for (const index in Object.keys(this.availableSymbols)) {
            if (index in Object.keys(this.availableSymbols)) {
                const symbolName = Object.keys(this.availableSymbols)[index];
                if (!this.availableSymbols[symbolName].isWild) {
                    this.symbolNames.push(symbolName);
                } else {
                    this.wildSymbolName = symbolName;
                }
            }
        }
    }

    spin() {
        if (this.balance >= this.creditPrice) {
            this.balance -= this.creditPrice;
            this.board = this.generateBoard();
            const wins = this.checkBoard();

            for (const column of this.highlightedElements) {
                for (
                    let lineIndex = 0;
                    lineIndex < column.length;
                    lineIndex++
                ) {
                    column[lineIndex] = false;
                }
            }

            this.lastWin = 0;
            for (let i = 0; i < wins.length; i++) {
                const win = wins[i];
                this.lastWin += win[3];
                if (win[3] > 0) {
                    this.lastWonLines[i] = true;
                    for (let j = 0; j < win[1].length; j++) {
                        const coordinate = win[2][j];
                        console.log(coordinate);
                        this.highlightedElements[coordinate[0]][
                            coordinate[1]
                        ] = true;
                    }
                } else {
                    this.lastWonLines[i] = false;
                }
            }
            this.balance += this.lastWin;
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

            const prize = this.availableSymbols[consecutiveSymbolNames[0]]
                .prize[consecutiveSymbolNames.length - 1];

            winningLines.push([symbols, consecutiveSymbolNames, line, prize]);
        }

        return winningLines;
    }

    generateBoard() {
        const board = [];
        for (let column = 0; column < this.columnCount; column++) {
            board.push([]);
            for (let line = 0; line < this.lineCount; line++) {
                if (Math.random() < this.wildcardChance) {
                    board[column].push(this.wildSymbolName);
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
