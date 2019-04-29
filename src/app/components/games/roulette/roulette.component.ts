import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    OnDestroy
} from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { GameService } from 'src/app/services/game.service';

@Component({
    selector: 'app-game-roulette',
    templateUrl: 'roulette.component.html',
    styleUrls: ['roulette.component.less']
})
export class RouletteGameComponent implements OnDestroy {
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

    @ViewChild('rouletteWheel')
    rouletteWheel: ElementRef;

    constructor(
        public appService: AppService,
        private gameService: GameService
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

    ngOnDestroy() {
        if (this.wheelSpinInterval) {
            clearInterval(this.wheelSpinInterval);
            this.wheelSpinInterval = null;
        }
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

    spin() {
        if (!this.spinning && this.totalBet() > 0) {
            this.spinning = true;
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
                            this.appService.user.balance += this.lastPrize;
                        }
                    }, 1000 / frameRate);
                });
        }
    }

    addBet(coordinates) {
        if (this.totalBet() + this.selectedCoinValue <= this.maxBet) {
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
    }

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

    totalBet() {
        let totalBet = 0;
        for (const betKey in this.bets) {
            if (betKey in this.bets) {
                totalBet += this.bets[betKey];
            }
        }
        return totalBet;
    }

    selectCoin(coin) {
        this.selectedCoinValue = coin.value;
    }

    clearBet() {
        this.bets = {};
    }

    doubleBet() {
        if (this.totalBet() * 2 <= this.maxBet) {
            const newBets = {};
            for (const betKey in this.bets) {
                if (betKey in this.bets) {
                    newBets[betKey] = this.bets[betKey] * 2;
                }
            }
            this.bets = newBets;
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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
