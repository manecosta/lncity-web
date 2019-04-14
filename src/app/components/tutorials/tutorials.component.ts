import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-tutorials',
    templateUrl: 'tutorials.component.html',
    styleUrls: ['tutorials.component.less']
})
export class TutorialsComponent {
    constructor(private appService: AppService) {}
}
