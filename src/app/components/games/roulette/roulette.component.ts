import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    OnDestroy,
    HostListener
} from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { GameService } from 'src/app/services/game.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { PaymentDialogComponent } from 'src/app/dialogs/paymentdialog/paymentdialog.component';

@Component({
    selector: 'app-game-roulette',
    templateUrl: 'roulette.component.html',
    styleUrls: ['roulette.component.less']
})
export class RouletteGameComponent implements OnDestroy, OnInit {
    lines = [
        [
            { value: 3, color: 'red' },
            { value: 6, color: 'black' },
            { value: 9, color: 'red' },
            { value: 12, color: 'red' },
            { value: 15, color: 'black' },
            { value: 18, color: 'red' },
            { value: 21, color: 'red' },
            { value: 24, color: 'black' },
            { value: 27, color: 'red' },
            { value: 30, color: 'red' },
            { value: 33, color: 'black' },
            { value: 36, color: 'red' }
        ],
        [
            { value: 2, color: 'black' },
            { value: 5, color: 'red' },
            { value: 8, color: 'black' },
            { value: 11, color: 'black' },
            { value: 14, color: 'red' },
            { value: 17, color: 'black' },
            { value: 20, color: 'black' },
            { value: 23, color: 'red' },
            { value: 26, color: 'black' },
            { value: 29, color: 'black' },
            { value: 32, color: 'red' },
            { value: 35, color: 'black' }
        ],
        [
            { value: 1, color: 'red' },
            { value: 4, color: 'black' },
            { value: 7, color: 'red' },
            { value: 10, color: 'black' },
            { value: 13, color: 'black' },
            { value: 16, color: 'red' },
            { value: 19, color: 'red' },
            { value: 22, color: 'black' },
            { value: 25, color: 'red' },
            { value: 28, color: 'black' },
            { value: 31, color: 'black' },
            { value: 34, color: 'red' }
        ]
    ];

    numbers = [
        { value: 1, color: 'red' },
        { value: 20, color: 'black' },
        { value: 14, color: 'red' },
        { value: 31, color: 'black' },
        { value: 9, color: 'red' },
        { value: 22, color: 'black' },
        { value: 18, color: 'red' },
        { value: 29, color: 'black' },
        { value: 7, color: 'red' },
        { value: 28, color: 'black' },
        { value: 12, color: 'red' },
        { value: 35, color: 'black' },
        { value: 3, color: 'red' },
        { value: 26, color: 'black' },
        { value: 0, color: 'green' },
        { value: 32, color: 'red' },
        { value: 15, color: 'black' },
        { value: 19, color: 'red' },
        { value: 4, color: 'black' },
        { value: 21, color: 'red' },
        { value: 2, color: 'black' },
        { value: 25, color: 'red' },
        { value: 17, color: 'black' },
        { value: 34, color: 'red' },
        { value: 6, color: 'black' },
        { value: 27, color: 'red' },
        { value: 13, color: 'black' },
        { value: 36, color: 'red' },
        { value: 11, color: 'black' },
        { value: 30, color: 'red' },
        { value: 8, color: 'black' },
        { value: 23, color: 'red' },
        { value: 10, color: 'black' },
        { value: 5, color: 'red' },
        { value: 24, color: 'black' },
        { value: 16, color: 'red' },
        { value: 33, color: 'black' }
    ];

    coins = [
        {
            value: 50,
            color: '#72cac8'
        },
        {
            value: 100,
            color: '#ffcf01'
        },
        {
            value: 200,
            color: '#00a4e4'
        },
        {
            value: 500,
            color: '#ee2e24'
        },
        {
            value: 1000,
            color: '#f57b20'
        },
        {
            value: 2000,
            color: '#afbd21'
        },
        {
            value: 5000,
            color: '#7b2b83'
        }
    ];

    loadingParameters = false;
    loadedParameters = false;
    loadParamtersInterval = null;

    prizeAnimationTimeout = null;
    prizeAnimationInterval = null;

    spinning = false;
    currentAngle = 0;
    wheelSpinInterval;

    firstTwelve = [];
    secondTwelve = [];
    thirdTwelve = [];
    firstEighteen = [];
    secondEighteen = [];
    redFields = [];
    blackFields = [];
    oddfields = [];
    evenFields = [];
    topFields = [];
    midFields = [];
    bottomFields = [];

    minBet = 500;
    maxBet = 50000;
    bets = {};
    selectedCoinValue = 500;

    lastPrize = 0;
    lastResults = [];
    currentResult = null;

    @ViewChild('rouletteWheel')
    rouletteWheel: ElementRef;

    constructor(
        public appService: AppService,
        private gameService: GameService,
        private dialog: MatDialog
    ) {
        for (let li = 0; li < this.lines.length; li++) {
            const line = this.lines[li];
            for (let ci = 0; ci < line.length; ci++) {
                const numberInfo = line[ci];

                if (li === 0) {
                    this.topFields.push([li, ci]);
                } else if (li === 1) {
                    this.midFields.push([li, ci]);
                } else {
                    this.bottomFields.push([li, ci]);
                }

                if (numberInfo.value < 13) {
                    this.firstTwelve.push([li, ci]);
                } else if (numberInfo.value > 24) {
                    this.thirdTwelve.push([li, ci]);
                } else {
                    this.secondTwelve.push([li, ci]);
                }

                if (numberInfo.value < 17) {
                    this.firstEighteen.push([li, ci]);
                } else {
                    this.secondEighteen.push([li, ci]);
                }

                if (numberInfo.color === 'red') {
                    this.redFields.push([li, ci]);
                } else {
                    this.blackFields.push([li, ci]);
                }

                if (numberInfo.value % 2 === 1) {
                    this.oddfields.push([li, ci]);
                } else {
                    this.evenFields.push([li, ci]);
                }
            }
        }
    }

    ngOnInit() {
        this.loadParamtersInterval = setInterval(() => {
            if (this.loadedParameters) {
                clearInterval(this.loadParamtersInterval);
                return;
            }
            if (!this.loadingParameters) {
                this.loadingParameters = true;
                this.gameService
                    .getRouletteParameters()
                    .then(response => {
                        this.loadedParameters = true;
                        this.loadingParameters = false;

                        this.minBet = response.min_bet_amount;
                        this.maxBet = response.max_bet_amount;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.wheelSpinInterval) {
            clearInterval(this.wheelSpinInterval);
            this.wheelSpinInterval = null;
        }

        this.resetPrizeAnimations();
    }

    @HostListener('window:keydown', ['$event'])
    keyPressed(event) {
        if (event.code === 'Space') {
            this.spin();
            return false;
        } else if (event.key === '+') {
            this.doubleBet();
            return false;
        } else if (event.code === 'Delete') {
            this.clearBet();
            return false;
        }
    }

    depositBalance() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            target: 'balance'
        };

        const paymentDialog = this.dialog.open(
            PaymentDialogComponent,
            dialogConfig
        );
    }

    // Spin related methods

    resetPrizeAnimations() {
        if (this.lastPrize > 0) {
            this.appService.user.balance += this.lastPrize;
            if (this.prizeAnimationInterval) {
                clearInterval(this.prizeAnimationInterval);
                this.prizeAnimationInterval = null;
            }
            this.lastPrize = 0;
        }
        this.currentResult = null;
    }

    getBetsForServer() {
        const bets = [];
        for (const betKey in this.bets) {
            if (betKey in this.bets) {
                const symbols = betKey.split('_').map(e => {
                    return +e;
                });
                bets.push({
                    symbols,
                    amount: this.bets[betKey]
                });
            }
        }
        return bets;
    }

    updateWheelAngle() {
        this.rouletteWheel.nativeElement.style.transform =
            'rotate(' + this.currentAngle + 'deg)';
    }

    easeInOut(val, power = 2) {
        return (
            Math.pow(val, power) /
            (Math.pow(val, power) + Math.pow(1 - val, power + 1))
        );
    }

    spin() {
        const totalBet = this.totalBet();
        if (
            !this.spinning &&
            totalBet >= this.minBet &&
            totalBet <= this.maxBet &&
            totalBet <= this.appService.user.balance
        ) {
            this.resetPrizeAnimations();

            this.spinning = true;
            this.currentResult = null;
            this.gameService
                .getRouletteResult(this.getBetsForServer())
                .then(result => {
                    this.appService.user.balance -= this.totalBet();

                    const resultValue = result.result;
                    this.lastPrize = 0;

                    let resultIndex;
                    for (let i = 0; i < this.numbers.length; i++) {
                        const n = this.numbers[i];
                        if (n.value === resultValue) {
                            resultIndex = i;
                            break;
                        }
                    }

                    const animTime = 10000;
                    const frameRate = 50;

                    this.currentAngle = this.currentAngle % 360;
                    const initialAngle = this.currentAngle;
                    const finalAngle =
                        -resultIndex * (360 / this.numbers.length) + 1800;

                    const initialTime = new Date().getTime();
                    let lastTime = initialTime;
                    this.wheelSpinInterval = setInterval(() => {
                        const currentTime = new Date().getTime();

                        lastTime = currentTime;
                        const fraction = this.easeInOut(
                            (currentTime - initialTime) / animTime
                        );

                        this.currentAngle =
                            initialAngle +
                            fraction * (finalAngle - initialAngle);

                        this.updateWheelAngle();
                        if (currentTime - initialTime > animTime - 5) {
                            this.currentAngle = finalAngle;
                            this.updateWheelAngle();
                            clearInterval(this.wheelSpinInterval);
                            this.spinning = false;

                            this.lastPrize = result.prize;

                            this.currentResult = this.numbers[resultIndex];
                            this.lastResults = [this.currentResult].concat(
                                this.lastResults
                            );

                            if (this.lastPrize > 0) {
                                this.prizeAnimationTimeout = setTimeout(() => {
                                    this.prizeAnimationTimeout = null;
                                    this.prizeAnimationInterval = setInterval(
                                        () => {
                                            const step = Math.min(
                                                this.lastPrize,
                                                50 *
                                                    Math.ceil(
                                                        this.totalBet() / 500
                                                    )
                                            );
                                            this.appService.user.balance += step;
                                            this.lastPrize -= step;
                                            if (this.lastPrize === 0) {
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
                        }
                    }, 1000 / frameRate);
                });
        }
    }

    // Bet related methods

    selectCoin(coin) {
        this.selectedCoinValue = coin.value;
    }

    addBet(coordinates) {
        const newBetValue = this.totalBet() + this.selectedCoinValue;
        if (
            newBetValue <= this.maxBet &&
            newBetValue <= this.appService.user.balance
        ) {
            let valuesKey = '0';
            if (coordinates !== 0) {
                const values = [];
                for (const coordinate of coordinates) {
                    values.push(this.lines[coordinate[0]][coordinate[1]].value);
                }
                valuesKey = values.sort().join('_') + '';
            }
            if (valuesKey in this.bets) {
                this.bets[valuesKey] += this.selectedCoinValue;
            } else {
                this.bets[valuesKey] = this.selectedCoinValue;
            }
        }

        this.resetPrizeAnimations();
    }

    doubleBet() {
        const totalBet = this.totalBet();
        if (
            totalBet * 2 <= this.maxBet &&
            totalBet > 0 &&
            totalBet * 2 <= this.appService.user.balance
        ) {
            const newBets = {};
            for (const betKey in this.bets) {
                if (betKey in this.bets) {
                    newBets[betKey] = this.bets[betKey] * 2;
                }
            }
            this.bets = newBets;
        }

        this.resetPrizeAnimations();
    }

    clearBet() {
        this.bets = {};

        this.resetPrizeAnimations();
    }

    totalBet() {
        let totalBet = 0;
        for (const betKey in this.bets) {
            if (betKey in this.bets) {
                totalBet += this.bets[betKey];
            }
        }
        return totalBet;
    }

    // UI Helpers

    currentCoordinatesBet(coordinates) {
        let valuesKey = '0';
        if (coordinates !== 0) {
            const values = [];
            for (const coordinate of coordinates) {
                values.push(this.lines[coordinate[0]][coordinate[1]].value);
            }
            valuesKey = values.sort().join('_') + '';
        }
        if (valuesKey in this.bets) {
            return this.bets[valuesKey];
        } else {
            return '';
        }
    }

    valueColor(value) {
        let color = 'transparent';
        for (const coin of this.coins) {
            if (value >= coin.value) {
                color = coin.color;
            }
        }
        return color;
    }

    getWheelRotationTransform() {
        return {
            transform: 'rotate(' + this.currentAngle + 'deg)'
        };
    }

    isFieldHighlighted(coordinates) {
        if (this.currentResult) {
            const coordinateValues = [];
            if (coordinates !== 0) {
                for (const coordinate of coordinates) {
                    coordinateValues.push(
                        this.lines[coordinate[0]][coordinate[1]].value
                    );
                }
            } else {
                coordinateValues.push(0);
            }

            for (const value of coordinateValues) {
                if (value === this.currentResult.value) {
                    return true;
                }
            }
        }
        return false;
    }
}
