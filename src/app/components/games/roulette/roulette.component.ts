import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-game-roulette',
    templateUrl: 'roulette.component.html',
    styleUrls: ['roulette.component.less']
})
export class RouletteGameComponent {
    constructor(private appService: AppService) {}
}
