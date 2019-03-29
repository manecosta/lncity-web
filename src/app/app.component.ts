import { Component } from '@angular/core';
import { AppService } from './services/app.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    menuOptions = [
        {
            title: 'Home',
            navigate: '/alpha'
        },
        {
            title: 'Roulette',
            navigate: '/roulette'
        }
    ];

    constructor(public appService: AppService) {}
}
