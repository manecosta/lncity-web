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
            title: 'Coming Soon',
            navigate: ''
        }
    ];

    constructor(public appService: AppService) {}
}
