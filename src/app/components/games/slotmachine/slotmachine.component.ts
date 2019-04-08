import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-game-slotmachine',
    templateUrl: 'slotmachine.component.html',
    styleUrls: ['slotmachine.component.less']
})
export class SlotMachinGameComponent {
    constructor(private appService: AppService) {}
}
